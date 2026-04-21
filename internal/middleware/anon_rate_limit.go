package middleware

import (
	"context"
	"strings"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
)

const (
	anonRateLimitMaxRequests = 3
	anonRateLimitWindow      = 30 * 24 * time.Hour
)

type anonRateLimitEntry struct {
	count   int
	resetAt time.Time
}

// AnonRateLimit is an in-memory rate limiter keyed by install_id + IP.
// It only applies to anonymous requests from the Chrome extension.
type AnonRateLimit struct {
	mu      sync.Mutex
	buckets map[string]*anonRateLimitEntry
}

func NewAnonRateLimit() *AnonRateLimit {
	return &AnonRateLimit{buckets: make(map[string]*anonRateLimitEntry)}
}

func (rl *AnonRateLimit) Middleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		authHeader := string(c.Request.Header.Peek("Authorization"))
		if strings.TrimSpace(authHeader) != "" {
			c.Next(ctx)
			return
		}

		source := string(c.Request.Header.Peek("X-Anycap-Source"))
		if strings.ToLower(source) != "chrome-extension" {
			c.Next(ctx)
			return
		}

		installID := string(c.Request.Header.Peek("X-Anycap-Install-Id"))
		if strings.TrimSpace(installID) == "" {
			c.Next(ctx)
			return
		}

		clientIP := c.ClientIP()
		key := installID + "|" + clientIP

		allowed := rl.allow(key)
		if !allowed {
			c.AbortWithStatusJSON(429, dto.ErrorEnvelope(trace.GetTraceID(ctx), "TRIAL_EXHAUSTED", "Anonymous trial exhausted. Sign in for more."))
			return
		}

		c.Next(ctx)
	}
}

func (rl *AnonRateLimit) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now().UTC()
	entry, ok := rl.buckets[key]
	if !ok || now.After(entry.resetAt) {
		entry = &anonRateLimitEntry{resetAt: now.Add(anonRateLimitWindow)}
		rl.buckets[key] = entry
	}

	if entry.count >= anonRateLimitMaxRequests {
		return false
	}

	entry.count++
	return true
}
