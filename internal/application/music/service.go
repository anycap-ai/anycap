package music

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Service struct {
	catalog     port.CatalogRepository
	nexusHub    port.NexusHubClient
	credit      port.CreditClient
	callLogs    port.CallLogRepo
	usage       port.UsageWriter
	artifactPub port.ArtifactPublisher
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

func (s *Service) SetArtifactPublisher(publisher port.ArtifactPublisher) {
	s.artifactPub = publisher
}

func (s *Service) Generate(ctx context.Context, req model.GenerateMusicRequest) (model.GenerateMusicResult, error) {
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"capability": "music.generate",
		"model":      req.Model,
	})

	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("music request validation failed")
		return model.GenerateMusicResult{}, err
	}
	if s == nil || s.catalog == nil || s.nexusHub == nil {
		logger.Error("music execution not configured")
		return model.GenerateMusicResult{}, model.ErrMusicExecutionNotConfigured
	}
	if s.credit == nil {
		logger.Error("music credit client not configured")
		return model.GenerateMusicResult{}, model.ErrInternal
	}
	if req.UserID == "" {
		logger.Warn("missing user id for music request")
		return model.GenerateMusicResult{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		logger.WithError(err).Error("music credit balance lookup failed")
		return model.GenerateMusicResult{}, err
	}
	if balance.Available < 1 {
		logger.WithField("available_credit", balance.Available).Warn("insufficient credit for music request")
		return model.GenerateMusicResult{}, model.ErrInsufficientCredit
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityMusic, req.Model)
	if err != nil {
		logger.WithError(err).Error("music model lookup failed")
		return model.GenerateMusicResult{}, err
	}
	mode := req.Mode
	if mode == "" {
		mode = model.InferMusicMode(req)
	}
	route, err := model.SelectRoute(spec, model.OperationGenerate, mode)
	if err != nil {
		logger.WithField("mode", mode).WithError(err).Warn("music route selection failed")
		return model.GenerateMusicResult{}, err
	}

	startedAt := time.Now()
	result, err := s.nexusHub.GenerateMusic(ctx, req, route)
	if err != nil {
		logger.WithFields(logging.Fields{
			"ability_key": route.AbilityKey,
			"mode":        mode,
		}).WithError(err).Error("music generation failed")
		return model.GenerateMusicResult{}, err
	}
	if s.artifactPub != nil {
		published, publishErr := s.artifactPub.Publish(ctx, model.ArtifactPublishRequest{
			UserID:         req.UserID,
			Capability:     "music.generate",
			MediaType:      model.CapsArtifactMediaTypeMusic,
			Provider:       "nexushub",
			ProviderTaskID: result.ID,
			Outputs:        result.Outputs,
		})
		if publishErr != nil {
			return model.GenerateMusicResult{}, publishErr
		}
		result.Outputs = published.Outputs
	}

	cost := result.CreditCost
	if s.usage != nil {
		eventID := externalid.Generate(externalid.PrefixUsageEvent)
		runID := externalid.Generate(externalid.PrefixProviderRun)
		if usageErr := s.usage.InsertUsageEvent(ctx, model.UsageEventRecord{
			ID:            eventID,
			UserID:        req.UserID,
			APIKeyID:      req.APIKeyID,
			ProductArea:   "capability",
			Action:        "music.generate",
			Provider:      "nexushub",
			RequestID:     req.RequestID,
			Status:        result.Status,
			EstimatedCost: cost,
			FinalCost:     cost,
			OccurredAt:    startedAt.UTC(),
		}); usageErr != nil {
			logger.WithFields(logging.Fields{
				"provider":    "nexushub",
				"credit_cost": cost,
			}).WithError(usageErr).Warn("usage event persistence failed")
		}
		if runErr := s.usage.InsertProviderRun(ctx, model.ProviderRunRecord{
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
		}); runErr != nil {
			logger.WithFields(logging.Fields{
				"provider":       "nexushub",
				"provider_task":  result.ID,
				"ability_key":    route.AbilityKey,
				"provider_state": result.Status,
			}).WithError(runErr).Warn("provider run persistence failed")
		}
	}
	if err := s.credit.Deduct(ctx, req.UserID, cost, "music.generate", req.RequestID); err != nil {
		logger.WithField("credit_cost", cost).WithError(err).Error("music credit deduction failed")
		return model.GenerateMusicResult{}, model.ErrBillingUncertain
	}

	if s.callLogs != nil {
		if callLogErr := s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  req.RequestID,
			UserID:     req.UserID,
			APIKeyID:   req.APIKeyID,
			Capability: "music.generate",
			Model:      req.Model,
			Status:     result.Status,
			LatencyMS:  time.Since(startedAt).Milliseconds(),
			CreditCost: cost,
		}); callLogErr != nil {
			logger.WithFields(logging.Fields{
				"credit_cost": cost,
				"latency_ms":  time.Since(startedAt).Milliseconds(),
			}).WithError(callLogErr).Warn("call log persistence failed")
		}
	}

	return result, nil
}
