package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"github.com/zalando/go-keyring"
)

// Credential storage strategy (safe-first):
//
//  1. ANYCAP_API_KEY env var -- creates an API Key credential at runtime.
//  2. OS keychain -- primary persistent store (macOS Keychain, Linux Secret Service,
//     Windows Credential Manager) via github.com/zalando/go-keyring.
//  3. Plain-text fallback file (~/.anycap/credentials, mode 0600) -- used only when
//     no keychain backend is available (headless Linux, Docker, etc.).
//
// When Environment is set (e.g. "local", "dev"), credentials are isolated:
//   - Keyring service: "anycap-{env}"
//   - Fallback file: ~/.anycap/credentials.{env}
//
// Credentials are stored as JSON.

const (
	keyringBaseService = "anycap"
	keyringAccount     = "credential"
)

// resolvedKeyringService returns the keyring service name, suffixed with
// the environment when set.
func resolvedKeyringService() string {
	if env := ResolvedEnvironment(); env != "" {
		return keyringBaseService + "-" + env
	}
	return keyringBaseService
}

// CredentialType distinguishes credential storage variants.
type CredentialType string

const (
	// CredentialTypeAPIKey is a static API Key credential.
	CredentialTypeAPIKey CredentialType = "api_key"
)

// Credential holds authentication data for API key auth.
type Credential struct {
	Type        CredentialType `json:"type"`
	AccessToken string         `json:"access_token"`
}

// NewAPIKeyCredential creates a static API Key credential.
func NewAPIKeyCredential(key string) *Credential {
	return &Credential{
		Type:        CredentialTypeAPIKey,
		AccessToken: key,
	}
}

// Token returns the bearer token to use in API requests.
func (c *Credential) Token() string {
	if c == nil {
		return ""
	}
	return c.AccessToken
}

// LoadCredential returns the stored credential.
//
// Resolution order: ANYCAP_API_KEY env > OS keychain > fallback file.
// If found in the fallback file and the keychain is available, auto-migrates
// the credential to the keychain and removes the file.
// Returns nil if no credential is found.
func LoadCredential() *Credential {
	// 1. Environment variable -> API Key credential (runtime only, never persisted).
	if v := os.Getenv("ANYCAP_API_KEY"); v != "" {
		return NewAPIKeyCredential(v)
	}

	// 2. OS keychain (primary persistent store).
	if secret, err := keyring.Get(resolvedKeyringService(), keyringAccount); err == nil && secret != "" {
		if cred := parseCredential(secret); cred != nil {
			return cred
		}
	}

	// 3. Fallback file (only when keychain is unavailable).
	raw := loadFromFile()
	if raw == "" {
		return nil
	}

	cred := parseCredential(raw)
	if cred == nil {
		return nil
	}

	// Auto-migrate: promote file credential to keychain, then remove the file.
	if data, err := json.Marshal(cred); err == nil {
		if err := keyring.Set(resolvedKeyringService(), keyringAccount, string(data)); err == nil {
			_ = deleteCredentialFile()
		}
	}

	return cred
}

// SaveCredential stores the credential. It tries the OS keychain first; on
// success it removes any existing fallback file. Falls back to writing a
// plain-text file with mode 0600 only if the keychain is unavailable.
func SaveCredential(cred *Credential) error {
	data, err := json.Marshal(cred)
	if err != nil {
		return err
	}
	raw := string(data)

	if err := keyring.Set(resolvedKeyringService(), keyringAccount, raw); err == nil {
		_ = deleteCredentialFile() // clean up fallback file if it exists
		return nil
	}
	// Keychain unavailable -- fall back to file.
	return saveToFile(raw)
}

// DeleteCredential removes the credential from both the OS keychain and the
// fallback file. Returns nil if at least one backend succeeds or reports
// "not found". Only returns an error if both backends fail.
func DeleteCredential() error {
	keyringErr := keyring.Delete(resolvedKeyringService(), keyringAccount)
	if keyringErr == keyring.ErrNotFound {
		keyringErr = nil
	}
	fileErr := deleteCredentialFile()

	// If either backend succeeded, consider the delete successful.
	if keyringErr == nil || fileErr == nil {
		return nil
	}
	return keyringErr
}

// parseCredential parses a stored JSON credential string.
func parseCredential(raw string) *Credential {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}

	var cred Credential
	if err := json.Unmarshal([]byte(raw), &cred); err != nil || cred.AccessToken == "" {
		return nil
	}
	if cred.Type == "" || cred.Type != CredentialTypeAPIKey {
		cred.Type = CredentialTypeAPIKey
	}
	return &cred
}

// --- fallback file helpers (used only when OS keychain is unavailable) ---

func credentialFilePath() (string, error) {
	dir, err := configDir()
	if err != nil {
		return "", err
	}
	name := "credentials"
	if env := ResolvedEnvironment(); env != "" {
		name = "credentials." + env
	}
	return filepath.Join(dir, name), nil
}

func loadFromFile() string {
	path, err := credentialFilePath()
	if err != nil {
		return ""
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(data))
}

func saveToFile(raw string) error {
	path, err := credentialFilePath()
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(raw+"\n"), 0600)
}

func deleteCredentialFile() error {
	path, err := credentialFilePath()
	if err != nil {
		return err
	}
	err = os.Remove(path)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
