package catalog

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

func newTestService() *Service {
	fixtures := []model.ModelSpec{
		{
			ModelID:     "test-img-model",
			Capability:  model.CapabilityImage,
			DisplayName: "Test Image Model",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_key_img",
						GenType:    "image",
						Priority:   100,
						Enabled:    true,
					}},
				},
				model.OperationEdit: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_key_img",
						GenType:    "image",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
		{
			ModelID:     "test-vid-model",
			Capability:  model.CapabilityVideo,
			DisplayName: "Test Video Model",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_key_vid",
						GenType:    "video",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
	}
	return NewService(nexushub.NewCatalogStubWith(fixtures))
}

func TestService_ListModels(t *testing.T) {
	svc := newTestService()

	summaries, err := svc.ListModels(context.Background(), model.CapabilityImage)
	if err != nil {
		t.Fatalf("list models: %v", err)
	}
	if len(summaries) != 1 {
		t.Fatalf("expected 1 image model, got %d", len(summaries))
	}
	if summaries[0].ModelID != "test-img-model" {
		t.Fatalf("expected test-img-model, got %s", summaries[0].ModelID)
	}
}

func TestService_ListModels_Video(t *testing.T) {
	svc := newTestService()

	summaries, err := svc.ListModels(context.Background(), model.CapabilityVideo)
	if err != nil {
		t.Fatalf("list models: %v", err)
	}
	if len(summaries) != 1 {
		t.Fatalf("expected 1 video model, got %d", len(summaries))
	}
	if summaries[0].ModelID != "test-vid-model" {
		t.Fatalf("expected test-vid-model, got %s", summaries[0].ModelID)
	}
}

func TestService_GetModelSchema(t *testing.T) {
	svc := newTestService()

	schema, err := svc.GetModelSchema(context.Background(), model.CapabilityImage, "test-img-model", "generate")
	if err != nil {
		t.Fatalf("get schema: %v", err)
	}
	if schema.ModelID != "test-img-model" {
		t.Fatalf("expected test-img-model, got %s", schema.ModelID)
	}
	if schema.Operation != "generate" {
		t.Fatalf("expected generate, got %s", schema.Operation)
	}
}

func TestService_GetModelSchema_NotFound(t *testing.T) {
	svc := newTestService()

	_, err := svc.GetModelSchema(context.Background(), model.CapabilityImage, "test-img-model", "upscale")
	if err == nil {
		t.Fatal("expected error for unsupported operation")
	}
}

func TestService_GetModel(t *testing.T) {
	svc := newTestService()

	spec, err := svc.GetModel(context.Background(), model.CapabilityImage, "test-img-model")
	if err != nil {
		t.Fatalf("get model: %v", err)
	}
	if len(spec.Operations) != 2 {
		t.Fatalf("expected 2 operations (generate, edit), got %d", len(spec.Operations))
	}
	genOp, ok := spec.Operations[model.OperationGenerate]
	if !ok {
		t.Fatal("expected generate operation")
	}
	if len(genOp.Routes) == 0 {
		t.Fatal("expected at least one route binding")
	}
	if genOp.Routes[0].AbilityKey != "test_ability_key_img" {
		t.Fatalf("expected test_ability_key_img, got %s", genOp.Routes[0].AbilityKey)
	}
}

func TestService_ListModels_Empty(t *testing.T) {
	svc := NewService(nexushub.NewCatalogStub())

	summaries, err := svc.ListModels(context.Background(), model.CapabilityImage)
	if err != nil {
		t.Fatalf("list models: %v", err)
	}
	if len(summaries) != 0 {
		t.Fatalf("expected 0 models from empty stub, got %d", len(summaries))
	}
}
