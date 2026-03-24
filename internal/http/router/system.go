package router

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/http/handlers"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/route"
)

type SystemRoutes struct {
	handler *handlers.SystemHandler
}

func NewSystemRoutes(handler *handlers.SystemHandler) *SystemRoutes {
	return &SystemRoutes{
		handler: handler,
	}
}

func (r *SystemRoutes) Register(h *server.Hertz) {
	r.registerRoot(h)

	v1 := h.Group("/v1")
	r.registerV1(v1)
}

func (r *SystemRoutes) registerRoot(h *server.Hertz) {
	h.GET("/ping", r.handler.Ping)
	h.GET("/healthz", r.handler.Healthz)
}

func (r *SystemRoutes) registerV1(v1 *route.RouterGroup) {
	v1.GET("/healthz", r.handler.Healthz)
}
