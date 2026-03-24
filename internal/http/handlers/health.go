package handlers

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type SystemHandler struct {
	serviceName string
}

func NewSystemHandler(serviceName string) *SystemHandler {
	return &SystemHandler{
		serviceName: serviceName,
	}
}

func (h *SystemHandler) Ping(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(consts.StatusOK, utils.H{
		"message": "pong",
	})
}

func (h *SystemHandler) Healthz(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(consts.StatusOK, utils.H{
		"service": h.serviceName,
		"status":  "ok",
	})
}
