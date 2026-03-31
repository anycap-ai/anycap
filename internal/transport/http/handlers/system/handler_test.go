package system

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type fakeSystemFeatureProvider struct {
	global map[string]bool
	user   map[string]bool
}

func (f fakeSystemFeatureProvider) GlobalFeatures() map[string]bool {
	return f.global
}

func (f fakeSystemFeatureProvider) UserFeatures(_ *model.Principal) map[string]bool {
	return f.user
}

func TestHandler_Features_ReturnsGlobalFeatureView(t *testing.T) {
	service := systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetFeatureProvider(fakeSystemFeatureProvider{
		global: map[string]bool{"image.generate": true},
		user:   map[string]bool{"image.generate": false},
	})

	handler := NewHandler(service, nil)
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(middleware.RequestID())
	h.GET("/v1/features", handler.Features)

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/features", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	data := body["data"].(map[string]any)
	features := data["features"].(map[string]any)
	if features["image.generate"] != true {
		t.Fatalf("expected global image.generate=true, got %v", features["image.generate"])
	}
}

func TestHandler_MeFeatures_ReturnsUserFeatureView(t *testing.T) {
	service := systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetFeatureProvider(fakeSystemFeatureProvider{
		global: map[string]bool{"music.generate": true},
		user:   map[string]bool{"music.generate": false},
	})

	handler := NewHandler(service, nil)
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(
		middleware.RequestID(),
		middleware.LocalBypassAuth(model.Principal{UserID: "u_1", Email: "external@gmail.com", AuthType: "local_bypass"}),
	)
	h.GET("/v1/me/features", handler.MeFeatures)

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/me/features", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	data := body["data"].(map[string]any)
	features := data["features"].(map[string]any)
	if features["music.generate"] != false {
		t.Fatalf("expected user music.generate=false, got %v", features["music.generate"])
	}
}

func TestHandler_MeFeatures_RequiresPrincipal(t *testing.T) {
	service := systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	handler := NewHandler(service, nil)
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(middleware.RequestID())
	h.GET("/v1/me/features", func(ctx context.Context, c *app.RequestContext) {
		handler.MeFeatures(ctx, c)
	})

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/me/features", nil)
	if w.Code != 401 {
		t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
	}
}
