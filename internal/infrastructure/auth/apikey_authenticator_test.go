package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	apikeyinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
)

type fakeAPIKeyLookup struct {
	key        model.APIKey
	findErr    error
	touchedKey string
}

func (f *fakeAPIKeyLookup) FindByPrefix(_ context.Context, _ string) (model.APIKey, error) {
	if f.findErr != nil {
		return model.APIKey{}, f.findErr
	}
	return f.key, nil
}

func (f *fakeAPIKeyLookup) TouchLastUsedAt(_ context.Context, keyID string, _ time.Time) error {
	f.touchedKey = keyID
	return nil
}

func TestAPIKeyAuthenticator_AuthenticateActiveKey(t *testing.T) {
	repo := &fakeAPIKeyLookup{}
	authenticator := NewAPIKeyAuthenticator(repo, func() time.Time {
		return time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	})

	created, err := apikeyinfra.NewMemoryService().CreateAPIKey(context.Background(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}
	repo.key = created.APIKey

	principal, err := authenticator.AuthenticateAPIKey(context.Background(), created.RawKey)
	if err != nil {
		t.Fatalf("AuthenticateAPIKey() error = %v", err)
	}
	if principal.UserID != "user-123" {
		t.Fatalf("expected user-123, got %q", principal.UserID)
	}
	if repo.touchedKey != created.APIKey.ID {
		t.Fatalf("expected touched key %q, got %q", created.APIKey.ID, repo.touchedKey)
	}
}

func TestAPIKeyAuthenticator_RejectRevokedKey(t *testing.T) {
	created, err := apikeyinfra.NewMemoryService().CreateAPIKey(context.Background(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}
	created.APIKey.Status = "revoked"

	authenticator := NewAPIKeyAuthenticator(&fakeAPIKeyLookup{key: created.APIKey}, time.Now)
	_, err = authenticator.AuthenticateAPIKey(context.Background(), created.RawKey)
	if !errors.Is(err, model.ErrAuthInvalid) {
		t.Fatalf("expected ErrAuthInvalid, got %v", err)
	}
}

func TestAPIKeyAuthenticator_RejectExpiredKey(t *testing.T) {
	created, err := apikeyinfra.NewMemoryService().CreateAPIKey(context.Background(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}
	expiredAt := time.Date(2026, 3, 24, 11, 0, 0, 0, time.UTC)
	created.APIKey.ExpiresAt = &expiredAt

	authenticator := NewAPIKeyAuthenticator(&fakeAPIKeyLookup{key: created.APIKey}, func() time.Time {
		return time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	})
	_, err = authenticator.AuthenticateAPIKey(context.Background(), created.RawKey)
	if !errors.Is(err, model.ErrAuthInvalid) {
		t.Fatalf("expected ErrAuthInvalid, got %v", err)
	}
}
