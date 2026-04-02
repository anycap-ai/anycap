package handlers

import (
	"context"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func WriteSuccess(c context.Context, ctx *app.RequestContext, data any) {
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), data))
}

func WriteError(c context.Context, ctx *app.RequestContext, statusCode int, code, message string) {
	ctx.JSON(statusCode, dto.ErrorEnvelope(trace.GetTraceID(c), code, message))
}

func ParseUserID(c context.Context, ctx *app.RequestContext, raw string) (int64, bool) {
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id <= 0 {
		WriteError(c, ctx, consts.StatusUnauthorized, "invalid_user_id", "invalid user identity")
		return 0, false
	}
	return id, true
}
