package middleware

import (
	"context"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
)

func Auth(apiKeys port.APIKeyService) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		header := string(c.Request.Header.Peek("Authorization"))
		if !strings.HasPrefix(strings.ToLower(header), "bearer ") {
			c.AbortWithStatusJSON(401, dto.ErrorEnvelope(GetRequestID(c), "AUTH_INVALID", "missing or invalid bearer token"))
			return
		}

		rawKey := strings.TrimSpace(header[len("Bearer "):])
		principal, err := apiKeys.AuthenticateAPIKey(ctx, rawKey)
		if err != nil {
			status, payload := dto.MapDomainError(err)
			payload.ID = GetRequestID(c)
			c.AbortWithStatusJSON(status, payload)
			return
		}

		SetPrincipal(c, principal)
		c.Next(ctx)
	}
}
