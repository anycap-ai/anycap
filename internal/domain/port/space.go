package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type SpaceRepository interface {
	GetByOwnerUserID(ctx context.Context, ownerUserID string) (*model.Space, error)
	CreatePersonalSpace(ctx context.Context, ownerUserID, name string) (*model.Space, error)
}

type SpaceService interface {
	GetOrCreatePersonalSpace(ctx context.Context, userID string) (*model.Space, error)
}
