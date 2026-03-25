package middleware

import (
	"context"
	"log"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
)

func AccessLog() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		startedAt := time.Now()
		c.Next(ctx)

		log.Printf(
			"request_id=%s method=%s path=%s status=%d latency_ms=%d",
			GetRequestID(c),
			string(c.Method()),
			string(c.Path()),
			c.Response.StatusCode(),
			time.Since(startedAt).Milliseconds(),
		)
	}
}
