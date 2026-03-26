package middleware

import (
	"context"
	"net/http"
	"testing"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestCORS_HandlesPreflightForAllowedOrigin(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(CORS([]string{"http://localhost:3000"}))
	h.POST("/v1/auth/login", func(ctx context.Context, c *app.RequestContext) {
		c.String(http.StatusOK, "ok")
	})

	req := ut.PerformRequest(h.Engine, http.MethodOptions, "/v1/auth/login", nil,
		ut.Header{Key: "Origin", Value: "http://localhost:3000"},
		ut.Header{Key: "Access-Control-Request-Method", Value: http.MethodPost},
	)
	if req.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d body=%s", req.Code, req.Body.String())
	}
	if got := req.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("expected allow origin header, got %q", got)
	}
	if got := req.Header().Get("Access-Control-Allow-Methods"); got == "" {
		t.Fatal("expected allow methods header")
	}
}

func TestCORS_AllowsPOSTForAllowedOrigin(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(CORS([]string{"http://localhost:3000"}))
	h.POST("/v1/auth/login", func(ctx context.Context, c *app.RequestContext) {
		c.String(http.StatusOK, "ok")
	})

	req := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/auth/login", nil,
		ut.Header{Key: "Origin", Value: "http://localhost:3000"},
	)
	if req.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", req.Code, req.Body.String())
	}
	if got := req.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("expected allow origin header, got %q", got)
	}
}

func TestCORS_DoesNotReflectUnknownOrigin(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(CORS([]string{"http://localhost:3000"}))
	h.POST("/v1/auth/login", func(ctx context.Context, c *app.RequestContext) {
		c.String(http.StatusOK, "ok")
	})

	req := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/auth/login", nil,
		ut.Header{Key: "Origin", Value: "http://evil.example.com"},
	)
	if req.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", req.Code, req.Body.String())
	}
	if got := req.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("expected no allow origin header, got %q", got)
	}
}
