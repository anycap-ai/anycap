package image

import (
	"bytes"
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/sirupsen/logrus"
)

type fakeUsageWriter struct {
	events []model.UsageEventRecord
	runs   []model.ProviderRunRecord
}

type zeroCostNexusClient struct{}
type emptyOutputNexusClient struct{ zeroCostNexusClient }
type failingUsageWriter struct{}
type fakeArtifactPublisher struct {
	result model.ArtifactPublishResult
	err    error
	called bool
}
type fakeBillingCoordinator struct {
	intents         []model.CreateBillingIntentInput
	providerSuccess []model.RecordBillingProviderSuccessInput
	uncertain       []string
	deducted        []string
	recordErr       error
}

func (f *fakeUsageWriter) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	f.events = append(f.events, event)
	return nil
}

func (f *fakeUsageWriter) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	f.runs = append(f.runs, run)
	return nil
}

func (zeroCostNexusClient) GenerateImage(_ context.Context, req model.GenerateImageRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateImageResult], error) {
	result := model.GenerateImageResult{
		ID:      "img-zero-cost",
		Status:  "success",
		Model:   req.Model,
		Outputs: []model.Artifact{{Type: "image", URL: "https://cdn.anycap.local/generated.png", MIMEType: "image/png"}},
	}
	return model.InvocationResult[model.GenerateImageResult]{Value: result, Meta: model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status}}, nil
}

func (zeroCostNexusClient) GenerateVideo(_ context.Context, _ model.GenerateVideoRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateVideoResult], error) {
	panic("unexpected GenerateVideo call")
}

func (zeroCostNexusClient) GenerateMusic(_ context.Context, _ model.GenerateMusicRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateMusicResult], error) {
	panic("unexpected GenerateMusic call")
}

func (emptyOutputNexusClient) GenerateImage(_ context.Context, req model.GenerateImageRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateImageResult], error) {
	result := model.GenerateImageResult{ID: "img-empty", Status: "success", Model: req.Model, Outputs: []model.Artifact{{Type: "image", URL: "  "}}}
	return model.InvocationResult[model.GenerateImageResult]{Value: result, Meta: model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status}}, nil
}

func (zeroCostNexusClient) GetSubmitResult(_ context.Context, _ string) (model.ProviderTaskResult, error) {
	panic("unexpected GetSubmitResult call")
}

func (zeroCostNexusClient) GetTaskIDByTrace(_ context.Context, _ string, _ string) (string, error) {
	panic("unexpected GetTaskIDByTrace call")
}

func (f *failingUsageWriter) InsertUsageEvent(_ context.Context, _ model.UsageEventRecord) error {
	return errors.New("usage writer down")
}

func (f *failingUsageWriter) InsertProviderRun(_ context.Context, _ model.ProviderRunRecord) error {
	return nil
}

func captureLogs(t *testing.T) *bytes.Buffer {
	t.Helper()

	logger := logging.GetLogger()
	originalOut := logger.Out
	originalFormatter := logger.Formatter
	originalLevel := logger.GetLevel()

	var buf bytes.Buffer
	logger.SetOutput(&buf)
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.DebugLevel)

	t.Cleanup(func() {
		logger.SetOutput(originalOut)
		logger.SetFormatter(originalFormatter)
		logger.SetLevel(originalLevel)
	})

	return &buf
}

func (f *fakeArtifactPublisher) Publish(_ context.Context, _ model.ArtifactPublishRequest) (model.ArtifactPublishResult, error) {
	f.called = true
	if f.err != nil {
		return model.ArtifactPublishResult{}, f.err
	}
	return f.result, nil
}

func (f *fakeBillingCoordinator) CreateOrGetIntent(_ context.Context, input model.CreateBillingIntentInput) (model.BillingIntent, error) {
	f.intents = append(f.intents, input)
	return model.BillingIntent{
		Provider:       input.Provider,
		TraceID:        input.TraceID,
		DeductSourceID: "anycap-image-generate-" + input.TraceID,
		CreditCost:     input.CreditCost,
	}, nil
}

func (f *fakeBillingCoordinator) RecordProviderSuccess(_ context.Context, input model.RecordBillingProviderSuccessInput) error {
	f.providerSuccess = append(f.providerSuccess, input)
	return f.recordErr
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

func testCatalog() *nexushub.CatalogStub {
	return nexushub.NewCatalogStubWith([]model.ModelSpec{
		{
			ModelID:     "flux-dev",
			Capability:  model.CapabilityImage,
			DisplayName: "FLUX Dev",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}},
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "flux-dev",
						GenType:    string(model.CapabilityImage),
						Mode:       model.ModeTextToImage,
						AlgoType:   "txt_2_img",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
	})
}

func TestGenerateImage_InsufficientCredit(t *testing.T) {
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 0}), calllog.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if !errors.Is(err, model.ErrInsufficientCredit) {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
	}
}

func TestGenerateImage_DeductIsIdempotent(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 3})
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, calllog.NewMemoryCallLogRepo())
	req := model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
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
	if balance.Available != 2 {
		t.Fatalf("expected balance 2 after idempotent generate, got %d", balance.Available)
	}
}

func TestGenerateImage_Success(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), logs)

	result, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.Value.Status != "success" {
		t.Fatalf("expected success, got %q", result.Value.Status)
	}
	if result.Value.Model != "flux-dev" {
		t.Fatalf("expected flux-dev, got %s", result.Value.Model)
	}
	if len(result.Value.Outputs) != 1 {
		t.Fatalf("expected 1 output, got %d", len(result.Value.Outputs))
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

func TestGenerateImage_SuccessPersistsUsageLedger(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	writer := &fakeUsageWriter{}
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), logs)
	service.SetUsageWriter(writer)

	result, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
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
	if writer.events[0].APIKeyID != "akid_1" || writer.events[0].Action != "image.generate" {
		t.Fatalf("unexpected usage event: %#v", writer.events[0])
	}
	if writer.events[0].OccurredAt == (time.Time{}) {
		t.Fatalf("expected occurred_at to be set, got %#v", writer.events[0])
	}
	if writer.runs[0].ProviderTaskID != result.Value.ID || writer.runs[0].UsageEventID != writer.events[0].ID {
		t.Fatalf("unexpected provider run linkage: event=%#v run=%#v", writer.events[0], writer.runs[0])
	}
}

func TestGenerateImage_DoesNotDeductWhenProviderCostMissing(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	writer := &fakeUsageWriter{}
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 2})
	service := NewService(testCatalog(), zeroCostNexusClient{}, creditClient, logs)
	service.SetUsageWriter(writer)

	result, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.Value.CreditCost != 0 {
		t.Fatalf("expected zero response credit cost when provider cost missing, got %d", result.Value.CreditCost)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 2 {
		t.Fatalf("expected balance to remain 2 when provider cost missing, got %d", balance.Available)
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

func TestGenerateImage_LogsUsagePersistenceFailureWithTraceID(t *testing.T) {
	logBuf := captureLogs(t)
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), logs)
	service.SetUsageWriter(&failingUsageWriter{})

	ctx := trace.SetTraceID(context.Background(), "trace-image-usage-1")
	_, err := service.Generate(ctx, model.GenerateImageRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}

	output := logBuf.String()
	if !strings.Contains(output, `"trace_id":"trace-image-usage-1"`) {
		t.Fatalf("expected trace_id in logs, got %q", output)
	}
	if !strings.Contains(output, "usage event persistence failed") {
		t.Fatalf("expected usage persistence warning, got %q", output)
	}
	if !strings.Contains(output, `"capability":"image.generate"`) {
		t.Fatalf("expected capability field in logs, got %q", output)
	}
}

func TestGenerateImage_RouteNotConfigured(t *testing.T) {
	catalog := nexushub.NewCatalogStubWith([]model.ModelSpec{
		{
			ModelID:     "flux-dev",
			Capability:  model.CapabilityImage,
			DisplayName: "FLUX Dev",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {},
			},
		},
	})
	service := NewService(catalog, nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), calllog.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if !errors.Is(err, model.ErrModelRouteNotConfigured) {
		t.Fatalf("expected ErrModelRouteNotConfigured, got %v", err)
	}
}

func TestGenerateImage_PublishFailureDoesNotDeductCredit(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 2})
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, calllog.NewMemoryCallLogRepo())
	service.SetArtifactPublisher(&fakeArtifactPublisher{err: model.ErrUpstreamUnavailable})

	_, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if !errors.Is(err, model.ErrUpstreamUnavailable) {
		t.Fatalf("expected ErrUpstreamUnavailable, got %v", err)
	}
	meta, ok := model.InvocationMetaFromError(err)
	if !ok || meta.TaskID != "img_req-1" || meta.Stage != model.InvocationStagePublish {
		t.Fatalf("diagnostics = %+v, found = %v", meta, ok)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 2 {
		t.Fatalf("expected credit unchanged after publish failure, got %d", balance.Available)
	}
}

func TestGenerateImage_RejectsEmptyProviderOutputWithTaskMetadata(t *testing.T) {
	service := NewService(testCatalog(), emptyOutputNexusClient{}, credit.NewStubClient(map[string]int64{"user-1": 2}), calllog.NewMemoryCallLogRepo())
	_, err := service.Generate(context.Background(), model.GenerateImageRequest{UserID: "user-1", RequestID: "req-empty", Prompt: "paper crane", Model: "flux-dev"})
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) {
		t.Fatalf("expected invocation error, got %v", err)
	}
	if invocationErr.Code != model.InvocationErrorCodeUpstreamEmptyResult || invocationErr.Meta.TaskID != "img-empty" || invocationErr.Meta.Stage != model.InvocationStageValidateResult {
		t.Fatalf("invocation error = %+v", invocationErr)
	}
}

func TestGenerateImage_BillingFailurePreservesTaskMetadata(t *testing.T) {
	billingCoord := &fakeBillingCoordinator{recordErr: errors.New("billing store down")}
	service := NewService(testCatalog(), zeroCostNexusClient{}, credit.NewStubClient(map[string]int64{"user-1": 2}), calllog.NewMemoryCallLogRepo())
	service.SetBillingCoordinator(billingCoord)
	_, err := service.Generate(context.Background(), model.GenerateImageRequest{UserID: "user-1", RequestID: "req-billing", Prompt: "paper crane", Model: "flux-dev"})
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) {
		t.Fatalf("expected invocation error, got %v", err)
	}
	if invocationErr.Meta.TaskID != "img-zero-cost" || invocationErr.Meta.Stage != model.InvocationStageBilling {
		t.Fatalf("invocation error = %+v", invocationErr)
	}
}

func TestGenerateImage_UsesBillingCoordinatorSourceID(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 2})
	billingCoord := &fakeBillingCoordinator{}
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, calllog.NewMemoryCallLogRepo())
	service.SetBillingCoordinator(billingCoord)

	_, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-billing-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}

	if len(billingCoord.intents) != 1 || billingCoord.intents[0].TraceID != "req-billing-1" {
		t.Fatalf("expected billing intent creation, got %+v", billingCoord.intents)
	}
	if len(billingCoord.providerSuccess) != 1 || billingCoord.providerSuccess[0].ProviderTaskID == "" {
		t.Fatalf("expected provider success record, got %+v", billingCoord.providerSuccess)
	}
	if len(billingCoord.deducted) != 1 || billingCoord.deducted[0] != "req-billing-1" {
		t.Fatalf("expected deducted trace req-billing-1, got %+v", billingCoord.deducted)
	}

	transactions, _, err := creditClient.ListTransactions(context.Background(), "user-1", 10, 0)
	if err != nil {
		t.Fatalf("ListTransactions() error = %v", err)
	}
	if len(transactions) != 1 || transactions[0].SourceID != "anycap-image-generate-req-billing-1" {
		t.Fatalf("expected persisted billing source id, got %#v", transactions)
	}
}

func TestSelectRoute_PrefersHighestPriorityEnabledRoute(t *testing.T) {
	spec := &model.ModelSpec{
		ModelID:    "flux-dev",
		Capability: model.CapabilityImage,
		Operations: map[model.Operation]model.OperationSpec{
			model.OperationGenerate: {
				Routes: []model.RouteBinding{
					{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "disabled-top",
						GenType:    string(model.CapabilityImage),
						Mode:       model.ModeTextToImage,
						Priority:   300,
						Enabled:    false,
					},
					{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "secondary",
						GenType:    string(model.CapabilityImage),
						Mode:       model.ModeTextToImage,
						Priority:   100,
						Enabled:    true,
					},
					{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "primary",
						GenType:    string(model.CapabilityImage),
						Mode:       model.ModeTextToImage,
						Priority:   200,
						Enabled:    true,
					},
				},
			},
		},
	}

	route, err := model.SelectRoute(spec, model.OperationGenerate, model.ModeTextToImage)
	if err != nil {
		t.Fatalf("SelectRoute() error = %v", err)
	}
	if route.AbilityKey != "primary" {
		t.Fatalf("expected primary route, got %s", route.AbilityKey)
	}
	if route.Priority != 200 {
		t.Fatalf("expected priority 200, got %d", route.Priority)
	}
}
