package handlers

import (
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func WriteSuccess(ctx *app.RequestContext, data any) {
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), data))
}

func WriteError(ctx *app.RequestContext, statusCode int, code, message string) {
	ctx.JSON(statusCode, dto.ErrorEnvelope(middleware.GetRequestID(ctx), code, message))
}

func ParseUserID(ctx *app.RequestContext, raw string) (int64, bool) {
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id <= 0 {
		WriteError(ctx, consts.StatusUnauthorized, "invalid_user_id", "invalid user identity")
		return 0, false
	}
	return id, true
}
