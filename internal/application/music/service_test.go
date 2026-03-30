package music

import (
	"context"
	"errors"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

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
