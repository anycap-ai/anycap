package nexushub

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type staticCatalogRepo struct {
	spec *model.ModelSpec
}

func (r *staticCatalogRepo) ListModels(_ context.Context, _ model.Capability) ([]model.ModelSpec, error) {
	if r.spec == nil {
		return nil, nil
	}
	return []model.ModelSpec{*r.spec}, nil
}

func (r *staticCatalogRepo) GetModel(_ context.Context, _ model.Capability, _ string) (*model.ModelSpec, error) {
	return r.spec, nil
}

type staticSchemaProvider struct {
	schemasByAbilityKey map[string]map[string]any
}

func (p *staticSchemaProvider) GetOperationSchemas(_ context.Context, abilityKey string) (map[string]any, error) {
	return p.schemasByAbilityKey[abilityKey], nil
}

func TestCatalogSchemaEnricher_GetModelUsesAlgoTypeSchema(t *testing.T) {
	baseRepo := &staticCatalogRepo{
		spec: &model.ModelSpec{
			ModelID:     "nano_banana_2",
			Capability:  model.CapabilityImage,
			DisplayName: "Nano Banana 2",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "nano_banana_2",
						GenType:    "image",
						AlgoType:   "txt_2_img",
						Priority:   100,
						Enabled:    true,
					}},
				},
				model.OperationEdit: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "nano_banana_2",
						GenType:    "image",
						AlgoType:   "img_2_img",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
	}

	provider := &staticSchemaProvider{
		schemasByAbilityKey: map[string]map[string]any{
			"nano_banana_2": {
				"txt_2_img": map[string]any{
					"model_params": map[string]any{
						"prompt": map[string]any{"type": "string"},
					},
				},
				"img_2_img": map[string]any{
					"model_params": map[string]any{
						"images": map[string]any{"type": "array"},
					},
				},
			},
		},
	}

	repo := NewCatalogSchemaEnricher(baseRepo, provider)
	spec, err := repo.GetModel(context.Background(), model.CapabilityImage, "nano_banana_2")
	if err != nil {
		t.Fatalf("GetModel() error = %v", err)
	}

	generateHints := spec.Operations[model.OperationGenerate].RequestHints
	editHints := spec.Operations[model.OperationEdit].RequestHints

	if len(generateHints) == 0 {
		t.Fatal("expected generate request hints to be enriched")
	}
	if len(editHints) == 0 {
		t.Fatal("expected edit request hints to be enriched")
	}
	if _, ok := generateHints["model_params"]; !ok {
		t.Fatalf("expected generate model_params, got %#v", generateHints)
	}
	if _, ok := editHints["model_params"]; !ok {
		t.Fatalf("expected edit model_params, got %#v", editHints)
	}
}

func TestCatalogSchemaEnricher_PreservesExistingHints(t *testing.T) {
	baseRepo := &staticCatalogRepo{
		spec: &model.ModelSpec{
			ModelID:     "existing",
			Capability:  model.CapabilityImage,
			DisplayName: "Existing",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					RequestHints: map[string]any{
						"source": "base",
					},
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "existing",
						AlgoType:   "txt_2_img",
						Enabled:    true,
					}},
				},
			},
		},
	}

	repo := NewCatalogSchemaEnricher(baseRepo, &staticSchemaProvider{
		schemasByAbilityKey: map[string]map[string]any{
			"existing": {
				"txt_2_img": map[string]any{"source": "provider"},
			},
		},
	})

	spec, err := repo.GetModel(context.Background(), model.CapabilityImage, "existing")
	if err != nil {
		t.Fatalf("GetModel() error = %v", err)
	}

	if got := spec.Operations[model.OperationGenerate].RequestHints["source"]; got != "base" {
		t.Fatalf("expected existing hints to be preserved, got %#v", got)
	}
}
