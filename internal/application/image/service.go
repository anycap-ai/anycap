package image

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	nexusHub port.NexusHubClient
	credit   port.CreditClient
	callLogs port.CallLogRepo
}

func NewService(nexusHub port.NexusHubClient, credit port.CreditClient, callLogs port.CallLogRepo) *Service {
	return &Service{
		nexusHub: nexusHub,
		credit:   credit,
		callLogs: callLogs,
	}
}

func (s *Service) ListModels(ctx context.Context) ([]model.ImageModel, error) {
	if s == nil || s.nexusHub == nil {
		return nil, model.ErrImageProviderNotConfigured
	}
	return s.nexusHub.ListImageModels(ctx)
}

func (s *Service) GetModelSchema(ctx context.Context, modelName string) (map[string]any, error) {
	if s == nil || s.nexusHub == nil {
		return nil, model.ErrImageProviderNotConfigured
	}
	return s.nexusHub.GetImageModelSchema(ctx, modelName)
}

func (s *Service) Generate(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error) {
	if err := req.Validate(); err != nil {
		return model.GenerateImageResult{}, err
	}
	if s == nil || s.nexusHub == nil {
		return model.GenerateImageResult{}, model.ErrImageProviderNotConfigured
	}
	if s.credit == nil {
		return model.GenerateImageResult{}, model.ErrInternal
	}
	if req.UserID == "" {
		return model.GenerateImageResult{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		return model.GenerateImageResult{}, err
	}
	if balance.Available < 1 {
		return model.GenerateImageResult{}, model.ErrInsufficientCredit
	}

	startedAt := time.Now()
	result, err := s.nexusHub.GenerateImage(ctx, req)
	if err != nil {
		return model.GenerateImageResult{}, err
	}

	cost := result.CreditCost
	if cost <= 0 {
		cost = 1
	}
	if err := s.credit.Deduct(ctx, req.UserID, cost, "image.generate", req.RequestID); err != nil {
		return model.GenerateImageResult{}, model.ErrBillingUncertain
	}

	if s.callLogs != nil {
		_ = s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  req.RequestID,
			UserID:     req.UserID,
			Capability: "image.generate",
			Model:      req.Model,
			Status:     result.Status,
			LatencyMS:  time.Since(startedAt).Milliseconds(),
			CreditCost: cost,
		})
	}

	return result, nil
}
