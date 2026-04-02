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
	if err := os.WriteFile(filepath.Join(dir, "config.toml"), []byte("endpoint = \"http://config:9999\"\n"), 0644); err != nil {
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
	if err := os.WriteFile(filepath.Join(dir, "config.toml"), []byte("auto_update = false\n"), 0644); err != nil {
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

func TestIsFeedbackEnabled_DefaultTrue(t *testing.T) {
	cfg := Config{}
	if !cfg.IsFeedbackEnabled() {
		t.Error("expected feedback enabled by default (nil pointer)")
	}
}

func TestIsFeedbackEnabled_ExplicitFalse(t *testing.T) {
	f := false
	cfg := Config{Feedback: &f}
	if cfg.IsFeedbackEnabled() {
		t.Error("expected feedback disabled when set to false")
	}
}

func TestIsFeedbackEnabled_ExplicitTrue(t *testing.T) {
	tr := true
	cfg := Config{Feedback: &tr}
	if !cfg.IsFeedbackEnabled() {
		t.Error("expected feedback enabled when set to true")
	}
}

func TestLoad_FeedbackFromFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	dir := filepath.Join(tmpHome, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "config.toml"), []byte("feedback = false\n"), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.IsFeedbackEnabled() {
		t.Error("expected feedback disabled from config file")
	}
}

func TestConfigDir_EnvOverride(t *testing.T) {
	customDir := filepath.Join(t.TempDir(), "custom-anycap")
	t.Setenv("ANYCAP_CONFIG_DIR", customDir)

	got := ConfigDir()
	if got != customDir {
		t.Fatalf("expected %q, got %q", customDir, got)
	}

	// Directory should be auto-created.
	info, err := os.Stat(customDir)
	if err != nil {
		t.Fatalf("config dir not created: %v", err)
	}
	if !info.IsDir() {
		t.Fatal("config dir is not a directory")
	}
}

func TestConfigDir_RelativePath(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", ".anycap")
	// Run from a known directory so the relative path is predictable.
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(tmpDir)

	got := ConfigDir()
	// Resolve symlinks for comparison (macOS /var -> /private/var).
	expected, _ := filepath.EvalSymlinks(filepath.Join(tmpDir, ".anycap"))
	gotResolved, _ := filepath.EvalSymlinks(got)
	if gotResolved != expected {
		t.Fatalf("expected absolute path %q, got %q", expected, gotResolved)
	}
}

func TestSaveAndLoad_WithConfigDirEnv(t *testing.T) {
	customDir := filepath.Join(t.TempDir(), "sandbox-anycap")
	t.Setenv("ANYCAP_CONFIG_DIR", customDir)

	tr := true
	cfg := Config{Endpoint: "http://sandbox:9090", AutoUpdate: &tr}
	if err := Save(cfg); err != nil {
		t.Fatalf("Save: %v", err)
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if loaded.Endpoint != "http://sandbox:9090" {
		t.Fatalf("expected http://sandbox:9090, got %q", loaded.Endpoint)
	}
}

func TestLoad_ValidConfigFile(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	dir := filepath.Join(tmpHome, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "config.toml"), []byte("endpoint = \"http://custom:8080\"\n"), 0644); err != nil {
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
