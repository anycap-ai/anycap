package handlers

import (
	"context"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"

	"github.com/cloudwego/hertz/pkg/app"
)

type SystemHandler struct {
	service *systemapp.Service
}

func NewSystemHandler(service *systemapp.Service) *SystemHandler {
	return &SystemHandler{service: service}
}

func (h *SystemHandler) Ping(_ context.Context, ctx *app.RequestContext) {
	writeSuccess(ctx, map[string]string{"message": "pong"})
}

func (h *SystemHandler) Healthz(_ context.Context, ctx *app.RequestContext) {
	status := h.service.Status()
	writeSuccess(ctx, map[string]string{
		"name":   status.Name,
		"env":    status.Env,
		"status": status.Status,
	})
}

func (h *SystemHandler) Status(_ context.Context, ctx *app.RequestContext) {
	writeSuccess(ctx, h.service.Status())
}
