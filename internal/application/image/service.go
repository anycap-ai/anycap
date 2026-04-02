package image

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Service struct {
	catalog        port.CatalogRepository
	nexusHub       port.NexusHubClient
	credit         port.CreditClient
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

func (s *Service) SetUploadRefResolver(r port.UploadRefResolver) {
	s.uploadResolver = r
}

func (s *Service) SetArtifactPublisher(publisher port.ArtifactPublisher) {
	s.artifactPub = publisher
}

// Generate is a convenience wrapper for Execute with OperationGenerate.
func (s *Service) Generate(ctx context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error) {
	return s.Execute(ctx, req, model.OperationGenerate)
}

// Execute runs an image operation (generate, edit, upscale, etc.).
// The operation determines which route is selected from the model catalog.
func (s *Service) Execute(ctx context.Context, req model.GenerateImageRequest, operation model.Operation) (model.GenerateImageResult, error) {
	action := "image." + string(operation)
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"capability": action,
		"model":      req.Model,
		"operation":  operation,
	})

	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("image request validation failed")
		return model.GenerateImageResult{}, err
	}
	if s == nil || s.catalog == nil || s.nexusHub == nil {
		logger.Error("image execution not configured")
		return model.GenerateImageResult{}, model.ErrImageExecutionNotConfigured
	}
	if s.credit == nil {
		logger.Error("image credit client not configured")
		return model.GenerateImageResult{}, model.ErrInternal
	}
	if req.UserID == "" {
		logger.Warn("missing user id for image request")
		return model.GenerateImageResult{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		logger.WithError(err).Error("image credit balance lookup failed")
		return model.GenerateImageResult{}, err
	}
	if balance.Available < 1 {
		logger.WithField("available_credit", balance.Available).Warn("insufficient credit for image request")
		return model.GenerateImageResult{}, model.ErrInsufficientCredit
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityImage, req.Model)
	if err != nil {
		logger.WithError(err).Error("image model lookup failed")
		return model.GenerateImageResult{}, err
	}
	mode := req.Mode
	if mode == "" {
		mode = model.InferImageMode(req)
	}
	route, err := model.SelectRoute(spec, operation, mode)
	if err != nil {
		logger.WithFields(logging.Fields{
			"mode": mode,
		}).WithError(err).Warn("image route selection failed")
		return model.GenerateImageResult{}, err
	}

	if len(req.ReferenceImageURLs) > 0 && s.uploadResolver != nil {
		resolved, resolveErr := s.uploadResolver.ResolveReferenceURLs(ctx, req.ReferenceImageURLs)
		if resolveErr != nil {
			logger.WithFields(logging.Fields{
				"reference_image_count": len(req.ReferenceImageURLs),
			}).WithError(resolveErr).Error("image reference resolution failed")
			return model.GenerateImageResult{}, resolveErr
		}
		req.ReferenceImageURLs = resolved
	}

	startedAt := time.Now()
	result, err := s.nexusHub.GenerateImage(ctx, req, route)
	if err != nil {
		logger.WithFields(logging.Fields{
			"ability_key": route.AbilityKey,
			"mode":        mode,
		}).WithError(err).Error("image generation failed")
		return model.GenerateImageResult{}, err
	}
	if s.artifactPub != nil {
		published, publishErr := s.artifactPub.Publish(ctx, model.ArtifactPublishRequest{
			UserID:         req.UserID,
			Capability:     action,
			MediaType:      model.CapsArtifactMediaTypeImage,
			Provider:       "nexushub",
			ProviderTaskID: result.ID,
			Outputs:        result.Outputs,
		})
		if publishErr != nil {
			return model.GenerateImageResult{}, publishErr
		}
		result.Outputs = published.Outputs
	}

	cost := result.CreditCost
	if cost <= 0 {
		cost = 1
	}
	if s.usage != nil {
		eventID := externalid.Generate(externalid.PrefixUsageEvent)
		runID := externalid.Generate(externalid.PrefixProviderRun)
		if usageErr := s.usage.InsertUsageEvent(ctx, model.UsageEventRecord{
			ID:            eventID,
			UserID:        req.UserID,
			APIKeyID:      req.APIKeyID,
			ProductArea:   "capability",
			Action:        action,
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
	if err := s.credit.Deduct(ctx, req.UserID, cost, action, req.RequestID); err != nil {
		logger.WithField("credit_cost", cost).WithError(err).Error("image credit deduction failed")
		return model.GenerateImageResult{}, model.ErrBillingUncertain
	}

	if s.callLogs != nil {
		if callLogErr := s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  req.RequestID,
			UserID:     req.UserID,
			APIKeyID:   req.APIKeyID,
			Capability: action,
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
