package app

import (
	"log"

	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	transporthttp "gitlab.knoffice.tech/engineering/anycap/internal/transport/http"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	hertzapp "github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
)

type Server struct {
	config     config.Config
	buildInfo  buildinfo.Info
	httpServer *server.Hertz
}

func NewServer(cfg config.Config, info buildinfo.Info) *Server {
	catalogRepo := buildCatalogRepo(cfg)

	systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, info)
	loginService := loginapp.NewService(auth.NewStubProvider("https://auth.anycap.local/authorize"), nil)
	imageService := imageapp.NewService(nexushub.NewStubClient())
	catalogService := catalogapp.NewService(catalogRepo)

	systemHandler := handlers.NewSystemHandler(systemService)
	loginHandler := handlers.NewLoginHandler(loginService)
	imageHandler := handlers.NewImageHandler(imageService)

	imageCatalogHandler := handlers.NewCatalogHandler(catalogService, model.CapabilityImage)
	videoCatalogHandler := handlers.NewCatalogHandler(catalogService, model.CapabilityVideo)
	audioCatalogHandler := handlers.NewCatalogHandler(catalogService, model.CapabilityAudio)

	httpServer := transporthttp.NewRouter(transporthttp.RouterConfig{
		Addr:        cfg.HTTPAddr,
		Middlewares: []hertzapp.HandlerFunc{middleware.RequestID()},
		Root: []transporthttp.RouteRegistrar{
			transporthttp.RouteRegistrarFunc(systemHandler.RegisterRootRoutes),
		},
		V1: []transporthttp.RouteRegistrar{
			systemHandler,
			loginHandler,
			imageHandler,
			imageCatalogHandler,
			videoCatalogHandler,
			audioCatalogHandler,
		},
	})

	return &Server{
		config:     cfg,
		buildInfo:  info,
		httpServer: httpServer,
	}
}

func (s *Server) Run() {
	log.Printf(
		"%s listening on %s (env=%s version=%s)",
		s.config.AppName,
		s.config.HTTPAddr,
		s.config.AppEnv,
		s.buildInfo.Version,
	)

	s.httpServer.Spin()
}

func buildCatalogRepo(cfg config.Config) port.CatalogRepository {
	if cfg.NexusHubBaseURL == "" {
		log.Fatal("NEXUSHUB_BASE_URL is required")
	}
	return nexushub.NewPlatformClient(nexushub.PlatformClientConfig{
		BaseURL: cfg.NexusHubBaseURL,
		Token:   cfg.NexusHubToken,
	})
}
