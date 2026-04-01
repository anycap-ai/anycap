package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type fakeFeatureProvider struct {
	enabledFor func(principal *model.Principal, feature string) (bool, bool)
}

func (f fakeFeatureProvider) EnabledFor(principal *model.Principal, feature string) (bool, bool) {
	return f.enabledFor(principal, feature)
}

func TestFeatureGate_AllowsEnabledFeature(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware(), FeatureGate(fakeFeatureProvider{
		enabledFor: func(_ *model.Principal, feature string) (bool, bool) {
			return feature == "image.generate", true
		},
	}))
	h.POST("/v1/image/generate", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestFeatureGate_BlocksDisabledFeature(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware(), FeatureGate(fakeFeatureProvider{
		enabledFor: func(_ *model.Principal, feature string) (bool, bool) {
			if feature == "music.generate" {
				return false, false
			}
			return false, true
		},
	}))
	h.POST("/v1/music/generate", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/music/generate", nil)
	if w.Code != 503 {
		t.Fatalf("expected 503, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	errObj, _ := body["error"].(map[string]any)
	if errObj == nil {
		t.Fatalf("expected error object, got %v", body)
	}
	if errObj["code"] != "FEATURE_DISABLED" {
		t.Fatalf("expected FEATURE_DISABLED, got %v", errObj["code"])
	}
	if errObj["message"] != "music.generate is not available on this server" {
		t.Fatalf("unexpected message: %v", errObj["message"])
	}
}

func TestFeatureGate_Returns403WhenUserNotAllowed(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(
		commonmw.TraceMiddleware(),
		LocalBypassAuth(model.Principal{UserID: "u_1", Email: "external@gmail.com", AuthType: "local_bypass"}),
		FeatureGate(fakeFeatureProvider{
			enabledFor: func(principal *model.Principal, feature string) (bool, bool) {
				if principal == nil || principal.Email != "internal@gmail.com" || feature != "music.generate" {
					return false, true
				}
				return true, true
			},
		}),
	)
	h.POST("/v1/music/generate", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/music/generate", nil)
	if w.Code != 403 {
		t.Fatalf("expected 403, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	errObj, _ := body["error"].(map[string]any)
	if errObj["code"] != "FEATURE_NOT_ALLOWED" {
		t.Fatalf("expected FEATURE_NOT_ALLOWED, got %v", errObj["code"])
	}
}

func TestFeatureGate_IgnoresUnmappedRoutes(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware(), FeatureGate(fakeFeatureProvider{
		enabledFor: func(_ *model.Principal, _ string) (bool, bool) {
			return false, false
		},
	}))
	h.GET("/v1/status", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/status", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200 for unmapped route, got %d: %s", w.Code, w.Body.String())
	}
}
