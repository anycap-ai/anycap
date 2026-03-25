package http

import (
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/route"
)

// RouteRegistrar allows handlers to self-register routes on a given router group.
// Handlers implement this interface and create their own sub-groups as needed.
type RouteRegistrar interface {
	RegisterRoutes(group *route.RouterGroup)
}

// RouteRegistrarFunc adapts a plain function into a RouteRegistrar.
type RouteRegistrarFunc func(group *route.RouterGroup)

func (f RouteRegistrarFunc) RegisterRoutes(group *route.RouterGroup) {
	f(group)
}

// RouterConfig holds the configuration for building the HTTP router.
// Adding a new capability (video, audio, etc.) only requires appending
// its handler to V1 — no struct changes or router edits needed.
type RouterConfig struct {
	Addr        string
	Middlewares []app.HandlerFunc
	Root        []RouteRegistrar
	V1          []RouteRegistrar
}

func NewRouter(cfg RouterConfig) *server.Hertz {
	h := server.Default(server.WithHostPorts(cfg.Addr))

	for _, mw := range cfg.Middlewares {
		h.Use(mw)
	}

	root := h.Group("")
	for _, r := range cfg.Root {
		r.RegisterRoutes(root)
	}

	v1 := h.Group("/v1")
	for _, r := range cfg.V1 {
		r.RegisterRoutes(v1)
	}

	return h
}
