package image

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

func TestService_ListModels(t *testing.T) {
	service := NewService(nexushub.NewStubClient())

	models, err := service.ListModels(context.Background())
	if err != nil {
		t.Fatalf("list models: %v", err)
	}
	if len(models) == 0 {
		t.Fatal("expected models")
	}
	if models[0].Capability != "image" {
		t.Fatalf("expected image capability, got %s", models[0].Capability)
	}
}

func TestService_Generate(t *testing.T) {
	service := NewService(nexushub.NewStubClient())

	result, err := service.Generate(context.Background(), model.GenerateImageRequest{
		Prompt: "draw a paper crane",
		Model:  "flux-dev",
	})
	if err != nil {
		t.Fatalf("generate image: %v", err)
	}
	if result.Status != "success" {
		t.Fatalf("expected success, got %s", result.Status)
	}
	if result.Model != "flux-dev" {
		t.Fatalf("expected flux-dev, got %s", result.Model)
	}
	if len(result.Outputs) != 1 {
		t.Fatalf("expected 1 output, got %d", len(result.Outputs))
	}
}
