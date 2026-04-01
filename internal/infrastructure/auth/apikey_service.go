package auth

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikeycodec"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

type APIKeyRepository interface {
	Insert(ctx context.Context, key model.APIKey) error
	FindByPrefix(ctx context.Context, prefix string) (model.APIKey, error)
	TouchLastUsedAt(ctx context.Context, keyID string, usedAt time.Time) error
	Revoke(ctx context.Context, keyID string) error
	ListByUserID(ctx context.Context, userID string) ([]model.APIKey, error)
	DisableByUserID(ctx context.Context, userID, keyID string) error
	SoftDeleteByUserID(ctx context.Context, userID, keyID string) error
}

type RepositoryAPIKeyService struct {
	repo          APIKeyRepository
	authenticator *APIKeyAuthenticator
	now           func() time.Time
	rawKeyGen     func() (string, error)
}

func NewRepositoryAPIKeyService(repo APIKeyRepository, users port.UserReader, now func() time.Time, rawKeyGen func() (string, error)) *RepositoryAPIKeyService {
	if now == nil {
		now = time.Now
	}
	if rawKeyGen == nil {
		rawKeyGen = apikeycodec.GenerateRawKey
	}

	return &RepositoryAPIKeyService{
		repo:          repo,
		authenticator: NewAPIKeyAuthenticator(repo, users, now),
		now:           now,
		rawKeyGen:     rawKeyGen,
	}
}

func (s *RepositoryAPIKeyService) AuthenticateAPIKey(ctx context.Context, rawKey string) (model.Principal, error) {
	return s.authenticator.AuthenticateAPIKey(ctx, rawKey)
}

func (s *RepositoryAPIKeyService) CreateAPIKey(ctx context.Context, userID, name string) (model.CreatedAPIKey, error) {
	return s.createAPIKey(ctx, userID, name, 0)
}

func (s *RepositoryAPIKeyService) CreateAPIKeyWithTTL(ctx context.Context, userID, name string, ttl time.Duration) (model.CreatedAPIKey, error) {
	return s.createAPIKey(ctx, userID, name, ttl)
}

func (s *RepositoryAPIKeyService) createAPIKey(ctx context.Context, userID, name string, ttl time.Duration) (model.CreatedAPIKey, error) {
	rawKey, err := s.rawKeyGen()
	if err != nil {
		return model.CreatedAPIKey{}, err
	}

	now := s.now().UTC()
	apiKey := model.APIKey{
		ID:        externalid.Generate(externalid.PrefixAPIKeyID),
		UserID:    userID,
		Name:      name,
		KeyPrefix: apikeycodec.PrefixFromRawKey(rawKey),
		KeyHash:   apikeycodec.HashRawKey(rawKey),
		Status:    model.APIKeyStatusActive,
		CreatedAt: now,
	}
	if ttl > 0 {
		expiresAt := now.Add(ttl)
		apiKey.ExpiresAt = &expiresAt
	}
	if err := s.repo.Insert(ctx, apiKey); err != nil {
		return model.CreatedAPIKey{}, err
	}

	return model.CreatedAPIKey{
		APIKey: apiKey,
		RawKey: rawKey,
	}, nil
}

func (s *RepositoryAPIKeyService) RevokeAPIKey(ctx context.Context, keyID string) error {
	return s.repo.Revoke(ctx, keyID)
}

func (s *RepositoryAPIKeyService) ListAPIKeys(ctx context.Context, userID string) ([]model.APIKey, error) {
	return s.repo.ListByUserID(ctx, userID)
}

func (s *RepositoryAPIKeyService) DisableAPIKey(ctx context.Context, userID, keyID string) error {
	return s.repo.DisableByUserID(ctx, userID, keyID)
}

func (s *RepositoryAPIKeyService) DeleteAPIKey(ctx context.Context, userID, keyID string) error {
	return s.repo.SoftDeleteByUserID(ctx, userID, keyID)
}
