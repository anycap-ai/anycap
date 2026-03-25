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

func (c *StubClient) GenerateImage(_ context.Context, req model.GenerateImageRequest, _ model.RouteBinding) (model.GenerateImageResult, error) {
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
