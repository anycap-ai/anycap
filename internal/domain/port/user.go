package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type UserProvisioner interface {
	FindOrCreateByAuthIdentity(ctx context.Context, provider string, authUser model.AuthUser, now time.Time) (model.User, bool, error)
}

type UserReader interface {
	GetUserByID(ctx context.Context, userID string) (model.User, error)
}
