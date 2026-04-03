package billing

import (
	"context"
	"errors"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const (
	defaultBillingPollInterval = 1 * time.Minute
	defaultBillingBatchSize    = 50
)

type WorkerConfig struct {
	PollInterval time.Duration
	BatchSize    int
}

type Worker struct {
	repo      port.BillingIntentRepository
	billing   port.BillingCoordinator
	nexus     port.NexusHubClient
	credit    port.CreditClient
	interval  time.Duration
	batchSize int
}

func NewWorker(repo port.BillingIntentRepository, billing port.BillingCoordinator, nexus port.NexusHubClient, credit port.CreditClient, cfg WorkerConfig) *Worker {
	interval := cfg.PollInterval
	if interval <= 0 {
		interval = defaultBillingPollInterval
	}
	batchSize := cfg.BatchSize
	if batchSize <= 0 {
		batchSize = defaultBillingBatchSize
	}
	return &Worker{
		repo:      repo,
		billing:   billing,
		nexus:     nexus,
		credit:    credit,
		interval:  interval,
		batchSize: batchSize,
	}
}

func (w *Worker) Run(ctx context.Context) error {
	if w == nil || w.repo == nil || w.billing == nil || w.nexus == nil || w.credit == nil {
		return fmt.Errorf("billing worker is not configured")
	}

	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		_, _ = w.RecoverPendingIntents(ctx, w.batchSize)

		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
		}
	}
}

func (w *Worker) RecoverPendingIntents(ctx context.Context, limit int) (int, error) {
	if w.repo == nil || w.billing == nil || w.nexus == nil || w.credit == nil {
		return 0, fmt.Errorf("billing worker is not configured")
	}
	if limit <= 0 {
		limit = w.batchSize
		if limit <= 0 {
			limit = defaultBillingBatchSize
		}
	}

	intents, err := w.repo.ListRecoverableIntents(ctx, time.Now().UTC(), limit)
	if err != nil {
		return 0, err
	}

	var recovered int
	for _, intent := range intents {
		if err := w.recoverIntent(ctx, intent); err != nil {
			return recovered, err
		}
		recovered++
	}
	return recovered, nil
}

func (w *Worker) recoverIntent(ctx context.Context, intent model.BillingIntent) error {
	if intent.ProviderStatus == "success" && intent.CreditCost > 0 {
		if err := w.credit.Deduct(ctx, intent.UserID, intent.CreditCost, intent.Capability, intent.DeductSourceID); err != nil {
			return w.billing.MarkUncertain(ctx, intent.Provider, intent.TraceID, err.Error())
		}
		return w.billing.MarkDeducted(ctx, intent.Provider, intent.TraceID)
	}

	taskID := intent.ProviderTaskID
	if taskID == "" {
		resolvedTaskID, err := w.nexus.GetTaskIDByTrace(ctx, intent.TraceID, "anycap")
		if err != nil {
			if isLookupDeferred(err) {
				return w.billing.MarkLookupNotReady(ctx, intent, err.Error())
			}
			return err
		}
		taskID = resolvedTaskID
	}

	result, err := w.nexus.GetSubmitResult(ctx, taskID)
	if err != nil {
		return err
	}

	switch result.Status {
	case "success":
		cost := result.CreditCost
		if cost <= 0 {
			cost = intent.CreditCost
		}
		if err := w.billing.RecordProviderSuccess(ctx, model.RecordBillingProviderSuccessInput{
			Provider:       intent.Provider,
			TraceID:        intent.TraceID,
			ProviderTaskID: taskID,
			ProviderStatus: result.Status,
			CreditCost:     cost,
		}); err != nil {
			return err
		}
		if err := w.credit.Deduct(ctx, intent.UserID, cost, intent.Capability, intent.DeductSourceID); err != nil {
			return w.billing.MarkUncertain(ctx, intent.Provider, intent.TraceID, err.Error())
		}
		return w.billing.MarkDeducted(ctx, intent.Provider, intent.TraceID)
	case "failed", "canceled":
		return w.billing.RecordProviderFailure(ctx, intent.Provider, intent.TraceID, result.Status, result.ErrorMessage)
	default:
		return w.billing.MarkLookupNotReady(ctx, intent, "provider status not terminal")
	}
}

func isLookupDeferred(err error) bool {
	var domainErr *model.DomainError
	if !errors.As(err, &domainErr) {
		return false
	}
	return domainErr.Code == "not_found" || domainErr.Code == "not_configured"
}
