package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type APIKeyService interface {
	AuthenticateAPIKey(ctx context.Context, rawKey string) (model.Principal, error)
	CreateAPIKey(ctx context.Context, userID, name string) (model.CreatedAPIKey, error)
	RevokeAPIKey(ctx context.Context, keyID string) error
}
