package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type APIKeyService interface {
	AuthenticateAPIKey(ctx context.Context, rawKey string) (model.Principal, error)
	CreateAPIKey(ctx context.Context, userID, name string) (model.CreatedAPIKey, error)
	CreateAPIKeyWithTTL(ctx context.Context, userID, name string, ttl time.Duration) (model.CreatedAPIKey, error)
	RevokeAPIKey(ctx context.Context, keyID string) error
	ListAPIKeys(ctx context.Context, userID string) ([]model.APIKey, error)
	DisableAPIKey(ctx context.Context, userID, keyID string) error
	DeleteAPIKey(ctx context.Context, userID, keyID string) error
}
