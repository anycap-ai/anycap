package http

import (
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
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
	APIKeyService port.APIKeyService
	RateLimiter   port.RateLimiter
	ProtectedRPM  int
}

func NewRouter(deps Dependencies) *server.Hertz {
	h := server.Default(server.WithHostPorts(deps.Config.HTTPAddr))
	h.Use(middleware.Recover(), middleware.RequestID(), middleware.AccessLog())

	systemHandler := handlers.NewSystemHandler(deps.SystemService)
	loginHandler := handlers.NewLoginHandler(deps.LoginService)
	imageHandler := handlers.NewImageHandler(deps.ImageService)

	h.GET("/ping", systemHandler.Ping)
	h.GET("/healthz", systemHandler.Healthz)

	v1 := h.Group("/v1")
	v1.GET("/healthz", systemHandler.Healthz)
	v1.POST("/login/init", loginHandler.Init)
	v1.POST("/login/callback", loginHandler.Callback)

	protected := v1.Group("", middleware.Auth(deps.APIKeyService), middleware.RateLimit(deps.RateLimiter, deps.ProtectedRPM))
	protected.GET("/status", systemHandler.Status)
	protected.GET("/image/models", imageHandler.ListModels)
	protected.GET("/image/models/:name/schema", imageHandler.GetModelSchema)
	protected.POST("/image/generate", imageHandler.Generate)

	return h
}
