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

type fakeAPIKeyUserReader struct {
	user model.User
	err  error
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

func (f *fakeAPIKeyUserReader) GetUserByID(_ context.Context, _ string) (model.User, error) {
	if f.err != nil {
		return model.User{}, f.err
	}
	return f.user, nil
}

func TestAPIKeyAuthenticator_AuthenticateActiveKey(t *testing.T) {
	repo := &fakeAPIKeyLookup{}
	authenticator := NewAPIKeyAuthenticator(repo, nil, func() time.Time {
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

func TestAPIKeyAuthenticator_AuthenticateActiveKeyHydratesUserProfile(t *testing.T) {
	repo := &fakeAPIKeyLookup{}
	authenticator := NewAPIKeyAuthenticator(repo, &fakeAPIKeyUserReader{
		user: model.User{
			ID:        "user-123",
			Email:     "internal@gmail.com",
			Name:      "Internal User",
			AvatarURL: "https://example.com/avatar.png",
		},
	}, func() time.Time {
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
	if principal.Email != "internal@gmail.com" {
		t.Fatalf("expected hydrated email, got %q", principal.Email)
	}
	if principal.Name != "Internal User" {
		t.Fatalf("expected hydrated name, got %q", principal.Name)
	}
	if principal.Picture != "https://example.com/avatar.png" {
		t.Fatalf("expected hydrated picture, got %q", principal.Picture)
	}
}

func TestAPIKeyAuthenticator_RejectRevokedKey(t *testing.T) {
	created, err := apikeyinfra.NewMemoryService().CreateAPIKey(context.Background(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}
	created.APIKey.Status = model.APIKeyStatusRevoked

	authenticator := NewAPIKeyAuthenticator(&fakeAPIKeyLookup{key: created.APIKey}, nil, time.Now)
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

	authenticator := NewAPIKeyAuthenticator(&fakeAPIKeyLookup{key: created.APIKey}, nil, func() time.Time {
		return time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	})
	_, err = authenticator.AuthenticateAPIKey(context.Background(), created.RawKey)
	if !errors.Is(err, model.ErrAuthInvalid) {
		t.Fatalf("expected ErrAuthInvalid, got %v", err)
	}
}
