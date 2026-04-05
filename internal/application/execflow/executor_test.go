package execflow

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
)

type fakeBillingCoordinator struct {
	steps           *[]string
	intents         []model.CreateBillingIntentInput
	providerSuccess []model.RecordBillingProviderSuccessInput
	uncertain       []string
	deducted        []string
}

type fakeUsageWriter struct {
	events []model.UsageEventRecord
	runs   []model.ProviderRunRecord
	err    error
}

type fakeCallLogRepo struct {
	logs []model.CallLog
	err  error
}

type recordingCreditClient struct {
	balance        model.Balance
	deductRequests []deductRequest
}

type failingCreditClient struct {
	balance model.Balance
	getErr  error
	dedErr  error
}

type deductRequest struct {
	userID    string
	amount    int64
	reason    string
	requestID string
}

type sampleResult struct {
	ID         string
	Status     string
	Model      string
	CreditCost int64
}

func (f *fakeBillingCoordinator) CreateOrGetIntent(_ context.Context, input model.CreateBillingIntentInput) (model.BillingIntent, error) {
	if f.steps != nil {
		*f.steps = append(*f.steps, "intent")
	}
	f.intents = append(f.intents, input)
	return model.BillingIntent{
		Provider:       input.Provider,
		TraceID:        input.TraceID,
		DeductSourceID: "deduct-" + input.TraceID,
		CreditCost:     input.CreditCost,
	}, nil
}

func (f *fakeBillingCoordinator) RecordProviderSuccess(_ context.Context, input model.RecordBillingProviderSuccessInput) error {
	f.providerSuccess = append(f.providerSuccess, input)
	return nil
}

func (f *fakeBillingCoordinator) RecordProviderFailure(_ context.Context, _, _, _, _ string) error {
	return nil
}

func (f *fakeBillingCoordinator) MarkUncertain(_ context.Context, _, traceID, _ string) error {
	f.uncertain = append(f.uncertain, traceID)
	return nil
}

func (f *fakeBillingCoordinator) MarkLookupNotReady(_ context.Context, intent model.BillingIntent, _ string) error {
	f.uncertain = append(f.uncertain, intent.TraceID)
	return nil
}

func (f *fakeBillingCoordinator) MarkDeducted(_ context.Context, _, traceID string) error {
	f.deducted = append(f.deducted, traceID)
	return nil
}

func (f *fakeUsageWriter) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	if f.err != nil {
		return f.err
	}
	f.events = append(f.events, event)
	return nil
}

func (f *fakeUsageWriter) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	if f.err != nil {
		return f.err
	}
	f.runs = append(f.runs, run)
	return nil
}

func (f *fakeCallLogRepo) Insert(_ context.Context, entry model.CallLog) error {
	if f.err != nil {
		return f.err
	}
	f.logs = append(f.logs, entry)
	return nil
}

func (f *fakeCallLogRepo) ListByUserID(_ context.Context, _ string, _ int) ([]model.CallLog, error) {
	return append([]model.CallLog(nil), f.logs...), nil
}

func (f *recordingCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return f.balance, nil
}

func (f *recordingCreditClient) Deduct(_ context.Context, userID string, amount int64, reason, requestID string) error {
	f.deductRequests = append(f.deductRequests, deductRequest{
		userID:    userID,
		amount:    amount,
		reason:    reason,
		requestID: requestID,
	})
	return nil
}

func (f *recordingCreditClient) GrantSignupReward(_ context.Context, _ string) error {
	return nil
}

func (f *recordingCreditClient) ListTransactions(_ context.Context, _ string, _, _ int) ([]model.CreditTransaction, int, error) {
	return nil, 0, nil
}

func (f *failingCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	if f.getErr != nil {
		return model.Balance{}, f.getErr
	}
	return f.balance, nil
}

func (f *failingCreditClient) Deduct(_ context.Context, _ string, _ int64, _ string, _ string) error {
	return f.dedErr
}

func (f *failingCreditClient) GrantSignupReward(_ context.Context, _ string) error {
	return nil
}

func (f *failingCreditClient) ListTransactions(_ context.Context, _ string, _, _ int) ([]model.CreditTransaction, int, error) {
	return nil, 0, nil
}

func TestExecutorRunFailsWhenBalanceIsInsufficient(t *testing.T) {
	exec := NewExecutor(credit.NewStubClient(map[string]int64{"user-1": 0}), nil, nil, nil)

	invoked := false
	_, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-1",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			invoked = true
			return sampleResult{}, nil
		},
	})
	if !errors.Is(err, model.ErrInsufficientCredit) {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
	}
	if invoked {
		t.Fatal("expected provider invoke to be skipped when balance is insufficient")
	}
}

func TestExecutorRunCreatesBillingIntentBeforeProviderInvoke(t *testing.T) {
	steps := []string{}
	billing := &fakeBillingCoordinator{steps: &steps}
	exec := NewExecutor(credit.NewStubClient(map[string]int64{"user-1": 2}), billing, nil, nil)

	result, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-2",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			steps = append(steps, "invoke")
			return sampleResult{ID: "task-1", Status: "success", CreditCost: 1}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
	})
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if result.ID != "task-1" {
		t.Fatalf("expected task-1 result, got %#v", result)
	}
	if len(steps) != 2 || steps[0] != "intent" || steps[1] != "invoke" {
		t.Fatalf("expected intent before invoke, got %#v", steps)
	}
}

func TestExecutorRunMarksBillingUncertainWhenProviderInvokeFails(t *testing.T) {
	billing := &fakeBillingCoordinator{}
	exec := NewExecutor(credit.NewStubClient(map[string]int64{"user-1": 2}), billing, nil, nil)
	boom := errors.New("provider down")

	_, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-3",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{}, boom
		},
	})
	if !errors.Is(err, boom) {
		t.Fatalf("expected provider error, got %v", err)
	}
	if len(billing.intents) != 1 || billing.intents[0].TraceID != "req-3" {
		t.Fatalf("expected billing intent for req-3, got %#v", billing.intents)
	}
	if len(billing.uncertain) != 1 || billing.uncertain[0] != "req-3" {
		t.Fatalf("expected uncertain trace req-3, got %#v", billing.uncertain)
	}
}

func TestExecutorRunReturnsBillingUncertainWhenDeductFails(t *testing.T) {
	billing := &fakeBillingCoordinator{}
	exec := NewExecutor(&failingCreditClient{
		balance: model.Balance{Available: 10},
		dedErr:  errors.New("credit down"),
	}, billing, nil, nil)

	_, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-4",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{ID: "task-4", Status: "success", CreditCost: 2}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
	})
	if !errors.Is(err, model.ErrBillingUncertain) {
		t.Fatalf("expected ErrBillingUncertain, got %v", err)
	}
	if len(billing.providerSuccess) != 1 || billing.providerSuccess[0].TraceID != "req-4" {
		t.Fatalf("expected provider success for req-4, got %#v", billing.providerSuccess)
	}
	if len(billing.uncertain) != 1 || billing.uncertain[0] != "req-4" {
		t.Fatalf("expected uncertain trace req-4, got %#v", billing.uncertain)
	}
	if len(billing.deducted) != 0 {
		t.Fatalf("expected no deducted finalize on failure, got %#v", billing.deducted)
	}
}

func TestExecutorRunToleratesUsageAndCallLogPersistenceFailures(t *testing.T) {
	billing := &fakeBillingCoordinator{}
	usage := &fakeUsageWriter{err: errors.New("usage down")}
	callLogs := &fakeCallLogRepo{err: errors.New("call log down")}
	exec := NewExecutor(credit.NewStubClient(map[string]int64{"user-1": 2}), billing, usage, callLogs)

	startedAt := time.Date(2026, 4, 6, 12, 0, 0, 0, time.UTC)
	exec.now = func() time.Time { return startedAt }

	result, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		APIKeyID:   "akid_1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-5",
		Model:      "flux-dev",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{ID: "task-5", Status: "success", Model: "flux-dev", CreditCost: 1}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
		BuildUsageRecords: func(result sampleResult, startedAt time.Time) *UsageRecords {
			return &UsageRecords{
				Event: &model.UsageEventRecord{
					ID:            "evt-1",
					UserID:        "user-1",
					APIKeyID:      "akid_1",
					ProductArea:   "capability",
					Action:        "image.generate",
					Provider:      "nexushub",
					RequestID:     "req-5",
					Status:        result.Status,
					EstimatedCost: result.CreditCost,
					FinalCost:     result.CreditCost,
					OccurredAt:    startedAt,
				},
				ProviderRun: &model.ProviderRunRecord{
					ID:             "run-1",
					Provider:       "nexushub",
					ProviderTaskID: result.ID,
					UsageEventID:   "evt-1",
					AuthMode:       "platform_token",
					AbilityKey:     "flux-dev",
					ProviderStatus: result.Status,
					ProviderCost:   result.CreditCost,
					SubmittedAt:    startedAt,
				},
			}
		},
		BuildCallLog: func(result sampleResult, _ time.Time) *model.CallLog {
			return &model.CallLog{
				RequestID:  "req-5",
				UserID:     "user-1",
				APIKeyID:   "akid_1",
				Capability: "image.generate",
				Model:      result.Model,
				Status:     result.Status,
				CreditCost: result.CreditCost,
			}
		},
	})
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if result.ID != "task-5" {
		t.Fatalf("expected task-5 result, got %#v", result)
	}
	if len(billing.deducted) != 1 || billing.deducted[0] != "req-5" {
		t.Fatalf("expected deducted trace req-5, got %#v", billing.deducted)
	}
}

func TestExecutorRunUsesBillingDeductSourceID(t *testing.T) {
	creditClient := &recordingCreditClient{
		balance: model.Balance{Available: 10},
	}
	billing := &fakeBillingCoordinator{}
	exec := NewExecutor(creditClient, billing, nil, nil)

	_, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-6",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{ID: "task-6", Status: "success", CreditCost: 3}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
	})
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if len(creditClient.deductRequests) != 1 {
		t.Fatalf("expected 1 deduct request, got %#v", creditClient.deductRequests)
	}
	if creditClient.deductRequests[0].requestID != "deduct-req-6" {
		t.Fatalf("expected deduct source id from billing intent, got %#v", creditClient.deductRequests[0])
	}
}

func TestExecutorRunDoesNotDeductWhenAfterSuccessFails(t *testing.T) {
	creditClient := &recordingCreditClient{
		balance: model.Balance{Available: 10},
	}
	billing := &fakeBillingCoordinator{}
	exec := NewExecutor(creditClient, billing, nil, nil)
	boom := errors.New("publish failed")

	_, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-7",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{ID: "task-7", Status: "success", CreditCost: 2}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
		AfterSuccess: func(context.Context, *sampleResult) error {
			return boom
		},
	})
	if !errors.Is(err, boom) {
		t.Fatalf("expected AfterSuccess error, got %v", err)
	}
	if len(creditClient.deductRequests) != 0 {
		t.Fatalf("expected no deduct when AfterSuccess fails, got %#v", creditClient.deductRequests)
	}
	if len(billing.providerSuccess) != 0 {
		t.Fatalf("expected no provider success record when AfterSuccess fails, got %#v", billing.providerSuccess)
	}
	if len(billing.deducted) != 0 {
		t.Fatalf("expected no deducted finalize when AfterSuccess fails, got %#v", billing.deducted)
	}
}

func TestExecutorRunSucceedsWhenUsageBuilderReturnsNil(t *testing.T) {
	creditClient := &recordingCreditClient{
		balance: model.Balance{Available: 10},
	}
	billing := &fakeBillingCoordinator{}
	usage := &fakeUsageWriter{}
	exec := NewExecutor(creditClient, billing, usage, nil)

	result, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-8",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{ID: "task-8", Status: "success", CreditCost: 2}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
		BuildUsageRecords: func(sampleResult, time.Time) *UsageRecords {
			return nil
		},
	})
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if result.ID != "task-8" {
		t.Fatalf("expected task-8 result, got %#v", result)
	}
	if len(usage.events) != 0 || len(usage.runs) != 0 {
		t.Fatalf("expected no usage records when builder returns nil, got events=%#v runs=%#v", usage.events, usage.runs)
	}
	if len(creditClient.deductRequests) != 1 {
		t.Fatalf("expected deduct to still happen, got %#v", creditClient.deductRequests)
	}
}

func TestExecutorRunSucceedsWhenCallLogBuilderReturnsNil(t *testing.T) {
	creditClient := &recordingCreditClient{
		balance: model.Balance{Available: 10},
	}
	billing := &fakeBillingCoordinator{}
	callLogs := &fakeCallLogRepo{}
	exec := NewExecutor(creditClient, billing, nil, callLogs)

	result, err := Run(context.Background(), exec, Input{
		UserID:     "user-1",
		Capability: "image.generate",
		Provider:   model.BillingProviderNexusHub,
		RequestID:  "req-9",
		MinCredit:  1,
	}, Hooks[sampleResult]{
		Invoke: func(context.Context) (sampleResult, error) {
			return sampleResult{ID: "task-9", Status: "success", CreditCost: 2}, nil
		},
		OnProviderSuccess: func(result sampleResult) ProviderSuccessMeta {
			return ProviderSuccessMeta{
				ProviderTaskID: result.ID,
				ProviderStatus: result.Status,
				CreditCost:     result.CreditCost,
			}
		},
		BuildCallLog: func(sampleResult, time.Time) *model.CallLog {
			return nil
		},
	})
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if result.ID != "task-9" {
		t.Fatalf("expected task-9 result, got %#v", result)
	}
	if len(callLogs.logs) != 0 {
		t.Fatalf("expected no call logs when builder returns nil, got %#v", callLogs.logs)
	}
	if len(creditClient.deductRequests) != 1 {
		t.Fatalf("expected deduct to still happen, got %#v", creditClient.deductRequests)
	}
}
