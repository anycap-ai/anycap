package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// ModelRouteRepository 提供 AnyCap 路由管理的 CRUD 能力。
type ModelRouteRepository interface {
	ListModelRoutes(ctx context.Context, filter model.ListModelRoutesFilter) ([]model.ModelRoute, error)
	GetModelRoute(ctx context.Context, id int64) (*model.ModelRoute, error)
	CreateModelRoute(ctx context.Context, input model.CreateModelRouteInput) (*model.ModelRoute, error)
	UpdateModelRoute(ctx context.Context, id int64, input model.UpdateModelRouteInput) (*model.ModelRoute, error)
	DeleteModelRoute(ctx context.Context, id int64) error
}
