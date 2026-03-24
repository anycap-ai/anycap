package main

import (
	"log"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/http/handlers"

	"github.com/cloudwego/hertz/pkg/app/server"
)

func main() {
	addr := config.HTTPAddr()

	h := server.Default(server.WithHostPorts(addr))
	h.GET("/ping", handlers.Ping)
	h.GET("/healthz", handlers.Healthz)
	h.GET("/v1/healthz", handlers.Healthz)

	log.Printf("anycap service listening on %s", addr)

	h.Spin()
}
