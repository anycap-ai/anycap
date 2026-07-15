package handlers

import (
	"context"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func WriteSuccess(c context.Context, ctx *app.RequestContext, data any) {
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), data))
}

func WriteInvocationSuccess(c context.Context, ctx *app.RequestContext, data any, meta model.InvocationMeta) {
	requestID := trace.GetTraceID(c)
	diagnostics := dto.NewInvocationDiagnostics(requestID, requestID, meta)
	ctx.JSON(consts.StatusOK, dto.SuccessInvocationEnvelope(requestID, data, diagnostics))
}

func WriteError(c context.Context, ctx *app.RequestContext, statusCode int, code, message string) {
	ctx.JSON(statusCode, dto.ErrorEnvelope(trace.GetTraceID(c), code, message))
}

func WriteInvocationError(c context.Context, ctx *app.RequestContext, err error) {
	statusCode, envelope := dto.MapDomainError(err)
	requestID := trace.GetTraceID(c)
	meta, _ := model.InvocationMetaFromError(err)
	if meta.Stage == "" {
		meta.Stage = model.InvocationStagePrepare
	}
	envelope.ID = requestID
	diagnostics := dto.NewInvocationDiagnostics(requestID, requestID, meta)
	envelope.Diagnostics = &diagnostics
	ctx.JSON(statusCode, envelope)
}

func WriteInvocationErrorPayload(c context.Context, ctx *app.RequestContext, statusCode int, code, message string, meta model.InvocationMeta) {
	requestID := trace.GetTraceID(c)
	diagnostics := dto.NewInvocationDiagnostics(requestID, requestID, meta)
	ctx.JSON(statusCode, dto.ErrorInvocationEnvelope(requestID, code, message, diagnostics))
}

func ParseUserID(c context.Context, ctx *app.RequestContext, raw string) (int64, bool) {
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id <= 0 {
		WriteError(c, ctx, consts.StatusUnauthorized, "invalid_user_id", "invalid user identity")
		return 0, false
	}
	return id, true
}
