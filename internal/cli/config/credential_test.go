package config

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

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
	if cred.IsOAuth() {
		t.Fatal("API key credential should not be OAuth")
	}
	if cred.IsExpired() {
		t.Fatal("API key credential should never be expired")
	}
}

func TestNewOAuthCredential(t *testing.T) {
	expiresAt := time.Now().Add(time.Hour)
	cred := NewOAuthCredential("at-123", "rt-456", expiresAt)

	if cred.Type != CredentialTypeOAuth {
		t.Fatalf("expected type oauth, got %s", cred.Type)
	}
	if cred.Token() != "at-123" {
		t.Fatalf("expected token at-123, got %s", cred.Token())
	}
	if !cred.IsOAuth() {
		t.Fatal("should be OAuth")
	}
	if cred.IsExpired() {
		t.Fatal("should not be expired (1h from now)")
	}
	if cred.RefreshToken != "rt-456" {
		t.Fatalf("expected refresh token rt-456, got %s", cred.RefreshToken)
	}
}

func TestOAuthCredential_IsExpired(t *testing.T) {
	// Already expired
	past := time.Now().Add(-time.Minute)
	cred := NewOAuthCredential("at", "rt", past)
	if !cred.IsExpired() {
		t.Fatal("should be expired")
	}

	// Expires within 30s buffer
	almostExpired := time.Now().Add(15 * time.Second)
	cred2 := NewOAuthCredential("at", "rt", almostExpired)
	if !cred2.IsExpired() {
		t.Fatal("should be expired (within 30s buffer)")
	}

	// Not expired
	future := time.Now().Add(time.Hour)
	cred3 := NewOAuthCredential("at", "rt", future)
	if cred3.IsExpired() {
		t.Fatal("should not be expired")
	}
}

func TestNilCredential(t *testing.T) {
	var cred *Credential
	if cred.Token() != "" {
		t.Fatal("nil credential should return empty token")
	}
	if cred.IsExpired() {
		t.Fatal("nil credential should not be expired")
	}
	if cred.IsOAuth() {
		t.Fatal("nil credential should not be OAuth")
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

	// Fallback file should NOT exist (keychain succeeded)
	path, _ := credentialFilePath()
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("expected no fallback file when keyring is available")
	}
}

func TestSaveAndLoadCredential_OAuth(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	_ = keyring.Delete(keyringService, keyringAccount)

	expiresAt := time.Now().Add(time.Hour).Truncate(time.Second)
	cred := NewOAuthCredential("at-abc", "rt-xyz", expiresAt)
	if err := SaveCredential(cred); err != nil {
		t.Fatalf("SaveCredential: %v", err)
	}

	got := LoadCredential()
	if got == nil {
		t.Fatal("expected credential, got nil")
	}
	if got.Type != CredentialTypeOAuth {
		t.Fatalf("expected type oauth, got %s", got.Type)
	}
	if got.Token() != "at-abc" {
		t.Fatalf("expected at-abc, got %q", got.Token())
	}
	if got.RefreshToken != "rt-xyz" {
		t.Fatalf("expected rt-xyz, got %q", got.RefreshToken)
	}
	if got.ExpiresAt == nil {
		t.Fatal("expected ExpiresAt to be set")
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

	_ = SaveCredential(NewOAuthCredential("at-keyring", "rt-keyring", time.Now().Add(time.Hour)))
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

	// Write credential directly to file (simulates fallback-only environment)
	cred := NewAPIKeyCredential("sk-file-key")
	data, _ := json.Marshal(cred)
	if err := saveToFile(string(data)); err != nil {
		t.Fatalf("saveToFile: %v", err)
	}

	// LoadCredential should find it in the file, migrate to keyring, and delete the file.
	got := LoadCredential()
	if got == nil || got.Token() != "sk-file-key" {
		t.Fatalf("expected sk-file-key, got %+v", got)
	}

	// Fallback file should be gone after migration.
	path, _ := credentialFilePath()
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("expected fallback file to be deleted after auto-migration")
	}

	// Second load should still work (from keyring now).
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

	// Credential should be in the fallback file as JSON
	path, _ := credentialFilePath()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("expected fallback file to exist: %v", err)
	}

	var loaded Credential
	if err := json.Unmarshal([]byte(data), &loaded); err != nil {
		t.Fatalf("fallback file should contain valid JSON: %v", err)
	}
	if loaded.Token() != "sk-no-keychain" {
		t.Fatalf("expected sk-no-keychain, got %q", loaded.Token())
	}

	// File permissions should be 0600
	info, _ := os.Stat(path)
	if perm := info.Mode().Perm(); perm != 0600 {
		t.Fatalf("expected file mode 0600, got %04o", perm)
	}
}

func TestSaveAndLoadCredential_KeychainUnavailable_RoundTrip(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	keyring.MockInitWithError(fmt.Errorf("D-Bus session bus not available"))
	t.Cleanup(func() { keyring.MockInit() })

	cred := NewOAuthCredential("at-roundtrip", "rt-roundtrip", time.Now().Add(time.Hour))
	if err := SaveCredential(cred); err != nil {
		t.Fatalf("SaveCredential: %v", err)
	}

	got := LoadCredential()
	if got == nil {
		t.Fatal("expected credential")
	}
	if got.Token() != "at-roundtrip" {
		t.Fatalf("expected at-roundtrip, got %q", got.Token())
	}
	if got.RefreshToken != "rt-roundtrip" {
		t.Fatalf("expected rt-roundtrip, got %q", got.RefreshToken)
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
