package capabilities

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func (s *Service) ImageUnderstand(ctx context.Context, req model.ImageUnderstandRequest) (model.UnderstandResult, error) {
	if err := req.Validate(); err != nil {
		return model.UnderstandResult{}, err
	}
	if s == nil || s.provider == nil {
		return model.UnderstandResult{}, model.ErrCapabilitiesProviderNotConfigured
	}

	if !s.auditEnabled() {
		return s.provider.ImageUnderstand(ctx, req)
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		return model.UnderstandResult{}, err
	}

	resolvedReq, artifacts, err := s.resolveImageInputs(ctx, actor.Space.ID, actor.UserID, req)
	if err != nil {
		return model.UnderstandResult{}, err
	}

	return s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      actor.UserID,
		Capability:  capabilityImageUnderstand,
		RequestMeta: buildImageRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.ImageUnderstand(ctx, resolvedReq)
	})
}

func (s *Service) VideoRead(ctx context.Context, req model.VideoReadRequest) (model.UnderstandResult, error) {
	if err := req.Validate(); err != nil {
		return model.UnderstandResult{}, err
	}
	if s == nil || s.provider == nil {
		return model.UnderstandResult{}, model.ErrCapabilitiesProviderNotConfigured
	}

	if !s.auditEnabled() {
		return s.provider.VideoRead(ctx, req)
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		return model.UnderstandResult{}, err
	}

	resolvedReq, artifacts, err := s.resolveVideoInput(ctx, actor.Space.ID, actor.UserID, req)
	if err != nil {
		return model.UnderstandResult{}, err
	}

	return s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      actor.UserID,
		Capability:  capabilityVideoRead,
		RequestMeta: buildVideoRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.VideoRead(ctx, resolvedReq)
	})
}
