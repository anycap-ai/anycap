package idresolver

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func WriteIDResolveError(c context.Context, ctx *app.RequestContext, code string, err error) {
	switch {
	case IsExternalIDInvalidError(err):
		handlers.WriteError(c, ctx, consts.StatusBadRequest, code, err.Error())
	case IsExternalIDNotFoundError(err):
		handlers.WriteError(c, ctx, consts.StatusNotFound, code, err.Error())
	default:
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, code, err.Error())
	}
}
