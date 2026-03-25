package capabilities

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

// Service orchestrates capabilities operations (presign, image understand, video read).
type Service struct {
	provider port.CapabilitiesProvider
	storage  port.ObjectStorage
}

func NewService(provider port.CapabilitiesProvider, storage port.ObjectStorage) *Service {
	return &Service{provider: provider, storage: storage}
}

func (s *Service) Presign(ctx context.Context, req model.PresignRequest) (model.PresignResult, error) {
	if err := req.Validate(); err != nil {
		return model.PresignResult{}, err
	}

	if s.storage == nil {
		return model.PresignResult{}, model.ErrStorageNotConfigured
	}

	return s.storage.PresignPut(ctx, req)
}

func (s *Service) ImageUnderstand(ctx context.Context, req model.ImageUnderstandRequest) (model.UnderstandResult, error) {
	if err := req.Validate(); err != nil {
		return model.UnderstandResult{}, err
	}

	return s.provider.ImageUnderstand(ctx, req)
}

func (s *Service) VideoRead(ctx context.Context, req model.VideoReadRequest) (model.UnderstandResult, error) {
	if err := req.Validate(); err != nil {
		return model.UnderstandResult{}, err
	}

	return s.provider.VideoRead(ctx, req)
}
