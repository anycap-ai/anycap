package middleware

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
)

type contextKey struct{ name string }

var (
	ctxUserIDKey = &contextKey{"user_id"}
)

const principalKey = "principal"

// ContextWithUserID injects the user ID into a context.Context
// so downstream infrastructure clients can forward it as X-User-ID.
func ContextWithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, ctxUserIDKey, userID)
}

// UserIDFromContext extracts the user ID from a context.Context.
func UserIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxUserIDKey).(string); ok {
		return v
	}
	return ""
}

func SetPrincipal(ctx *app.RequestContext, principal model.Principal) {
	ctx.Set(principalKey, principal)
}

func GetPrincipal(ctx *app.RequestContext) (*model.Principal, bool) {
	value, ok := ctx.Get(principalKey)
	if !ok {
		return nil, false
	}

	principal, ok := value.(model.Principal)
	if !ok {
		return nil, false
	}

	return &principal, true
}
