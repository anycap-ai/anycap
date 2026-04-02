package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type SpaceRepository interface {
	GetByOwnerUserID(ctx context.Context, ownerUserID int64) (*model.Space, error)
	CreatePersonalSpace(ctx context.Context, ownerUserID int64, name string) (*model.Space, error)
}

type SpaceService interface {
	GetOrCreatePersonalSpace(ctx context.Context, userID int64) (*model.Space, error)
}
