package capabilities

import (
	"context"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
)

func (s *Service) ImageRead(ctx context.Context, req model.ImageReadRequest) (model.UnderstandResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", "image.read")
	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("image read validation failed")
		return model.UnderstandResult{}, err
	}
	if s == nil || s.provider == nil {
		logger.Error("image read provider not configured")
		return model.UnderstandResult{}, model.ErrCapabilitiesProviderNotConfigured
	}

	if !s.auditEnabled() {
		return s.provider.ImageRead(ctx, req)
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		logger.WithError(err).Error("resolve image read actor failed")
		return model.UnderstandResult{}, err
	}

	resolvedReq, artifacts, err := s.resolveImageInputs(ctx, actor.Space.ID, actor.UserID, req)
	if err != nil {
		logger.WithError(err).Error("resolve image read inputs failed")
		return model.UnderstandResult{}, err
	}

	userIDStr := strconv.FormatInt(actor.UserID, 10)
	return s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      userIDStr,
		Capability:  capabilityImageRead,
		RequestMeta: buildImageRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.ImageRead(ctx, resolvedReq)
	})
}

func (s *Service) VideoRead(ctx context.Context, req model.VideoReadRequest) (model.UnderstandResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", "video.read")
	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("video read validation failed")
		return model.UnderstandResult{}, err
	}
	if s == nil || s.provider == nil {
		logger.Error("video read provider not configured")
		return model.UnderstandResult{}, model.ErrCapabilitiesProviderNotConfigured
	}

	if !s.auditEnabled() {
		return s.provider.VideoRead(ctx, req)
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		logger.WithError(err).Error("resolve video read actor failed")
		return model.UnderstandResult{}, err
	}

	resolvedReq, artifacts, err := s.resolveVideoInput(ctx, actor.Space.ID, actor.UserID, req)
	if err != nil {
		logger.WithError(err).Error("resolve video read input failed")
		return model.UnderstandResult{}, err
	}

	userIDStr := strconv.FormatInt(actor.UserID, 10)
	return s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      userIDStr,
		Capability:  capabilityVideoRead,
		RequestMeta: buildVideoRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.VideoRead(ctx, resolvedReq)
	})
}

func (s *Service) AudioRead(ctx context.Context, req model.AudioReadRequest) (model.UnderstandResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", "audio.read")
	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("audio read validation failed")
		return model.UnderstandResult{}, err
	}
	if s == nil || s.provider == nil {
		logger.Error("audio read provider not configured")
		return model.UnderstandResult{}, model.ErrCapabilitiesProviderNotConfigured
	}

	if !s.auditEnabled() {
		return s.provider.AudioRead(ctx, req)
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		logger.WithError(err).Error("resolve audio read actor failed")
		return model.UnderstandResult{}, err
	}

	resolvedReq, artifacts, err := s.resolveAudioInput(ctx, actor.Space.ID, actor.UserID, req)
	if err != nil {
		logger.WithError(err).Error("resolve audio read input failed")
		return model.UnderstandResult{}, err
	}

	userIDStr := strconv.FormatInt(actor.UserID, 10)
	return s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      userIDStr,
		Capability:  capabilityAudioRead,
		RequestMeta: buildAudioRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.AudioRead(ctx, resolvedReq)
	})
}
