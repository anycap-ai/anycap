package idresolver

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func WriteIDResolveError(ctx *app.RequestContext, code string, err error) {
	switch {
	case IsExternalIDInvalidError(err):
		handlers.WriteError(ctx, consts.StatusBadRequest, code, err.Error())
	case IsExternalIDNotFoundError(err):
		handlers.WriteError(ctx, consts.StatusNotFound, code, err.Error())
	default:
		handlers.WriteError(ctx, consts.StatusInternalServerError, code, err.Error())
	}
}
