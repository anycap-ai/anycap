package integration

import (
	"context"
	"net/http"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type captureAnonymousTrialStore struct {
	keys []string
}

func (s *captureAnonymousTrialStore) ConsumeAnonymousTrial(_ context.Context, key string, _ time.Time, limit int, _ time.Duration) (model.AnonymousTrialState, error) {
	s.keys = append(s.keys, key)
	return model.AnonymousTrialState{Key: key, Count: 1, Limit: limit, Allowed: true}, nil
}

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

func TestAnonRateLimit_UsesSharedTrialStoreAcrossMiddlewareInstances(t *testing.T) {
	store := middleware.NewMemoryAnonymousTrialStore()
	first := middleware.NewAnonRateLimitWithStore(store)
	second := middleware.NewAnonRateLimitWithStore(store)

	h := server.Default()
	firstGroup := h.Group("/first", first.Middleware())
	firstGroup.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})
	secondGroup := h.Group("/second", second.Middleware())
	secondGroup.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	headers := []ut.Header{
		{Key: "X-Anycap-Source", Value: "chrome-extension"},
		{Key: "X-Anycap-Install-Id", Value: "install_shared"},
		{Key: "Content-Type", Value: "application/json"},
	}
	for i := 0; i < 3; i++ {
		resp := ut.PerformRequest(h.Engine, http.MethodPost, "/first/image/generate",
			&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
			headers...,
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d body=%s", i+1, resp.Code, resp.Body.String())
		}
	}

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/second/image/generate",
		&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
		headers...,
	)
	if resp.Code != http.StatusTooManyRequests {
		t.Fatalf("expected shared trial store to block fourth request, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestAnonRateLimit_BlocksInstallIDRotationFromSameClient(t *testing.T) {
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
			ut.Header{Key: "X-Anycap-Install-Id", Value: "install_rotating_" + string(rune('a'+i))},
			ut.Header{Key: "X-Forwarded-For", Value: "203.0.113.10"},
			ut.Header{Key: "Content-Type", Value: "application/json"},
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d body=%s", i+1, resp.Code, resp.Body.String())
		}
	}

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
		&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
		ut.Header{Key: "X-Anycap-Source", Value: "chrome-extension"},
		ut.Header{Key: "X-Anycap-Install-Id", Value: "install_rotating_d"},
		ut.Header{Key: "X-Forwarded-For", Value: "203.0.113.10"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusTooManyRequests {
		t.Fatalf("expected install ID rotation to be blocked, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestAnonRateLimit_BlocksInstallIDRotationWithSpoofedForwardedFor(t *testing.T) {
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
			ut.Header{Key: "X-Anycap-Install-Id", Value: "install_spoofed_" + string(rune('a'+i))},
			ut.Header{Key: "X-Forwarded-For", Value: "203.0.113." + string(rune('1'+i))},
			ut.Header{Key: "Content-Type", Value: "application/json"},
		)
		if resp.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d body=%s", i+1, resp.Code, resp.Body.String())
		}
	}

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
		&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
		ut.Header{Key: "X-Anycap-Source", Value: "chrome-extension"},
		ut.Header{Key: "X-Anycap-Install-Id", Value: "install_spoofed_d"},
		ut.Header{Key: "X-Forwarded-For", Value: "198.51.100.10"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusTooManyRequests {
		t.Fatalf("expected spoofed forwarded IP rotation to be blocked, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestAnonRateLimit_KeysTrialBudgetByInstallID(t *testing.T) {
	store := &captureAnonymousTrialStore{}
	rl := middleware.NewAnonRateLimitWithStore(store)
	h := server.Default()
	anon := h.Group("/v1", rl.Middleware())
	anon.POST("/image/generate", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate",
		&ut.Body{Body: strings.NewReader(`{"prompt":"a cat"}`), Len: len(`{"prompt":"a cat"}`)},
		ut.Header{Key: "X-Anycap-Source", Value: "chrome-extension"},
		ut.Header{Key: "X-Anycap-Install-Id", Value: "install_budget_key"},
		ut.Header{Key: "X-Forwarded-For", Value: "203.0.113.10"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(store.keys) != 2 {
		t.Fatalf("expected install and client trial keys, got %v", store.keys)
	}
	if store.keys[0] != "install_budget_key" {
		t.Fatalf("expected install trial budget key first, got %q", store.keys[0])
	}
	if !strings.HasPrefix(store.keys[1], "client:") {
		t.Fatalf("expected client trial budget key second, got %q", store.keys[1])
	}
	if strings.Contains(store.keys[1], "203.0.113.10") {
		t.Fatalf("expected client trial budget key to avoid raw IP, got %q", store.keys[1])
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
