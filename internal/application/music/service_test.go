package music

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

type fakeUsageWriter struct {
	events []model.UsageEventRecord
	runs   []model.ProviderRunRecord
}

type zeroCostNexusClient struct{}
type fakeArtifactPublisher struct {
	err error
}
type fakeBillingCoordinator struct {
	intents         []model.CreateBillingIntentInput
	providerSuccess []model.RecordBillingProviderSuccessInput
	deducted        []string
}

func (f *fakeUsageWriter) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	f.events = append(f.events, event)
	return nil
}

func (f *fakeUsageWriter) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	f.runs = append(f.runs, run)
	return nil
}

func (zeroCostNexusClient) GenerateImage(_ context.Context, _ model.GenerateImageRequest, _ model.RouteBinding) (model.GenerateImageResult, error) {
	panic("unexpected GenerateImage call")
}

func (zeroCostNexusClient) GenerateVideo(_ context.Context, _ model.GenerateVideoRequest, _ model.RouteBinding) (model.GenerateVideoResult, error) {
	panic("unexpected GenerateVideo call")
}

func (zeroCostNexusClient) GenerateMusic(_ context.Context, req model.GenerateMusicRequest, _ model.RouteBinding) (model.GenerateMusicResult, error) {
	return model.GenerateMusicResult{
		ID:      "mus-zero-cost",
		Status:  "success",
		Model:   req.Model,
		Outputs: []model.Artifact{{Type: "music", URL: "https://cdn.anycap.local/generated.mp3", MIMEType: "audio/mpeg"}},
	}, nil
}

func (zeroCostNexusClient) GetSubmitResult(_ context.Context, _ string) (model.ProviderTaskResult, error) {
	panic("unexpected GetSubmitResult call")
}

func (zeroCostNexusClient) GetTaskIDByTrace(_ context.Context, _ string, _ string) (string, error) {
	panic("unexpected GetTaskIDByTrace call")
}

func (f *fakeArtifactPublisher) Publish(_ context.Context, _ model.ArtifactPublishRequest) (model.ArtifactPublishResult, error) {
	if f.err != nil {
		return model.ArtifactPublishResult{}, f.err
	}
	return model.ArtifactPublishResult{}, nil
}

func (f *fakeBillingCoordinator) CreateOrGetIntent(_ context.Context, input model.CreateBillingIntentInput) (model.BillingIntent, error) {
	f.intents = append(f.intents, input)
	return model.BillingIntent{
		Provider:       input.Provider,
		TraceID:        input.TraceID,
		DeductSourceID: "anycap-music-generate-" + input.TraceID,
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

func (f *fakeBillingCoordinator) MarkUncertain(_ context.Context, _, _ string, _ string) error {
	return nil
}

func (f *fakeBillingCoordinator) MarkLookupNotReady(_ context.Context, _ model.BillingIntent, _ string) error {
	return nil
}

func (f *fakeBillingCoordinator) MarkDeducted(_ context.Context, _, traceID string) error {
	f.deducted = append(f.deducted, traceID)
	return nil
}

func testCatalog() *nexushub.CatalogStub {
	return nexushub.NewCatalogStubWith([]model.ModelSpec{
		{
			ModelID:     "mureka-v6",
			Capability:  model.CapabilityMusic,
			DisplayName: "Mureka V6",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}},
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "mureka-v6",
						GenType:    string(model.CapabilityMusic),
						Mode:       model.ModeTextToMusic,
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
	})
}

func TestGenerateMusic_InsufficientCredit(t *testing.T) {
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 0}), calllog.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if !errors.Is(err, model.ErrInsufficientCredit) {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
	}
}

func TestGenerateMusic_AnonymousSkipsCreditClient(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), nil, logs)

	result, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    model.AnonymousUserIDPrefix + "install-1",
		RequestID: "req-anon-music",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.CreditCost != 0 {
		t.Fatalf("expected anonymous result credit cost 0, got %d", result.CreditCost)
	}

	items, err := logs.ListByUserID(context.Background(), model.AnonymousUserIDPrefix+"install-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].CreditCost != 0 {
		t.Fatalf("expected one zero-cost anonymous call log, got %#v", items)
	}
}

func TestGenerateMusic_AnonymousSkipsBillingCoordinator(t *testing.T) {
	billingCoord := &fakeBillingCoordinator{}
	writer := &fakeUsageWriter{}
	service := NewService(testCatalog(), nexushub.NewStubClient(), nil, calllog.NewMemoryCallLogRepo())
	service.SetBillingCoordinator(billingCoord)
	service.SetUsageWriter(writer)

	_, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    model.AnonymousUserIDPrefix + "install-1",
		RequestID: "req-anon-music-billing",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if len(billingCoord.intents) != 0 || len(billingCoord.providerSuccess) != 0 || len(billingCoord.deducted) != 0 {
		t.Fatalf("expected anonymous request to skip billing coordinator, got %#v", billingCoord)
	}
	if len(writer.events) != 0 || len(writer.runs) != 0 {
		t.Fatalf("expected anonymous request to skip usage ledger, got events=%#v runs=%#v", writer.events, writer.runs)
	}
}

func TestGenerateMusic_DeductIsIdempotent(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 3})
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, calllog.NewMemoryCallLogRepo())
	req := model.GenerateMusicRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	}

	if _, err := service.Generate(context.Background(), req); err != nil {
		t.Fatalf("first Generate() error = %v", err)
	}
	if _, err := service.Generate(context.Background(), req); err != nil {
		t.Fatalf("second Generate() error = %v", err)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 1 {
		t.Fatalf("expected balance 1 after idempotent generate, got %d", balance.Available)
	}
}

func TestGenerateMusic_Success(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 3}), logs)

	result, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.Status != "success" {
		t.Fatalf("expected success, got %q", result.Status)
	}
	if result.Model != "mureka-v6" {
		t.Fatalf("expected mureka-v6, got %s", result.Model)
	}
	if len(result.Outputs) != 1 {
		t.Fatalf("expected 1 output, got %d", len(result.Outputs))
	}
	if logs.Count() != 1 {
		t.Fatalf("expected 1 call log, got %d", logs.Count())
	}
	items, err := logs.ListByUserID(context.Background(), "user-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].APIKeyID != "akid_1" {
		t.Fatalf("expected call log api_key_id akid_1, got %#v", items)
	}
}

func TestGenerateMusic_SuccessPersistsUsageLedger(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	writer := &fakeUsageWriter{}
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 3}), logs)
	service.SetUsageWriter(writer)

	result, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if len(writer.events) != 1 {
		t.Fatalf("expected 1 usage event, got %d", len(writer.events))
	}
	if len(writer.runs) != 1 {
		t.Fatalf("expected 1 provider run, got %d", len(writer.runs))
	}
	if writer.events[0].APIKeyID != "akid_1" || writer.events[0].Action != "music.generate" {
		t.Fatalf("unexpected usage event: %#v", writer.events[0])
	}
	if writer.events[0].OccurredAt == (time.Time{}) {
		t.Fatalf("expected occurred_at to be set, got %#v", writer.events[0])
	}
	if writer.runs[0].ProviderTaskID != result.ID || writer.runs[0].UsageEventID != writer.events[0].ID {
		t.Fatalf("unexpected provider run linkage: event=%#v run=%#v", writer.events[0], writer.runs[0])
	}
}

func TestGenerateMusic_DoesNotDeductWhenProviderCostMissing(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	writer := &fakeUsageWriter{}
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 3})
	service := NewService(testCatalog(), zeroCostNexusClient{}, creditClient, logs)
	service.SetUsageWriter(writer)

	result, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.CreditCost != 0 {
		t.Fatalf("expected zero response credit cost when provider cost missing, got %d", result.CreditCost)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 3 {
		t.Fatalf("expected balance to remain 3 when provider cost missing, got %d", balance.Available)
	}

	transactions, _, err := creditClient.ListTransactions(context.Background(), "user-1", 10, 0)
	if err != nil {
		t.Fatalf("ListTransactions() error = %v", err)
	}
	if len(transactions) != 0 {
		t.Fatalf("expected no credit transactions when provider cost missing, got %#v", transactions)
	}

	items, err := logs.ListByUserID(context.Background(), "user-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].CreditCost != 0 {
		t.Fatalf("expected call log with zero cost, got %#v", items)
	}

	if len(writer.events) != 1 || writer.events[0].FinalCost != 0 || writer.events[0].EstimatedCost != 0 {
		t.Fatalf("expected zero-cost usage event, got %#v", writer.events)
	}
	if len(writer.runs) != 1 || writer.runs[0].ProviderCost != 0 {
		t.Fatalf("expected zero-cost provider run, got %#v", writer.runs)
	}
}

func TestGenerateMusic_RouteNotConfigured(t *testing.T) {
	catalog := nexushub.NewCatalogStubWith([]model.ModelSpec{
		{
			ModelID:     "mureka-v6",
			Capability:  model.CapabilityMusic,
			DisplayName: "Mureka V6",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {},
			},
		},
	})
	service := NewService(catalog, nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), calllog.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if !errors.Is(err, model.ErrModelRouteNotConfigured) {
		t.Fatalf("expected ErrModelRouteNotConfigured, got %v", err)
	}
}

func TestGenerateMusic_PublishFailureDoesNotDeductCredit(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 3})
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, calllog.NewMemoryCallLogRepo())
	service.SetArtifactPublisher(&fakeArtifactPublisher{err: model.ErrUpstreamUnavailable})

	_, err := service.Generate(context.Background(), model.GenerateMusicRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "lofi night drive",
		Model:     "mureka-v6",
	})
	if !errors.Is(err, model.ErrUpstreamUnavailable) {
		t.Fatalf("expected ErrUpstreamUnavailable, got %v", err)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 3 {
		t.Fatalf("expected credit unchanged after publish failure, got %d", balance.Available)
	}
}
