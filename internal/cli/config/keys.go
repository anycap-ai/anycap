package config

import (
	"fmt"
	"strings"
)

// KeyType represents the value type of a configuration key.
type KeyType string

const (
	KeyTypeString KeyType = "string"
	KeyTypeBool   KeyType = "bool"
)

// KeyDef describes a single CLI configuration key.
type KeyDef struct {
	Name        string  // TOML key name (e.g. "endpoint")
	Type        KeyType // Value type for validation and coercion
	Default     string  // Default value as string; empty means resolved at runtime
	Description string  // Human-readable description
	EnvVar      string  // Environment variable that can override this key
}

// ResolveDefault returns the effective default value for a key.
// Keys whose default depends on build-time variables (e.g. endpoint)
// are resolved dynamically.
func (k *KeyDef) ResolveDefault() string {
	if k.Default != "" {
		return k.Default
	}
	switch k.Name {
	case "endpoint":
		return DefaultEndpoint
	}
	return ""
}

// Keys is the authoritative registry of all CLI configuration keys.
// This slice is the single source of truth for config key metadata,
// help text generation, and validation.
var Keys = []KeyDef{
	{
		Name:        "endpoint",
		Type:        KeyTypeString,
		Description: "AnyCap server endpoint URL",
		EnvVar:      "ANYCAP_API_ENDPOINT",
	},
	{
		Name:        "auto_update",
		Type:        KeyTypeBool,
		Default:     "true",
		Description: "Automatically check and update CLI from GitHub Releases",
		EnvVar:      "ANYCAP_NO_UPDATE (set any value to disable)",
	},
	{
		Name:        "feedback",
		Type:        KeyTypeBool,
		Default:     "true",
		Description: "Enable the feedback command for submitting bug reports and feature requests",
	},
}

// LookupKey returns the key definition by name, or nil if not found.
func LookupKey(name string) *KeyDef {
	for i := range Keys {
		if Keys[i].Name == name {
			return &Keys[i]
		}
	}
	return nil
}

// KeyNames returns a sorted list of all config key names.
func KeyNames() []string {
	names := make([]string, len(Keys))
	for i, k := range Keys {
		names[i] = k.Name
	}
	return names
}

// keyDefJSON is the JSON-serializable form of a KeyDef.
type keyDefJSON struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Default     string `json:"default"`
	Description string `json:"description"`
	EnvVar      string `json:"env,omitempty"`
}

// KeysDef returns all config key definitions in a JSON-serializable form.
func KeysDef() []keyDefJSON {
	out := make([]keyDefJSON, len(Keys))
	for i, k := range Keys {
		out[i] = keyDefJSON{
			Name:        k.Name,
			Type:        string(k.Type),
			Default:     k.ResolveDefault(),
			Description: k.Description,
			EnvVar:      k.EnvVar,
		}
	}
	return out
}

// --- Config accessor methods ------------------------------------------------

// GetEffective returns the effective value for a config key.
// If the key is not set in the config file, the default is returned.
func (c *Config) GetEffective(key string) (any, error) {
	if LookupKey(key) == nil {
		return nil, fmt.Errorf("unknown config key: %q\nRun 'anycap config --help' to see available keys", key)
	}
	switch key {
	case "endpoint":
		if c.Endpoint != "" {
			return c.Endpoint, nil
		}
		return DefaultEndpoint, nil
	case "auto_update":
		return c.IsAutoUpdateEnabled(), nil
	case "feedback":
		return c.IsFeedbackEnabled(), nil
	}
	return nil, fmt.Errorf("unhandled config key: %q", key)
}

// IsSet reports whether a key has an explicit value in the config file.
func (c *Config) IsSet(key string) bool {
	switch key {
	case "endpoint":
		return c.Endpoint != ""
	case "auto_update":
		return c.AutoUpdate != nil
	case "feedback":
		return c.Feedback != nil
	}
	return false
}

// SetValue sets a config key from a string, performing type coercion.
func (c *Config) SetValue(key, value string) error {
	if LookupKey(key) == nil {
		return fmt.Errorf("unknown config key: %q\nRun 'anycap config --help' to see available keys", key)
	}
	switch key {
	case "endpoint":
		c.Endpoint = value
	case "auto_update":
		b, err := parseBool(value)
		if err != nil {
			return fmt.Errorf("invalid value for %q: expected true/false, got %q", key, value)
		}
		c.AutoUpdate = &b
	case "feedback":
		b, err := parseBool(value)
		if err != nil {
			return fmt.Errorf("invalid value for %q: expected true/false, got %q", key, value)
		}
		c.Feedback = &b
	}
	return nil
}

// UnsetValue resets a config key to its zero/nil value so the default applies.
func (c *Config) UnsetValue(key string) error {
	if LookupKey(key) == nil {
		return fmt.Errorf("unknown config key: %q\nRun 'anycap config --help' to see available keys", key)
	}
	switch key {
	case "endpoint":
		c.Endpoint = ""
	case "auto_update":
		c.AutoUpdate = nil
	case "feedback":
		c.Feedback = nil
	}
	return nil
}

// parseBool converts common boolean string representations to bool.
func parseBool(s string) (bool, error) {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "true", "1", "yes", "on":
		return true, nil
	case "false", "0", "no", "off":
		return false, nil
	default:
		return false, fmt.Errorf("invalid boolean: %q", s)
	}
}
