package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
)

func CORS(allowedOrigins []string) app.HandlerFunc {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		trimmed := strings.TrimSpace(origin)
		if trimmed == "" {
			continue
		}
		allowed[trimmed] = struct{}{}
	}

	return func(ctx context.Context, c *app.RequestContext) {
		origin := strings.TrimSpace(string(c.Request.Header.Peek("Origin")))
		if origin != "" {
			if _, ok := allowed[origin]; ok {
				c.Response.Header.Set("Access-Control-Allow-Origin", origin)
				c.Response.Header.Set("Vary", "Origin")
				c.Response.Header.Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				c.Response.Header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				c.Response.Header.Set("Access-Control-Max-Age", "600")
			}
		}

		if string(c.Method()) == http.MethodOptions {
			c.Response.SetStatusCode(http.StatusNoContent)
			return
		}

		c.Next(ctx)
	}
}
