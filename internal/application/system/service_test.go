package system

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type fakeAPIKeyService struct {
	revoked []string
}

func (f *fakeAPIKeyService) AuthenticateAPIKey(_ context.Context, _ string) (model.Principal, error) {
	return model.Principal{}, nil
}

func (f *fakeAPIKeyService) CreateAPIKey(_ context.Context, _, _ string) (model.CreatedAPIKey, error) {
	return model.CreatedAPIKey{}, nil
}

func (f *fakeAPIKeyService) CreateAPIKeyWithTTL(_ context.Context, _, _ string, _ time.Duration) (model.CreatedAPIKey, error) {
	return model.CreatedAPIKey{}, nil
}

func (f *fakeAPIKeyService) RevokeAPIKey(_ context.Context, keyID string) error {
	f.revoked = append(f.revoked, keyID)
	return nil
}

func TestService_Status(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{
		Version: "dev",
		Commit:  "abc123",
		Date:    "2026-03-24T00:00:00Z",
	}, nil)

	status := service.Status(nil)
	if status.Service.Name != "anycap-server" {
		t.Fatalf("expected anycap-server, got %s", status.Service.Name)
	}
	if status.Service.Version != "dev" {
		t.Fatalf("expected version dev, got %s", status.Service.Version)
	}
	if status.Service.Status != "ok" {
		t.Fatalf("expected status ok, got %s", status.Service.Status)
	}
}

func TestService_LogoutRevokesCurrentAPIKey(t *testing.T) {
	apiKeys := &fakeAPIKeyService{}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, apiKeys)

	err := service.Logout(context.Background(), &model.Principal{
		UserID:   "user-1",
		APIKeyID: "key-123",
		AuthType: "api_key",
	})
	if err != nil {
		t.Fatalf("Logout() error = %v", err)
	}
	if len(apiKeys.revoked) != 1 || apiKeys.revoked[0] != "key-123" {
		t.Fatalf("unexpected revoked keys: %+v", apiKeys.revoked)
	}
}
