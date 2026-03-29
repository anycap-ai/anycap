package security

import "testing"

func TestHashPasswordPBKDF2SHA256_Format(t *testing.T) {
	hash, salt, err := HashPasswordPBKDF2SHA256("secret-123", "pepper")
	if err != nil {
		t.Fatalf("HashPasswordPBKDF2SHA256() error = %v", err)
	}
	if hash == "" || salt == "" {
		t.Fatal("expected non-empty hash and salt")
	}
	prefix := "pbkdf2_sha256$120000$v1$"
	if len(hash) <= len(prefix) || hash[:len(prefix)] != prefix {
		t.Fatalf("expected hash prefix %q, got %q", prefix, hash)
	}
}
