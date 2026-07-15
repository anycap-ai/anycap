package billing

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeBillingNexusClient struct {
	results map[string]model.ProviderTaskResult
	traces  map[string]string
}

func (f *fakeBillingNexusClient) GenerateImage(context.Context, model.GenerateImageRequest, model.RouteBinding) (model.InvocationResult[model.GenerateImageResult], error) {
	panic("unexpected GenerateImage call")
}

func (f *fakeBillingNexusClient) GenerateVideo(context.Context, model.GenerateVideoRequest, model.RouteBinding) (model.InvocationResult[model.GenerateVideoResult], error) {
	panic("unexpected GenerateVideo call")
}

func (f *fakeBillingNexusClient) GenerateMusic(context.Context, model.GenerateMusicRequest, model.RouteBinding) (model.InvocationResult[model.GenerateMusicResult], error) {
	panic("unexpected GenerateMusic call")
}

func (f *fakeBillingNexusClient) GetSubmitResult(_ context.Context, taskID string) (model.ProviderTaskResult, error) {
	return f.results[taskID], nil
}

func (f *fakeBillingNexusClient) GetTaskIDByTrace(_ context.Context, traceID, _ string) (string, error) {
	taskID, ok := f.traces[traceID]
	if !ok {
		return "", model.ErrNotFound("task not found")
	}
	return taskID, nil
}

func TestWorker_RecoverByTaskID(t *testing.T) {
	repo := newFakeBillingRepo()
	service := NewService(repo)
	now := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }
	repo.recover = []model.BillingIntent{{
		ID:             "bi_1",
		UserID:         "user-1",
		Provider:       model.BillingProviderNexusHub,
		Capability:     "image.generate",
		TraceID:        "trc_1",
		ProviderTaskID: "atomic_1",
		CreditCost:     3,
		BillingStatus:  model.BillingStatusProviderSucceededPendingDeduct,
		DeductSourceID: "anycap-image-generate-trc_1",
		CreatedAt:      now.Add(-time.Minute),
		UpdatedAt:      now.Add(-time.Minute),
	}}
	repo.intents["nexushub:trc_1"] = repo.recover[0]

	worker := NewWorker(repo, service, &fakeBillingNexusClient{
		results: map[string]model.ProviderTaskResult{
			"atomic_1": {TaskID: "atomic_1", Status: "success", CreditCost: 3},
		},
	}, &fakeBillingCreditClient{}, WorkerConfig{})

	n, err := worker.RecoverPendingIntents(context.Background(), 10)
	if err != nil {
		t.Fatalf("RecoverPendingIntents() error = %v", err)
	}
	if n != 1 {
		t.Fatalf("expected recovered count 1, got %d", n)
	}
	saved, _ := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_1")
	if saved == nil || saved.BillingStatus != model.BillingStatusDeducted {
		t.Fatalf("expected deducted intent, got %+v", saved)
	}
}

func TestWorker_RecoverByTraceLookup(t *testing.T) {
	repo := newFakeBillingRepo()
	service := NewService(repo)
	now := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }
	repo.recover = []model.BillingIntent{{
		ID:             "bi_2",
		UserID:         "user-1",
		Provider:       model.BillingProviderNexusHub,
		Capability:     "video.generate",
		TraceID:        "trc_lookup",
		CreditCost:     5,
		BillingStatus:  model.BillingStatusUncertainRetryable,
		DeductSourceID: "anycap-video-generate-trc_lookup",
		CreatedAt:      now.Add(-2 * time.Minute),
		UpdatedAt:      now.Add(-2 * time.Minute),
	}}
	repo.intents["nexushub:trc_lookup"] = repo.recover[0]

	worker := NewWorker(repo, service, &fakeBillingNexusClient{
		traces: map[string]string{"trc_lookup": "atomic_lookup"},
		results: map[string]model.ProviderTaskResult{
			"atomic_lookup": {TaskID: "atomic_lookup", Status: "success", CreditCost: 5},
		},
	}, &fakeBillingCreditClient{}, WorkerConfig{})

	if _, err := worker.RecoverPendingIntents(context.Background(), 10); err != nil {
		t.Fatalf("RecoverPendingIntents() error = %v", err)
	}
	saved, _ := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_lookup")
	if saved == nil || saved.ProviderTaskID != "atomic_lookup" || saved.BillingStatus != model.BillingStatusDeducted {
		t.Fatalf("expected recovered intent with task id, got %+v", saved)
	}
}

func TestWorker_RequeuesLookup404WithinWindow(t *testing.T) {
	repo := newFakeBillingRepo()
	service := NewService(repo)
	now := time.Date(2026, 4, 3, 10, 5, 0, 0, time.UTC)
	service.now = func() time.Time { return now }
	repo.recover = []model.BillingIntent{{
		ID:             "bi_3",
		UserID:         "user-1",
		Provider:       model.BillingProviderNexusHub,
		Capability:     "image.generate",
		TraceID:        "trc_missing",
		BillingStatus:  model.BillingStatusUncertainRetryable,
		DeductSourceID: "anycap-image-generate-trc_missing",
		CreatedAt:      now.Add(-5 * time.Minute),
		UpdatedAt:      now.Add(-5 * time.Minute),
	}}
	repo.intents["nexushub:trc_missing"] = repo.recover[0]

	worker := NewWorker(repo, service, &fakeBillingNexusClient{
		traces: map[string]string{},
	}, &fakeBillingCreditClient{}, WorkerConfig{})

	if _, err := worker.RecoverPendingIntents(context.Background(), 10); err != nil {
		t.Fatalf("RecoverPendingIntents() error = %v", err)
	}
	saved, _ := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_missing")
	if saved == nil || saved.BillingStatus != model.BillingStatusUncertainRetryable || saved.NextRetryAt == nil {
		t.Fatalf("expected requeued intent, got %+v", saved)
	}
}

func TestWorker_ReleasesLookup404AfterWindow(t *testing.T) {
	repo := newFakeBillingRepo()
	service := NewService(repo)
	now := time.Date(2026, 4, 3, 10, 31, 0, 0, time.UTC)
	service.now = func() time.Time { return now }
	repo.recover = []model.BillingIntent{{
		ID:             "bi_4",
		UserID:         "user-1",
		Provider:       model.BillingProviderNexusHub,
		Capability:     "image.generate",
		TraceID:        "trc_expired",
		BillingStatus:  model.BillingStatusUncertainRetryable,
		DeductSourceID: "anycap-image-generate-trc_expired",
		CreatedAt:      now.Add(-31 * time.Minute),
		UpdatedAt:      now.Add(-31 * time.Minute),
	}}
	repo.intents["nexushub:trc_expired"] = repo.recover[0]

	worker := NewWorker(repo, service, &fakeBillingNexusClient{
		traces: map[string]string{},
	}, &fakeBillingCreditClient{}, WorkerConfig{})

	if _, err := worker.RecoverPendingIntents(context.Background(), 10); err != nil {
		t.Fatalf("RecoverPendingIntents() error = %v", err)
	}
	saved, _ := repo.GetIntentByTrace(context.Background(), model.BillingProviderNexusHub, "trc_expired")
	if saved == nil || saved.BillingStatus != model.BillingStatusReleased || saved.ReleasedAt == nil {
		t.Fatalf("expected released intent, got %+v", saved)
	}
}

type fakeBillingCreditClient struct {
	deductCalls []string
}

func (f *fakeBillingCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return model.Balance{Available: 10}, nil
}

func (f *fakeBillingCreditClient) Deduct(_ context.Context, _ string, _ int64, _ string, sourceID string) error {
	f.deductCalls = append(f.deductCalls, sourceID)
	return nil
}

func (f *fakeBillingCreditClient) GrantSignupReward(_ context.Context, _ string) error {
	return nil
}

func (f *fakeBillingCreditClient) ListTransactions(_ context.Context, _ string, _, _ int) ([]model.CreditTransaction, int, error) {
	return nil, 0, nil
}
