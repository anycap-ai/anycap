package http

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/common/ut"
)

func newRouterForTest(t *testing.T, rpm int) (*Dependencies, string) {
	t.Helper()

	apiKeys := apikey.NewMemoryService()
	created, err := apiKeys.CreateAPIKey(t.Context(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}

	deps := &Dependencies{
		Config: config.Config{
			AppName:      "anycap-server",
			AppEnv:       "test",
			HTTPAddr:     ":0",
			RuntimeMode:  "stub",
			RateLimitRPM: rpm,
		},
		BuildInfo:     buildinfo.Info{Version: "dev", Commit: "abc123", Date: "2026-03-24T00:00:00Z"},
		SystemService: systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev", Commit: "abc123", Date: "2026-03-24T00:00:00Z"}),
		LoginService: loginapp.NewService(auth.NewStubClient("https://auth.anycap.local/authorize", map[string]model.AuthUser{
			"code-123": {UserID: "user-123", Email: "user@example.com"},
		}), apiKeys, func() string { return "state-123" }),
		ImageService:  imageapp.NewService(nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-123": 3}), apikey.NewMemoryCallLogRepo()),
		APIKeyService: apiKeys,
		RateLimiter:   ratelimit.NewInMemoryLimiter(),
		ProtectedRPM:  rpm,
	}

	return deps, created.RawKey
}

func TestRouter_Contracts(t *testing.T) {
	deps, rawKey := newRouterForTest(t, 10)
	engine := NewRouter(*deps)

	t.Run("login init", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, http.MethodPost, "/v1/login/init", nil)
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.Code)
		}
	})

	t.Run("login callback", func(t *testing.T) {
		body := strings.NewReader(`{"code":"code-123"}`)
		resp := ut.PerformRequest(engine.Engine, http.MethodPost, "/v1/login/callback", &ut.Body{Body: body, Len: len(`{"code":"code-123"}`)}, ut.Header{Key: "Content-Type", Value: "application/json"})
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
		}
	})

	t.Run("protected image models require auth", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/image/models", nil)
		if resp.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", resp.Code)
		}
	})

	t.Run("image models with auth", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/image/models", nil, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey})
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
		}
	})

	t.Run("image schema with auth", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/image/models/flux-dev/schema", nil, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey})
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
		}
	})

	t.Run("image generate with auth", func(t *testing.T) {
		body := strings.NewReader(`{"prompt":"paper crane","model":"flux-dev"}`)
		resp := ut.PerformRequest(
			engine.Engine,
			http.MethodPost,
			"/v1/image/generate",
			&ut.Body{Body: body, Len: len(`{"prompt":"paper crane","model":"flux-dev"}`)},
			ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
			ut.Header{Key: "Content-Type", Value: "application/json"},
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
		}

		var payload struct {
			Status string `json:"status"`
			Data   struct {
				Model string `json:"model"`
			} `json:"data"`
		}
		if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
			t.Fatalf("unmarshal response: %v body=%s", err, resp.Body.String())
		}
		if payload.Status != "success" || payload.Data.Model != "flux-dev" {
			t.Fatalf("unexpected payload: %+v", payload)
		}
	})

	t.Run("status with auth includes user", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/status", nil, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey})
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
		}

		var payload struct {
			Data struct {
				User *struct {
					UserID string `json:"user_id"`
				} `json:"user"`
			} `json:"data"`
		}
		if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
			t.Fatalf("unmarshal response: %v", err)
		}
		if payload.Data.User == nil || payload.Data.User.UserID != "user-123" {
			t.Fatalf("expected authenticated user in status, got body=%s", resp.Body.String())
		}
	})
}

func TestRouter_RateLimitExceeded(t *testing.T) {
	deps, rawKey := newRouterForTest(t, 2)
	engine := NewRouter(*deps)

	for i := 0; i < 2; i++ {
		resp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/image/models", nil, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey})
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200 before limit, got %d", resp.Code)
		}
	}

	resp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/image/models", nil, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey})
	if resp.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d body=%s", resp.Code, resp.Body.String())
	}
}
