package middleware

import (
	"context"
	"net/http"
	"testing"

	infraratelimit "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestRateLimit_UsesUserAndCapabilityBucket(t *testing.T) {
	h := newRateLimitTestServer()
	h.POST("/image",
		LocalBypassAuth(model.Principal{UserID: "2000000001", AuthType: "local_bypass"}),
		WithCapability("image.generate"),
		RateLimit(infraratelimit.NewInMemoryLimiter(), staticRateLimitResolver{
			"default":        1,
			"image.generate": 1,
		}),
		okHandler,
	)

	first := ut.PerformRequest(h.Engine, http.MethodPost, "/image", nil)
	if first.Code != http.StatusOK {
		t.Fatalf("expected first request 200, got %d body=%s", first.Code, first.Body.String())
	}

	second := ut.PerformRequest(h.Engine, http.MethodPost, "/image", nil)
	if second.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second request 429, got %d body=%s", second.Code, second.Body.String())
	}
}

func TestRateLimit_SkipsRequestsWithoutCapability(t *testing.T) {
	h := newRateLimitTestServer()
	h.POST("/system",
		LocalBypassAuth(model.Principal{UserID: "2000000001", AuthType: "local_bypass"}),
		RateLimit(infraratelimit.NewInMemoryLimiter(), staticRateLimitResolver{
			"default": 1,
		}),
		okHandler,
	)

	first := ut.PerformRequest(h.Engine, http.MethodPost, "/system", nil)
	if first.Code != http.StatusOK {
		t.Fatalf("expected first request 200, got %d body=%s", first.Code, first.Body.String())
	}

	second := ut.PerformRequest(h.Engine, http.MethodPost, "/system", nil)
	if second.Code != http.StatusOK {
		t.Fatalf("expected second request 200, got %d body=%s", second.Code, second.Body.String())
	}
}

func TestRateLimit_DifferentCapabilitiesUseDifferentBuckets(t *testing.T) {
	h := newRateLimitTestServer()
	limiter := infraratelimit.NewInMemoryLimiter()

	registerRateLimitedRoute(h, http.MethodPost, "/image",
		model.Principal{UserID: "2000000001", AuthType: "local_bypass"},
		"image.generate",
		limiter,
		staticRateLimitResolver{
			"default":        1,
			"image.generate": 1,
			"video.generate": 1,
		},
	)
	registerRateLimitedRoute(h, http.MethodPost, "/video",
		model.Principal{UserID: "2000000001", AuthType: "local_bypass"},
		"video.generate",
		limiter,
		staticRateLimitResolver{
			"default":        1,
			"image.generate": 1,
			"video.generate": 1,
		},
	)

	imageFirst := ut.PerformRequest(h.Engine, http.MethodPost, "/image", nil)
	if imageFirst.Code != http.StatusOK {
		t.Fatalf("expected first image request 200, got %d body=%s", imageFirst.Code, imageFirst.Body.String())
	}

	videoFirst := ut.PerformRequest(h.Engine, http.MethodPost, "/video", nil)
	if videoFirst.Code != http.StatusOK {
		t.Fatalf("expected first video request 200, got %d body=%s", videoFirst.Code, videoFirst.Body.String())
	}

	imageSecond := ut.PerformRequest(h.Engine, http.MethodPost, "/image", nil)
	if imageSecond.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second image request 429, got %d body=%s", imageSecond.Code, imageSecond.Body.String())
	}

	videoSecond := ut.PerformRequest(h.Engine, http.MethodPost, "/video", nil)
	if videoSecond.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second video request 429, got %d body=%s", videoSecond.Code, videoSecond.Body.String())
	}
}

func TestRateLimit_DifferentUsersUseDifferentBuckets(t *testing.T) {
	h := newRateLimitTestServer()
	limiter := infraratelimit.NewInMemoryLimiter()

	registerRateLimitedRoute(h, http.MethodPost, "/user-a",
		model.Principal{UserID: "2000000001", AuthType: "local_bypass"},
		"image.generate",
		limiter,
		staticRateLimitResolver{
			"default":        1,
			"image.generate": 1,
		},
	)
	registerRateLimitedRoute(h, http.MethodPost, "/user-b",
		model.Principal{UserID: "2000000002", AuthType: "local_bypass"},
		"image.generate",
		limiter,
		staticRateLimitResolver{
			"default":        1,
			"image.generate": 1,
		},
	)

	userAFirst := ut.PerformRequest(h.Engine, http.MethodPost, "/user-a", nil)
	if userAFirst.Code != http.StatusOK {
		t.Fatalf("expected first user A request 200, got %d body=%s", userAFirst.Code, userAFirst.Body.String())
	}

	userBFirst := ut.PerformRequest(h.Engine, http.MethodPost, "/user-b", nil)
	if userBFirst.Code != http.StatusOK {
		t.Fatalf("expected first user B request 200, got %d body=%s", userBFirst.Code, userBFirst.Body.String())
	}

	userASecond := ut.PerformRequest(h.Engine, http.MethodPost, "/user-a", nil)
	if userASecond.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second user A request 429, got %d body=%s", userASecond.Code, userASecond.Body.String())
	}

	userBSecond := ut.PerformRequest(h.Engine, http.MethodPost, "/user-b", nil)
	if userBSecond.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second user B request 429, got %d body=%s", userBSecond.Code, userBSecond.Body.String())
	}
}

func TestRateLimit_UsesCapabilitySpecificRPM(t *testing.T) {
	h := newRateLimitTestServer()
	limiter := infraratelimit.NewInMemoryLimiter()
	resolver := staticRateLimitResolver{
		"default":        5,
		"image.generate": 1,
		"video.generate": 2,
	}

	registerRateLimitedRoute(h, http.MethodPost, "/image",
		model.Principal{UserID: "2000000001", AuthType: "local_bypass"},
		"image.generate",
		limiter,
		resolver,
	)
	registerRateLimitedRoute(h, http.MethodPost, "/video",
		model.Principal{UserID: "2000000001", AuthType: "local_bypass"},
		"video.generate",
		limiter,
		resolver,
	)

	imageFirst := ut.PerformRequest(h.Engine, http.MethodPost, "/image", nil)
	if imageFirst.Code != http.StatusOK {
		t.Fatalf("expected first image request 200, got %d body=%s", imageFirst.Code, imageFirst.Body.String())
	}

	imageSecond := ut.PerformRequest(h.Engine, http.MethodPost, "/image", nil)
	if imageSecond.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second image request 429, got %d body=%s", imageSecond.Code, imageSecond.Body.String())
	}

	videoFirst := ut.PerformRequest(h.Engine, http.MethodPost, "/video", nil)
	if videoFirst.Code != http.StatusOK {
		t.Fatalf("expected first video request 200, got %d body=%s", videoFirst.Code, videoFirst.Body.String())
	}

	videoSecond := ut.PerformRequest(h.Engine, http.MethodPost, "/video", nil)
	if videoSecond.Code != http.StatusOK {
		t.Fatalf("expected second video request 200, got %d body=%s", videoSecond.Code, videoSecond.Body.String())
	}

	videoThird := ut.PerformRequest(h.Engine, http.MethodPost, "/video", nil)
	if videoThird.Code != http.StatusTooManyRequests {
		t.Fatalf("expected third video request 429, got %d body=%s", videoThird.Code, videoThird.Body.String())
	}
}

func TestRateLimit_UsesRegisteredRouteCapabilityBeforeHandlerMiddleware(t *testing.T) {
	h := newRateLimitTestServer()
	protected := h.Group("",
		LocalBypassAuth(model.Principal{UserID: "2000000001", AuthType: "local_bypass"}),
		RateLimit(infraratelimit.NewInMemoryLimiter(), staticRateLimitResolver{
			"default":        1,
			"image.generate": 1,
		}),
	)
	image := protected.Group("/image")

	CapabilityPOST(image, "/generate", "image.generate", okHandler)

	first := ut.PerformRequest(h.Engine, http.MethodPost, "/image/generate", nil)
	if first.Code != http.StatusOK {
		t.Fatalf("expected first request 200, got %d body=%s", first.Code, first.Body.String())
	}

	second := ut.PerformRequest(h.Engine, http.MethodPost, "/image/generate", nil)
	if second.Code != http.StatusTooManyRequests {
		t.Fatalf("expected second request 429, got %d body=%s", second.Code, second.Body.String())
	}
}

func newRateLimitTestServer() *server.Hertz {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID())
	return h
}

func registerRateLimitedRoute(h *server.Hertz, method, path string, principal model.Principal, capability string, limiter *infraratelimit.InMemoryLimiter, resolver staticRateLimitResolver) {
	handler := []app.HandlerFunc{
		LocalBypassAuth(principal),
		WithCapability(capability),
		RateLimit(limiter, resolver),
		okHandler,
	}

	switch method {
	case http.MethodPost:
		h.POST(path, handler...)
	default:
		panic("unsupported method in test")
	}
}

func okHandler(ctx context.Context, c *app.RequestContext) {
	c.String(http.StatusOK, "ok")
}

type staticRateLimitResolver map[string]int

func (r staticRateLimitResolver) ResolveCapabilityRateLimitRPM(capability string) int {
	if rpm, ok := r[capability]; ok {
		return rpm
	}
	return r["default"]
}
