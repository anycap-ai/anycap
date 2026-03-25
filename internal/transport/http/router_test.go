package http

import (
	"bytes"
	"encoding/json"
	"testing"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/common/ut"
)

func newTestDeps() Dependencies {
	return Dependencies{
		Config: config.Config{
			AppName:  "anycap-server",
			AppEnv:   "test",
			HTTPAddr: ":0",
		},
		BuildInfo: buildinfo.Info{
			Version: "dev",
			Commit:  "abc123",
			Date:    "2026-03-24T00:00:00Z",
		},
		SystemService: systemapp.NewService("anycap-server", "test", buildinfo.Info{
			Version: "dev",
			Commit:  "abc123",
			Date:    "2026-03-24T00:00:00Z",
		}),
		LoginService: loginapp.NewService(auth.NewStubProvider("https://auth.anycap.local/authorize"), func() string {
			return "state-123"
		}),
		ImageService:        imageapp.NewService(nexushub.NewStubClient()),
		CapabilitiesService: capapp.NewService(agentplatform.NewStubClient(), s3store.NewStubClient()),
	}
}

// parseEnvelope is a test helper to decode the standard response envelope.
func parseEnvelope(t *testing.T, body []byte) map[string]any {
	t.Helper()
	var env map[string]any
	if err := json.Unmarshal(body, &env); err != nil {
		t.Fatalf("unmarshal envelope: %v\nbody: %s", err, body)
	}
	return env
}

func jsonBody(v any) *ut.Body {
	b, _ := json.Marshal(v)
	return &ut.Body{
		Body: bytes.NewReader(b),
		Len:  len(b),
	}
}

// ---------- System endpoints ----------

func TestRouter_Ping(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "GET", "/ping", nil)
	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d", resp.Code)
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	if env["status"] != "success" {
		t.Fatalf("expected status=success, got %v", env["status"])
	}
}

func TestRouter_Healthz(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "GET", "/healthz", nil)
	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d", resp.Code)
	}
	if resp.Header().Get("X-Request-Id") == "" {
		t.Fatal("expected X-Request-Id header")
	}
}

func TestRouter_Status(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "GET", "/v1/status", nil)
	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d", resp.Code)
	}

	var payload struct {
		Status string `json:"status"`
		Data   struct {
			Name    string `json:"name"`
			Version string `json:"version"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if payload.Status != "success" {
		t.Fatalf("expected success, got %s", payload.Status)
	}
	if payload.Data.Name != "anycap-server" {
		t.Fatalf("expected anycap-server, got %s", payload.Data.Name)
	}
	if payload.Data.Version != "dev" {
		t.Fatalf("expected version dev, got %s", payload.Data.Version)
	}
}

// ---------- Capabilities: Presign ----------

func TestRouter_Presign_Success(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/presign",
		jsonBody(map[string]any{
			"filename":       "test.png",
			"content_type":   "image/png",
			"content_length": 1024,
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	if env["status"] != "success" {
		t.Fatalf("expected status=success, got %v", env["status"])
	}

	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatal("expected data to be an object")
	}
	if data["upload_url"] == nil || data["upload_url"] == "" {
		t.Error("expected non-empty upload_url")
	}
	if data["object_url"] == nil || data["object_url"] == "" {
		t.Error("expected non-empty object_url")
	}
	if data["object_key"] != nil {
		t.Error("object_key must not be exposed in API response")
	}
}

func TestRouter_Presign_MissingFilename(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/presign",
		jsonBody(map[string]any{
			"content_type":   "image/png",
			"content_length": 1024,
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 400 {
		t.Fatalf("expected 400, got %d: %s", resp.Code, resp.Body.String())
	}
}

func TestRouter_Presign_InvalidContentType(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/presign",
		jsonBody(map[string]any{
			"filename":       "test.txt",
			"content_type":   "text/plain",
			"content_length": 100,
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 400 {
		t.Fatalf("expected 400, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	errObj := env["error"].(map[string]any)
	if errObj["code"] != "invalid_content_type" {
		t.Fatalf("expected error code=invalid_content_type, got %v", errObj["code"])
	}
}

func TestRouter_Presign_NoStorage(t *testing.T) {
	deps := newTestDeps()
	deps.CapabilitiesService = capapp.NewService(agentplatform.NewStubClient(), nil)
	engine := NewRouter(deps)

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/presign",
		jsonBody(map[string]any{
			"filename":       "test.png",
			"content_type":   "image/png",
			"content_length": 1024,
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 502 {
		t.Fatalf("expected 502, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	errObj := env["error"].(map[string]any)
	if errObj["code"] != "storage_not_configured" {
		t.Fatalf("expected error code=storage_not_configured, got %v", errObj["code"])
	}
}

// ---------- Capabilities: Image Understand ----------

func TestRouter_ImageUnderstand_URL(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/image/understand",
		jsonBody(map[string]string{
			"url":         "https://example.com/photo.jpg",
			"instruction": "What is in this image?",
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	if env["status"] != "success" {
		t.Fatalf("expected status=success, got %v", env["status"])
	}

	data := env["data"].(map[string]any)
	if data["content"] == nil || data["content"] == "" {
		t.Error("expected non-empty content")
	}
	if data["model"] != "stub" {
		t.Errorf("expected model=stub, got %v", data["model"])
	}

	usage, ok := data["usage"].(map[string]any)
	if !ok {
		t.Fatal("expected usage object in response")
	}
	if usage["input_tokens"] == nil {
		t.Error("expected input_tokens in usage")
	}
	if usage["total_tokens"] == nil {
		t.Error("expected total_tokens in usage")
	}
}

func TestRouter_ImageUnderstand_Base64(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/image/understand",
		jsonBody(map[string]string{
			"data":      "aGVsbG8=",
			"mime_type": "image/png",
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
	}
}

func TestRouter_ImageUnderstand_MissingInput(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/image/understand",
		jsonBody(map[string]string{}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 422 {
		t.Fatalf("expected 422, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	errObj := env["error"].(map[string]any)
	if errObj["code"] != "missing_input" {
		t.Fatalf("expected error code=missing_input, got %v", errObj["code"])
	}
}

func TestRouter_ImageUnderstand_AmbiguousInput(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/image/understand",
		jsonBody(map[string]string{
			"url":       "https://example.com/photo.jpg",
			"data":      "aGVsbG8=",
			"mime_type": "image/png",
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 422 {
		t.Fatalf("expected 422, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	errObj := env["error"].(map[string]any)
	if errObj["code"] != "ambiguous_input" {
		t.Fatalf("expected error code=ambiguous_input, got %v", errObj["code"])
	}
}

func TestRouter_ImageUnderstand_InvalidJSON(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/image/understand",
		&ut.Body{Body: bytes.NewReader([]byte("not json")), Len: 8},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 400 {
		t.Fatalf("expected 400, got %d: %s", resp.Code, resp.Body.String())
	}
}

// ---------- Capabilities: Video Read ----------

func TestRouter_VideoRead_Success(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/video/read",
		jsonBody(map[string]string{
			"url":         "https://example.com/video.mp4",
			"instruction": "What happens in this video?",
		}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	if env["status"] != "success" {
		t.Fatalf("expected status=success, got %v", env["status"])
	}

	data := env["data"].(map[string]any)
	if data["content"] == nil || data["content"] == "" {
		t.Error("expected non-empty content")
	}
	if data["model"] != "stub" {
		t.Errorf("expected model=stub, got %v", data["model"])
	}

	usage, ok := data["usage"].(map[string]any)
	if !ok {
		t.Fatal("expected usage object in video read response")
	}
	if usage["input_tokens"] == nil {
		t.Error("expected input_tokens in usage")
	}
	if usage["total_tokens"] == nil {
		t.Error("expected total_tokens in usage")
	}
}

func TestRouter_VideoRead_MissingURL(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/video/read",
		jsonBody(map[string]string{}),
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 422 {
		t.Fatalf("expected 422, got %d: %s", resp.Code, resp.Body.String())
	}

	env := parseEnvelope(t, resp.Body.Bytes())
	errObj := env["error"].(map[string]any)
	if errObj["code"] != "missing_input" {
		t.Fatalf("expected error code=missing_input, got %v", errObj["code"])
	}
}

func TestRouter_VideoRead_InvalidJSON(t *testing.T) {
	engine := NewRouter(newTestDeps())

	resp := ut.PerformRequest(engine.Engine, "POST", "/v1/capabilities/video/read",
		&ut.Body{Body: bytes.NewReader([]byte("{bad")), Len: 4},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)

	if resp.Code != 400 {
		t.Fatalf("expected 400, got %d: %s", resp.Code, resp.Body.String())
	}
}
