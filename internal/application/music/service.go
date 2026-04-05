package music

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/execflow"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Service struct {
	catalog     port.CatalogRepository
	nexusHub    port.NexusHubClient
	credit      port.CreditClient
	billing     port.BillingCoordinator
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

func (s *Service) SetBillingCoordinator(billing port.BillingCoordinator) {
	s.billing = billing
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

	result, err := execflow.Run(ctx, execflow.NewExecutor(s.credit, s.billing, s.usage, s.callLogs), execflow.Input{
		UserID:     req.UserID,
		APIKeyID:   req.APIKeyID,
		Capability: "music.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  req.RequestID,
		Model:      req.Model,
		MinCredit:  1,
	}, execflow.Hooks[model.GenerateMusicResult]{
		Invoke: func(ctx context.Context) (model.GenerateMusicResult, error) {
			result, err := s.nexusHub.GenerateMusic(ctx, req, route)
			if err != nil {
				logger.WithFields(logging.Fields{
					"ability_key": route.AbilityKey,
					"mode":        mode,
				}).WithError(err).Error("music generation failed")
			}
			return result, err
		},
		OnProviderSuccess: func(result model.GenerateMusicResult) execflow.ProviderSuccessMeta {
			return execflow.ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
		AfterSuccess: func(ctx context.Context, result *model.GenerateMusicResult) error {
			if s.artifactPub == nil {
				return nil
			}
			published, err := s.artifactPub.Publish(ctx, model.ArtifactPublishRequest{
				UserID:         req.UserID,
				Capability:     "music.generate",
				MediaType:      model.CapsArtifactMediaTypeMusic,
				Provider:       "nexushub",
				ProviderTaskID: result.ID,
				Outputs:        result.Outputs,
			})
			if err != nil {
				return err
			}
			result.Outputs = published.Outputs
			return nil
		},
		BuildUsageRecords: func(result model.GenerateMusicResult, startedAt time.Time) *execflow.UsageRecords {
			eventID := externalid.Generate(externalid.PrefixUsageEvent)
			runID := externalid.Generate(externalid.PrefixProviderRun)
			return &execflow.UsageRecords{
				Event: &model.UsageEventRecord{
					ID:            eventID,
					UserID:        req.UserID,
					APIKeyID:      req.APIKeyID,
					ProductArea:   "capability",
					Action:        "music.generate",
					Provider:      "nexushub",
					RequestID:     req.RequestID,
					Status:        result.Status,
					EstimatedCost: result.CreditCost,
					FinalCost:     result.CreditCost,
					OccurredAt:    startedAt.UTC(),
				},
				ProviderRun: &model.ProviderRunRecord{
					ID:             runID,
					Provider:       "nexushub",
					ProviderTaskID: result.ID,
					UsageEventID:   eventID,
					AuthMode:       "platform_token",
					AbilityKey:     route.AbilityKey,
					ProviderStatus: result.Status,
					ProviderUsage:  result.Usage,
					ProviderCost:   result.CreditCost,
					RawResult: map[string]any{
						"model":   result.Model,
						"outputs": result.Outputs,
					},
					SubmittedAt: startedAt.UTC(),
				},
			}
		},
		BuildCallLog: func(result model.GenerateMusicResult, startedAt time.Time) *model.CallLog {
			return &model.CallLog{
				RequestID:  req.RequestID,
				UserID:     req.UserID,
				APIKeyID:   req.APIKeyID,
				Capability: "music.generate",
				Model:      req.Model,
				Status:     result.Status,
				LatencyMS:  time.Since(startedAt).Milliseconds(),
				CreditCost: result.CreditCost,
			}
		},
	})
	if err != nil {
		return model.GenerateMusicResult{}, err
	}

	return result, nil
}
