package nexushub

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/sirupsen/logrus"
)

func init() {
	trace.Setup()
}

func captureLogs(t *testing.T) *bytes.Buffer {
	t.Helper()

	logger := logging.GetLogger()
	originalOut := logger.Out
	originalFormatter := logger.Formatter
	originalLevel := logger.GetLevel()

	var buf bytes.Buffer
	logger.SetOutput(&buf)
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.DebugLevel)

	t.Cleanup(func() {
		logger.SetOutput(originalOut)
		logger.SetFormatter(originalFormatter)
		logger.SetLevel(originalLevel)
	})

	return &buf
}

func TestClient_GenerateImage(t *testing.T) {
	var captured submitAtomicProcessRequest

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != submitAtomicProcessPath {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		if got := r.Header.Get("X-Trace-ID"); got != "req-1" {
			t.Fatalf("expected trace id header req-1, got %q", got)
		}
		if got := r.Header.Get("X-Nexus-Extra"); !strings.Contains(got, `"trace_id":"req-1"`) || !strings.Contains(got, `"biz_id":"anycap"`) {
			t.Fatalf("expected X-Nexus-Extra to contain trace_id and biz_id, got %q", got)
		}

		if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
			t.Fatalf("decode request: %v", err)
		}

		resp := submitAtomicProcessResponse{
			Base:        submitBaseResponse{Code: 0, Message: "success"},
			TaskID:      "task-123",
			Status:      "succeeded",
			RespPayload: `{"resources":[{"url":"https://cdn.anycap.local/generated.png","credit_cost":99}]}`,
			NexusCost:   0.021,
			NexusUsage:  map[string]any{"images": 1},
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(resp); err != nil {
			t.Fatalf("encode response: %v", err)
		}
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{
		BaseURL: srv.URL,
		Token:   "nexus-token",
	})

	ctx := trace.SetTraceID(context.Background(), "req-1")
	result, err := client.GenerateImage(ctx, model.GenerateImageRequest{
		RequestID:          "req-1",
		UserID:             "user-123",
		Prompt:             "paper crane",
		Model:              "flux-dev",
		NegativePrompt:     "low quality",
		Ratio:              "1:1",
		Resolution:         "1024x1024",
		ReferenceImageURLs: []string{"https://cdn.anycap.local/ref.png"},
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "google_nano_banana_2",
		GenType:    string(model.CapabilityImage),
		AlgoType:   "img_2_img",
		Priority:   100,
		Enabled:    true,
	})
	if err != nil {
		t.Fatalf("GenerateImage() error = %v", err)
	}

	if captured.AbilityKey != "google_nano_banana_2" {
		t.Fatalf("expected ability key google_nano_banana_2, got %q", captured.AbilityKey)
	}
	if captured.Token != "nexus-token" {
		t.Fatalf("expected token nexus-token, got %q", captured.Token)
	}
	if captured.BizInfo.BizID != defaultNexusHubBizID {
		t.Fatalf("expected biz_id %q, got %q", defaultNexusHubBizID, captured.BizInfo.BizID)
	}
	if captured.UserInfo.UID != 123 {
		t.Fatalf("expected uid 123, got %d", captured.UserInfo.UID)
	}
	if captured.Extra["model_id"] != "flux-dev" {
		t.Fatalf("expected extra model_id flux-dev, got %#v", captured.Extra["model_id"])
	}

	var payload atomicProcessPayload
	if err := json.Unmarshal([]byte(captured.ReqPayload), &payload); err != nil {
		t.Fatalf("unmarshal req_payload: %v", err)
	}
	if payload.GenType != string(model.CapabilityImage) {
		t.Fatalf("expected gen_type image, got %q", payload.GenType)
	}
	if payload.ImageOption == nil {
		t.Fatal("expected image_option")
	}
	if payload.ImageOption.Type != "img_2_img" {
		t.Fatalf("expected algo type img_2_img, got %q", payload.ImageOption.Type)
	}
	if payload.ImageOption.NegativePrompt != "low quality" {
		t.Fatalf("expected negative prompt to round trip, got %q", payload.ImageOption.NegativePrompt)
	}
	if len(payload.ImageOption.ReferImageURLs) != 1 {
		t.Fatalf("expected 1 reference image, got %d", len(payload.ImageOption.ReferImageURLs))
	}

	if result.ID != "task-123" {
		t.Fatalf("expected result id task-123, got %q", result.ID)
	}
	if result.Status != "success" {
		t.Fatalf("expected success status, got %q", result.Status)
	}
	if len(result.Outputs) != 1 || result.Outputs[0].URL != "https://cdn.anycap.local/generated.png" {
		t.Fatalf("unexpected outputs: %#v", result.Outputs)
	}
	if result.CreditCost != 2 {
		t.Fatalf("expected credit cost 2 from nexus_cost, got %d", result.CreditCost)
	}
}

func TestClient_GenerateMusic(t *testing.T) {
	var captured submitAtomicProcessRequest

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
			t.Fatalf("decode request: %v", err)
		}

		resp := submitAtomicProcessResponse{
			Base:        submitBaseResponse{Code: 0, Message: "success"},
			TaskID:      "music-task-123",
			Status:      "succeeded",
			RespPayload: `{"resources":[{"url":"https://cdn.anycap.local/generated.mp3","credit_cost":99}]}`,
			NexusCost:   0.041,
			NexusUsage:  map[string]any{"music": 1},
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(resp); err != nil {
			t.Fatalf("encode response: %v", err)
		}
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{
		BaseURL: srv.URL,
		Token:   "nexus-token",
	})

	ctx := trace.SetTraceID(context.Background(), "req-music-1")
	result, err := client.GenerateMusic(ctx, model.GenerateMusicRequest{
		RequestID:        "req-music-1",
		UserID:           "user-123",
		Prompt:           "lofi night drive",
		Model:            "mureka-v6",
		MakeInstrumental: true,
		CustomMode:       true,
		Tags:             "lofi chill",
		Title:            "Night Drive",
		Lyrics:           "city lights at midnight",
		ContinueAt:       30,
		ContinueClipID:   "clip_123",
		VocalGender:      "female",
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "mureka_v6",
		GenType:    string(model.CapabilityMusic),
		Priority:   100,
		Enabled:    true,
	})
	if err != nil {
		t.Fatalf("GenerateMusic() error = %v", err)
	}

	if captured.AbilityKey != "mureka_v6" {
		t.Fatalf("expected ability key mureka_v6, got %q", captured.AbilityKey)
	}
	if captured.UserInfo.UID != 123 {
		t.Fatalf("expected uid 123, got %d", captured.UserInfo.UID)
	}
	if captured.Extra["capability"] != string(model.CapabilityMusic) {
		t.Fatalf("expected music capability extra, got %#v", captured.Extra["capability"])
	}

	var payload atomicProcessPayload
	if err := json.Unmarshal([]byte(captured.ReqPayload), &payload); err != nil {
		t.Fatalf("unmarshal req_payload: %v", err)
	}
	if payload.GenType != string(model.CapabilityMusic) {
		t.Fatalf("expected gen_type music, got %q", payload.GenType)
	}
	if payload.MusicOption == nil {
		t.Fatal("expected music_option")
	}
	if !payload.MusicOption.MakeInstrumental || !payload.MusicOption.CustomMode {
		t.Fatalf("expected music flags to round trip, got %#v", payload.MusicOption)
	}
	if payload.MusicOption.Tags != "lofi chill" {
		t.Fatalf("expected tags to round trip, got %q", payload.MusicOption.Tags)
	}
	if payload.MusicOption.ContinueClipID != "clip_123" {
		t.Fatalf("expected continue clip id to round trip, got %q", payload.MusicOption.ContinueClipID)
	}

	if result.ID != "music-task-123" {
		t.Fatalf("expected result id music-task-123, got %q", result.ID)
	}
	if result.Status != "success" {
		t.Fatalf("expected success status, got %q", result.Status)
	}
	if len(result.Outputs) != 1 || result.Outputs[0].URL != "https://cdn.anycap.local/generated.mp3" {
		t.Fatalf("unexpected outputs: %#v", result.Outputs)
	}
	if result.CreditCost != 3 {
		t.Fatalf("expected credit cost 3 from nexus_cost, got %d", result.CreditCost)
	}
}

func TestClient_GenerateVideo(t *testing.T) {
	var captured submitAtomicProcessRequest

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
			t.Fatalf("decode request: %v", err)
		}

		resp := submitAtomicProcessResponse{
			Base:        submitBaseResponse{Code: 0, Message: "success"},
			TaskID:      "video-task-123",
			Status:      "succeeded",
			RespPayload: `{"resources":[{"url":"https://cdn.anycap.local/generated.mp4","credit_cost":99}]}`,
			NexusCost:   0.081,
			NexusUsage:  map[string]any{"videos": 1},
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(resp); err != nil {
			t.Fatalf("encode response: %v", err)
		}
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{
		BaseURL: srv.URL,
		Token:   "nexus-token",
	})

	ctx := trace.SetTraceID(context.Background(), "req-video-1")
	result, err := client.GenerateVideo(ctx, model.GenerateVideoRequest{
		RequestID:          "req-video-1",
		UserID:             "user-123",
		Prompt:             "paper crane",
		Model:              "veo-mini",
		Mode:               model.ModeImageToVideo,
		ReferenceImageURLs: []string{"https://cdn.anycap.local/frame.png"},
	}, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: "veo-mini",
		GenType:    string(model.CapabilityVideo),
		AlgoType:   "img_2_video",
		Mode:       model.ModeImageToVideo,
		Priority:   100,
		Enabled:    true,
	})
	if err != nil {
		t.Fatalf("GenerateVideo() error = %v", err)
	}

	if captured.AbilityKey != "veo-mini" {
		t.Fatalf("expected ability key veo-mini, got %q", captured.AbilityKey)
	}

	var payload atomicProcessPayload
	if err := json.Unmarshal([]byte(captured.ReqPayload), &payload); err != nil {
		t.Fatalf("unmarshal req_payload: %v", err)
	}
	if payload.VideoOption == nil {
		t.Fatal("expected video_option")
	}
	if payload.VideoOption.Type != "img_2_video" {
		t.Fatalf("expected algo type img_2_video, got %q", payload.VideoOption.Type)
	}
	if payload.ResourceURL != "https://cdn.anycap.local/frame.png" {
		t.Fatalf("expected resource url to round trip, got %q", payload.ResourceURL)
	}

	if result.ID != "video-task-123" {
		t.Fatalf("expected result id video-task-123, got %q", result.ID)
	}
	if result.Status != "success" {
		t.Fatalf("expected success status, got %q", result.Status)
	}
	if len(result.Outputs) != 1 || result.Outputs[0].URL != "https://cdn.anycap.local/generated.mp4" {
		t.Fatalf("unexpected outputs: %#v", result.Outputs)
	}
	if result.CreditCost != 5 {
		t.Fatalf("expected credit cost 5 from nexus_cost, got %d", result.CreditCost)
	}
}

func TestClient_GetSubmitResult(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("expected GET, got %s", r.Method)
		}
		if r.URL.Path != "/v1/get_submit_result/task-123" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		if got := r.Header.Get("X-Token"); got != "nexus-token" {
			t.Fatalf("expected X-Token nexus-token, got %q", got)
		}
		if got := r.Header.Get("X-Trace-ID"); got != "req-sync-1" {
			t.Fatalf("expected trace id header req-sync-1, got %q", got)
		}

		resp := submitAtomicProcessResponse{
			Base:        submitBaseResponse{Code: 0, Message: "success"},
			TaskID:      "task-123",
			Status:      "failed",
			RespPayload: `{"resources":[{"url":"https://cdn.anycap.local/generated.png","credit_cost":4}]}`,
			NexusCost:   0.039,
			ErrCode:     5005,
			ErrMsg:      "validation failed",
			NexusUsage:  map[string]any{"images": 1},
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(resp); err != nil {
			t.Fatalf("encode response: %v", err)
		}
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{
		BaseURL: srv.URL,
		Token:   "nexus-token",
	})

	ctx := trace.SetTraceID(context.Background(), "req-sync-1")
	result, err := client.GetSubmitResult(ctx, "task-123")
	if err != nil {
		t.Fatalf("GetSubmitResult() error = %v", err)
	}
	if result.TaskID != "task-123" || result.Status != "failed" {
		t.Fatalf("unexpected result: %+v", result)
	}
	if result.CreditCost != 2 {
		t.Fatalf("expected credit cost 2 from nexus_cost, got %d", result.CreditCost)
	}
	if result.ErrorCode != 5005 || result.ErrorMessage != "validation failed" {
		t.Fatalf("unexpected error mapping: %+v", result)
	}
}

func TestClient_GetTaskIDByTrace_NotConfigured(t *testing.T) {
	client := NewClient(ClientConfig{
		BaseURL: "https://nexus.example.com",
		Token:   "nexus-token",
	})

	_, err := client.GetTaskIDByTrace(context.Background(), "trc_lookup_1", "anycap")
	if err == nil {
		t.Fatal("expected error when trace lookup path is not configured")
	}
	domainErr, ok := err.(*model.DomainError)
	if !ok || domainErr.Code != "not_configured" {
		t.Fatalf("expected not_configured error, got %#v", err)
	}
}

// TestMapSubmitError_NexusHub500WithValidationCode reproduces the exact error
// from production: NexusHub returns HTTP 500 with base.code=5005 for what is
// actually a parameter validation error (unsupported video duration).
func TestMapSubmitError_NexusHub500WithValidationCode(t *testing.T) {
	tests := []struct {
		name       string
		httpStatus int
		baseCode   int
		message    string
		wantErr    error // sentinel error to match
	}{
		{
			name:       "HTTP 500 + base.code 5005 (TaskErrCodeInvalidRequest) maps to ErrInvalidParam",
			httpStatus: 500,
			baseCode:   5005,
			message:    "internal server error: [3] Unsupported output video duration 5 seconds, supported durations are [8,4,6] for feature text_to_video.",
			wantErr:    model.ErrInvalidParam,
		},
		{
			name:       "HTTP 500 + base.code 422 (validation failed) maps to ErrInvalidParam",
			httpStatus: 500,
			baseCode:   422,
			message:    "validation failed: invalid ratio",
			wantErr:    model.ErrInvalidParam,
		},
		{
			name:       "HTTP 500 + base.code 5003 (rate limit) maps to ErrUpstreamUnavailable",
			httpStatus: 500,
			baseCode:   5003,
			message:    "Resource has been exhausted (e.g. check quota).",
			wantErr:    model.ErrUpstreamUnavailable,
		},
		{
			name:       "HTTP 429 + base.code 429 (provider quota) maps to ErrUpstreamUnavailable",
			httpStatus: 429,
			baseCode:   429,
			message:    "Resource has been exhausted (e.g. check quota).",
			wantErr:    model.ErrUpstreamUnavailable,
		},
		{
			name:       "HTTP 500 + base.code 500 (true internal error) remains untyped",
			httpStatus: 500,
			baseCode:   500,
			message:    "internal server error",
			wantErr:    nil, // no sentinel wrapping
		},
		{
			name:       "HTTP 400 always maps to ErrInvalidParam regardless of base.code",
			httpStatus: 400,
			baseCode:   0,
			message:    "bad request",
			wantErr:    model.ErrInvalidParam,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := mapSubmitError(tt.httpStatus, tt.baseCode, tt.message)
			if err == nil {
				t.Fatal("expected error, got nil")
			}
			if tt.wantErr != nil {
				if !strings.Contains(err.Error(), tt.wantErr.Error()) {
					t.Fatalf("expected error to wrap %v, got: %v", tt.wantErr, err)
				}
			} else {
				// Should NOT wrap a sentinel error
				if strings.Contains(err.Error(), model.ErrInvalidParam.Error()) ||
					strings.Contains(err.Error(), model.ErrRateLimited.Error()) ||
					strings.Contains(err.Error(), model.ErrUpstreamUnavailable.Error()) {
					t.Fatalf("expected untyped error, got: %v", err)
				}
			}
			// Message should always be preserved
			if !strings.Contains(err.Error(), tt.message) {
				t.Fatalf("expected message %q in error, got: %v", tt.message, err)
			}
		})
	}
}

// TestClient_GenerateVideo_NexusHub500ValidationError tests the full roundtrip:
// NexusHub returns HTTP 500 with base.code=5005 for an invalid duration,
// and the client should return an ErrInvalidParam-wrapped error.
func TestClient_GenerateVideo_NexusHub500ValidationError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simulate NexusHub returning HTTP 500 with base.code=5005
		resp := submitAtomicProcessResponse{
			Base: submitBaseResponse{
				Code:    5005,
				Message: "internal server error: [3] Unsupported output video duration 5 seconds, supported durations are [8,4,6] for feature text_to_video.",
			},
			TaskID: "task-failed",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := NewClient(ClientConfig{
		BaseURL: srv.URL,
		Token:   "nexus-token",
	})

	ctx := trace.SetTraceID(context.Background(), "req-test-duration")

	_, err := client.GenerateVideo(ctx, model.GenerateVideoRequest{
		RequestID: "req-test-duration",
		UserID:    "12345",
		Prompt:    "ocean waves",
		Model:     "veo-3.1",
		Duration:  5,
	}, model.RouteBinding{
		AbilityKey: "veo3.1",
		GenType:    string(model.CapabilityVideo),
		Enabled:    true,
	})

	if err == nil {
		t.Fatal("expected error for unsupported duration")
	}

	// Must be ErrInvalidParam, not a generic internal error
	if !strings.Contains(err.Error(), model.ErrInvalidParam.Error()) {
		t.Fatalf("expected ErrInvalidParam, got: %v", err)
	}

	// Error message must contain the useful detail
	if !strings.Contains(err.Error(), "supported durations are [8,4,6]") {
		t.Fatalf("expected duration constraint in error, got: %v", err)
	}
}

func TestClient_GenerateImageRequiresNumericUserID(t *testing.T) {
	logBuf := captureLogs(t)
	client := NewClient(ClientConfig{
		BaseURL: "https://example.com",
		Token:   "nexus-token",
	})

	ctx := trace.SetTraceID(context.Background(), "trace-invalid-user-1")
	_, err := client.GenerateImage(ctx, model.GenerateImageRequest{
		UserID: "user-demo",
		Prompt: "paper crane",
		Model:  "flux-dev",
	}, model.RouteBinding{
		AbilityKey: "flux-dev",
		GenType:    string(model.CapabilityImage),
		Enabled:    true,
	})
	if err == nil {
		t.Fatal("expected error for non-numeric user id")
	}
	if !strings.Contains(err.Error(), "numeric user id") {
		t.Fatalf("expected numeric user id error, got %v", err)
	}
	output := logBuf.String()
	if !strings.Contains(output, `"trace_id":"trace-invalid-user-1"`) {
		t.Fatalf("expected trace_id in logs, got %q", output)
	}
	if !strings.Contains(output, "invalid nexushub user id") {
		t.Fatalf("expected invalid user log, got %q", output)
	}
}
