package nexushub

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct{}

func NewStubClient() *StubClient {
	return &StubClient{}
}

func (c *StubClient) ListImageModels(_ context.Context) ([]model.ImageModel, error) {
	return []model.ImageModel{
		{ID: "flux-dev", Capability: "image", DisplayName: "FLUX Dev", Operations: []string{"generate"}},
		{ID: "gpt-image-1.5", Capability: "image", DisplayName: "GPT Image 1.5", Operations: []string{"generate"}},
	}, nil
}

func (c *StubClient) GetImageModelSchema(_ context.Context, modelName string) (map[string]any, error) {
	return map[string]any{
		"name": modelName,
		"type": "object",
		"properties": map[string]any{
			"prompt": map[string]any{"type": "string"},
			"model":  map[string]any{"type": "string", "default": modelName},
		},
		"required": []string{"prompt"},
	}, nil
}

func (c *StubClient) GenerateImage(_ context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error) {
	safePrompt := url.PathEscape(strings.ReplaceAll(req.Prompt, " ", "-"))
	if req.Model == "" {
		req.Model = "flux-dev"
	}

	return model.GenerateImageResult{
		ID:         fmt.Sprintf("img_%s", req.RequestID),
		Status:     "success",
		Model:      req.Model,
		CreditCost: 1,
		Outputs: []model.Artifact{{
			Type:     "image",
			URL:      fmt.Sprintf("https://files.anycap.local/generated/%s/%s.png", req.Model, safePrompt),
			MIMEType: "image/png",
		}},
		Usage: map[string]any{"credits": 1},
	}, nil
}
