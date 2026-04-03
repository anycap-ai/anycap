package billing

import (
	"context"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

var retrySchedule = []time.Duration{
	1 * time.Minute,
	3 * time.Minute,
	5 * time.Minute,
	10 * time.Minute,
	20 * time.Minute,
	30 * time.Minute,
}

const recoveryWindow = 30 * time.Minute

type Service struct {
	repo port.BillingIntentRepository
	now  func() time.Time
}

func NewService(repo port.BillingIntentRepository) *Service {
	return &Service{
		repo: repo,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func BuildDeductSourceID(capability, traceID string) string {
	capability = strings.TrimSpace(strings.ToLower(capability))
	capability = strings.ReplaceAll(capability, " ", "-")
	capability = strings.ReplaceAll(capability, ".", "-")
	capability = strings.ReplaceAll(capability, "/", "-")
	if capability == "" {
		capability = "credit"
	}
	if traceID == "" {
		return "anycap-" + capability
	}
	return "anycap-" + capability + "-" + traceID
}

func (s *Service) CreateOrGetIntent(ctx context.Context, input model.CreateBillingIntentInput) (model.BillingIntent, error) {
	now := s.now()
	intent := model.BillingIntent{
		ID:             input.ID,
		UserID:         input.UserID,
		APIKeyID:       input.APIKeyID,
		Provider:       input.Provider,
		Capability:     input.Capability,
		TraceID:        input.TraceID,
		CreditCost:     input.CreditCost,
		BillingStatus:  model.BillingStatusCreated,
		DeductSourceID: BuildDeductSourceID(input.Capability, input.TraceID),
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if intent.ID == "" {
		intent.ID = externalid.Generate("bi")
	}
	return s.repo.CreateOrGetIntent(ctx, intent)
}

func (s *Service) RecordProviderSuccess(ctx context.Context, input model.RecordBillingProviderSuccessInput) error {
	return s.repo.RecordProviderSuccess(ctx, model.BillingIntentProviderSuccessUpdate{
		Provider:       input.Provider,
		TraceID:        input.TraceID,
		ProviderTaskID: input.ProviderTaskID,
		ProviderStatus: input.ProviderStatus,
		CreditCost:     input.CreditCost,
		UpdatedAt:      s.now(),
	})
}

func (s *Service) RecordProviderFailure(ctx context.Context, provider, traceID, providerStatus, lastError string) error {
	return s.repo.RecordProviderFailure(ctx, model.BillingIntentProviderFailureUpdate{
		Provider:       provider,
		TraceID:        traceID,
		ProviderStatus: providerStatus,
		LastError:      lastError,
		UpdatedAt:      s.now(),
	})
}

func (s *Service) MarkUncertain(ctx context.Context, provider, traceID, lastError string) error {
	intent, err := s.repo.GetIntentByTrace(ctx, provider, traceID)
	if err != nil {
		return err
	}
	if intent == nil {
		return nil
	}
	return s.MarkLookupNotReady(ctx, *intent, lastError)
}

func (s *Service) MarkLookupNotReady(ctx context.Context, intent model.BillingIntent, lastError string) error {
	now := s.now()
	if now.Sub(intent.CreatedAt) >= recoveryWindow {
		return s.repo.MarkReleased(ctx, model.BillingIntentReleaseUpdate{
			Provider:   intent.Provider,
			TraceID:    intent.TraceID,
			LastError:  lastError,
			ReleasedAt: now,
			UpdatedAt:  now,
		})
	}

	attempts := intent.RecoveryAttempts + 1
	nextRetry := now.Add(nextRetryDelay(attempts))
	return s.repo.MarkUncertain(ctx, model.BillingIntentRetryUpdate{
		Provider:         intent.Provider,
		TraceID:          intent.TraceID,
		LastError:        lastError,
		RecoveryAttempts: attempts,
		NextRetryAt:      &nextRetry,
		UpdatedAt:        now,
	})
}

func (s *Service) MarkDeducted(ctx context.Context, provider, traceID string) error {
	now := s.now()
	return s.repo.MarkDeducted(ctx, model.BillingIntentDeductedUpdate{
		Provider:   provider,
		TraceID:    traceID,
		DeductedAt: now,
		UpdatedAt:  now,
	})
}

func nextRetryDelay(attempt int) time.Duration {
	if attempt <= 0 {
		return retrySchedule[0]
	}
	if attempt > len(retrySchedule) {
		return retrySchedule[len(retrySchedule)-1]
	}
	return retrySchedule[attempt-1]
}
