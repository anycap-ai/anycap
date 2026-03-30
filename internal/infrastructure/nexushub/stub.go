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

func (c *StubClient) GenerateVideo(_ context.Context, req model.GenerateVideoRequest, _ model.RouteBinding) (model.GenerateVideoResult, error) {
	safePrompt := url.PathEscape(strings.ReplaceAll(req.Prompt, " ", "-"))
	if req.Model == "" {
		req.Model = "kling-v1"
	}

	return model.GenerateVideoResult{
		ID:         fmt.Sprintf("vid_%s", req.RequestID),
		Status:     "success",
		Model:      req.Model,
		CreditCost: 5,
		Outputs: []model.Artifact{{
			Type:     "video",
			URL:      fmt.Sprintf("https://files.anycap.local/generated/%s/%s.mp4", req.Model, safePrompt),
			MIMEType: "video/mp4",
		}},
		Usage: map[string]any{"credits": 5},
	}, nil
}

func (c *StubClient) GenerateMusic(_ context.Context, req model.GenerateMusicRequest, _ model.RouteBinding) (model.GenerateMusicResult, error) {
	safeInput := strings.TrimSpace(req.Prompt)
	if safeInput == "" {
		safeInput = strings.TrimSpace(req.Tags)
	}
	safeInput = url.PathEscape(strings.ReplaceAll(safeInput, " ", "-"))
	if req.Model == "" {
		req.Model = "mureka-v6"
	}

	return model.GenerateMusicResult{
		ID:         fmt.Sprintf("mus_%s", req.RequestID),
		Status:     "success",
		Model:      req.Model,
		CreditCost: 2,
		Outputs: []model.Artifact{{
			Type:     "music",
			URL:      fmt.Sprintf("https://files.anycap.local/generated/%s/%s.mp3", req.Model, safeInput),
			MIMEType: "audio/mpeg",
		}},
		Usage: map[string]any{"credits": 2},
	}, nil
}

func (c *StubClient) GetSubmitResult(_ context.Context, taskID string) (model.ProviderTaskResult, error) {
	return model.ProviderTaskResult{
		TaskID:     taskID,
		Status:     "success",
		Usage:      map[string]any{"credits": 1},
		CreditCost: 1,
		RawResult: map[string]any{
			"task_id": taskID,
			"status":  "success",
		},
	}, nil
}
