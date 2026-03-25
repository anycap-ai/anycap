package handlers

import (
	"context"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type SystemHandler struct {
	service *systemapp.Service
}

func NewSystemHandler(service *systemapp.Service) *SystemHandler {
	return &SystemHandler{service: service}
}

// RegisterRootRoutes registers top-level health/ping routes (outside /v1).
func (h *SystemHandler) RegisterRootRoutes(group *route.RouterGroup) {
	group.GET("/ping", h.Ping)
	group.GET("/healthz", h.Healthz)
}

// RegisterRoutes registers system routes under the /v1 group.
func (h *SystemHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/healthz", h.Healthz)
	group.GET("/status", h.Status)
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
