package middleware

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
)

type CapabilityRateLimitResolver interface {
	ResolveCapabilityRateLimitRPM(capability string) int
}

func RateLimit(limiter port.RateLimiter, resolver CapabilityRateLimitResolver) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		if limiter == nil || resolver == nil {
			c.Next(ctx)
			return
		}

		capability, ok := ResolveCapability(c)
		if !ok {
			c.Next(ctx)
			return
		}

		principal, ok := GetPrincipal(c)
		if !ok || principal == nil || principal.UserID == "" {
			c.Next(ctx)
			return
		}

		rpm := resolver.ResolveCapabilityRateLimitRPM(capability)
		if rpm <= 0 {
			c.Next(ctx)
			return
		}

		key := fmt.Sprintf("rl:usercap:%s:%s", principal.UserID, capability)

		allowed, remaining, resetAt, err := limiter.Allow(ctx, key, rpm, time.Minute)
		if err != nil {
			status, payload := dto.MapDomainError(err)
			payload.ID = trace.GetTraceID(ctx)
			c.AbortWithStatusJSON(status, payload)
			return
		}

		c.Response.Header.Set("X-RateLimit-Limit", strconv.Itoa(rpm))
		c.Response.Header.Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Response.Header.Set("X-RateLimit-Reset", strconv.FormatInt(resetAt.Unix(), 10))

		if !allowed {
			status, payload := dto.MapDomainError(model.ErrRateLimited)
			payload.ID = trace.GetTraceID(ctx)
			c.AbortWithStatusJSON(status, payload)
			return
		}

		c.Next(ctx)
	}
}
