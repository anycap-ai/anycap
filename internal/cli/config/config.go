package config

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func init() {
	// Best-effort load of .env file; allows CLI to pick up
	// ANYCAP_API_ENDPOINT and other env vars during local development.
	_ = godotenv.Load()
}

// DefaultEndpoint is the server endpoint used when no flag, env var, or config
// file overrides it. Release builds inject the production URL via ldflags:
//
//	-ldflags "-X gitlab.knoffice.tech/engineering/anycap/internal/cli/config.DefaultEndpoint=https://api.anycap.ai"
var DefaultEndpoint = "http://127.0.0.1:18080"

// Config holds user preferences loaded from ~/.anycap/config.json.
type Config struct {
	Endpoint   string `json:"endpoint,omitempty"`
	AutoUpdate *bool  `json:"auto_update,omitempty"`
}

// IsAutoUpdateEnabled returns whether auto-update is enabled.
// Defaults to true when the field is not set.
func (c Config) IsAutoUpdateEnabled() bool {
	if c.AutoUpdate == nil {
		return true
	}
	return *c.AutoUpdate
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

// Load reads ~/.anycap/config.json. Returns zero Config if the file doesn't exist.
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

// ResolveEndpoint returns the endpoint with precedence:
//
//	flag > ANYCAP_API_ENDPOINT env > config file > DefaultEndpoint
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
