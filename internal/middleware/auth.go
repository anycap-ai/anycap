package middleware

import (
	"context"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
)

func Auth(apiKeys port.APIKeyService, identityTokens port.IdentityTokenAuthenticator) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		header := string(c.Request.Header.Peek("Authorization"))
		if !strings.HasPrefix(strings.ToLower(header), "bearer ") {
			payload := dto.ErrorEnvelope(trace.GetTraceID(ctx), "AUTH_INVALID", "missing or invalid bearer token")
			c.AbortWithStatusJSON(401, invocationErrorEnvelope(ctx, c, payload))
			return
		}

		rawToken := strings.TrimSpace(header[len("Bearer "):])
		var (
			principal model.Principal
			err       error
		)

		switch {
		case strings.HasPrefix(rawToken, "ak_"):
			principal, err = apiKeys.AuthenticateAPIKey(ctx, rawToken)
		case identityTokens != nil:
			principal, err = identityTokens.AuthenticateIdentityToken(ctx, rawToken)
		default:
			err = model.ErrAuthInvalid
		}
		if err != nil {
			ReportError(c, err)
			status, payload := dto.MapDomainError(err)
			payload.ID = trace.GetTraceID(ctx)
			payload = invocationErrorEnvelope(ctx, c, payload)
			c.AbortWithStatusJSON(status, payload)
			return
		}

		SetPrincipal(c, principal)
		ctx = ContextWithUserID(ctx, principal.UserID)
		c.Next(ctx)
	}
}

func LocalBypassAuth(principal model.Principal) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		SetPrincipal(c, principal)
		ctx = ContextWithUserID(ctx, principal.UserID)
		c.Next(ctx)
	}
}
