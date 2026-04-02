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
//  3. Plain-text fallback file (credentials in config dir, mode 0600) -- used only
//     when no keychain backend is available (headless Linux, Docker, etc.).
//
// Set ANYCAP_NO_KEYRING=1 to skip the OS keychain entirely and always use the
// fallback file. This is useful in sandboxed/containerized environments where
// the keychain is ephemeral but the config directory is persistent.
//
// When Environment is set (e.g. "local", "dev"), credentials are isolated:
//   - Keyring service: "anycap-{env}"
//   - Fallback file: credentials.{env} in config dir
//
// Credentials are stored as JSON.

const (
	keyringBaseService = "anycap"
	keyringAccount     = "credential"
)

// keyringDisabled returns true when ANYCAP_NO_KEYRING is set to a truthy
// value ("1", "true", "yes"). When disabled, credentials are always stored
// in the fallback file.
func keyringDisabled() bool {
	v := strings.ToLower(os.Getenv("ANYCAP_NO_KEYRING"))
	return v == "1" || v == "true" || v == "yes"
}

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
// When ANYCAP_NO_KEYRING=1 is set, the keychain step is skipped entirely.
// If found in the fallback file and the keychain is available (and not disabled),
// auto-migrates the credential to the keychain and removes the file.
// Returns nil if no credential is found.
func LoadCredential() *Credential {
	// 1. Environment variable -> API Key credential (runtime only, never persisted).
	if v := os.Getenv("ANYCAP_API_KEY"); v != "" {
		return NewAPIKeyCredential(v)
	}

	// 2. OS keychain (primary persistent store, skipped when disabled).
	if !keyringDisabled() {
		if secret, err := keyring.Get(resolvedKeyringService(), keyringAccount); err == nil && secret != "" {
			if cred := parseCredential(secret); cred != nil {
				return cred
			}
		}
	}

	// 3. Fallback file.
	raw := loadFromFile()
	if raw == "" {
		return nil
	}

	cred := parseCredential(raw)
	if cred == nil {
		return nil
	}

	// Auto-migrate: promote file credential to keychain, then remove the file.
	// Skipped when keyring is disabled -- the file IS the primary store.
	if !keyringDisabled() {
		if data, err := json.Marshal(cred); err == nil {
			if err := keyring.Set(resolvedKeyringService(), keyringAccount, string(data)); err == nil {
				_ = deleteCredentialFile()
			}
		}
	}

	return cred
}

// SaveCredential stores the credential. It tries the OS keychain first; on
// success it removes any existing fallback file. Falls back to writing a
// plain-text file with mode 0600 only if the keychain is unavailable.
// When ANYCAP_NO_KEYRING=1 is set, always writes to the fallback file.
func SaveCredential(cred *Credential) error {
	data, err := json.Marshal(cred)
	if err != nil {
		return err
	}
	raw := string(data)

	if !keyringDisabled() {
		if err := keyring.Set(resolvedKeyringService(), keyringAccount, raw); err == nil {
			_ = deleteCredentialFile() // clean up fallback file if it exists
			return nil
		}
	}
	// Keychain disabled or unavailable -- write to file.
	return saveToFile(raw)
}

// DeleteCredential removes the credential from both the OS keychain and the
// fallback file. Returns nil if at least one backend succeeds or reports
// "not found". Only returns an error if both backends fail.
// When ANYCAP_NO_KEYRING=1 is set, only removes the fallback file and
// returns its error directly.
func DeleteCredential() error {
	fileErr := deleteCredentialFile()

	if keyringDisabled() {
		// File is the sole backend -- its result is authoritative.
		return fileErr
	}

	keyringErr := keyring.Delete(resolvedKeyringService(), keyringAccount)
	if keyringErr == keyring.ErrNotFound {
		keyringErr = nil
	}

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
