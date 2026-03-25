package nexushub

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

func TestClient_GenerateImage(t *testing.T) {
	var captured submitAtomicProcessRequest

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != submitAtomicProcessPath {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		if got := r.Header.Get("X-Request-Id"); got != "req-1" {
			t.Fatalf("expected request id header req-1, got %q", got)
		}

		if err := json.NewDecoder(r.Body).Decode(&captured); err != nil {
			t.Fatalf("decode request: %v", err)
		}

		resp := submitAtomicProcessResponse{
			Base:        submitBaseResponse{Code: 0, Message: "success"},
			TaskID:      "task-123",
			Status:      "succeeded",
			RespPayload: `{"resources":[{"url":"https://cdn.anycap.local/generated.png","credit_cost":2}]}`,
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

	ctx := middleware.ContextWithRequestID(context.Background(), "req-1")
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
		t.Fatalf("expected credit cost 2, got %d", result.CreditCost)
	}
}

func TestClient_GenerateImageRequiresNumericUserID(t *testing.T) {
	client := NewClient(ClientConfig{
		BaseURL: "https://example.com",
		Token:   "nexus-token",
	})

	_, err := client.GenerateImage(context.Background(), model.GenerateImageRequest{
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
}
