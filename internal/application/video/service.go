package video

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
	catalog        port.CatalogRepository
	nexusHub       port.NexusHubClient
	credit         port.CreditClient
	billing        port.BillingCoordinator
	callLogs       port.CallLogRepo
	usage          port.UsageWriter
	uploadResolver port.UploadRefResolver
	artifactPub    port.ArtifactPublisher
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

func (s *Service) SetUploadRefResolver(r port.UploadRefResolver) {
	s.uploadResolver = r
}

func (s *Service) SetArtifactPublisher(publisher port.ArtifactPublisher) {
	s.artifactPub = publisher
}

func (s *Service) Generate(ctx context.Context, req model.GenerateVideoRequest) (model.GenerateVideoResult, error) {
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"capability": "video.generate",
		"model":      req.Model,
	})

	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("video request validation failed")
		return model.GenerateVideoResult{}, err
	}
	if s == nil || s.catalog == nil || s.nexusHub == nil {
		logger.Error("video execution not configured")
		return model.GenerateVideoResult{}, model.ErrVideoExecutionNotConfigured
	}
	anonymous := model.IsAnonymousUserID(req.UserID)
	if s.credit == nil && !anonymous {
		logger.Error("video credit client not configured")
		return model.GenerateVideoResult{}, model.ErrInternal
	}
	if req.UserID == "" {
		logger.Warn("missing user id for video request")
		return model.GenerateVideoResult{}, model.ErrAuthInvalid
	}

	minCredit := int64(1)
	if anonymous {
		minCredit = 0
	} else {
		balance, err := s.credit.GetBalance(ctx, req.UserID)
		if err != nil {
			logger.WithError(err).Error("video credit balance lookup failed")
			return model.GenerateVideoResult{}, err
		}
		if balance.Available < 1 {
			logger.WithField("available_credit", balance.Available).Warn("insufficient credit for video request")
			return model.GenerateVideoResult{}, model.ErrInsufficientCredit
		}
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityVideo, req.Model)
	if err != nil {
		logger.WithError(err).Error("video model lookup failed")
		return model.GenerateVideoResult{}, err
	}
	mode := req.Mode
	if mode == "" {
		mode = model.InferVideoMode(req)
	}
	route, err := model.SelectRoute(spec, model.OperationGenerate, mode)
	if err != nil {
		logger.WithField("mode", mode).WithError(err).Warn("video route selection failed")
		return model.GenerateVideoResult{}, err
	}

	if len(req.ReferenceImageURLs) > 0 && s.uploadResolver != nil {
		resolved, resolveErr := s.uploadResolver.ResolveReferenceURLs(ctx, req.ReferenceImageURLs)
		if resolveErr != nil {
			logger.WithFields(logging.Fields{
				"reference_image_count": len(req.ReferenceImageURLs),
			}).WithError(resolveErr).Error("video reference resolution failed")
			return model.GenerateVideoResult{}, resolveErr
		}
		req.ReferenceImageURLs = resolved
	}

	billing := s.billing
	if anonymous {
		billing = nil
	}

	result, err := execflow.Run(ctx, execflow.NewExecutor(s.credit, billing, s.usage, s.callLogs), execflow.Input{
		UserID:     req.UserID,
		APIKeyID:   req.APIKeyID,
		Capability: "video.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  req.RequestID,
		Model:      req.Model,
		MinCredit:  minCredit,
	}, execflow.Hooks[model.GenerateVideoResult]{
		Invoke: func(ctx context.Context) (model.GenerateVideoResult, error) {
			result, err := s.nexusHub.GenerateVideo(ctx, req, route)
			if err != nil {
				logger.WithFields(logging.Fields{
					"ability_key": route.AbilityKey,
					"mode":        mode,
				}).WithError(err).Error("video generation failed")
			}
			return result, err
		},
		OnProviderSuccess: func(result model.GenerateVideoResult) execflow.ProviderSuccessMeta {
			creditCost := result.CreditCost
			if anonymous {
				creditCost = 0
			}
			return execflow.ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     creditCost,
			}
		},
		AfterSuccess: func(ctx context.Context, result *model.GenerateVideoResult) error {
			if s.artifactPub == nil || anonymous {
				return nil
			}
			published, err := s.artifactPub.Publish(ctx, model.ArtifactPublishRequest{
				UserID:         req.UserID,
				Capability:     "video.generate",
				MediaType:      model.CapsArtifactMediaTypeVideo,
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
		BuildUsageRecords: func(result model.GenerateVideoResult, startedAt time.Time) *execflow.UsageRecords {
			if anonymous {
				return nil
			}
			eventID := externalid.Generate(externalid.PrefixUsageEvent)
			runID := externalid.Generate(externalid.PrefixProviderRun)
			creditCost := result.CreditCost
			return &execflow.UsageRecords{
				Event: &model.UsageEventRecord{
					ID:            eventID,
					UserID:        req.UserID,
					APIKeyID:      req.APIKeyID,
					ProductArea:   "capability",
					Action:        "video.generate",
					Provider:      "nexushub",
					RequestID:     req.RequestID,
					Status:        result.Status,
					EstimatedCost: creditCost,
					FinalCost:     creditCost,
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
					ProviderCost:   creditCost,
					RawResult: map[string]any{
						"model":   result.Model,
						"outputs": result.Outputs,
					},
					SubmittedAt: startedAt.UTC(),
				},
			}
		},
		BuildCallLog: func(result model.GenerateVideoResult, startedAt time.Time) *model.CallLog {
			creditCost := result.CreditCost
			if anonymous {
				creditCost = 0
			}
			return &model.CallLog{
				RequestID:  req.RequestID,
				UserID:     req.UserID,
				APIKeyID:   req.APIKeyID,
				Capability: "video.generate",
				Model:      req.Model,
				Status:     result.Status,
				LatencyMS:  time.Since(startedAt).Milliseconds(),
				CreditCost: creditCost,
			}
		},
	})
	if err != nil {
		return model.GenerateVideoResult{}, err
	}

	if anonymous {
		result.CreditCost = 0
	}
	return result, nil
}
