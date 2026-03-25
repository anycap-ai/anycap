package auth

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	apikeyinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
)

type APIKeyLookup interface {
	FindByPrefix(ctx context.Context, prefix string) (model.APIKey, error)
	TouchLastUsedAt(ctx context.Context, keyID string, usedAt time.Time) error
}

type APIKeyAuthenticator struct {
	repo APIKeyLookup
	now  func() time.Time
}

func NewAPIKeyAuthenticator(repo APIKeyLookup, now func() time.Time) *APIKeyAuthenticator {
	if now == nil {
		now = time.Now
	}

	return &APIKeyAuthenticator{repo: repo, now: now}
}

func (a *APIKeyAuthenticator) AuthenticateAPIKey(ctx context.Context, rawKey string) (model.Principal, error) {
	key, err := a.repo.FindByPrefix(ctx, apikeyinfra.PrefixFromRawKey(rawKey))
	if err != nil {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if key.Status != apikeyinfra.ActiveStatus() {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if key.ExpiresAt != nil && a.now().After(*key.ExpiresAt) {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if key.KeyHash != apikeyinfra.HashRawKey(rawKey) {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if err := a.repo.TouchLastUsedAt(ctx, key.ID, a.now().UTC()); err != nil {
		return model.Principal{}, err
	}

	return model.Principal{
		UserID:   key.UserID,
		APIKeyID: key.ID,
		AuthType: "api_key",
		Scopes:   []string{"image.generate", "image.read", "system.read"},
	}, nil
}
