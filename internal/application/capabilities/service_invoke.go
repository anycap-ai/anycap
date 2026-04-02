package capabilities

import (
	"context"
	"strconv"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"
)

const (
	imageReadCreditCost int64 = 5
	videoReadCreditCost int64 = 10
	audioReadCreditCost int64 = 10
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
	userID := middleware.UserIDFromContext(ctx)
	if err := s.ensureReadBalance(ctx, userID, imageReadCreditCost, "image.read"); err != nil {
		return model.UnderstandResult{}, err
	}

	startedAt := time.Now()
	requestID := readRequestID(ctx, "image.read")
	if !s.auditEnabled() {
		result, err := s.provider.ImageRead(ctx, req)
		if err != nil {
			return model.UnderstandResult{}, err
		}
		if err := s.finalizeSuccessfulRead(ctx, userID, "", requestID, "image.read", result.Model, imageReadCreditCost, startedAt); err != nil {
			return model.UnderstandResult{}, err
		}
		return result, nil
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
	result, err := s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      userIDStr,
		Capability:  capabilityImageRead,
		RequestMeta: buildImageRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.ImageRead(ctx, resolvedReq)
	})
	if err != nil {
		return model.UnderstandResult{}, err
	}
	if err := s.finalizeSuccessfulRead(ctx, userID, "", requestID, "image.read", result.Model, imageReadCreditCost, startedAt); err != nil {
		return model.UnderstandResult{}, err
	}
	return result, nil
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
	userID := middleware.UserIDFromContext(ctx)
	if err := s.ensureReadBalance(ctx, userID, videoReadCreditCost, "video.read"); err != nil {
		return model.UnderstandResult{}, err
	}

	startedAt := time.Now()
	requestID := readRequestID(ctx, "video.read")
	if !s.auditEnabled() {
		result, err := s.provider.VideoRead(ctx, req)
		if err != nil {
			return model.UnderstandResult{}, err
		}
		if err := s.finalizeSuccessfulRead(ctx, userID, "", requestID, "video.read", result.Model, videoReadCreditCost, startedAt); err != nil {
			return model.UnderstandResult{}, err
		}
		return result, nil
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
	result, err := s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      userIDStr,
		Capability:  capabilityVideoRead,
		RequestMeta: buildVideoRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.VideoRead(ctx, resolvedReq)
	})
	if err != nil {
		return model.UnderstandResult{}, err
	}
	if err := s.finalizeSuccessfulRead(ctx, userID, "", requestID, "video.read", result.Model, videoReadCreditCost, startedAt); err != nil {
		return model.UnderstandResult{}, err
	}
	return result, nil
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
	userID := middleware.UserIDFromContext(ctx)
	if err := s.ensureReadBalance(ctx, userID, audioReadCreditCost, "audio.read"); err != nil {
		return model.UnderstandResult{}, err
	}

	startedAt := time.Now()
	requestID := readRequestID(ctx, "audio.read")
	if !s.auditEnabled() {
		result, err := s.provider.AudioRead(ctx, req)
		if err != nil {
			return model.UnderstandResult{}, err
		}
		if err := s.finalizeSuccessfulRead(ctx, userID, "", requestID, "audio.read", result.Model, audioReadCreditCost, startedAt); err != nil {
			return model.UnderstandResult{}, err
		}
		return result, nil
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
	result, err := s.runUnderstandTask(ctx, understandTaskInput{
		SpaceID:     actor.Space.ID,
		UserID:      userIDStr,
		Capability:  capabilityAudioRead,
		RequestMeta: buildAudioRequestMeta(req, len(artifacts)),
		Artifacts:   artifacts,
	}, func(ctx context.Context) (model.UnderstandResult, error) {
		return s.provider.AudioRead(ctx, resolvedReq)
	})
	if err != nil {
		return model.UnderstandResult{}, err
	}
	if err := s.finalizeSuccessfulRead(ctx, userID, "", requestID, "audio.read", result.Model, audioReadCreditCost, startedAt); err != nil {
		return model.UnderstandResult{}, err
	}
	return result, nil
}

func (s *Service) ensureReadBalance(ctx context.Context, userID string, cost int64, capability string) error {
	logger := logging.WithContext(ctx).WithField("capability", capability)
	if cost <= 0 || s.credit == nil {
		return nil
	}
	if userID == "" {
		logger.Warn("missing user id for billed capabilities request")
		return model.ErrAuthInvalid
	}
	balance, err := s.credit.GetBalance(ctx, userID)
	if err != nil {
		logger.WithError(err).Error("capabilities credit balance lookup failed")
		return err
	}
	if balance.Available < cost {
		logger.WithFields(logging.Fields{
			"available_credit": balance.Available,
			"required_credit":  cost,
		}).Warn("insufficient credit for capabilities request")
		return model.ErrInsufficientCredit
	}
	return nil
}

func (s *Service) finalizeSuccessfulRead(ctx context.Context, userID, apiKeyID, requestID, capability, modelName string, cost int64, startedAt time.Time) error {
	logger := logging.WithContext(ctx).WithField("capability", capability)
	if s.credit != nil {
		if err := s.credit.Deduct(ctx, userID, cost, capability, requestID); err != nil {
			logger.WithField("credit_cost", cost).WithError(err).Error("capabilities credit deduction failed")
			return model.ErrBillingUncertain
		}
	}
	if s.callLogs != nil {
		if err := s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  requestID,
			UserID:     userID,
			APIKeyID:   apiKeyID,
			Capability: capability,
			Model:      modelName,
			Status:     "success",
			LatencyMS:  time.Since(startedAt).Milliseconds(),
			CreditCost: cost,
		}); err != nil {
			logger.WithFields(logging.Fields{
				"credit_cost": cost,
				"latency_ms":  time.Since(startedAt).Milliseconds(),
			}).WithError(err).Warn("capabilities call log persistence failed")
		}
	}
	return nil
}

func readRequestID(ctx context.Context, capability string) string {
	if requestID := trace.GetTraceID(ctx); requestID != "" {
		return requestID
	}
	return capability + "-" + strconv.FormatInt(time.Now().UTC().UnixNano(), 10)
}
