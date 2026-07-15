package image

import (
	"context"
	"errors"
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

// Generate is a convenience wrapper for Execute with OperationGenerate.
func (s *Service) Generate(ctx context.Context, req model.GenerateImageRequest) (model.InvocationResult[model.GenerateImageResult], error) {
	return s.Execute(ctx, req, model.OperationGenerate)
}

// Execute runs an image operation (generate, edit, upscale, etc.).
// The operation determines which route is selected from the model catalog.
func (s *Service) Execute(ctx context.Context, req model.GenerateImageRequest, operation model.Operation) (model.InvocationResult[model.GenerateImageResult], error) {
	action := "image." + string(operation)
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"capability": action,
		"model":      req.Model,
		"operation":  operation,
	})

	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("image request validation failed")
		return model.InvocationResult[model.GenerateImageResult]{}, err
	}
	if s == nil || s.catalog == nil || s.nexusHub == nil {
		logger.Error("image execution not configured")
		return model.InvocationResult[model.GenerateImageResult]{}, model.ErrImageExecutionNotConfigured
	}
	if s.credit == nil {
		logger.Error("image credit client not configured")
		return model.InvocationResult[model.GenerateImageResult]{}, model.ErrInternal
	}
	if req.UserID == "" {
		logger.Warn("missing user id for image request")
		return model.InvocationResult[model.GenerateImageResult]{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		logger.WithError(err).Error("image credit balance lookup failed")
		return model.InvocationResult[model.GenerateImageResult]{}, err
	}
	if balance.Available < 1 {
		logger.WithField("available_credit", balance.Available).Warn("insufficient credit for image request")
		return model.InvocationResult[model.GenerateImageResult]{}, model.ErrInsufficientCredit
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityImage, req.Model)
	if err != nil {
		logger.WithError(err).Error("image model lookup failed")
		return model.InvocationResult[model.GenerateImageResult]{}, err
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
		return model.InvocationResult[model.GenerateImageResult]{}, err
	}

	if len(req.ReferenceImageURLs) > 0 && s.uploadResolver != nil {
		resolved, resolveErr := s.uploadResolver.ResolveReferenceURLs(ctx, req.ReferenceImageURLs)
		if resolveErr != nil {
			logger.WithFields(logging.Fields{
				"reference_image_count": len(req.ReferenceImageURLs),
			}).WithError(resolveErr).Error("image reference resolution failed")
			return model.InvocationResult[model.GenerateImageResult]{}, resolveErr
		}
		req.ReferenceImageURLs = resolved
	}

	var invocationMeta model.InvocationMeta
	result, err := execflow.Run(ctx, execflow.NewExecutor(s.credit, s.billing, s.usage, s.callLogs), execflow.Input{
		UserID:     req.UserID,
		APIKeyID:   req.APIKeyID,
		Capability: action,
		Provider:   model.BillingProviderNexusHub,
		RequestID:  req.RequestID,
		Model:      req.Model,
		MinCredit:  1,
	}, execflow.Hooks[model.GenerateImageResult]{
		Invoke: func(ctx context.Context) (model.GenerateImageResult, error) {
			invocation, err := s.nexusHub.GenerateImage(ctx, req, route)
			if err != nil {
				logger.WithFields(logging.Fields{
					"ability_key": route.AbilityKey,
					"mode":        mode,
				}).WithError(err).Error("image generation failed")
				return model.GenerateImageResult{}, err
			}
			invocationMeta = invocation.Meta
			if !execflow.HasUsableOutput(invocation.Value.Outputs) {
				return model.GenerateImageResult{}, model.WrapInvocationError(
					model.InvocationErrorCodeUpstreamEmptyResult,
					errors.New("provider completed without a usable image result"),
					model.MergeInvocationMeta(invocationMeta, model.InvocationMeta{Stage: model.InvocationStageValidateResult}),
				)
			}
			return invocation.Value, nil
		},
		InvocationMeta: func() model.InvocationMeta { return invocationMeta },
		OnProviderSuccess: func(result model.GenerateImageResult) execflow.ProviderSuccessMeta {
			return execflow.ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
		AfterSuccess: func(ctx context.Context, result *model.GenerateImageResult) error {
			if s.artifactPub == nil {
				return nil
			}
			published, err := s.artifactPub.Publish(ctx, model.ArtifactPublishRequest{
				UserID:         req.UserID,
				Capability:     action,
				MediaType:      model.CapsArtifactMediaTypeImage,
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
		BuildUsageRecords: func(result model.GenerateImageResult, startedAt time.Time) *execflow.UsageRecords {
			eventID := externalid.Generate(externalid.PrefixUsageEvent)
			runID := externalid.Generate(externalid.PrefixProviderRun)
			return &execflow.UsageRecords{
				Event: &model.UsageEventRecord{
					ID:            eventID,
					UserID:        req.UserID,
					APIKeyID:      req.APIKeyID,
					ProductArea:   "capability",
					Action:        action,
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
		BuildCallLog: func(result model.GenerateImageResult, startedAt time.Time) *model.CallLog {
			return &model.CallLog{
				RequestID:  req.RequestID,
				UserID:     req.UserID,
				APIKeyID:   req.APIKeyID,
				Capability: action,
				Model:      req.Model,
				Status:     result.Status,
				LatencyMS:  time.Since(startedAt).Milliseconds(),
				CreditCost: result.CreditCost,
			}
		},
	})
	if err != nil {
		return model.InvocationResult[model.GenerateImageResult]{}, err
	}

	return model.InvocationResult[model.GenerateImageResult]{Value: result, Meta: invocationMeta}, nil
}
