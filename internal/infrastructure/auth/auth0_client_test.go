package auth

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestAuth0Stub_BuildLoginURL(t *testing.T) {
	client := NewStubClient("https://auth.anycap.local/authorize", nil)

	loginURL, err := client.BuildLoginURL(context.Background(), "state-123")
	if err != nil {
		t.Fatalf("BuildLoginURL() error = %v", err)
	}
	if !strings.Contains(loginURL, "state=state-123") {
		t.Fatalf("expected state in login URL, got %q", loginURL)
	}
}

func TestAuth0Stub_ExchangeCode(t *testing.T) {
	client := NewStubClient("https://auth.anycap.local/authorize", map[string]model.AuthUser{
		"code-123": {UserID: "user-123", Email: "user@example.com"},
	})

	user, err := client.ExchangeCode(context.Background(), "code-123")
	if err != nil {
		t.Fatalf("ExchangeCode() error = %v", err)
	}
	if user.UserID != "user-123" {
		t.Fatalf("expected user-123, got %q", user.UserID)
	}
}
