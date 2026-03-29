package config

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/zalando/go-keyring"
)

func TestMain(m *testing.M) {
	keyring.MockInit()
	os.Exit(m.Run())
}

func TestNewAPIKeyCredential(t *testing.T) {
	cred := NewAPIKeyCredential("sk-test-123")

	if cred.Type != CredentialTypeAPIKey {
		t.Fatalf("expected type api_key, got %s", cred.Type)
	}
	if cred.Token() != "sk-test-123" {
		t.Fatalf("expected token sk-test-123, got %s", cred.Token())
	}
}

func TestNilCredentialToken(t *testing.T) {
	var cred *Credential
	if cred.Token() != "" {
		t.Fatal("nil credential should return empty token")
	}
}

func TestSaveAndLoadCredential_APIKey(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	cred := NewAPIKeyCredential("sk-test-123")
	if err := SaveCredential(cred); err != nil {
		t.Fatalf("SaveCredential: %v", err)
	}

	got := LoadCredential()
	if got == nil {
		t.Fatal("expected credential, got nil")
	}
	if got.Type != CredentialTypeAPIKey {
		t.Fatalf("expected type api_key, got %s", got.Type)
	}
	if got.Token() != "sk-test-123" {
		t.Fatalf("expected sk-test-123, got %q", got.Token())
	}

	path, _ := credentialFilePath()
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("expected no fallback file when keyring is available")
	}
}

func TestDeleteCredential(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	_ = SaveCredential(NewAPIKeyCredential("sk-to-delete"))

	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential: %v", err)
	}

	if got := LoadCredential(); got != nil {
		t.Fatalf("expected nil after delete, got %+v", got)
	}
}

func TestLoadCredential_EnvOverridesKeyring(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	_ = SaveCredential(NewAPIKeyCredential("sk-keyring"))
	t.Setenv("ANYCAP_API_KEY", "sk-from-env")

	got := LoadCredential()
	if got == nil {
		t.Fatal("expected credential")
	}
	if got.Type != CredentialTypeAPIKey {
		t.Fatalf("expected api_key type from env, got %s", got.Type)
	}
	if got.Token() != "sk-from-env" {
		t.Fatalf("expected sk-from-env, got %q", got.Token())
	}
}

func TestLoadCredential_AutoMigrateFileToKeyring(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	cred := NewAPIKeyCredential("sk-file-key")
	data, _ := json.Marshal(cred)
	if err := saveToFile(string(data)); err != nil {
		t.Fatalf("saveToFile: %v", err)
	}

	got := LoadCredential()
	if got == nil || got.Token() != "sk-file-key" {
		t.Fatalf("expected sk-file-key, got %+v", got)
	}

	path, _ := credentialFilePath()
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("expected fallback file to be deleted after auto-migration")
	}

	got = LoadCredential()
	if got == nil || got.Token() != "sk-file-key" {
		t.Fatalf("expected sk-file-key from keyring, got %+v", got)
	}
}

func TestSaveCredential_KeychainUnavailable_FallbackToFile(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	keyring.MockInitWithError(fmt.Errorf("D-Bus session bus not available"))
	t.Cleanup(func() { keyring.MockInit() })

	cred := NewAPIKeyCredential("sk-no-keychain")
	if err := SaveCredential(cred); err != nil {
		t.Fatalf("SaveCredential should succeed via file fallback: %v", err)
	}

	path, _ := credentialFilePath()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("expected fallback file to exist: %v", err)
	}

	var loaded Credential
	if err := json.Unmarshal(data, &loaded); err != nil {
		t.Fatalf("fallback file should contain valid JSON: %v", err)
	}
	if loaded.Token() != "sk-no-keychain" {
		t.Fatalf("expected sk-no-keychain, got %q", loaded.Token())
	}

	info, _ := os.Stat(path)
	if perm := info.Mode().Perm(); perm != 0600 {
		t.Fatalf("expected file mode 0600, got %04o", perm)
	}
}

func TestSaveAndLoadCredential_KeychainUnavailable_RoundTrip(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	keyring.MockInitWithError(fmt.Errorf("D-Bus session bus not available"))
	t.Cleanup(func() { keyring.MockInit() })

	cred := NewAPIKeyCredential("sk-roundtrip")
	if err := SaveCredential(cred); err != nil {
		t.Fatalf("SaveCredential: %v", err)
	}

	got := LoadCredential()
	if got == nil {
		t.Fatal("expected credential")
	}
	if got.Token() != "sk-roundtrip" {
		t.Fatalf("expected sk-roundtrip, got %q", got.Token())
	}

	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential: %v", err)
	}
	if got := LoadCredential(); got != nil {
		t.Fatalf("expected nil after delete, got %+v", got)
	}
}

func TestDeleteCredential_NothingStored(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	if err := DeleteCredential(); err != nil {
		t.Fatalf("DeleteCredential on empty: %v", err)
	}
}
