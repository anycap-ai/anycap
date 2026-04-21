package integration

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestAnonRateLimit_AllowsWithinLimit(t *testing.T) {
	rl := middleware.NewAnonRateLimit()
	h := server.Default()
	anon := h.Group("/v1", rl.Middleware())
	anon.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	for i := 0; i < 3; i++ {
		resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
			&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
			ut.Header{Key: "X-Anycap-Source", Value: "chrome-extension"},
			ut.Header{Key: "X-Anycap-Install-Id", Value: "install_abc"},
			ut.Header{Key: "Content-Type", Value: "application/json"},
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d body=%s", i+1, resp.Code, resp.Body.String())
		}
	}
}

func TestAnonRateLimit_BlocksOverLimit(t *testing.T) {
	rl := middleware.NewAnonRateLimit()
	h := server.Default()
	anon := h.Group("/v1", rl.Middleware())
	anon.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	headers := []ut.Header{
		{Key: "X-Anycap-Source", Value: "chrome-extension"},
		{Key: "X-Anycap-Install-Id", Value: "install_def"},
		{Key: "Content-Type", Value: "application/json"},
	}

	for i := 0; i < 3; i++ {
		resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
			&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
			headers...,
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, resp.Code)
		}
	}

	// 4th request should be blocked.
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
		&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
		headers...,
	)
	if resp.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d body=%s", resp.Code, resp.Body.String())
	}
	body := resp.Body.String()
	if !strings.Contains(body, "TRIAL_EXHAUSTED") {
		t.Fatalf("expected TRIAL_EXHAUSTED in body, got %s", body)
	}
}

func TestAnonRateLimit_SkipsAuthenticated(t *testing.T) {
	rl := middleware.NewAnonRateLimit()
	h := server.Default()
	anon := h.Group("/v1", rl.Middleware())
	anon.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	for i := 0; i < 5; i++ {
		resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
			&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
			ut.Header{Key: "Authorization", Value: "Bearer token123"},
			ut.Header{Key: "Content-Type", Value: "application/json"},
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d body=%s", i+1, resp.Code, resp.Body.String())
		}
	}
}

func TestAnonRateLimit_SkipsNonExtension(t *testing.T) {
	rl := middleware.NewAnonRateLimit()
	h := server.Default()
	anon := h.Group("/v1", rl.Middleware())
	anon.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	for i := 0; i < 5; i++ {
		resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
			&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
			ut.Header{Key: "X-Anycap-Install-Id", Value: "install_ghi"},
			ut.Header{Key: "Content-Type", Value: "application/json"},
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d body=%s", i+1, resp.Code, resp.Body.String())
		}
	}
}
