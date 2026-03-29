package auth

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikeycodec"
)

type fakeAPIKeyRepo struct {
	inserted []model.APIKey
	found    model.APIKey
	revoked  []string
}

func (f *fakeAPIKeyRepo) Insert(_ context.Context, key model.APIKey) error {
	f.inserted = append(f.inserted, key)
	return nil
}

func (f *fakeAPIKeyRepo) FindByPrefix(_ context.Context, _ string) (model.APIKey, error) {
	return f.found, nil
}

func (f *fakeAPIKeyRepo) TouchLastUsedAt(_ context.Context, _ string, _ time.Time) error {
	return nil
}

func (f *fakeAPIKeyRepo) Revoke(_ context.Context, keyID string) error {
	f.revoked = append(f.revoked, keyID)
	return nil
}

func TestRepositoryAPIKeyService_CreateAPIKey(t *testing.T) {
	repo := &fakeAPIKeyRepo{}
	service := NewRepositoryAPIKeyService(repo, func() time.Time {
		return time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	}, func() (string, error) {
		return "ak_test_raw_key_123456", nil
	})

	created, err := service.CreateAPIKey(context.Background(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}
	if created.RawKey != "ak_test_raw_key_123456" {
		t.Fatalf("expected raw key to round-trip, got %q", created.RawKey)
	}
	if len(repo.inserted) != 1 {
		t.Fatalf("expected 1 inserted key, got %d", len(repo.inserted))
	}
	if repo.inserted[0].UserID != "user-123" {
		t.Fatalf("expected inserted user user-123, got %q", repo.inserted[0].UserID)
	}
	if repo.inserted[0].ExpiresAt != nil {
		t.Fatalf("expected default api key to have no expiry, got %v", repo.inserted[0].ExpiresAt)
	}
}

func TestRepositoryAPIKeyService_CreateAPIKeyWithTTL(t *testing.T) {
	repo := &fakeAPIKeyRepo{}
	now := time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	service := NewRepositoryAPIKeyService(repo, func() time.Time {
		return now
	}, func() (string, error) {
		return "ak_test_raw_key_123456", nil
	})

	_, err := service.CreateAPIKeyWithTTL(context.Background(), "user-123", "cli", 7*24*time.Hour)
	if err != nil {
		t.Fatalf("CreateAPIKeyWithTTL() error = %v", err)
	}
	if len(repo.inserted) != 1 {
		t.Fatalf("expected 1 inserted key, got %d", len(repo.inserted))
	}
	if repo.inserted[0].ExpiresAt == nil {
		t.Fatal("expected expires_at to be set")
	}
	want := now.Add(7 * 24 * time.Hour)
	if !repo.inserted[0].ExpiresAt.Equal(want) {
		t.Fatalf("expected expires_at %v, got %v", want, *repo.inserted[0].ExpiresAt)
	}
}

func TestRepositoryAPIKeyService_AuthenticateAPIKey(t *testing.T) {
	repo := &fakeAPIKeyRepo{}
	service := NewRepositoryAPIKeyService(repo, func() time.Time {
		return time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	}, func() (string, error) {
		return "ak_test_raw_key_123456", nil
	})

	created, err := service.CreateAPIKey(context.Background(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}
	repo.found = repo.inserted[0]

	principal, err := service.AuthenticateAPIKey(context.Background(), created.RawKey)
	if err != nil {
		t.Fatalf("AuthenticateAPIKey() error = %v", err)
	}
	if principal.APIKeyID == "" || principal.UserID != "user-123" {
		t.Fatalf("unexpected principal: %+v", principal)
	}
}

func TestRepositoryAPIKeyService_RevokeAPIKey(t *testing.T) {
	repo := &fakeAPIKeyRepo{}
	service := NewRepositoryAPIKeyService(repo, time.Now, apikeycodec.GenerateRawKey)

	if err := service.RevokeAPIKey(context.Background(), "key-123"); err != nil {
		t.Fatalf("RevokeAPIKey() error = %v", err)
	}
	if len(repo.revoked) != 1 || repo.revoked[0] != "key-123" {
		t.Fatalf("unexpected revoked keys: %+v", repo.revoked)
	}
}
