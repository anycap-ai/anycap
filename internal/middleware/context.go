package middleware

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
)

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
