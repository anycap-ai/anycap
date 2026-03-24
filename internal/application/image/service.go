package image

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	provider port.ImageProvider
}

func NewService(provider port.ImageProvider) *Service {
	return &Service{provider: provider}
}

func (s *Service) ListModels(ctx context.Context) ([]model.ImageModel, error) {
	return s.provider.ListImageModels(ctx)
}

func (s *Service) Generate(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error) {
	if req.Model == "" {
		req.Model = "flux-dev"
	}
	if err := req.Validate(); err != nil {
		return model.GenerateImageResult{}, err
	}

	return s.provider.GenerateImage(ctx, req)
}
