package http

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"testing"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/cloudwego/hertz/pkg/route"
)

type modelRouteRepoStub struct {
	items []model.ModelRoute
}

func (s *modelRouteRepoStub) ListModelRoutes(_ context.Context, _ model.ListModelRoutesFilter) ([]model.ModelRoute, error) {
	return s.items, nil
}

func (s *modelRouteRepoStub) GetModelRoute(_ context.Context, id int64) (*model.ModelRoute, error) {
	for i := range s.items {
		if s.items[i].ID == id {
			return &s.items[i], nil
		}
	}
	return nil, nil
}

func (s *modelRouteRepoStub) CreateModelRoute(_ context.Context, input model.CreateModelRouteInput) (*model.ModelRoute, error) {
	item := model.ModelRoute{
		ID:          1,
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		DisplayName: input.DisplayName,
		Status:      input.Status,
		Extra:       input.Extra,
	}
	return &item, nil
}

func (s *modelRouteRepoStub) UpdateModelRoute(_ context.Context, id int64, input model.UpdateModelRouteInput) (*model.ModelRoute, error) {
	item := model.ModelRoute{
		ID:          id,
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		DisplayName: input.DisplayName,
		Status:      input.Status,
		Extra:       input.Extra,
	}
	return &item, nil
}

func (s *modelRouteRepoStub) DeleteModelRoute(_ context.Context, _ int64) error {
	return nil
}

func newRouterForTest(t *testing.T, rpm int) (*serverHarness, string) {
	t.Helper()

	apiKeys := apikey.NewMemoryService()
	created, err := apiKeys.CreateAPIKey(t.Context(), "user-123", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}

	systemHandler := handlers.NewSystemHandler(systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev", Commit: "abc123", Date: "2026-03-24T00:00:00Z"}))
	loginHandler := handlers.NewLoginHandler(loginapp.NewService(auth.NewStubClient("https://auth.anycap.local/authorize", map[string]model.AuthUser{"code-123": {UserID: "user-123", Email: "user@example.com", Name: "Demo User"}}), apiKeys, func() string { return "state-123" }))
	imageHandler := handlers.NewImageHandler(imageapp.NewService(nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-123": 3}), apikey.NewMemoryCallLogRepo()))
	catalogService := catalogapp.NewService(nexushub.NewCatalogStubWith([]model.ModelSpec{{ModelID: "flux-dev", Capability: model.CapabilityImage, DisplayName: "FLUX Dev", Status: "active", Operations: map[model.Operation]model.OperationSpec{model.OperationGenerate: {RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}}}}}}))
	imageCatalog := handlers.NewCatalogHandler(catalogService, model.CapabilityImage)
	capHandler := handlers.NewCapabilitiesHandler(capapp.NewService(agentplatform.NewStubClient(), s3store.NewStubClient()))
	modelRouteHandler := handlers.NewModelRouteHandler(modelrouteapp.NewService(&modelRouteRepoStub{
		items: []model.ModelRoute{
			{
				ID:         1,
				ModelID:    "nano-banana-2",
				Capability: model.CapabilityImage,
				Operation:  model.OperationEdit,
				AbilityKey: "google_nano_banana_2",
				AlgoType:   "img_2_img",
				Status:     model.ModelRouteStatusActive,
			},
		},
	}))

	engine := NewRouter(RouterConfig{
		Addr: ":0",
		Middlewares: []app.HandlerFunc{
			middleware.Recover(), middleware.RequestID(), middleware.AccessLog(),
		},
		Root: []RouteRegistrar{RouteRegistrarFunc(systemHandler.RegisterRootRoutes)},
		V1: []RouteRegistrar{
			systemHandler,
			loginHandler,
			imageCatalog,
			modelRouteHandler,
			RouteRegistrarFunc(func(group *route.RouterGroup) {
				protected := group.Group("", middleware.Auth(apiKeys), middleware.RateLimit(ratelimit.NewInMemoryLimiter(), rpm))
				systemHandler.RegisterProtectedRoutes(protected)
				imageHandler.RegisterRoutes(protected)
				capHandler.RegisterRoutes(protected)
			}),
		},
	})

	return &serverHarness{engine: engine}, created.RawKey
}

type serverHarness struct {
	engine *server.Hertz
}

func TestRouter_HealthAndLogin(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/ping", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.Code)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/login/init", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/login", &ut.Body{Body: bytes.NewReader([]byte(`{"method":"localhost"}`)), Len: len(`{"method":"localhost"}`)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/login/callback", &ut.Body{Body: bytes.NewReader([]byte(`{"code":"code-123"}`)), Len: len(`{"code":"code-123"}`)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_ProtectedRoutes(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/status", nil)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.Code)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/image/models", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/image/models/flux-dev/schema?operation=generate", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	body := []byte(`{"prompt":"paper crane","model":"flux-dev"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/image/generate", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_ModelRoutesDoNotRequireAuth(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/admin/model-routes", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	if env["status"] != "success" {
		t.Fatalf("expected success status, got %#v", env["status"])
	}
}

func TestRouter_CapabilitiesPresign(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)
	body := []byte(`{"filename":"demo.png","content_type":"image/png","content_length":1024}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/capabilities/presign", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	if env["status"] != "success" {
		t.Fatalf("expected success status, got %#v", env["status"])
	}
}

func TestRouter_Healthz(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/healthz", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.Code)
	}
	if resp.Header().Get("X-Request-Id") == "" {
		t.Fatal("expected X-Request-Id header")
	}
}
