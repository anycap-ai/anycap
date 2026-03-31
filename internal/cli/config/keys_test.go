package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLookupKey_Found(t *testing.T) {
	k := LookupKey("endpoint")
	if k == nil {
		t.Fatal("expected to find 'endpoint' key")
	}
	if k.Type != KeyTypeString {
		t.Fatalf("expected string type, got %s", k.Type)
	}
}

func TestLookupKey_NotFound(t *testing.T) {
	k := LookupKey("nonexistent")
	if k != nil {
		t.Fatal("expected nil for unknown key")
	}
}

func TestKeyNames(t *testing.T) {
	names := KeyNames()
	if len(names) != len(Keys) {
		t.Fatalf("expected %d names, got %d", len(Keys), len(names))
	}
	found := map[string]bool{}
	for _, n := range names {
		found[n] = true
	}
	if !found["endpoint"] || !found["auto_update"] {
		t.Fatalf("missing expected keys: %v", names)
	}
}

func TestResolveDefault_Endpoint(t *testing.T) {
	k := LookupKey("endpoint")
	d := k.ResolveDefault()
	if d != DefaultEndpoint {
		t.Fatalf("expected %q, got %q", DefaultEndpoint, d)
	}
}

func TestResolveDefault_AutoUpdate(t *testing.T) {
	k := LookupKey("auto_update")
	if k.ResolveDefault() != "true" {
		t.Fatalf("expected 'true', got %q", k.ResolveDefault())
	}
}

func TestKeysDef_ContainsAllKeys(t *testing.T) {
	defs := KeysDef()
	if len(defs) != len(Keys) {
		t.Fatalf("expected %d defs, got %d", len(Keys), len(defs))
	}
	for i, d := range defs {
		if d.Name != Keys[i].Name {
			t.Errorf("expected name %q at index %d, got %q", Keys[i].Name, i, d.Name)
		}
		if d.Description == "" {
			t.Errorf("empty description for %q", d.Name)
		}
		if d.Default == "" {
			t.Errorf("empty default for %q", d.Name)
		}
	}
}

func TestGetEffective_EndpointDefault(t *testing.T) {
	cfg := Config{}
	val, err := cfg.GetEffective("endpoint")
	if err != nil {
		t.Fatal(err)
	}
	if val != DefaultEndpoint {
		t.Fatalf("expected default %q, got %q", DefaultEndpoint, val)
	}
}

func TestGetEffective_EndpointSet(t *testing.T) {
	cfg := Config{Endpoint: "http://custom:9999"}
	val, err := cfg.GetEffective("endpoint")
	if err != nil {
		t.Fatal(err)
	}
	if val != "http://custom:9999" {
		t.Fatalf("expected http://custom:9999, got %v", val)
	}
}

func TestGetEffective_AutoUpdateDefault(t *testing.T) {
	cfg := Config{}
	val, err := cfg.GetEffective("auto_update")
	if err != nil {
		t.Fatal(err)
	}
	if val != true {
		t.Fatalf("expected true, got %v", val)
	}
}

func TestGetEffective_AutoUpdateExplicitFalse(t *testing.T) {
	f := false
	cfg := Config{AutoUpdate: &f}
	val, err := cfg.GetEffective("auto_update")
	if err != nil {
		t.Fatal(err)
	}
	if val != false {
		t.Fatalf("expected false, got %v", val)
	}
}

func TestGetEffective_UnknownKey(t *testing.T) {
	cfg := Config{}
	_, err := cfg.GetEffective("bad_key")
	if err == nil {
		t.Fatal("expected error for unknown key")
	}
}

func TestIsSet(t *testing.T) {
	cfg := Config{}
	if cfg.IsSet("endpoint") {
		t.Error("expected endpoint not set")
	}
	if cfg.IsSet("auto_update") {
		t.Error("expected auto_update not set")
	}

	tr := true
	cfg = Config{Endpoint: "http://x", AutoUpdate: &tr}
	if !cfg.IsSet("endpoint") {
		t.Error("expected endpoint set")
	}
	if !cfg.IsSet("auto_update") {
		t.Error("expected auto_update set")
	}
}

func TestSetValue_String(t *testing.T) {
	cfg := Config{}
	if err := cfg.SetValue("endpoint", "http://new:1234"); err != nil {
		t.Fatal(err)
	}
	if cfg.Endpoint != "http://new:1234" {
		t.Fatalf("expected http://new:1234, got %q", cfg.Endpoint)
	}
}

func TestSetValue_BoolTrue(t *testing.T) {
	cfg := Config{}
	for _, v := range []string{"true", "1", "yes", "on", "TRUE", "Yes"} {
		if err := cfg.SetValue("auto_update", v); err != nil {
			t.Fatalf("SetValue(%q): %v", v, err)
		}
		if cfg.AutoUpdate == nil || !*cfg.AutoUpdate {
			t.Fatalf("expected true for %q", v)
		}
	}
}

func TestSetValue_BoolFalse(t *testing.T) {
	cfg := Config{}
	for _, v := range []string{"false", "0", "no", "off", "FALSE", "No"} {
		if err := cfg.SetValue("auto_update", v); err != nil {
			t.Fatalf("SetValue(%q): %v", v, err)
		}
		if cfg.AutoUpdate == nil || *cfg.AutoUpdate {
			t.Fatalf("expected false for %q", v)
		}
	}
}

func TestSetValue_InvalidBool(t *testing.T) {
	cfg := Config{}
	err := cfg.SetValue("auto_update", "maybe")
	if err == nil {
		t.Fatal("expected error for invalid bool")
	}
}

func TestSetValue_UnknownKey(t *testing.T) {
	cfg := Config{}
	err := cfg.SetValue("bad_key", "x")
	if err == nil {
		t.Fatal("expected error for unknown key")
	}
}

func TestUnsetValue(t *testing.T) {
	tr := true
	cfg := Config{Endpoint: "http://x", AutoUpdate: &tr}

	if err := cfg.UnsetValue("endpoint"); err != nil {
		t.Fatal(err)
	}
	if cfg.Endpoint != "" {
		t.Fatalf("expected empty, got %q", cfg.Endpoint)
	}

	if err := cfg.UnsetValue("auto_update"); err != nil {
		t.Fatal(err)
	}
	if cfg.AutoUpdate != nil {
		t.Fatal("expected nil auto_update")
	}
}

func TestUnsetValue_UnknownKey(t *testing.T) {
	cfg := Config{}
	err := cfg.UnsetValue("bad_key")
	if err == nil {
		t.Fatal("expected error for unknown key")
	}
}

func TestSaveAndLoad(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	tr := true
	cfg := Config{Endpoint: "http://saved:8080", AutoUpdate: &tr}
	if err := Save(cfg); err != nil {
		t.Fatalf("Save: %v", err)
	}

	// Verify file was created
	path := filepath.Join(tmpHome, ".anycap", "config.toml")
	if _, err := os.Stat(path); err != nil {
		t.Fatalf("config file not created: %v", err)
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if loaded.Endpoint != "http://saved:8080" {
		t.Fatalf("expected http://saved:8080, got %q", loaded.Endpoint)
	}
	if loaded.AutoUpdate == nil || !*loaded.AutoUpdate {
		t.Fatal("expected auto_update true")
	}
}

func TestSave_OmitsZeroValues(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	cfg := Config{} // all zero
	if err := Save(cfg); err != nil {
		t.Fatalf("Save: %v", err)
	}

	data, err := os.ReadFile(filepath.Join(tmpHome, ".anycap", "config.toml"))
	if err != nil {
		t.Fatal(err)
	}
	// Empty config should produce minimal TOML (no keys)
	if contains(string(data), "endpoint") {
		t.Fatalf("expected endpoint omitted, got:\n%s", data)
	}
	if contains(string(data), "auto_update") {
		t.Fatalf("expected auto_update omitted, got:\n%s", data)
	}
}

func TestConfigPath(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	p := ConfigPath()
	expected := filepath.Join(tmpHome, ".anycap", "config.toml")
	if p != expected {
		t.Fatalf("expected %q, got %q", expected, p)
	}
}

func TestConfigPath_WithEnvironment(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	// Set environment via env var.
	t.Setenv("ANYCAP_APP_ENV", "local")

	p := ConfigPath()
	expected := filepath.Join(tmpHome, ".anycap", "config.local.toml")
	if p != expected {
		t.Fatalf("expected %q, got %q", expected, p)
	}
}

func TestResolvedEnvironment(t *testing.T) {
	// Default: empty.
	old := Environment
	Environment = ""
	defer func() { Environment = old }()

	if got := ResolvedEnvironment(); got != "" {
		t.Fatalf("expected empty, got %q", got)
	}

	// ldflags value.
	Environment = "staging"
	if got := ResolvedEnvironment(); got != "staging" {
		t.Fatalf("expected staging, got %q", got)
	}

	// ANYCAP_APP_ENV overrides ldflags.
	t.Setenv("ANYCAP_APP_ENV", "dev")
	if got := ResolvedEnvironment(); got != "dev" {
		t.Fatalf("expected dev (env override), got %q", got)
	}
}

func TestCredentialFilePath_WithEnvironment(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_APP_ENV", "local")

	path, err := credentialFilePath()
	if err != nil {
		t.Fatal(err)
	}
	expected := filepath.Join(tmpHome, ".anycap", "credentials.local")
	if path != expected {
		t.Fatalf("expected %q, got %q", expected, path)
	}
}

func TestKeyringService_WithEnvironment(t *testing.T) {
	old := Environment
	defer func() { Environment = old }()

	Environment = ""
	t.Setenv("ANYCAP_APP_ENV", "")
	if got := resolvedKeyringService(); got != "anycap" {
		t.Fatalf("expected anycap, got %q", got)
	}

	t.Setenv("ANYCAP_APP_ENV", "local")
	if got := resolvedKeyringService(); got != "anycap-local" {
		t.Fatalf("expected anycap-local, got %q", got)
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchString(s, substr)
}

func searchString(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
