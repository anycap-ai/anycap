package config

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/zalando/go-keyring"
)

// Credential storage strategy (safe-first):
//
//  1. ANYCAP_API_KEY env var -- token-based access for CI/CD pipelines.
//  2. OS keychain -- primary persistent store (macOS Keychain, Linux Secret Service,
//     Windows Credential Manager) via github.com/zalando/go-keyring.
//  3. Plain-text fallback file (~/.anycap/credentials, mode 0600) -- used only when
//     no keychain backend is available (headless Linux, Docker, etc.).
//
// On load, if a credential is found in the fallback file and the keychain is
// available, it is automatically migrated to the keychain and the file is deleted.

const (
	keyringService = "anycap"
	keyringAccount = "api-key"
)

// LoadCredential returns the stored API key.
//
// Resolution order: ANYCAP_API_KEY env > OS keychain > fallback file.
// If found in the fallback file and the keychain is available, auto-migrates
// the credential to the keychain and removes the file.
func LoadCredential() string {
	// 1. Environment variable (token-based access for CI/CD).
	if v := os.Getenv("ANYCAP_API_KEY"); v != "" {
		return v
	}

	// 2. OS keychain (primary persistent store).
	if secret, err := keyring.Get(keyringService, keyringAccount); err == nil && secret != "" {
		return secret
	}

	// 3. Fallback file (only when keychain is unavailable).
	key := loadFromFile()
	if key == "" {
		return ""
	}

	// Auto-migrate: promote file credential to keychain, then remove the file.
	if err := keyring.Set(keyringService, keyringAccount, key); err == nil {
		_ = deleteCredentialFile()
	}

	return key
}

// SaveCredential stores the API key. It tries the OS keychain first; on success
// it removes any existing fallback file. Falls back to writing a plain-text file
// with mode 0600 only if the keychain is unavailable.
func SaveCredential(apiKey string) error {
	if err := keyring.Set(keyringService, keyringAccount, apiKey); err == nil {
		_ = deleteCredentialFile() // clean up fallback file if it exists
		return nil
	}
	// Keychain unavailable -- fall back to file.
	return saveToFile(apiKey)
}

// DeleteCredential removes the API key from both the OS keychain and the
// fallback file. Returns nil if at least one backend succeeds or reports
// "not found". Only returns an error if both backends fail.
func DeleteCredential() error {
	keyringErr := keyring.Delete(keyringService, keyringAccount)
	if keyringErr == keyring.ErrNotFound {
		keyringErr = nil
	}
	fileErr := deleteCredentialFile()

	// If either backend succeeded, consider the delete successful.
	// This handles the case where keychain is unavailable (Docker, headless)
	// but the file was the active backend.
	if keyringErr == nil || fileErr == nil {
		return nil
	}
	return keyringErr
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

func saveToFile(apiKey string) error {
	path, err := credentialFilePath()
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(apiKey+"\n"), 0600)
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
