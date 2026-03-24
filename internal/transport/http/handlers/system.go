package handlers

import (
	"context"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type SystemHandler struct {
	service *systemapp.Service
}

func NewSystemHandler(service *systemapp.Service) *SystemHandler {
	return &SystemHandler{service: service}
}

func (h *SystemHandler) Ping(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(consts.StatusOK, utils.H{
		"status": "success",
		"data": utils.H{
			"message": "pong",
		},
	})
}

func (h *SystemHandler) Healthz(_ context.Context, ctx *app.RequestContext) {
	status := h.service.Status()
	ctx.JSON(consts.StatusOK, utils.H{
		"status": "success",
		"data": utils.H{
			"name":   status.Name,
			"env":    status.Env,
			"status": status.Status,
		},
	})
}

func (h *SystemHandler) Status(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(consts.StatusOK, utils.H{
		"status": "success",
		"data":   h.service.Status(),
	})
}
