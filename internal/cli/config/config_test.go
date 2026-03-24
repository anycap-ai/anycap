package config

import (
	"os"
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

	// Fallback file should NOT exist (keyring succeeded)
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

func TestDeleteCredential_NothingStored(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	// Deleting when nothing is stored should not error.
	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential on empty: %v", err)
	}
}
