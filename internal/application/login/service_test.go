package login

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
)

func TestService_Init(t *testing.T) {
	service := NewService(auth.NewStubClient("https://auth.anycap.local/authorize", nil), apikey.NewMemoryService(), func() string {
		return "state-123"
	})

	result, err := service.Init(context.Background())
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if result.State != "state-123" {
		t.Fatalf("expected state-123, got %q", result.State)
	}
	if !strings.Contains(result.AuthURL, "state=state-123") {
		t.Fatalf("expected auth URL to contain state, got %q", result.AuthURL)
	}
}

func TestService_Callback(t *testing.T) {
	service := NewService(auth.NewStubClient("https://auth.anycap.local/authorize", map[string]model.AuthUser{
		"code-123": {UserID: "user-123", Email: "user@example.com"},
	}), apikey.NewMemoryService(), func() string {
		return "state-123"
	})

	result, err := service.Callback(context.Background(), "code-123")
	if err != nil {
		t.Fatalf("Callback() error = %v", err)
	}
	if result.UserID != "user-123" {
		t.Fatalf("expected user-123, got %q", result.UserID)
	}
	if result.APIKey == "" {
		t.Fatal("expected API key")
	}
}

func TestService_CallbackIsIdempotent(t *testing.T) {
	service := NewService(auth.NewStubClient("https://auth.anycap.local/authorize", map[string]model.AuthUser{
		"code-123": {UserID: "user-123", Email: "user@example.com"},
	}), apikey.NewMemoryService(), nil)

	first, err := service.Callback(context.Background(), "code-123")
	if err != nil {
		t.Fatalf("first Callback() error = %v", err)
	}
	second, err := service.Callback(context.Background(), "code-123")
	if err != nil {
		t.Fatalf("second Callback() error = %v", err)
	}
	if first.APIKey != second.APIKey {
		t.Fatalf("expected idempotent callback API key, got %q and %q", first.APIKey, second.APIKey)
	}
}
