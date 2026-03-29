package auth

import (
	"context"
	"net/url"
	"strings"
	"testing"
)

func TestAuth0Stub_BuildLoginURL(t *testing.T) {
	client := NewStubClient("https://auth.anycap.local/authorize", nil)

	loginURL, err := client.BuildLoginURL(context.Background(), "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("BuildLoginURL() error = %v", err)
	}
	if !strings.Contains(loginURL, "state=state-123") {
		t.Fatalf("expected state in login URL, got %q", loginURL)
	}
}

func TestAuth0Client_BuildLoginURL(t *testing.T) {
	client := NewClient(ClientConfig{
		Issuer:       "https://example.auth0.com/",
		Audience:     "https://api.anycap.local",
		ClientID:     "client-123",
		ClientSecret: "secret-123",
		RedirectURL:  "https://anycap.local/auth/callback",
	}, nil)

	loginURL, err := client.BuildLoginURL(context.Background(), "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("BuildLoginURL() error = %v", err)
	}

	parsed, err := url.Parse(loginURL)
	if err != nil {
		t.Fatalf("parse login url: %v", err)
	}
	if parsed.Path != "/authorize" {
		t.Fatalf("expected /authorize path, got %q", parsed.Path)
	}
	query := parsed.Query()
	if query.Get("client_id") != "client-123" {
		t.Fatalf("expected client_id, got %q", query.Get("client_id"))
	}
	if query.Get("redirect_uri") != "http://127.0.0.1:14565/callback" {
		t.Fatalf("expected redirect_uri, got %q", query.Get("redirect_uri"))
	}
	if query.Get("state") != "state-123" {
		t.Fatalf("expected state, got %q", query.Get("state"))
	}
	if query.Get("response_type") != "code" {
		t.Fatalf("expected response_type=code, got %q", query.Get("response_type"))
	}
	if query.Get("audience") != "https://api.anycap.local" {
		t.Fatalf("expected audience, got %q", query.Get("audience"))
	}
	if query.Get("scope") != "openid profile email" {
		t.Fatalf("expected scope, got %q", query.Get("scope"))
	}
	if query.Get("prompt") != "login" {
		t.Fatalf("expected prompt=login, got %q", query.Get("prompt"))
	}
}
