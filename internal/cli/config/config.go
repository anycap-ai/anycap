package config

import (
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
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
var DefaultEndpoint = "http://127.0.0.1:8080"

// Environment identifies the build environment. Empty string means production.
// When set, config/credential files and keyring entries are suffixed to isolate
// environments (e.g. config.local.toml, credentials.local, keyring "anycap-local").
// Override via ldflags:
//
//	-ldflags "-X gitlab.knoffice.tech/engineering/anycap/internal/cli/config.Environment=local"
//
// Can also be overridden at runtime via ANYCAP_APP_ENV environment variable.
var Environment = ""

// ResolvedEnvironment returns the effective environment, checking ANYCAP_APP_ENV
// first, then falling back to the ldflags-injected Environment value.
func ResolvedEnvironment() string {
	if v := os.Getenv("ANYCAP_APP_ENV"); v != "" {
		return v
	}
	return Environment
}

// Config holds user preferences loaded from config.toml in the config directory.
type Config struct {
	Endpoint   string `toml:"endpoint,omitempty"`
	AutoUpdate *bool  `toml:"auto_update,omitempty"`
	Feedback   *bool  `toml:"feedback,omitempty"`
}

// IsAutoUpdateEnabled returns whether auto-update is enabled.
// Defaults to true when the field is not set.
func (c Config) IsAutoUpdateEnabled() bool {
	if c.AutoUpdate == nil {
		return true
	}
	return *c.AutoUpdate
}

// IsFeedbackEnabled returns whether the feedback command is enabled.
// Defaults to true when the field is not set.
func (c Config) IsFeedbackEnabled() bool {
	if c.Feedback == nil {
		return true
	}
	return *c.Feedback
}

// ConfigDir returns the AnyCap config directory, creating it if needed.
//
// Resolution order: ANYCAP_CONFIG_DIR env > ~/.anycap.
// Setting ANYCAP_CONFIG_DIR is useful in sandboxed environments where the
// home directory is not persistent (e.g. agent containers). Point it at the
// working directory to keep config and credentials across restarts:
//
//	export ANYCAP_CONFIG_DIR=./.anycap
func ConfigDir() string {
	dir, _ := configDir()
	return dir
}

// configDir returns the AnyCap config directory, creating it if needed.
func configDir() (string, error) {
	var dir string
	if v := os.Getenv("ANYCAP_CONFIG_DIR"); v != "" {
		var err error
		dir, err = filepath.Abs(v)
		if err != nil {
			return "", err
		}
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		dir = filepath.Join(home, ".anycap")
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return dir, nil
}

// ConfigPath returns the full path to the config file.
// When Environment is set, returns config.{env}.toml (e.g. config.local.toml).
func ConfigPath() string {
	if env := ResolvedEnvironment(); env != "" {
		return filepath.Join(ConfigDir(), "config."+env+".toml")
	}
	return filepath.Join(ConfigDir(), "config.toml")
}

// Save writes the config to config.toml in the config directory.
// Fields with zero/nil values are omitted (omitempty).
func Save(cfg Config) error {
	dir, err := configDir()
	if err != nil {
		return err
	}
	path := filepath.Join(dir, "config.toml")
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return toml.NewEncoder(f).Encode(cfg)
}

// Load reads config.toml from the config directory. Returns zero Config if the file doesn't exist.
func Load() (Config, error) {
	dir, err := configDir()
	if err != nil {
		return Config{}, err
	}

	path := filepath.Join(dir, "config.toml")
	var cfg Config
	if _, err := toml.DecodeFile(path, &cfg); err != nil {
		if os.IsNotExist(err) {
			return Config{}, nil
		}
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
