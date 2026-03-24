package app

import (
	"log"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/http/router"

	"github.com/cloudwego/hertz/pkg/app/server"
)

type App struct {
	config     config.Config
	httpServer *server.Hertz
}

func New(cfg config.Config) *App {
	httpServer := server.Default(server.WithHostPorts(cfg.HTTP.Addr))

	systemHandler := handlers.NewSystemHandler(cfg.App.Name)

	router.Register(
		httpServer,
		router.NewSystemRoutes(systemHandler),
	)

	return &App{
		config:     cfg,
		httpServer: httpServer,
	}
}

func (a *App) Run() {
	log.Printf(
		"%s service listening on %s (env=%s)",
		a.config.App.Name,
		a.config.HTTP.Addr,
		a.config.App.Env,
	)

	a.httpServer.Spin()
}
