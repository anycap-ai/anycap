package config

import (
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/zalando/go-keyring"
)

func TestMain(m *testing.M) {
	keyring.MockInit()
	os.Exit(m.Run())
}

func TestSaveAndLoadCredential_Keyring(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	if err := SaveCredential("sk-test-123"); err != nil {
		t.Fatalf("SaveCredential: %v", err)
	}

	got := LoadCredential()
	if got != "sk-test-123" {
		t.Fatalf("expected sk-test-123, got %q", got)
	}

	// Fallback file should NOT exist (keychain succeeded)
	path, _ := credentialFilePath()
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("expected no fallback file when keyring is available")
	}
}

func TestDeleteCredential(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	_ = SaveCredential("sk-to-delete")

	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential: %v", err)
	}

	if got := LoadCredential(); got != "" {
		t.Fatalf("expected empty after delete, got %q", got)
	}
}

func TestLoadCredential_EnvOverridesKeyring(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	_ = SaveCredential("sk-from-keyring")
	t.Setenv("ANYCAP_API_KEY", "sk-from-env")

	got := LoadCredential()
	if got != "sk-from-env" {
		t.Fatalf("expected sk-from-env, got %q", got)
	}
}

func TestLoadCredential_AutoMigrateFileToKeyring(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	// Ensure clean keyring state.
	_ = keyring.Delete(keyringService, keyringAccount)

	// Simulate a pre-existing fallback file (from before keychain support).
	if err := saveToFile("sk-legacy-key"); err != nil {
		t.Fatalf("saveToFile: %v", err)
	}

	// LoadCredential should find it in the file, migrate to keyring, and delete the file.
	got := LoadCredential()
	if got != "sk-legacy-key" {
		t.Fatalf("expected sk-legacy-key, got %q", got)
	}

	// Fallback file should be gone after migration.
	path, _ := credentialFilePath()
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("expected fallback file to be deleted after auto-migration")
	}

	// Second load should still work (from keyring now).
	got = LoadCredential()
	if got != "sk-legacy-key" {
		t.Fatalf("expected sk-legacy-key from keyring, got %q", got)
	}
}

func TestSaveCredential_KeychainUnavailable_FallbackToFile(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	// Simulate keychain unavailable (Docker, headless Linux, etc.)
	keyring.MockInitWithError(fmt.Errorf("D-Bus session bus not available"))
	t.Cleanup(func() { keyring.MockInit() })

	if err := SaveCredential("sk-no-keychain"); err != nil {
		t.Fatalf("SaveCredential should succeed via file fallback: %v", err)
	}

	// Credential should be in the fallback file
	path, _ := credentialFilePath()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("expected fallback file to exist: %v", err)
	}
	if got := strings.TrimSpace(string(data)); got != "sk-no-keychain" {
		t.Fatalf("expected sk-no-keychain in file, got %q", got)
	}

	// File permissions should be 0600
	info, _ := os.Stat(path)
	if perm := info.Mode().Perm(); perm != 0600 {
		t.Fatalf("expected file mode 0600, got %04o", perm)
	}
}

func TestLoadCredential_KeychainUnavailable_ReadsFromFile(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	// Simulate keychain unavailable
	keyring.MockInitWithError(fmt.Errorf("D-Bus session bus not available"))
	t.Cleanup(func() { keyring.MockInit() })

	// Write credential directly to file (simulates previous save without keychain)
	if err := saveToFile("sk-file-only"); err != nil {
		t.Fatalf("saveToFile: %v", err)
	}

	got := LoadCredential()
	if got != "sk-file-only" {
		t.Fatalf("expected sk-file-only, got %q", got)
	}

	// File should still exist (keychain is broken, can't migrate)
	path, _ := credentialFilePath()
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Fatal("expected fallback file to remain when keychain is unavailable")
	}
}

func TestSaveAndLoadCredential_KeychainUnavailable_RoundTrip(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	// Simulate keychain unavailable for the full cycle
	keyring.MockInitWithError(fmt.Errorf("D-Bus session bus not available"))
	t.Cleanup(func() { keyring.MockInit() })

	// Save
	if err := SaveCredential("sk-roundtrip"); err != nil {
		t.Fatalf("SaveCredential: %v", err)
	}

	// Load
	got := LoadCredential()
	if got != "sk-roundtrip" {
		t.Fatalf("expected sk-roundtrip, got %q", got)
	}

	// Delete
	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential: %v", err)
	}

	// Verify gone
	if got := LoadCredential(); got != "" {
		t.Fatalf("expected empty after delete, got %q", got)
	}
}

func TestDeleteCredential_NothingStored(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	// Deleting when nothing is stored should not error.
	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential on empty: %v", err)
	}
}
