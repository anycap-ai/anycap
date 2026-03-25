package handlers

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
)

func writeSuccess(ctx *app.RequestContext, data any) {
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), data))
}

func writeSuccessWithID(ctx *app.RequestContext, id string, data any) {
	env := dto.SuccessEnvelope(middleware.GetRequestID(ctx), data)
	if id != "" {
		env.ID = id
	}
	ctx.JSON(200, env)
}

func writeError(ctx *app.RequestContext, statusCode int, code, message string) {
	ctx.JSON(statusCode, dto.ErrorEnvelope(middleware.GetRequestID(ctx), code, message))
}
