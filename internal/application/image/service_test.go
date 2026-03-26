package image

import (
	"context"
	"errors"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

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
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 0}), apikey.NewMemoryCallLogRepo())

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
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, apikey.NewMemoryCallLogRepo())
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
	logs := apikey.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), logs)

	result, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
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
	service := NewService(catalog, nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), apikey.NewMemoryCallLogRepo())

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

func TestSelectGenerateRoute_PrefersHighestPriorityEnabledRoute(t *testing.T) {
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
						Priority:   300,
						Enabled:    false,
					},
					{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "secondary",
						GenType:    string(model.CapabilityImage),
						Priority:   100,
						Enabled:    true,
					},
					{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "primary",
						GenType:    string(model.CapabilityImage),
						Priority:   200,
						Enabled:    true,
					},
				},
			},
		},
	}

	route, err := selectGenerateRoute(spec)
	if err != nil {
		t.Fatalf("selectGenerateRoute() error = %v", err)
	}
	if route.AbilityKey != "primary" {
		t.Fatalf("expected primary route, got %s", route.AbilityKey)
	}
	if route.Priority != 200 {
		t.Fatalf("expected priority 200, got %d", route.Priority)
	}
}
