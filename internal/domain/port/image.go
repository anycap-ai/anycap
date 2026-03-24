package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ImageProvider interface {
	ListImageModels(ctx context.Context) ([]model.ImageModel, error)
	GenerateImage(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error)
}

type ImageService interface {
	ListModels(ctx context.Context) ([]model.ImageModel, error)
	Generate(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error)
}
