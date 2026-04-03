package billing

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeBillingRepo struct {
	intents  map[string]model.BillingIntent
	requeued []model.BillingIntentRetryUpdate
	released []model.BillingIntentReleaseUpdate
	recover  []model.BillingIntent
}

func newFakeBillingRepo() *fakeBillingRepo {
	return &fakeBillingRepo{intents: make(map[string]model.BillingIntent)}
}

func (f *fakeBillingRepo) CreateOrGetIntent(_ context.Context, intent model.BillingIntent) (model.BillingIntent, error) {
	key := intent.Provider + ":" + intent.TraceID
	if existing, ok := f.intents[key]; ok {
		return existing, nil
	}
	f.intents[key] = intent
	return intent, nil
}

func (f *fakeBillingRepo) GetIntentByTrace(_ context.Context, provider, traceID string) (*model.BillingIntent, error) {
	key := provider + ":" + traceID
	intent, ok := f.intents[key]
	if !ok {
		return nil, nil
	}
	copy := intent
	return &copy, nil
}

func (f *fakeBillingRepo) RecordProviderSuccess(_ context.Context, update model.BillingIntentProviderSuccessUpdate) error {
	key := update.Provider + ":" + update.TraceID
	intent := f.intents[key]
	intent.ProviderTaskID = update.ProviderTaskID
	intent.ProviderStatus = update.ProviderStatus
	intent.CreditCost = update.CreditCost
	intent.BillingStatus = model.BillingStatusProviderSucceededPendingDeduct
	intent.LastError = ""
	intent.UpdatedAt = update.UpdatedAt
	f.intents[key] = intent
	return nil
}

func (f *fakeBillingRepo) RecordProviderFailure(_ context.Context, update model.BillingIntentProviderFailureUpdate) error {
	key := update.Provider + ":" + update.TraceID
	intent := f.intents[key]
	intent.ProviderStatus = update.ProviderStatus
	intent.BillingStatus = model.BillingStatusProviderFailed
	intent.LastError = update.LastError
	intent.UpdatedAt = update.UpdatedAt
	f.intents[key] = intent
	return nil
}

func (f *fakeBillingRepo) MarkUncertain(_ context.Context, update model.BillingIntentRetryUpdate) error {
	key := update.Provider + ":" + update.TraceID
	intent := f.intents[key]
	intent.BillingStatus = model.BillingStatusUncertainRetryable
	intent.LastError = update.LastError
	intent.RecoveryAttempts = update.RecoveryAttempts
	intent.NextRetryAt = update.NextRetryAt
	intent.UpdatedAt = update.UpdatedAt
	f.intents[key] = intent
	f.requeued = append(f.requeued, update)
	return nil
}

func (f *fakeBillingRepo) MarkDeducted(_ context.Context, update model.BillingIntentDeductedUpdate) error {
	key := update.Provider + ":" + update.TraceID
	intent := f.intents[key]
	intent.BillingStatus = model.BillingStatusDeducted
	intent.DeductedAt = &update.DeductedAt
	intent.UpdatedAt = update.UpdatedAt
	intent.LastError = ""
	f.intents[key] = intent
	return nil
}

func (f *fakeBillingRepo) MarkReleased(_ context.Context, update model.BillingIntentReleaseUpdate) error {
	key := update.Provider + ":" + update.TraceID
	intent := f.intents[key]
	intent.BillingStatus = model.BillingStatusReleased
	intent.LastError = update.LastError
	intent.ReleasedAt = &update.ReleasedAt
	intent.UpdatedAt = update.UpdatedAt
	f.intents[key] = intent
	f.released = append(f.released, update)
	return nil
}

func (f *fakeBillingRepo) ListRecoverableIntents(_ context.Context, _ time.Time, _ int) ([]model.BillingIntent, error) {
	return append([]model.BillingIntent(nil), f.recover...), nil
}

func TestBuildDeductSourceID(t *testing.T) {
	if got := BuildDeductSourceID("image.generate", "trc_123"); got != "anycap-image-generate-trc_123" {
		t.Fatalf("BuildDeductSourceID() = %q, want %q", got, "anycap-image-generate-trc_123")
	}
}

func TestBillingIntentStateTransitions(t *testing.T) {
	repo := newFakeBillingRepo()
	service := NewService(repo)
	now := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }

	intent, err := service.CreateOrGetIntent(context.Background(), model.CreateBillingIntentInput{
		UserID:     "2000000001",
		APIKeyID:   "akid_1",
		Provider:   model.BillingProviderNexusHub,
		Capability: "image.generate",
		TraceID:    "trc_123",
		CreditCost: 0,
	})
	if err != nil {
		t.Fatalf("CreateOrGetIntent() error = %v", err)
	}
	if intent.BillingStatus != model.BillingStatusCreated {
		t.Fatalf("expected created status, got %q", intent.BillingStatus)
	}
	if intent.DeductSourceID != "anycap-image-generate-trc_123" {
		t.Fatalf("unexpected deduct source id: %+v", intent)
	}

	if err := service.RecordProviderSuccess(context.Background(), model.RecordBillingProviderSuccessInput{
		Provider:       model.BillingProviderNexusHub,
		TraceID:        "trc_123",
		ProviderTaskID: "atomic_123",
		ProviderStatus: "success",
		CreditCost:     3,
	}); err != nil {
		t.Fatalf("RecordProviderSuccess() error = %v", err)
	}

	saved, err := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_123")
	if err != nil {
		t.Fatalf("GetIntentByTrace() error = %v", err)
	}
	if saved == nil || saved.BillingStatus != model.BillingStatusProviderSucceededPendingDeduct {
		t.Fatalf("unexpected billing status after provider success: %+v", saved)
	}

	if err := service.MarkDeducted(context.Background(), model.BillingProviderNexusHub, "trc_123"); err != nil {
		t.Fatalf("MarkDeducted() error = %v", err)
	}
	saved, _ = repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_123")
	if saved == nil || saved.BillingStatus != model.BillingStatusDeducted || saved.DeductedAt == nil {
		t.Fatalf("unexpected deducted intent: %+v", saved)
	}
}

func TestService_MarkUncertainOrRelease(t *testing.T) {
	repo := newFakeBillingRepo()
	service := NewService(repo)
	createdAt := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)
	currentTime := createdAt.Add(5 * time.Minute)
	service.now = func() time.Time { return currentTime }

	_, err := service.CreateOrGetIntent(context.Background(), model.CreateBillingIntentInput{
		UserID:     "2000000001",
		Provider:   model.BillingProviderNexusHub,
		Capability: "image.generate",
		TraceID:    "trc_retry",
	})
	if err != nil {
		t.Fatalf("CreateOrGetIntent() error = %v", err)
	}
	intent, _ := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_retry")
	intent.CreatedAt = createdAt
	intent.UpdatedAt = createdAt
	repo.intents[intent.Provider+":"+intent.TraceID] = *intent

	if err := service.MarkLookupNotReady(context.Background(), *intent, "trace lookup 404"); err != nil {
		t.Fatalf("MarkLookupNotReady() error = %v", err)
	}

	saved, _ := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_retry")
	if saved == nil || saved.BillingStatus != model.BillingStatusUncertainRetryable {
		t.Fatalf("expected uncertain_retryable, got %+v", saved)
	}
	if saved.NextRetryAt == nil || !saved.NextRetryAt.After(currentTime) {
		t.Fatalf("expected next retry after now, got %+v", saved)
	}

	currentTime = createdAt.Add(31 * time.Minute)
	service.now = func() time.Time { return currentTime }
	if err := service.MarkLookupNotReady(context.Background(), *saved, "trace lookup 404"); err != nil {
		t.Fatalf("MarkLookupNotReady() after expiry error = %v", err)
	}
	saved, _ = repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_retry")
	if saved == nil || saved.BillingStatus != model.BillingStatusReleased || saved.ReleasedAt == nil {
		t.Fatalf("expected released intent, got %+v", saved)
	}
}
