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
		{
			ID:          "flux-dev",
			Capability:  "image",
			DisplayName: "FLUX Dev",
			Operations:  []string{"generate"},
		},
		{
			ID:          "gpt-image-1.5",
			Capability:  "image",
			DisplayName: "GPT Image 1.5",
			Operations:  []string{"generate"},
		},
	}, nil
}

func (c *StubClient) GenerateImage(_ context.Context, req model.GenerateImageRequest) (model.GenerateImageResult, error) {
	safePrompt := url.PathEscape(strings.ReplaceAll(req.Prompt, " ", "-"))

	return model.GenerateImageResult{
		ID:     "img_demo_001",
		Status: "success",
		Model:  req.Model,
		Outputs: []model.Artifact{
			{
				Type:     "image",
				URL:      fmt.Sprintf("https://files.anycap.local/generated/%s/%s.png", req.Model, safePrompt),
				MIMEType: "image/png",
			},
		},
		Usage: map[string]any{
			"credits": 1,
		},
	}, nil
}
