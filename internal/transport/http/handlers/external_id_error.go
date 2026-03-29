package handlers

import (
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func writeIDResolveError(ctx *app.RequestContext, code string, err error) {
	switch {
	case isExternalIDInvalidError(err):
		writeError(ctx, consts.StatusBadRequest, code, err.Error())
	case isExternalIDNotFoundError(err):
		writeError(ctx, consts.StatusNotFound, code, err.Error())
	default:
		writeError(ctx, consts.StatusBadRequest, code, err.Error())
	}
}
