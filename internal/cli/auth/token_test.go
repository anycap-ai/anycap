package auth

import "testing"

func TestParseTokenResponse_APIKeyLegacyShape(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"api_key","access_token":"sk-test-123","user":{"email":"dev@anycap.ai","name":"Dev"}}}`)

	cred, email, err := parseTokenResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cred.Token() != "sk-test-123" {
		t.Errorf("expected token sk-test-123, got %q", cred.Token())
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
	if email != "dev@anycap.ai" {
		t.Errorf("expected email dev@anycap.ai, got %q", email)
	}
}

func TestParseTokenResponse_RejectsOAuthType(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"oauth","access_token":"eyJ-test"}}`)

	_, _, err := parseTokenResponse(body)
	if err == nil {
		t.Fatal("expected error for unsupported oauth credential_type")
	}
}

func TestParseTokenResponse_EmptyAccessToken(t *testing.T) {
	body := []byte(`{"data":{"credential_type":"api_key","access_token":""}}`)

	_, _, err := parseTokenResponse(body)
	if err == nil {
		t.Fatal("expected error for empty api key token")
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
