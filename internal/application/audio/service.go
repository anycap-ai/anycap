package audio

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/execflow"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Service struct {
	catalog        port.CatalogRepository
	audioClient    port.AudioGenerationClient
	credit         port.CreditClient
	billing        port.BillingCoordinator
	callLogs       port.CallLogRepo
	usage          port.UsageWriter
	uploadResolver port.UploadRefResolver
	artifactPub    port.ArtifactPublisher
}

func NewService(catalog port.CatalogRepository, audioClient port.AudioGenerationClient, credit port.CreditClient, callLogs port.CallLogRepo) *Service {
	return &Service{catalog: catalog, audioClient: audioClient, credit: credit, callLogs: callLogs}
}

func (s *Service) SetUsageWriter(usage port.UsageWriter) {
	s.usage = usage
}

func (s *Service) SetBillingCoordinator(billing port.BillingCoordinator) {
	s.billing = billing
}

func (s *Service) SetUploadRefResolver(resolver port.UploadRefResolver) {
	s.uploadResolver = resolver
}

func (s *Service) SetArtifactPublisher(publisher port.ArtifactPublisher) {
	s.artifactPub = publisher
}

func (s *Service) Generate(ctx context.Context, req model.GenerateAudioRequest) (model.InvocationResult[model.GenerateAudioResult], error) {
	logger := logging.WithContext(ctx).WithFields(logging.Fields{"capability": "audio.generate", "model": req.Model})

	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("audio request validation failed")
		return model.InvocationResult[model.GenerateAudioResult]{}, err
	}
	if s == nil || s.catalog == nil || s.audioClient == nil {
		logger.Error("audio execution not configured")
		return model.InvocationResult[model.GenerateAudioResult]{}, model.ErrAudioExecutionNotConfigured
	}
	if s.credit == nil {
		logger.Error("audio credit client not configured")
		return model.InvocationResult[model.GenerateAudioResult]{}, model.ErrInternal
	}
	if req.UserID == "" {
		logger.Warn("missing user id for audio request")
		return model.InvocationResult[model.GenerateAudioResult]{}, model.ErrAuthInvalid
	}

	balance, err := s.credit.GetBalance(ctx, req.UserID)
	if err != nil {
		logger.WithError(err).Error("audio credit balance lookup failed")
		return model.InvocationResult[model.GenerateAudioResult]{}, err
	}
	if balance.Available < 1 {
		logger.WithField("available_credit", balance.Available).Warn("insufficient credit for audio request")
		return model.InvocationResult[model.GenerateAudioResult]{}, model.ErrInsufficientCredit
	}

	spec, err := s.catalog.GetModel(ctx, model.CapabilityAudio, req.Model)
	if err != nil {
		logger.WithError(err).Error("audio model lookup failed")
		return model.InvocationResult[model.GenerateAudioResult]{}, err
	}
	mode := req.Mode
	if mode == "" {
		mode = model.InferAudioMode(req)
	}
	route, err := model.SelectRoute(spec, model.OperationGenerate, mode)
	if err != nil {
		logger.WithField("mode", mode).WithError(err).Warn("audio route selection failed")
		return model.InvocationResult[model.GenerateAudioResult]{}, err
	}

	if len(req.ReferenceAudioURLs) > 0 && s.uploadResolver != nil {
		resolved, resolveErr := s.uploadResolver.ResolveReferenceURLs(ctx, req.ReferenceAudioURLs)
		if resolveErr != nil {
			logger.WithField("reference_audio_count", len(req.ReferenceAudioURLs)).WithError(resolveErr).Error("audio reference resolution failed")
			return model.InvocationResult[model.GenerateAudioResult]{}, resolveErr
		}
		req.ReferenceAudioURLs = resolved
	}
	if containsUnresolvedUploadReference(req.ReferenceAudioURLs) {
		logger.Error("audio upload reference remained unresolved")
		return model.InvocationResult[model.GenerateAudioResult]{}, model.ErrUploadReferenceInvalid
	}
	if len(req.ReferenceImageURLs) > 0 && s.uploadResolver != nil {
		resolved, resolveErr := s.uploadResolver.ResolveReferenceURLs(ctx, req.ReferenceImageURLs)
		if resolveErr != nil {
			logger.WithField("reference_image_count", len(req.ReferenceImageURLs)).WithError(resolveErr).Error("audio image reference resolution failed")
			return model.InvocationResult[model.GenerateAudioResult]{}, resolveErr
		}
		req.ReferenceImageURLs = resolved
	}
	if containsUnresolvedUploadReference(req.ReferenceImageURLs) {
		logger.Error("audio image upload reference remained unresolved")
		return model.InvocationResult[model.GenerateAudioResult]{}, model.ErrUploadReferenceInvalid
	}

	var invocationMeta model.InvocationMeta
	result, err := execflow.Run(ctx, execflow.NewExecutor(s.credit, s.billing, s.usage, s.callLogs), execflow.Input{
		UserID: req.UserID, APIKeyID: req.APIKeyID, Capability: "audio.generate",
		Provider: model.BillingProviderNexusHub, RequestID: req.RequestID, Model: req.Model, MinCredit: 1,
	}, execflow.Hooks[model.GenerateAudioResult]{
		Invoke: func(ctx context.Context) (model.GenerateAudioResult, error) {
			invocation, invokeErr := s.audioClient.GenerateAudio(ctx, req, route)
			if invokeErr != nil {
				logger.WithFields(logging.Fields{"ability_key": route.AbilityKey, "mode": mode}).WithError(invokeErr).Error("audio generation failed")
				return model.GenerateAudioResult{}, invokeErr
			}
			invocationMeta = invocation.Meta
			if !execflow.HasUsableOutput(audioArtifacts(invocation.Value.Outputs)) {
				return model.GenerateAudioResult{}, model.WrapInvocationError(
					model.InvocationErrorCodeUpstreamEmptyResult,
					errors.New("provider completed without a usable audio result"),
					model.MergeInvocationMeta(invocationMeta, model.InvocationMeta{Stage: model.InvocationStageValidateResult}),
				)
			}
			return invocation.Value, nil
		},
		InvocationMeta: func() model.InvocationMeta { return invocationMeta },
		OnProviderSuccess: func(result model.GenerateAudioResult) execflow.ProviderSuccessMeta {
			return execflow.ProviderSuccessMeta{ProviderTaskID: result.ID, ProviderStatus: result.Status, CreditCost: result.CreditCost}
		},
		AfterSuccess: func(ctx context.Context, result *model.GenerateAudioResult) error {
			if s.artifactPub == nil {
				return nil
			}
			published, publishErr := s.artifactPub.Publish(ctx, model.ArtifactPublishRequest{
				UserID: req.UserID, Capability: "audio.generate", MediaType: model.CapsArtifactMediaTypeAudio,
				Provider: "nexushub", ProviderTaskID: result.ID, Outputs: audioArtifacts(result.Outputs),
			})
			if publishErr != nil {
				return publishErr
			}
			if len(published.Outputs) != len(result.Outputs) {
				return fmt.Errorf("%w: artifact publisher returned %d audio outputs, want %d", model.ErrInternal, len(published.Outputs), len(result.Outputs))
			}
			for i := range result.Outputs {
				result.Outputs[i].Artifact = published.Outputs[i]
			}
			return nil
		},
		BuildUsageRecords: func(result model.GenerateAudioResult, startedAt time.Time) *execflow.UsageRecords {
			eventID := externalid.Generate(externalid.PrefixUsageEvent)
			runID := externalid.Generate(externalid.PrefixProviderRun)
			return &execflow.UsageRecords{
				Event: &model.UsageEventRecord{
					ID: eventID, UserID: req.UserID, APIKeyID: req.APIKeyID, ProductArea: "capability",
					Action: "audio.generate", Provider: "nexushub", RequestID: req.RequestID, Status: result.Status,
					EstimatedCost: result.CreditCost, FinalCost: result.CreditCost, OccurredAt: startedAt.UTC(),
				},
				ProviderRun: &model.ProviderRunRecord{
					ID: runID, Provider: "nexushub", ProviderTaskID: result.ID, UsageEventID: eventID,
					AuthMode: "platform_token", AbilityKey: route.AbilityKey, ProviderStatus: result.Status,
					ProviderUsage: result.Usage, ProviderCost: result.CreditCost,
					RawResult: map[string]any{"model": result.Model, "outputs": result.Outputs}, SubmittedAt: startedAt.UTC(),
				},
			}
		},
		BuildCallLog: func(result model.GenerateAudioResult, startedAt time.Time) *model.CallLog {
			return &model.CallLog{
				RequestID: req.RequestID, UserID: req.UserID, APIKeyID: req.APIKeyID, Capability: "audio.generate",
				Model: req.Model, Status: result.Status, LatencyMS: time.Since(startedAt).Milliseconds(), CreditCost: result.CreditCost,
			}
		},
	})
	if err != nil {
		return model.InvocationResult[model.GenerateAudioResult]{}, err
	}
	return model.InvocationResult[model.GenerateAudioResult]{Value: result, Meta: invocationMeta}, nil
}

func containsUnresolvedUploadReference(urls []string) bool {
	for _, rawURL := range urls {
		if strings.HasPrefix(strings.TrimSpace(rawURL), "anycap://") {
			return true
		}
	}
	return false
}

func audioArtifacts(outputs []model.AudioArtifact) []model.Artifact {
	artifacts := make([]model.Artifact, len(outputs))
	for i := range outputs {
		artifacts[i] = outputs[i].Artifact
	}
	return artifacts
}
