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
					RequestHints: map[string]any{
						"model_params": map[string]any{
							"prompt": map[string]any{"type": "string", "required": true},
						},
					},
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
		{
			ModelID:     "test-music-model",
			Capability:  model.CapabilityMusic,
			DisplayName: "Test Music Model",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					RequestHints: map[string]any{
						"prompt": map[string]any{"type": "string"},
						"tags":   map[string]any{"type": "string"},
					},
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_key_music",
						GenType:    "music",
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

func TestService_ListModels_Music(t *testing.T) {
	svc := newTestService()

	summaries, err := svc.ListModels(context.Background(), model.CapabilityMusic)
	if err != nil {
		t.Fatalf("list models: %v", err)
	}
	if len(summaries) != 1 {
		t.Fatalf("expected 1 music model, got %d", len(summaries))
	}
	if summaries[0].ModelID != "test-music-model" {
		t.Fatalf("expected test-music-model, got %s", summaries[0].ModelID)
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
	if len(schema.Schema) == 0 {
		t.Fatal("expected schema payload in schema response")
	}
}

func TestService_GetModelSchema_NotFound(t *testing.T) {
	svc := newTestService()

	_, err := svc.GetModelSchema(context.Background(), model.CapabilityImage, "test-img-model", "upscale")
	if err == nil {
		t.Fatal("expected error for unsupported operation")
	}
}

func TestService_GetModelSchemas_WithModes(t *testing.T) {
	fixtures := []model.ModelSpec{
		{
			ModelID:    "multi-mode-model",
			Capability: model.CapabilityVideo,
			Status:     "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Modes: []model.ModeSpec{
						{Mode: model.ModeTextToVideo, Description: "Text to video"},
						{Mode: model.ModeImageToVideo, Description: "Image to video"},
					},
					ModeSchemas: map[model.Mode]map[string]any{
						model.ModeTextToVideo:  {"prompt": map[string]any{"type": "string"}},
						model.ModeImageToVideo: {"reference_image": map[string]any{"type": "string", "format": "file-or-url"}},
					},
					Routes: []model.RouteBinding{
						{AbilityKey: "k1", Mode: model.ModeTextToVideo, Priority: 100, Enabled: true},
						{AbilityKey: "k1", Mode: model.ModeImageToVideo, Priority: 100, Enabled: true},
					},
				},
			},
		},
	}
	svc := NewService(nexushub.NewCatalogStubWith(fixtures))

	// Get all schemas
	schemas, err := svc.GetModelSchemas(context.Background(), model.CapabilityVideo, "multi-mode-model", "generate", "")
	if err != nil {
		t.Fatalf("get schemas: %v", err)
	}
	if len(schemas) != 2 {
		t.Fatalf("expected 2 schemas, got %d", len(schemas))
	}

	// Filter by mode
	schemas, err = svc.GetModelSchemas(context.Background(), model.CapabilityVideo, "multi-mode-model", "generate", "image-to-video")
	if err != nil {
		t.Fatalf("get schemas with mode filter: %v", err)
	}
	if len(schemas) != 1 {
		t.Fatalf("expected 1 schema, got %d", len(schemas))
	}
	if schemas[0].Mode != "image-to-video" {
		t.Fatalf("expected mode image-to-video, got %s", schemas[0].Mode)
	}
	if schemas[0].Schema == nil {
		t.Fatal("expected schema payload")
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
