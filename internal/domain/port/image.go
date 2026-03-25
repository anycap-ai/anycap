package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ImageService interface {
	ListModels(ctx context.Context) ([]model.ImageModel, error)
	GetModelSchema(ctx context.Context, modelName string) (map[string]any, error)
	Generate(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error)
}
