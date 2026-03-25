package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type NexusHubClient interface {
	ListImageModels(ctx context.Context) ([]model.ImageModel, error)
	GetImageModelSchema(ctx context.Context, modelName string) (map[string]any, error)
	GenerateImage(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error)
}
