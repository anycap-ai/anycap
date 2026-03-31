package video

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

type Service struct {
	catalog  port.CatalogRepository
	nexusHub port.NexusHubClient
	credit   port.CreditClient
	callLogs port.CallLogRepo
	usage    port.UsageWriter
}

func NewService(catalog port.CatalogRepository, nexusHub port.NexusHubClient, credit port.CreditClient, callLogs port.CallLogRepo) *Service {
	return &Service{
		catalog:  catalog,
		nexusHub: nexusHub,
		credit:   credit,
		callLogs: callLogs,
	}
}

func (s *Service) SetUsageWriter(usage port.UsageWriter) {
	s.usage = usage
}

func (s *Service) Generate(ctx context.Context, req model.GenerateVideoRequest) (model.GenerateVideoResult, error) {
	if err := req.Validate(); err != nil {
		return model.GenerateVideoResult{}, err
	}
	if s == nil || s.catalog == nil || s.nexusHub == nil {
		return model.GenerateVideoResult{}, model.ErrVideoExecutionNotConfigured
	}
	if s.credit == nil {
		return model.GenerateVideoResult{}, model.ErrInternal
	}
	if req.UserID == "" {
		return model.GenerateVideoResult{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		return model.GenerateVideoResult{}, err
	}
	if balance.Available < 1 {
		return model.GenerateVideoResult{}, model.ErrInsufficientCredit
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityVideo, req.Model)
	if err != nil {
		return model.GenerateVideoResult{}, err
	}
	mode := req.Mode
	if mode == "" {
		mode = model.InferVideoMode(req)
	}
	route, err := model.SelectRoute(spec, model.OperationGenerate, mode)
	if err != nil {
		return model.GenerateVideoResult{}, err
	}

	startedAt := time.Now()
	result, err := s.nexusHub.GenerateVideo(ctx, req, route)
	if err != nil {
		return model.GenerateVideoResult{}, err
	}

	cost := result.CreditCost
	if cost <= 0 {
		cost = 1
	}
	if s.usage != nil {
		eventID := externalid.Generate(externalid.PrefixUsageEvent)
		runID := externalid.Generate(externalid.PrefixProviderRun)
		_ = s.usage.InsertUsageEvent(ctx, model.UsageEventRecord{
			ID:            eventID,
			UserID:        req.UserID,
			APIKeyID:      req.APIKeyID,
			ProductArea:   "capability",
			Action:        "video.generate",
			Provider:      "nexushub",
			RequestID:     req.RequestID,
			Status:        result.Status,
			EstimatedCost: cost,
			FinalCost:     cost,
			OccurredAt:    startedAt.UTC(),
		})
		_ = s.usage.InsertProviderRun(ctx, model.ProviderRunRecord{
			ID:             runID,
			Provider:       "nexushub",
			ProviderTaskID: result.ID,
			UsageEventID:   eventID,
			AuthMode:       "platform_token",
			AbilityKey:     route.AbilityKey,
			ProviderStatus: result.Status,
			ProviderUsage:  result.Usage,
			ProviderCost:   cost,
			RawResult: map[string]any{
				"model":   result.Model,
				"outputs": result.Outputs,
			},
			SubmittedAt: startedAt.UTC(),
		})
	}
	if err := s.credit.Deduct(ctx, req.UserID, cost, "video.generate", req.RequestID); err != nil {
		return model.GenerateVideoResult{}, model.ErrBillingUncertain
	}

	if s.callLogs != nil {
		_ = s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  req.RequestID,
			UserID:     req.UserID,
			APIKeyID:   req.APIKeyID,
			Capability: "video.generate",
			Model:      req.Model,
			Status:     result.Status,
			LatencyMS:  time.Since(startedAt).Milliseconds(),
			CreditCost: cost,
		})
	}

	return result, nil
}
