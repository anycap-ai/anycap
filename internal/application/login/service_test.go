package login

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
)

func TestService_Init(t *testing.T) {
	service := NewService(auth.NewStubProvider("https://auth.anycap.local/authorize"), func() string {
		return "state-123"
	})

	result, err := service.Init(context.Background())
	if err != nil {
		t.Fatalf("init login: %v", err)
	}

	if result.State != "state-123" {
		t.Fatalf("expected state-123, got %s", result.State)
	}
	if !strings.Contains(result.AuthURL, "state=state-123") {
		t.Fatalf("expected state in auth url, got %s", result.AuthURL)
	}
}
