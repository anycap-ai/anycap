package audio

import (
	"bytes"
	"context"
	"net/http"
	"testing"

	audioapp "gitlab.knoffice.tech/engineering/anycap/internal/application/audio"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type captureAudioClient struct {
	req   model.GenerateAudioRequest
	route model.RouteBinding
}

func (c *captureAudioClient) GenerateAudio(_ context.Context, req model.GenerateAudioRequest, route model.RouteBinding) (model.InvocationResult[model.GenerateAudioResult], error) {
	c.req = req
	c.route = route
	result := model.GenerateAudioResult{
		ID: "atomic_audio_handler", Status: "success", Model: req.Model,
		Outputs: []model.AudioArtifact{{Artifact: model.Artifact{Type: "audio", URL: "https://cdn.test/output.wav", MIMEType: "audio/wav"}}},
	}
	return model.InvocationResult[model.GenerateAudioResult]{
		Value: result,
		Meta:  model.InvocationMeta{TaskID: result.ID, ProviderStatus: result.Status, Stage: model.InvocationStageDecodeResult},
	}, nil
}

func audioHandlerCatalog() *nexushub.CatalogStub {
	return nexushub.NewCatalogStubWith([]model.ModelSpec{{
		ModelID: "doubao-seed-audio-1-0", Capability: model.CapabilityAudio, Status: "active",
		Operations: map[model.Operation]model.OperationSpec{
			model.OperationGenerate: {Routes: []model.RouteBinding{
				{RouteType: model.RouteTypeScheduler, AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "txt_2_audio", Mode: model.ModeTextToAudio, Priority: 100, Enabled: true},
				{RouteType: model.RouteTypeScheduler, AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "audio_2_audio", Mode: model.ModeAudioToAudio, Priority: 100, Enabled: true},
				{RouteType: model.RouteTypeScheduler, AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "image_2_audio", Mode: model.ModeImageToAudio, Priority: 100, Enabled: true},
			}},
		},
	}})
}

func newAudioHandlerTestServer(withPrincipal bool) (*server.Hertz, *captureAudioClient) {
	client := &captureAudioClient{}
	service := audioapp.NewService(
		audioHandlerCatalog(),
		client,
		credit.NewStubClient(map[string]int64{"123": 20}),
		calllog.NewMemoryCallLogRepo(),
	)
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	if withPrincipal {
		h.Use(middleware.LocalBypassAuth(model.Principal{UserID: "123", APIKeyID: "akid_audio", AuthType: "local_bypass"}))
	}
	NewHandler(service).RegisterRoutes(h.Group("/v1"))
	return h, client
}

func TestHandlerGenerateMapsPublicAudioDTO(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		wantMode model.Mode
		check    func(t *testing.T, req model.GenerateAudioRequest)
	}{
		{
			name:     "text controls and speaker",
			body:     `{"prompt":"calm voice","model":"doubao-seed-audio-1-0","mode":"text-to-audio","format":"wav","sample_rate":24000,"speech_rate":0,"loudness_rate":0,"pitch_rate":0,"enable_subtitle":true,"speaker_ids":["speaker-1"]}`,
			wantMode: model.ModeTextToAudio,
			check: func(t *testing.T, req model.GenerateAudioRequest) {
				t.Helper()
				if req.Format != "wav" || req.SampleRate != 24000 || req.SpeechRate == nil || *req.SpeechRate != 0 || req.LoudnessRate == nil || *req.LoudnessRate != 0 || req.PitchRate == nil || *req.PitchRate != 0 || !req.EnableSubtitle {
					t.Fatalf("audio controls were not mapped: %+v", req)
				}
				if len(req.SpeakerIDs) != 1 || req.SpeakerIDs[0] != "speaker-1" {
					t.Fatalf("speaker IDs were not mapped: %+v", req.SpeakerIDs)
				}
			},
		},
		{
			name:     "audio references",
			body:     `{"prompt":"make it warmer","model":"doubao-seed-audio-1-0","mode":"audio-to-audio","audios":["https://media.test/reference.wav"]}`,
			wantMode: model.ModeAudioToAudio,
			check: func(t *testing.T, req model.GenerateAudioRequest) {
				t.Helper()
				if len(req.ReferenceAudioURLs) != 1 || req.ReferenceAudioURLs[0] != "https://media.test/reference.wav" {
					t.Fatalf("audio references were not mapped: %+v", req.ReferenceAudioURLs)
				}
			},
		},
		{
			name:     "image references",
			body:     `{"prompt":"create the scene sound","model":"doubao-seed-audio-1-0","mode":"image-to-audio","images":["https://media.test/scene.png"]}`,
			wantMode: model.ModeImageToAudio,
			check: func(t *testing.T, req model.GenerateAudioRequest) {
				t.Helper()
				if len(req.ReferenceImageURLs) != 1 || req.ReferenceImageURLs[0] != "https://media.test/scene.png" {
					t.Fatalf("image references were not mapped: %+v", req.ReferenceImageURLs)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h, client := newAudioHandlerTestServer(true)
			response := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/audio/generate",
				&ut.Body{Body: bytes.NewBufferString(tt.body), Len: len(tt.body)},
				ut.Header{Key: "Content-Type", Value: "application/json"},
			)
			if response.Code != http.StatusOK {
				t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
			}
			if client.req.UserID != "123" || client.req.APIKeyID != "akid_audio" || client.req.Mode != tt.wantMode || client.route.AlgoType == "" {
				t.Fatalf("principal or route mapping failed: req=%+v route=%+v", client.req, client.route)
			}
			tt.check(t, client.req)
		})
	}
}

func TestHandlerGenerateRejectsInvalidJSONAndMissingPrincipal(t *testing.T) {
	h, _ := newAudioHandlerTestServer(true)
	invalid := "{"
	response := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/audio/generate",
		&ut.Body{Body: bytes.NewBufferString(invalid), Len: len(invalid)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("invalid JSON status = %d, body = %s", response.Code, response.Body.String())
	}

	h, _ = newAudioHandlerTestServer(false)
	body := `{"prompt":"sound","model":"doubao-seed-audio-1-0"}`
	response = ut.PerformRequest(h.Engine, http.MethodPost, "/v1/audio/generate",
		&ut.Body{Body: bytes.NewBufferString(body), Len: len(body)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("missing principal status = %d, body = %s", response.Code, response.Body.String())
	}
}
