package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"github.com/zalando/go-keyring"
)

const DefaultEndpoint = "http://127.0.0.1:8080"

// Config holds user preferences loaded from config file.
type Config struct {
	Endpoint string `json:"endpoint,omitempty"`
}

// configDir returns ~/.anycap, creating it if needed.
func configDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(home, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return dir, nil
}

// Load reads ~/.anycap/config.json. Returns zero Config if file doesn't exist.
func Load() (Config, error) {
	dir, err := configDir()
	if err != nil {
		return Config{}, err
	}

	data, err := os.ReadFile(filepath.Join(dir, "config.json"))
	if os.IsNotExist(err) {
		return Config{}, nil
	}
	if err != nil {
		return Config{}, err
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

// ResolveEndpoint returns the endpoint with precedence: flag > env > config file > default.
func ResolveEndpoint(flagValue string) string {
	if flagValue != "" {
		return flagValue
	}
	if v := os.Getenv("ANYCAP_API_ENDPOINT"); v != "" {
		return v
	}
	cfg, _ := Load()
	if cfg.Endpoint != "" {
		return cfg.Endpoint
	}
	return DefaultEndpoint
}

const (
	keyringService = "anycap"
	keyringAccount = "api-key"
)

// credentialFilePath returns the path to the fallback credentials file.
func credentialFilePath() (string, error) {
	dir, err := configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "credentials"), nil
}

// loadFromFile reads the API key from the fallback file.
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

// saveToFile writes the API key to the fallback file with 0600 permissions.
func saveToFile(apiKey string) error {
	path, err := credentialFilePath()
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(apiKey+"\n"), 0600)
}

// deleteFile removes the fallback credentials file. Returns nil if the file doesn't exist.
func deleteFile() error {
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

// LoadCredential returns the API key with precedence: env var > OS keychain > fallback file.
// If found in the fallback file and the keychain is available, it auto-migrates to the keychain
// and deletes the fallback file.
func LoadCredential() string {
	// 1. Environment variable always wins.
	if v := os.Getenv("ANYCAP_API_KEY"); v != "" {
		return v
	}

	// 2. Try OS keychain.
	if secret, err := keyring.Get(keyringService, keyringAccount); err == nil && secret != "" {
		return secret
	}

	// 3. Fallback file.
	key := loadFromFile()
	if key == "" {
		return ""
	}

	// Auto-migrate: if keychain is available, move the credential there and delete the file.
	if err := keyring.Set(keyringService, keyringAccount, key); err == nil {
		_ = deleteFile()
	}

	return key
}

// SaveCredential stores the API key. It tries the OS keychain first; on success it removes
// any existing fallback file. If the keychain is unavailable, it falls back to writing a
// plain-text file with 0600 permissions.
func SaveCredential(apiKey string) error {
	if err := keyring.Set(keyringService, keyringAccount, apiKey); err == nil {
		// Keychain succeeded -- clean up fallback file if it exists.
		_ = deleteFile()
		return nil
	}
	// Keychain unavailable -- fall back to file.
	return saveToFile(apiKey)
}

// DeleteCredential removes the API key from both the OS keychain and the fallback file.
func DeleteCredential() error {
	keyringErr := keyring.Delete(keyringService, keyringAccount)
	if keyringErr == keyring.ErrNotFound {
		keyringErr = nil
	}
	fileErr := deleteFile()

	// Return keyring error only if file delete also failed (both backends broken).
	if fileErr != nil {
		return fileErr
	}
	return keyringErr
}
