package auth

import (
	"context"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	apikeyinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
)

type APIKeyRepository interface {
	Insert(ctx context.Context, key model.APIKey) error
	FindByPrefix(ctx context.Context, prefix string) (model.APIKey, error)
	TouchLastUsedAt(ctx context.Context, keyID string, usedAt time.Time) error
	Revoke(ctx context.Context, keyID string) error
}

type RepositoryAPIKeyService struct {
	repo          APIKeyRepository
	authenticator *APIKeyAuthenticator
	now           func() time.Time
	rawKeyGen     func() (string, error)
}

func NewRepositoryAPIKeyService(repo APIKeyRepository, now func() time.Time, rawKeyGen func() (string, error)) *RepositoryAPIKeyService {
	if now == nil {
		now = time.Now
	}
	if rawKeyGen == nil {
		rawKeyGen = apikeyinfra.GenerateRawKey
	}

	return &RepositoryAPIKeyService{
		repo:          repo,
		authenticator: NewAPIKeyAuthenticator(repo, now),
		now:           now,
		rawKeyGen:     rawKeyGen,
	}
}

func (s *RepositoryAPIKeyService) AuthenticateAPIKey(ctx context.Context, rawKey string) (model.Principal, error) {
	return s.authenticator.AuthenticateAPIKey(ctx, rawKey)
}

func (s *RepositoryAPIKeyService) CreateAPIKey(ctx context.Context, userID, name string) (model.CreatedAPIKey, error) {
	rawKey, err := s.rawKeyGen()
	if err != nil {
		return model.CreatedAPIKey{}, err
	}

	now := s.now().UTC()
	apiKey := model.APIKey{
		ID:        fmt.Sprintf("key_%d", now.UnixNano()),
		UserID:    userID,
		Name:      name,
		KeyPrefix: apikeyinfra.PrefixFromRawKey(rawKey),
		KeyHash:   apikeyinfra.HashRawKey(rawKey),
		Status:    apikeyinfra.ActiveStatus(),
		CreatedAt: now,
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
