package middleware

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
)

func RateLimit(limiter port.RateLimiter, rpm int) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		if limiter == nil || rpm <= 0 {
			c.Next(ctx)
			return
		}

		key := ""
		if principal, ok := GetPrincipal(c); ok && principal.APIKeyID != "" {
			key = fmt.Sprintf("rl:apikey:%s", principal.APIKeyID)
		} else {
			header := string(c.Request.Header.Peek("Authorization"))
			if strings.HasPrefix(strings.ToLower(header), "bearer ") {
				key = "rl:token:" + strings.TrimSpace(header[len("Bearer "):])
			}
		}
		if key == "" {
			c.Next(ctx)
			return
		}

		allowed, remaining, resetAt, err := limiter.Allow(ctx, key, rpm, time.Minute)
		if err != nil {
			status, payload := dto.MapDomainError(err)
			payload.ID = GetRequestID(c)
			c.AbortWithStatusJSON(status, payload)
			return
		}

		c.Response.Header.Set("X-RateLimit-Limit", strconv.Itoa(rpm))
		c.Response.Header.Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Response.Header.Set("X-RateLimit-Reset", strconv.FormatInt(resetAt.Unix(), 10))

		if !allowed {
			status, payload := dto.MapDomainError(model.ErrRateLimited)
			payload.ID = GetRequestID(c)
			c.AbortWithStatusJSON(status, payload)
			return
		}

		c.Next(ctx)
	}
}
