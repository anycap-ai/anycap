package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/netip"
	"strings"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
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

// AnonRateLimit limits anonymous Chrome extension trials by install ID and
// network peer. It only applies to anonymous requests from the Chrome extension.
type AnonRateLimit struct {
	store port.AnonymousTrialStore
	now   func() time.Time
}

type memoryAnonymousTrialStore struct {
	mu      sync.Mutex
	buckets map[string]*anonRateLimitEntry
}

func NewAnonRateLimit() *AnonRateLimit {
	return NewAnonRateLimitWithStore(NewMemoryAnonymousTrialStore())
}

func NewAnonRateLimitWithStore(store port.AnonymousTrialStore) *AnonRateLimit {
	if store == nil {
		store = NewMemoryAnonymousTrialStore()
	}
	return &AnonRateLimit{store: store, now: time.Now}
}

func NewMemoryAnonymousTrialStore() port.AnonymousTrialStore {
	return &memoryAnonymousTrialStore{buckets: make(map[string]*anonRateLimitEntry)}
}

func (rl *AnonRateLimit) Middleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		authHeader := string(c.Request.Header.Peek("Authorization"))
		if strings.TrimSpace(authHeader) != "" {
			c.Next(ctx)
			return
		}

		source := strings.TrimSpace(string(c.Request.Header.Peek("X-Anycap-Source")))
		if strings.ToLower(source) != chromeExtensionSource {
			c.Next(ctx)
			return
		}

		installID, ok := NormalizeChromeExtensionInstallID(string(c.Request.Header.Peek("X-Anycap-Install-Id")))
		if !ok {
			c.Next(ctx)
			return
		}

		now := rl.now().UTC()
		state, err := rl.store.ConsumeAnonymousTrial(ctx, installID, now, anonRateLimitMaxRequests, anonRateLimitWindow)
		if err != nil {
			c.AbortWithStatusJSON(503, dto.ErrorEnvelope(trace.GetTraceID(ctx), "TRIAL_LIMIT_UNAVAILABLE", "Anonymous trial limit is temporarily unavailable."))
			return
		}
		if !state.Allowed {
			c.AbortWithStatusJSON(429, dto.ErrorEnvelope(trace.GetTraceID(ctx), "TRIAL_EXHAUSTED", "Anonymous trial exhausted. Sign in for more."))
			return
		}

		if clientKey, ok := anonymousClientTrialKey(c); ok {
			clientState, err := rl.store.ConsumeAnonymousTrial(ctx, clientKey, now, anonRateLimitMaxRequests, anonRateLimitWindow)
			if err != nil {
				c.AbortWithStatusJSON(503, dto.ErrorEnvelope(trace.GetTraceID(ctx), "TRIAL_LIMIT_UNAVAILABLE", "Anonymous trial limit is temporarily unavailable."))
				return
			}
			if !clientState.Allowed {
				c.AbortWithStatusJSON(429, dto.ErrorEnvelope(trace.GetTraceID(ctx), "TRIAL_EXHAUSTED", "Anonymous trial exhausted. Sign in for more."))
				return
			}
		}

		c.Next(ctx)
	}
}

func anonymousClientTrialKey(c *app.RequestContext) (string, bool) {
	remoteAddr := c.RemoteAddr()
	if remoteAddr == nil {
		return "", false
	}
	return hashClientAddr(remoteAddr.String())
}

func hashClientAddr(raw string) (string, bool) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", false
	}

	if addr, err := netip.ParseAddr(raw); err == nil {
		sum := sha256.Sum256([]byte(addr.String()))
		return "client:" + hex.EncodeToString(sum[:16]), true
	}
	if addrPort, err := netip.ParseAddrPort(raw); err == nil {
		sum := sha256.Sum256([]byte(addrPort.Addr().String()))
		return "client:" + hex.EncodeToString(sum[:16]), true
	}

	return "", false
}

func (s *memoryAnonymousTrialStore) ConsumeAnonymousTrial(_ context.Context, key string, now time.Time, limit int, window time.Duration) (model.AnonymousTrialState, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.buckets[key]
	if !ok || now.After(entry.resetAt) {
		entry = &anonRateLimitEntry{resetAt: now.Add(window)}
		s.buckets[key] = entry
	}

	if entry.count >= limit {
		return model.AnonymousTrialState{
			Key:     key,
			Count:   entry.count,
			Limit:   limit,
			ResetAt: entry.resetAt,
			Allowed: false,
		}, nil
	}

	entry.count++
	return model.AnonymousTrialState{
		Key:     key,
		Count:   entry.count,
		Limit:   limit,
		ResetAt: entry.resetAt,
		Allowed: true,
	}, nil
}
