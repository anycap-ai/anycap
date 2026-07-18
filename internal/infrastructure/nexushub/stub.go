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

func (c *StubClient) GenerateImage(_ context.Context, req model.GenerateImageRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateImageResult], error) {
	safePrompt := url.PathEscape(strings.ReplaceAll(req.Prompt, " ", "-"))
	if req.Model == "" {
		req.Model = "flux-dev"
	}

	result := model.GenerateImageResult{
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
	}
	return invocationSuccess(result, model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status, Stage: model.InvocationStageDecodeResult})
}

func (c *StubClient) GenerateVideo(_ context.Context, req model.GenerateVideoRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateVideoResult], error) {
	safePrompt := url.PathEscape(strings.ReplaceAll(req.Prompt, " ", "-"))
	if req.Model == "" {
		req.Model = "kling-v1"
	}

	result := model.GenerateVideoResult{
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
	}
	return invocationSuccess(result, model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status, Stage: model.InvocationStageDecodeResult})
}

func (c *StubClient) GenerateMusic(_ context.Context, req model.GenerateMusicRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateMusicResult], error) {
	safeInput := strings.TrimSpace(req.Prompt)
	if safeInput == "" {
		safeInput = strings.TrimSpace(req.Tags)
	}
	safeInput = url.PathEscape(strings.ReplaceAll(safeInput, " ", "-"))
	if req.Model == "" {
		req.Model = "mureka-v6"
	}

	result := model.GenerateMusicResult{
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
	}
	return invocationSuccess(result, model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status, Stage: model.InvocationStageDecodeResult})
}

func (c *StubClient) GenerateAudio(_ context.Context, req model.GenerateAudioRequest, _ model.RouteBinding) (model.InvocationResult[model.GenerateAudioResult], error) {
	safePrompt := url.PathEscape(strings.ReplaceAll(req.Prompt, " ", "-"))
	if req.Model == "" {
		req.Model = "doubao-seed-audio-1-0"
	}
	result := model.GenerateAudioResult{
		ID:         fmt.Sprintf("aud_%s", req.RequestID),
		Status:     "success",
		Model:      req.Model,
		CreditCost: 2,
		Outputs: []model.AudioArtifact{{
			Artifact: model.Artifact{
				Type:     "audio",
				URL:      fmt.Sprintf("https://files.anycap.local/generated/%s/%s.mp3", req.Model, safePrompt),
				MIMEType: "audio/mpeg",
			},
		}},
		Usage: map[string]any{"credits": 2},
	}
	return invocationSuccess(result, model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status, Stage: model.InvocationStageDecodeResult})
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

func (c *StubClient) GetTaskIDByTrace(_ context.Context, traceID, _ string) (string, error) {
	if strings.TrimSpace(traceID) == "" {
		return "", model.ErrNotFound("nexushub trace lookup not found")
	}
	return "trace_" + traceID, nil
}
