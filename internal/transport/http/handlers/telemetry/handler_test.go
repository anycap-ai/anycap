package telemetry

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/config"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/cloudwego/hertz/pkg/route"
)

func setupRouter() *route.Engine {
	opt := config.NewOptions([]config.Option{})
	engine := route.NewEngine(opt)
	h := NewHandler()
	v1 := engine.Group("/v1")
	h.RegisterRoutes(v1)
	return engine
}

func performRequest(engine *route.Engine, method, path string, body io.Reader) *ut.ResponseRecorder {
	var bodyBytes []byte
	if body != nil {
		bodyBytes, _ = io.ReadAll(body)
	}
	headers := []ut.Header{
		{Key: "Content-Type", Value: "application/json"},
	}
	w := ut.PerformRequest(engine, method, path,
		&ut.Body{Body: bytes.NewReader(bodyBytes), Len: len(bodyBytes)},
		headers...,
	)
	return w
}

func TestIngest_ValidErrorEvent(t *testing.T) {
	engine := setupRouter()

	event := map[string]any{
		"type":        "error",
		"device_id":   "u_abc123",
		"command":     "image generate",
		"args":        []string{"image", "generate", "--model", "test"},
		"duration_ms": 1234,
		"version":     "0.0.8",
		"os":          "darwin",
		"arch":        "arm64",
		"error":       "credit_insufficient: not enough credits",
		"error_code":  "credit_insufficient",
		"timestamp":   1711929600,
	}
	body, _ := json.Marshal(event)

	w := performRequest(engine, http.MethodPost, "/v1/telemetry", bytes.NewReader(body))

	resp := w.Result()
	if resp.StatusCode() != 200 {
		t.Fatalf("expected 200, got %d: %s", resp.StatusCode(), string(resp.Body()))
	}

	var envelope struct {
		Status string `json:"status"`
	}
	if err := json.Unmarshal(resp.Body(), &envelope); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if envelope.Status != "success" {
		t.Errorf("expected status=success, got %q", envelope.Status)
	}
}

func TestIngest_EmptyBody(t *testing.T) {
	engine := setupRouter()

	w := performRequest(engine, http.MethodPost, "/v1/telemetry", bytes.NewReader(nil))

	resp := w.Result()
	if resp.StatusCode() != 400 {
		t.Fatalf("expected 400, got %d", resp.StatusCode())
	}
}

func TestIngest_InvalidJSON(t *testing.T) {
	engine := setupRouter()

	w := performRequest(engine, http.MethodPost, "/v1/telemetry", strings.NewReader("not json"))

	resp := w.Result()
	if resp.StatusCode() != 400 {
		t.Fatalf("expected 400, got %d", resp.StatusCode())
	}
}

func TestIngest_MissingType(t *testing.T) {
	engine := setupRouter()

	body, _ := json.Marshal(map[string]any{
		"device_id": "u_abc",
		"command":   "image generate",
	})

	w := performRequest(engine, http.MethodPost, "/v1/telemetry", bytes.NewReader(body))

	resp := w.Result()
	if resp.StatusCode() != 400 {
		t.Fatalf("expected 400, got %d", resp.StatusCode())
	}

	var envelope struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal(resp.Body(), &envelope); err != nil {
		t.Fatalf("failed to parse error response: %v", err)
	}
	if envelope.Error.Code != "INVALID_PARAM" {
		t.Errorf("expected error code INVALID_PARAM, got %q", envelope.Error.Code)
	}
}

func TestIngest_OversizedBody(t *testing.T) {
	engine := setupRouter()

	// 17 KB of valid JSON
	big := `{"type":"error","error":"` + strings.Repeat("x", 17*1024) + `"}`

	w := performRequest(engine, http.MethodPost, "/v1/telemetry", strings.NewReader(big))

	resp := w.Result()
	if resp.StatusCode() != 413 {
		t.Fatalf("expected 413, got %d", resp.StatusCode())
	}
}

func TestIngest_MinimalEvent(t *testing.T) {
	engine := setupRouter()

	body, _ := json.Marshal(map[string]any{"type": "error"})

	w := performRequest(engine, http.MethodPost, "/v1/telemetry", bytes.NewReader(body))

	resp := w.Result()
	if resp.StatusCode() != 200 {
		t.Fatalf("expected 200, got %d: %s", resp.StatusCode(), string(resp.Body()))
	}
}

// Silence unused import warnings.
var _ = server.Default
var _ = context.Background
