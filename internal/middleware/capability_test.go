package middleware

import (
	"context"
	"net/http"
	"testing"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestWithCapability_SetsCapabilityOnRequestContext(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.POST("/test",
		WithCapability("image.generate"),
		func(ctx context.Context, c *app.RequestContext) {
			got, ok := GetCapability(c)
			if !ok {
				t.Fatal("expected capability in request context")
			}
			if got != "image.generate" {
				t.Fatalf("expected image.generate, got %q", got)
			}
			c.String(http.StatusOK, "ok")
		},
	)

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/test", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestCapabilityPOST_RegistersRouteCapability(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	v1 := h.Group("/v1")
	image := v1.Group("/image")

	CapabilityPOST(image, "/generate", "image.generate",
		func(ctx context.Context, c *app.RequestContext) {
			got, ok := ResolveCapability(c)
			if !ok {
				t.Fatal("expected capability to resolve from registered route")
			}
			if got != "image.generate" {
				t.Fatalf("expected image.generate, got %q", got)
			}
			c.String(http.StatusOK, "ok")
		},
	)

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}
