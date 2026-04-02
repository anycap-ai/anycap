package image

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

func (f *fakeUsageWriter) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	f.events = append(f.events, event)
	return nil
}

func (f *fakeUsageWriter) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	f.runs = append(f.runs, run)
	return nil
}

func (zeroCostNexusClient) GenerateImage(_ context.Context, req model.GenerateImageRequest, _ model.RouteBinding) (model.GenerateImageResult, error) {
	return model.GenerateImageResult{
		ID:      "img-zero-cost",
		Status:  "success",
		Model:   req.Model,
		Outputs: []model.Artifact{{Type: "image", URL: "https://cdn.anycap.local/generated.png", MIMEType: "image/png"}},
	}, nil
}

func (zeroCostNexusClient) GenerateVideo(_ context.Context, _ model.GenerateVideoRequest, _ model.RouteBinding) (model.GenerateVideoResult, error) {
	panic("unexpected GenerateVideo call")
}

func (zeroCostNexusClient) GenerateMusic(_ context.Context, _ model.GenerateMusicRequest, _ model.RouteBinding) (model.GenerateMusicResult, error) {
	panic("unexpected GenerateMusic call")
}

func (zeroCostNexusClient) GetSubmitResult(_ context.Context, _ string) (model.ProviderTaskResult, error) {
	panic("unexpected GetSubmitResult call")
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
	if result.Status != "success" {
		t.Fatalf("expected success, got %q", result.Status)
	}
	if result.Model != "flux-dev" {
		t.Fatalf("expected flux-dev, got %s", result.Model)
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
	if writer.runs[0].ProviderTaskID != result.ID || writer.runs[0].UsageEventID != writer.events[0].ID {
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
	if result.CreditCost != 0 {
		t.Fatalf("expected zero response credit cost when provider cost missing, got %d", result.CreditCost)
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
