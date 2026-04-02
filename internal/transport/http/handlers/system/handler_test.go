package system

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	commonconsts "gitlab.knoffice.tech/open/common-go/consts"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

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
	h.Use(commonmw.TraceMiddleware())
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

func TestHandler_Features_UsesTraceIDFromCommonMiddleware(t *testing.T) {
	service := systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetFeatureProvider(fakeSystemFeatureProvider{
		global: map[string]bool{"image.generate": true},
	})

	handler := NewHandler(service, nil)
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	h.GET("/v1/features", handler.Features)

	w := ut.PerformRequest(
		h.Engine,
		http.MethodGet,
		"/v1/features",
		nil,
		ut.Header{Key: commonconsts.Header_TraceID, Value: "trace-common-1"},
	)
	if w.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	if got := w.Header().Get(commonconsts.Header_TraceID); got != "trace-common-1" {
		t.Fatalf("expected X-Trace-ID header trace-common-1, got %q", got)
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	if body["id"] != "trace-common-1" {
		t.Fatalf("expected response id trace-common-1, got %#v", body["id"])
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
		commonmw.TraceMiddleware(),
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
	h.Use(commonmw.TraceMiddleware())
	h.GET("/v1/me/features", func(ctx context.Context, c *app.RequestContext) {
		handler.MeFeatures(ctx, c)
	})

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/me/features", nil)
	if w.Code != 401 {
		t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
	}
}

func TestHandler_Status_UsesUserFeaturesForScopes(t *testing.T) {
	service := systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetFeatureProvider(fakeSystemFeatureProvider{
		global: map[string]bool{
			"image.generate": true,
			"video.generate": true,
			"music.generate": true,
		},
		user: map[string]bool{
			"image.generate": true,
			"video.generate": false,
			"music.generate": true,
		},
	})

	handler := NewHandler(service, presenter.PassthroughIDMapper{})
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(
		commonmw.TraceMiddleware(),
		middleware.LocalBypassAuth(model.Principal{
			UserID:   "user-1",
			APIKeyID: "akid_1",
			AuthType: "api_key",
			Scopes:   []string{"system.read"},
			Email:    "internal@gmail.com",
		}),
	)
	h.GET("/v1/status", func(ctx context.Context, c *app.RequestContext) {
		handler.Status(ctx, c)
	})

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/status", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	data := body["data"].(map[string]any)
	user := data["user"].(map[string]any)
	scopes := user["scopes"].([]any)
	if len(scopes) != 3 {
		t.Fatalf("expected 3 effective scopes, got %#v", scopes)
	}
	if scopes[0] != "image.generate" || scopes[1] != "music.generate" || scopes[2] != "system.read" {
		t.Fatalf("expected sorted effective scopes, got %#v", scopes)
	}
}
