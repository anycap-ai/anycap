package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"time"

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
// Credentials are stored as JSON.

const (
	keyringService = "anycap"
	keyringAccount = "credential"
)

// CredentialType distinguishes between OAuth and API Key authentication.
type CredentialType string

const (
	// CredentialTypeOAuth is an OAuth credential with access/refresh tokens.
	CredentialTypeOAuth CredentialType = "oauth"

	// CredentialTypeAPIKey is a static API Key credential.
	CredentialTypeAPIKey CredentialType = "api_key"
)

// Credential holds authentication data. OAuth credentials include refresh
// tokens and expiry for automatic token renewal. API Key credentials are
// static long-lived keys that never expire from the client's perspective.
type Credential struct {
	Type         CredentialType `json:"type"`
	AccessToken  string         `json:"access_token"`
	RefreshToken string         `json:"refresh_token,omitempty"`
	ExpiresAt    *time.Time     `json:"expires_at,omitempty"`
}

// NewAPIKeyCredential creates a static API Key credential.
func NewAPIKeyCredential(key string) *Credential {
	return &Credential{
		Type:        CredentialTypeAPIKey,
		AccessToken: key,
	}
}

// NewOAuthCredential creates an OAuth credential with refresh capability.
func NewOAuthCredential(accessToken, refreshToken string, expiresAt time.Time) *Credential {
	return &Credential{
		Type:         CredentialTypeOAuth,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    &expiresAt,
	}
}

// Token returns the bearer token to use in API requests.
func (c *Credential) Token() string {
	if c == nil {
		return ""
	}
	return c.AccessToken
}

// IsExpired reports whether an OAuth credential's access token has expired.
// Returns true if the token expires within 30 seconds (to avoid edge-case
// failures). API Key credentials never expire from the client's perspective.
func (c *Credential) IsExpired() bool {
	if c == nil || c.Type != CredentialTypeOAuth || c.ExpiresAt == nil {
		return false
	}
	return time.Now().After(c.ExpiresAt.Add(-30 * time.Second))
}

// IsOAuth reports whether this credential uses OAuth token refresh.
func (c *Credential) IsOAuth() bool {
	return c != nil && c.Type == CredentialTypeOAuth
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
	if secret, err := keyring.Get(keyringService, keyringAccount); err == nil && secret != "" {
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
		if err := keyring.Set(keyringService, keyringAccount, string(data)); err == nil {
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

	if err := keyring.Set(keyringService, keyringAccount, raw); err == nil {
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
	keyringErr := keyring.Delete(keyringService, keyringAccount)
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
	return &cred
}

// --- fallback file helpers (used only when OS keychain is unavailable) ---

func credentialFilePath() (string, error) {
	dir, err := configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "credentials"), nil
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
