package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestResolveEndpoint_FlagWins(t *testing.T) {
	got := ResolveEndpoint("http://flag:1234")
	if got != "http://flag:1234" {
		t.Fatalf("expected flag value, got %q", got)
	}
}

func TestResolveEndpoint_EnvOverridesDefault(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("ANYCAP_API_ENDPOINT", "http://env:5678")

	got := ResolveEndpoint("")
	if got != "http://env:5678" {
		t.Fatalf("expected env value, got %q", got)
	}
}

func TestResolveEndpoint_ConfigFileOverridesDefault(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_API_ENDPOINT", "")

	dir := filepath.Join(tmpHome, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"endpoint":"http://config:9999"}`), 0644); err != nil {
		t.Fatal(err)
	}

	got := ResolveEndpoint("")
	if got != "http://config:9999" {
		t.Fatalf("expected config file value, got %q", got)
	}
}

func TestResolveEndpoint_Default(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("ANYCAP_API_ENDPOINT", "")

	got := ResolveEndpoint("")
	if got != DefaultEndpoint {
		t.Fatalf("expected default %q, got %q", DefaultEndpoint, got)
	}
}

func TestLoad_NonExistentFile(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Endpoint != "" {
		t.Fatalf("expected empty endpoint, got %q", cfg.Endpoint)
	}
}

func TestIsAutoUpdateEnabled_DefaultTrue(t *testing.T) {
	cfg := Config{}
	if !cfg.IsAutoUpdateEnabled() {
		t.Error("expected auto-update enabled by default (nil pointer)")
	}
}

func TestIsAutoUpdateEnabled_ExplicitFalse(t *testing.T) {
	f := false
	cfg := Config{AutoUpdate: &f}
	if cfg.IsAutoUpdateEnabled() {
		t.Error("expected auto-update disabled when set to false")
	}
}

func TestIsAutoUpdateEnabled_ExplicitTrue(t *testing.T) {
	tr := true
	cfg := Config{AutoUpdate: &tr}
	if !cfg.IsAutoUpdateEnabled() {
		t.Error("expected auto-update enabled when set to true")
	}
}

func TestLoad_AutoUpdateFromFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	dir := filepath.Join(tmpHome, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"auto_update":false}`), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.IsAutoUpdateEnabled() {
		t.Error("expected auto-update disabled from config file")
	}
}

func TestLoad_ValidConfigFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	dir := filepath.Join(tmpHome, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "config.json"), []byte(`{"endpoint":"http://custom:8080"}`), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.Endpoint != "http://custom:8080" {
		t.Fatalf("expected http://custom:8080, got %q", cfg.Endpoint)
	}
}
