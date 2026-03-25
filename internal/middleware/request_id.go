package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
)

const requestIDHeader = "X-Request-Id"

func RequestID() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		c.Set(principalKey, nil)
		requestID := string(c.Request.Header.Peek(requestIDHeader))
		if requestID == "" {
			requestID = fmt.Sprintf("req_%d", time.Now().UTC().UnixNano())
		}

		SetRequestID(c, requestID)
		c.Response.Header.Set(requestIDHeader, requestID)
		c.Next(ctx)
	}
}
