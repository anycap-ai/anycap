package router

import "github.com/cloudwego/hertz/pkg/app/server"

type Registrar interface {
	Register(h *server.Hertz)
}

func Register(h *server.Hertz, registrars ...Registrar) {
	for _, registrar := range registrars {
		registrar.Register(h)
	}
}
