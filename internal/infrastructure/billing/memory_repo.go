package billing

import (
	"context"
	"sort"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type MemoryRepo struct {
	mu      sync.Mutex
	intents map[string]model.BillingIntent
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{intents: make(map[string]model.BillingIntent)}
}

func (r *MemoryRepo) CreateOrGetIntent(_ context.Context, intent model.BillingIntent) (model.BillingIntent, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	key := billingKey(intent.Provider, intent.TraceID)
	if existing, ok := r.intents[key]; ok {
		return existing, nil
	}
	r.intents[key] = intent
	return intent, nil
}

func (r *MemoryRepo) GetIntentByTrace(_ context.Context, provider, traceID string) (*model.BillingIntent, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	intent, ok := r.intents[billingKey(provider, traceID)]
	if !ok {
		return nil, nil
	}
	copy := intent
	return &copy, nil
}

func (r *MemoryRepo) RecordProviderSuccess(_ context.Context, update model.BillingIntentProviderSuccessUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	intent := r.intents[billingKey(update.Provider, update.TraceID)]
	intent.ProviderTaskID = update.ProviderTaskID
	intent.ProviderStatus = update.ProviderStatus
	intent.CreditCost = update.CreditCost
	intent.BillingStatus = model.BillingStatusProviderSucceededPendingDeduct
	intent.LastError = ""
	intent.UpdatedAt = update.UpdatedAt
	r.intents[billingKey(update.Provider, update.TraceID)] = intent
	return nil
}

func (r *MemoryRepo) RecordProviderFailure(_ context.Context, update model.BillingIntentProviderFailureUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	intent := r.intents[billingKey(update.Provider, update.TraceID)]
	intent.ProviderStatus = update.ProviderStatus
	intent.BillingStatus = model.BillingStatusProviderFailed
	intent.LastError = update.LastError
	intent.UpdatedAt = update.UpdatedAt
	r.intents[billingKey(update.Provider, update.TraceID)] = intent
	return nil
}

func (r *MemoryRepo) MarkUncertain(_ context.Context, update model.BillingIntentRetryUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	intent := r.intents[billingKey(update.Provider, update.TraceID)]
	intent.BillingStatus = model.BillingStatusUncertainRetryable
	intent.LastError = update.LastError
	intent.RecoveryAttempts = update.RecoveryAttempts
	intent.NextRetryAt = update.NextRetryAt
	intent.UpdatedAt = update.UpdatedAt
	r.intents[billingKey(update.Provider, update.TraceID)] = intent
	return nil
}

func (r *MemoryRepo) MarkDeducted(_ context.Context, update model.BillingIntentDeductedUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	intent := r.intents[billingKey(update.Provider, update.TraceID)]
	intent.BillingStatus = model.BillingStatusDeducted
	intent.DeductedAt = &update.DeductedAt
	intent.UpdatedAt = update.UpdatedAt
	intent.LastError = ""
	r.intents[billingKey(update.Provider, update.TraceID)] = intent
	return nil
}

func (r *MemoryRepo) MarkReleased(_ context.Context, update model.BillingIntentReleaseUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	intent := r.intents[billingKey(update.Provider, update.TraceID)]
	intent.BillingStatus = model.BillingStatusReleased
	intent.LastError = update.LastError
	intent.ReleasedAt = &update.ReleasedAt
	intent.UpdatedAt = update.UpdatedAt
	r.intents[billingKey(update.Provider, update.TraceID)] = intent
	return nil
}

func (r *MemoryRepo) ListRecoverableIntents(_ context.Context, now time.Time, limit int) ([]model.BillingIntent, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	items := make([]model.BillingIntent, 0, len(r.intents))
	for _, intent := range r.intents {
		switch intent.BillingStatus {
		case model.BillingStatusProviderSucceededPendingDeduct:
			items = append(items, intent)
		case model.BillingStatusUncertainRetryable:
			if intent.NextRetryAt == nil || !intent.NextRetryAt.After(now) {
				items = append(items, intent)
			}
		}
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt.Before(items[j].CreatedAt)
	})
	if limit > 0 && len(items) > limit {
		items = items[:limit]
	}
	return items, nil
}

func billingKey(provider, traceID string) string {
	return provider + ":" + traceID
}
