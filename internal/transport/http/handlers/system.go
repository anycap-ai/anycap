package handlers

import (
	"context"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type SystemHandler struct {
	service *systemapp.Service
}

func NewSystemHandler(service *systemapp.Service) *SystemHandler {
	return &SystemHandler{service: service}
}

func (h *SystemHandler) RegisterRootRoutes(group *route.RouterGroup) {
	group.GET("/ping", h.Ping)
	group.GET("/healthz", h.Healthz)
}

func (h *SystemHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/healthz", h.Healthz)
}

func (h *SystemHandler) RegisterProtectedRoutes(group *route.RouterGroup) {
	group.GET("/status", h.Status)
}

func (h *SystemHandler) Ping(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]string{"message": "pong"}))
}

func (h *SystemHandler) Healthz(_ context.Context, ctx *app.RequestContext) {
	status := h.service.Status(nil)
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), status.Service))
}

func (h *SystemHandler) Status(_ context.Context, ctx *app.RequestContext) {
	principal, _ := middleware.GetPrincipal(ctx)
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), h.service.Status(principal)))
}
