package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestFeatureGate_AllowsEnabledFeature(t *testing.T) {
	features := map[string]bool{"image.generate": true}
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID(), FeatureGate(features))
	h.POST("/v1/image/generate", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestFeatureGate_BlocksDisabledFeature(t *testing.T) {
	features := map[string]bool{"music.generate": false}
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID(), FeatureGate(features))
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

func TestFeatureGate_MissingFeatureBlocks(t *testing.T) {
	// Feature not in the map at all -> treated as disabled (false).
	features := map[string]bool{}
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID(), FeatureGate(features))
	h.POST("/v1/music/generate", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/music/generate", nil)
	if w.Code != 503 {
		t.Fatalf("expected 503, got %d: %s", w.Code, w.Body.String())
	}
}

func TestFeatureGate_IgnoresUnmappedRoutes(t *testing.T) {
	features := map[string]bool{"image.generate": false}
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID(), FeatureGate(features))
	h.GET("/v1/status", func(_ context.Context, ctx *app.RequestContext) {
		ctx.JSON(200, map[string]string{"status": "ok"})
	})

	w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/status", nil)
	if w.Code != 200 {
		t.Fatalf("expected 200 for unmapped route, got %d: %s", w.Code, w.Body.String())
	}
}
