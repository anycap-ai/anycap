package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadOrCreateDeviceID_CreatesNew(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("HOME", tmp)

	id := LoadOrCreateDeviceID()
	if id == "" {
		t.Fatal("expected non-empty device ID")
	}

	// Should be persisted.
	path := filepath.Join(tmp, ".anycap", deviceIDFileName())
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("device ID file not created: %v", err)
	}
	if got := trimNewline(string(data)); got != id {
		t.Errorf("persisted ID = %q, want %q", got, id)
	}
}

func TestLoadOrCreateDeviceID_ReturnsExisting(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("HOME", tmp)

	// Pre-create.
	dir := filepath.Join(tmp, ".anycap")
	_ = os.MkdirAll(dir, 0755)
	_ = os.WriteFile(filepath.Join(dir, deviceIDFileName()), []byte("u_existing\n"), 0600)

	id := LoadOrCreateDeviceID()
	if id != "u_existing" {
		t.Errorf("got %q, want %q", id, "u_existing")
	}
}

func TestSetDeviceUserID(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("HOME", tmp)

	// Generate initial random ID.
	initial := LoadOrCreateDeviceID()
	if initial == "" {
		t.Fatal("expected initial device ID")
	}

	// Set user ID.
	SetDeviceUserID("u_abc123")

	got := LoadOrCreateDeviceID()
	if got != "u_abc123" {
		t.Errorf("got %q, want %q", got, "u_abc123")
	}
}

func TestResetDeviceID(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("HOME", tmp)

	SetDeviceUserID("u_abc123")
	ResetDeviceID()

	// Should generate a new random ID, not "u_abc123".
	got := LoadOrCreateDeviceID()
	if got == "u_abc123" {
		t.Error("expected new device ID after reset, got same user ID")
	}
	if got == "" {
		t.Error("expected non-empty device ID after reset")
	}
}

func TestSetDeviceUserID_Empty(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("HOME", tmp)

	initial := LoadOrCreateDeviceID()
	SetDeviceUserID("") // should be a no-op

	got := LoadOrCreateDeviceID()
	if got != initial {
		t.Errorf("empty SetDeviceUserID changed ID from %q to %q", initial, got)
	}
}

func TestGenerateDeviceID_Format(t *testing.T) {
	id := generateDeviceID()
	// UUID v4 format: 8-4-4-4-12 hex digits.
	if len(id) != 36 {
		t.Errorf("expected 36-char UUID, got %d chars: %q", len(id), id)
	}
	if id[8] != '-' || id[13] != '-' || id[18] != '-' || id[23] != '-' {
		t.Errorf("unexpected UUID format: %q", id)
	}
}

func trimNewline(s string) string {
	for len(s) > 0 && (s[len(s)-1] == '\n' || s[len(s)-1] == '\r') {
		s = s[:len(s)-1]
	}
	return s
}
