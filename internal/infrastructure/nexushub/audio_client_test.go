package nexushub

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestBuildAtomicAudioOption(t *testing.T) {
	speechRate, loudnessRate, pitchRate := 10, -5, 2
	tests := []struct {
		name       string
		req        model.GenerateAudioRequest
		route      model.RouteBinding
		modalities []string
		values     []string
	}{
		{
			name: "text to audio speaker",
			req: model.GenerateAudioRequest{
				Format: "mp3", SampleRate: 24000,
				SpeechRate: &speechRate, LoudnessRate: &loudnessRate, PitchRate: &pitchRate,
				EnableSubtitle: true, SpeakerIDs: []string{"speaker-1"},
			},
			route:      model.RouteBinding{AlgoType: "txt_2_audio"},
			modalities: []string{"speaker"},
			values:     []string{"speaker-1"},
		},
		{
			name:       "audio to audio URLs",
			req:        model.GenerateAudioRequest{ReferenceAudioURLs: []string{"https://media.test/a.wav", "https://media.test/b.mp3"}},
			route:      model.RouteBinding{AlgoType: "audio_2_audio"},
			modalities: []string{"audio", "audio"},
			values:     []string{"https://media.test/a.wav", "https://media.test/b.mp3"},
		},
		{
			name:       "image to audio URL",
			req:        model.GenerateAudioRequest{ReferenceImageURLs: []string{"https://media.test/scene.png"}},
			route:      model.RouteBinding{AlgoType: "image_2_audio"},
			modalities: []string{"image"},
			values:     []string{"https://media.test/scene.png"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildAtomicAudioOption(tt.req, tt.route)
			if got.Type != tt.route.AlgoType {
				t.Fatalf("type = %q, want %q", got.Type, tt.route.AlgoType)
			}
			if len(got.References) != len(tt.modalities) {
				t.Fatalf("references = %+v", got.References)
			}
			for i, reference := range got.References {
				if reference.Modality != tt.modalities[i] {
					t.Fatalf("reference[%d].modality = %q", i, reference.Modality)
				}
				value := reference.URL
				if reference.Modality == "speaker" {
					value = reference.SpeakerID
				}
				if value != tt.values[i] {
					t.Fatalf("reference[%d] value = %q, want %q", i, value, tt.values[i])
				}
			}
			if tt.name == "text to audio speaker" {
				if got.Format != "mp3" || got.SampleRate != 24000 || got.SpeechRate != &speechRate || got.LoudnessRate != &loudnessRate || got.PitchRate != &pitchRate || !got.EnableSubtitle {
					t.Fatalf("audio controls did not round trip: %+v", got)
				}
			}
		})
	}
}

func TestClientGenerateAudioMapsPayloadAndMetadata(t *testing.T) {
	var captured submitAtomicProcessRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != submitAtomicProcessPath {
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
		if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"task_id":      "atomic_audio_123",
			"status":       "succeeded",
			"nexus_cost":   0.02485,
			"nexus_usage":  map[string]any{"audio_second": 10.5},
			"resp_payload": `{"resources":[{"url":"https://cdn.test/output.mp3?X-Signature=abc","meta_data":{"url":"https://cdn.test/output.mp3?X-Signature=abc","format":"mp3","duration":10.5,"original_duration":11,"audio_size":84524,"subtitle":{"segments":[{"text":"wind"}]}}}]}`,
		})
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "nexus-token"})
	result, err := client.GenerateAudio(context.Background(), model.GenerateAudioRequest{
		RequestID: "req-audio-1",
		UserID:    "user-123",
		Prompt:    "wind through pine trees",
		Model:     "doubao-seed-audio-1-0",
		Mode:      model.ModeTextToAudio,
		Format:    "mp3",
	}, model.RouteBinding{
		RouteType:  model.RouteTypeScheduler,
		AbilityKey: "doubao-seed-audio-1-0",
		GenType:    string(model.CapabilityAudio),
		AlgoType:   "txt_2_audio",
	})
	if err != nil {
		t.Fatalf("GenerateAudio() error = %v", err)
	}

	if captured.AbilityKey != "doubao-seed-audio-1-0" || captured.Extra["capability"] != string(model.CapabilityAudio) {
		t.Fatalf("unexpected submit envelope: %+v", captured)
	}
	var payload atomicProcessPayload
	if err := json.Unmarshal([]byte(captured.ReqPayload), &payload); err != nil {
		t.Fatalf("decode req_payload: %v", err)
	}
	if payload.GenType != string(model.CapabilityAudio) || payload.AudioOption == nil || payload.AudioOption.Type != "txt_2_audio" {
		t.Fatalf("unexpected audio payload: %+v", payload)
	}

	if result.Meta.TaskID != "atomic_audio_123" || result.Meta.ProviderStatus != "success" {
		t.Fatalf("unexpected invocation metadata: %+v", result.Meta)
	}
	if result.Value.ID != "atomic_audio_123" || result.Value.CreditCost != 2 || result.Value.Usage["audio_second"] != 10.5 {
		t.Fatalf("unexpected audio result: %+v", result.Value)
	}
	if len(result.Value.Outputs) != 1 {
		t.Fatalf("outputs = %+v", result.Value.Outputs)
	}
	output := result.Value.Outputs[0]
	if output.Type != "audio" || output.MIMEType != "audio/mpeg" || output.DurationSeconds != 10.5 || output.OriginalDurationSeconds != 11 || output.SizeBytes != 84524 {
		t.Fatalf("unexpected audio artifact: %+v", output)
	}
	if string(output.Subtitle) != `{"segments":[{"text":"wind"}]}` {
		t.Fatalf("subtitle = %s", output.Subtitle)
	}
}

func TestClientGenerateAudioRejectsSuccessfulHTTPWithBaseError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"base":    map[string]any{"code": 422, "message": "validation failed: bad audio option"},
			"task_id": "atomic_audio_rejected",
			"status":  "failed",
		})
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "nexus-token"})
	_, err := client.GenerateAudio(context.Background(), model.GenerateAudioRequest{
		RequestID: "req-audio-invalid", UserID: "user-123", Prompt: "sound", Model: "doubao-seed-audio-1-0",
	}, model.RouteBinding{AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "txt_2_audio"})
	if !errors.Is(err, model.ErrInvalidParam) {
		t.Fatalf("error = %v, want ErrInvalidParam", err)
	}
	meta, ok := model.InvocationMetaFromError(err)
	if !ok || meta.TaskID != "atomic_audio_rejected" || meta.ProviderStatus != "failed" || meta.Stage != model.InvocationStageSubmit {
		t.Fatalf("invocation metadata = %+v, found=%v", meta, ok)
	}
}

func TestClientGenerateAudioDoesNotExposeResourcePath(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"task_id":      "atomic_audio_path",
			"status":       "succeeded",
			"resp_payload": `{"resources":[{"path":"private/audio/123/output.wav","meta_data":{"format":"wav","duration":1.5}}]}`,
		})
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "nexus-token"})
	result, err := client.GenerateAudio(context.Background(), model.GenerateAudioRequest{
		RequestID: "req-audio-path", UserID: "123", Prompt: "sound", Model: "doubao-seed-audio-1-0",
	}, model.RouteBinding{AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "txt_2_audio"})
	if err != nil {
		t.Fatalf("GenerateAudio() error = %v", err)
	}
	if len(result.Value.Outputs) != 1 || result.Value.Outputs[0].URL != "" {
		t.Fatalf("internal resource path reached public output: %+v", result.Value.Outputs)
	}
}

func TestClientGenerateAudioSerializesReferenceModes(t *testing.T) {
	tests := []struct {
		name     string
		req      model.GenerateAudioRequest
		algo     string
		modality string
		wantURL  string
	}{
		{
			name: "audio to audio", algo: "audio_2_audio", modality: "audio", wantURL: "https://media.test/reference.wav",
			req: model.GenerateAudioRequest{ReferenceAudioURLs: []string{"https://media.test/reference.wav"}},
		},
		{
			name: "image to audio", algo: "image_2_audio", modality: "image", wantURL: "https://media.test/scene.png",
			req: model.GenerateAudioRequest{ReferenceImageURLs: []string{"https://media.test/scene.png"}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var captured submitAtomicProcessRequest
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
					t.Fatalf("decode request: %v", err)
				}
				_ = json.NewEncoder(w).Encode(map[string]any{
					"base": map[string]any{"code": 0, "message": "success"}, "task_id": "atomic_reference", "status": "succeeded",
					"resp_payload": `{"resources":[{"url":"https://cdn.test/output.mp3"}]}`,
				})
			}))
			defer srv.Close()

			tt.req.RequestID = "req-reference"
			tt.req.UserID = "123"
			tt.req.Prompt = "guided sound"
			tt.req.Model = "doubao-seed-audio-1-0"
			client := NewClient(ClientConfig{BaseURL: srv.URL, Token: "nexus-token"})
			if _, err := client.GenerateAudio(context.Background(), tt.req, model.RouteBinding{
				AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: tt.algo,
			}); err != nil {
				t.Fatalf("GenerateAudio() error = %v", err)
			}

			var payload atomicProcessPayload
			if err := json.Unmarshal([]byte(captured.ReqPayload), &payload); err != nil {
				t.Fatalf("decode req_payload: %v", err)
			}
			if payload.AudioOption == nil || payload.AudioOption.Type != tt.algo || len(payload.AudioOption.References) != 1 {
				t.Fatalf("unexpected payload: %+v", payload)
			}
			reference := payload.AudioOption.References[0]
			if reference.Modality != tt.modality || reference.URL != tt.wantURL {
				t.Fatalf("unexpected reference: %+v", reference)
			}
		})
	}
}
