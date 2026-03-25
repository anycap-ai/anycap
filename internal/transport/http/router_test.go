package http

import (
	"encoding/json"
	"testing"

	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func testCatalogFixtures() []model.ModelSpec {
	return []model.ModelSpec{
		{
			ModelID:     "test-img-a",
			Capability:  model.CapabilityImage,
			DisplayName: "Test Image A",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_img_a",
						GenType:    "image",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
		{
			ModelID:     "test-img-b",
			Capability:  model.CapabilityImage,
			DisplayName: "Test Image B",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_img_b",
						GenType:    "image",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
		{
			ModelID:     "test-vid",
			Capability:  model.CapabilityVideo,
			DisplayName: "Test Video",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "test_ability_vid",
						GenType:    "video",
						Priority:   100,
						Enabled:    true,
					}},
				},
			},
		},
	}
}

func createTestEngine(t *testing.T) *server.Hertz {
	t.Helper()

	systemHandler := handlers.NewSystemHandler(
		systemapp.NewService("anycap-server", "test", buildinfo.Info{
			Version: "dev",
			Commit:  "abc123",
			Date:    "2026-03-24T00:00:00Z",
		}),
	)
	loginHandler := handlers.NewLoginHandler(
		loginapp.NewService(auth.NewStubProvider("https://auth.anycap.local/authorize"), func() string {
			return "state-123"
		}),
	)
	imageHandler := handlers.NewImageHandler(
		imageapp.NewService(nexushub.NewStubClient()),
	)

	catalogService := catalogapp.NewService(nexushub.NewCatalogStubWith(testCatalogFixtures()))
	imageCatalog := handlers.NewCatalogHandler(catalogService, model.CapabilityImage)
	videoCatalog := handlers.NewCatalogHandler(catalogService, model.CapabilityVideo)

	return NewRouter(RouterConfig{
		Addr:        ":0",
		Middlewares: []app.HandlerFunc{middleware.RequestID()},
		Root: []RouteRegistrar{
			RouteRegistrarFunc(systemHandler.RegisterRootRoutes),
		},
		V1: []RouteRegistrar{
			systemHandler,
			loginHandler,
			imageHandler,
			imageCatalog,
			videoCatalog,
		},
	})
}

func TestRouter_StatusEndpoints(t *testing.T) {
	engine := createTestEngine(t)

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

func TestRouter_CatalogDiscovery(t *testing.T) {
	engine := createTestEngine(t)

	t.Run("image_models", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/v1/image/models", nil)
		if resp.Code != 200 {
			t.Fatalf("expected 200, got %d", resp.Code)
		}

		var payload struct {
			Status     string              `json:"status"`
			Capability string              `json:"capability"`
			Models     []model.ModelSummary `json:"models"`
		}
		if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
			t.Fatalf("unmarshal: %v", err)
		}

		if payload.Status != "success" {
			t.Fatalf("expected success, got %s", payload.Status)
		}
		if payload.Capability != "image" {
			t.Fatalf("expected image, got %s", payload.Capability)
		}
		if len(payload.Models) != 2 {
			t.Fatalf("expected 2 image models, got %d", len(payload.Models))
		}

		ids := make(map[string]bool)
		for _, m := range payload.Models {
			ids[m.ModelID] = true
		}
		if !ids["test-img-a"] {
			t.Fatal("expected test-img-a in image models")
		}
		if !ids["test-img-b"] {
			t.Fatal("expected test-img-b in image models")
		}
	})

	t.Run("video_models", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/v1/video/models", nil)
		if resp.Code != 200 {
			t.Fatalf("expected 200, got %d", resp.Code)
		}

		var payload struct {
			Status     string              `json:"status"`
			Capability string              `json:"capability"`
			Models     []model.ModelSummary `json:"models"`
		}
		if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
			t.Fatalf("unmarshal: %v", err)
		}

		if len(payload.Models) != 1 {
			t.Fatalf("expected 1 video model, got %d", len(payload.Models))
		}
		if payload.Models[0].ModelID != "test-vid" {
			t.Fatalf("expected test-vid, got %s", payload.Models[0].ModelID)
		}
	})

	t.Run("model_schema", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/v1/image/models/test-img-a/schema?operation=generate", nil)
		if resp.Code != 200 {
			t.Fatalf("expected 200, got %d", resp.Code)
		}

		var payload struct {
			Status string `json:"status"`
			Data   struct {
				Capability string `json:"capability"`
				ModelID    string `json:"model"`
				Operation  string `json:"operation"`
			} `json:"data"`
		}
		if err := json.Unmarshal(resp.Body.Bytes(), &payload); err != nil {
			t.Fatalf("unmarshal: %v", err)
		}

		if payload.Status != "success" {
			t.Fatalf("expected success, got %s", payload.Status)
		}
		if payload.Data.ModelID != "test-img-a" {
			t.Fatalf("expected test-img-a, got %s", payload.Data.ModelID)
		}
		if payload.Data.Operation != "generate" {
			t.Fatalf("expected generate, got %s", payload.Data.Operation)
		}
	})

	t.Run("model_schema_not_found", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/v1/image/models/nonexistent/schema", nil)
		if resp.Code != 404 {
			t.Fatalf("expected 404, got %d", resp.Code)
		}
	})

	t.Run("unsupported_operation_schema", func(t *testing.T) {
		resp := ut.PerformRequest(engine.Engine, "GET", "/v1/image/models/test-img-a/schema?operation=upscale", nil)
		if resp.Code != 404 {
			t.Fatalf("expected 404 for unsupported operation, got %d", resp.Code)
		}
	})
}
