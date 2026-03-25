package handlers

import (
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

func writeSuccess(ctx *app.RequestContext, data any) {
	ctx.JSON(consts.StatusOK, envelope{
		Status: "success",
		Data:   data,
	})
}

func writeSuccessWithID(ctx *app.RequestContext, id string, data any) {
	ctx.JSON(consts.StatusOK, envelope{
		ID:     id,
		Status: "success",
		Data:   data,
	})
}

func writeError(ctx *app.RequestContext, statusCode int, code, message string) {
	ctx.JSON(statusCode, envelope{
		Status: "error",
		Error: &errorPayload{
			Code:    code,
			Message: message,
		},
	})
}
