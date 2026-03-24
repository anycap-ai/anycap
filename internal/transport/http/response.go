package http

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type envelope struct {
	ID     string        `json:"id,omitempty"`
	Status string        `json:"status"`
	Data   any           `json:"data,omitempty"`
	Error  *errorPayload `json:"error,omitempty"`
}

type errorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeSuccess(_ context.Context, ctx *app.RequestContext, data any) {
	ctx.JSON(consts.StatusOK, envelope{
		Status: "success",
		Data:   data,
	})
}

func writeError(_ context.Context, ctx *app.RequestContext, statusCode int, code, message string) {
	ctx.JSON(statusCode, envelope{
		Status: "error",
		Error: &errorPayload{
			Code:    code,
			Message: message,
		},
	})
}
