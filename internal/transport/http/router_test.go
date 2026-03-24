package http

import (
	"encoding/json"
	"testing"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestRouter_StatusEndpoints(t *testing.T) {
	deps := Dependencies{
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
		ImageService: imageapp.NewService(nexushub.NewStubClient()),
	}

	engine := NewRouter(deps)

	t.Run("ping", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/ping", nil)
		if resp.Code != 200 {
			t.Fatalf("expected 200, got %d", resp.Code)
		}

		var payload map[string]any
		if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
			t.Fatalf("unmarshal response: %v", err)
		}

		if payload["status"] != "success" {
			t.Fatalf("expected status success, got %#v", payload["status"])
		}
	})

	t.Run("healthz", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/healthz", nil)
		if resp.Code != 200 {
			t.Fatalf("expected 200, got %d", resp.Code)
		}

		if resp.Header().Get("X-Request-Id") == "" {
			t.Fatal("expected X-Request-Id header")
		}
	})

	t.Run("status", func(t *testing.T) {
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
			t.Fatalf("unmarshal response: %v", err)
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
	})
}
