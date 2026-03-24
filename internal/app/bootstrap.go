package app

import (
	"log"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	transporthttp "gitlab.knoffice.tech/engineering/anycap/internal/transport/http"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app/server"
)

type Server struct {
	config     config.Config
	buildInfo  buildinfo.Info
	httpServer *server.Hertz
}

func NewServer(cfg config.Config, info buildinfo.Info) *Server {
	systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, info)
	loginService := loginapp.NewService(auth.NewStubProvider("https://auth.anycap.local/authorize"), nil)
	imageService := imageapp.NewService(nexushub.NewStubClient())

	httpServer := transporthttp.NewRouter(transporthttp.Dependencies{
		Config:        cfg,
		BuildInfo:     info,
		SystemService: systemService,
		LoginService:  loginService,
		ImageService:  imageService,
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
