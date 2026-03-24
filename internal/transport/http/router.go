package http

import (
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app/server"
)

type Dependencies struct {
	Config        config.Config
	BuildInfo     buildinfo.Info
	SystemService *systemapp.Service
	LoginService  *loginapp.Service
	ImageService  *imageapp.Service
}

func NewRouter(deps Dependencies) *server.Hertz {
	h := server.Default(server.WithHostPorts(deps.Config.HTTPAddr))
	h.Use(middleware.RequestID())

	systemHandler := handlers.NewSystemHandler(deps.SystemService)
	loginHandler := handlers.NewLoginHandler(deps.LoginService)
	imageHandler := handlers.NewImageHandler(deps.ImageService)

	h.GET("/ping", systemHandler.Ping)
	h.GET("/healthz", systemHandler.Healthz)

	v1 := h.Group("/v1")
	v1.GET("/healthz", systemHandler.Healthz)
	v1.GET("/status", systemHandler.Status)
	v1.POST("/login/init", loginHandler.Init)
	v1.GET("/image/models", imageHandler.ListModels)
	v1.POST("/image/generate", imageHandler.Generate)

	return h
}
