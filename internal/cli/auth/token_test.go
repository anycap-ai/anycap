package auth

import (
	"testing"
)

func TestParseTokenResponse_APIKey(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"api_key","access_token":"sk-test-123","user":{"email":"dev@anycap.ai","name":"Dev"}}}`)

	cred, email, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cred.Token() != "sk-test-123" {
		t.Errorf("expected token sk-test-123, got %q", cred.Token())
	}
	if cred.IsOAuth() {
		t.Error("expected API key credential, got OAuth")
	}
	if email != "dev@anycap.ai" {
		t.Errorf("expected email dev@anycap.ai, got %q", email)
	}
}

func TestParseTokenResponse_APIKeyMVPShape(t *testing.T) {
	body := []byte(`{"data":{"api_key":"ak-test-123","api_key_id":"key-123","user":{"email":"dev@anycap.ai","name":"Dev"}}}`)

	cred, email, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cred.Token() != "ak-test-123" {
		t.Errorf("expected token ak-test-123, got %q", cred.Token())
	}
	if cred.IsOAuth() {
		t.Error("expected API key credential, got OAuth")
	}
	if email != "dev@anycap.ai" {
		t.Errorf("expected email dev@anycap.ai, got %q", email)
	}
}

func TestParseTokenResponse_OAuth(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"oauth","access_token":"eyJ-test","refresh_token":"rt-test","expires_in":3600,"user":{"email":"user@anycap.ai"}}}`)

	cred, email, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cred.Token() != "eyJ-test" {
		t.Errorf("expected token eyJ-test, got %q", cred.Token())
	}
	if !cred.IsOAuth() {
		t.Error("expected OAuth credential, got API key")
	}
	if cred.RefreshToken != "rt-test" {
		t.Errorf("expected refresh_token rt-test, got %q", cred.RefreshToken)
	}
	if email != "user@anycap.ai" {
		t.Errorf("expected email user@anycap.ai, got %q", email)
	}
}

func TestParseTokenResponse_InferAPIKey(t *testing.T) {
	// No credential_type field, no refresh_token -> infer API key
	body := []byte(`{"data":{"access_token":"sk-inferred","user":{"email":"test@test.com"}}}`)

	cred, _, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cred.IsOAuth() {
		t.Error("expected inferred API key, got OAuth")
	}
	if cred.Token() != "sk-inferred" {
		t.Errorf("expected sk-inferred, got %q", cred.Token())
	}
}

func TestParseTokenResponse_InferOAuth(t *testing.T) {
	// No credential_type field, but has refresh_token -> infer OAuth
	body := []byte(`{"data":{"access_token":"eyJ-inferred","refresh_token":"rt-inferred","expires_in":7200}}`)

	cred, _, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !cred.IsOAuth() {
		t.Error("expected inferred OAuth, got API key")
	}
}

func TestParseTokenResponse_EmptyAccessToken(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"api_key","access_token":""}}`)

	_, _, err := parseTokenResponse(body)
	if err == nil {
		t.Fatal("expected error for empty api key token")
	}
}

func TestParseTokenResponse_UnknownType(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"magic","access_token":"tok"}}`)

	_, _, err := parseTokenResponse(body)
	if err == nil {
		t.Fatal("expected error for unknown credential_type")
	}
}

func TestParseTokenResponse_InvalidJSON(t *testing.T) {
	_, _, err := parseTokenResponse([]byte(`not json`))
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}

func TestParseTokenResponse_NoUser(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"api_key","access_token":"sk-no-user"}}`)

	cred, email, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cred.Token() != "sk-no-user" {
		t.Errorf("expected sk-no-user, got %q", cred.Token())
	}
	if email != "" {
		t.Errorf("expected empty email, got %q", email)
	}
}
