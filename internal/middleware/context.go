package middleware

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
)

type contextKey struct{ name string }

var ctxRequestIDKey = &contextKey{"request_id"}

const (
	requestIDKey = "request_id"
	principalKey = "principal"
)

func SetRequestID(ctx *app.RequestContext, requestID string) {
	ctx.Set(requestIDKey, requestID)
}

func GetRequestID(ctx *app.RequestContext) string {
	value, ok := ctx.Get(requestIDKey)
	if !ok {
		return ""
	}

	requestID, _ := value.(string)
	return requestID
}

// ContextWithRequestID injects the request ID into a context.Context
// so downstream code (infrastructure clients, etc.) can access it.
func ContextWithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, ctxRequestIDKey, requestID)
}

// RequestIDFromContext extracts the request ID from a context.Context.
func RequestIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ctxRequestIDKey).(string); ok {
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
