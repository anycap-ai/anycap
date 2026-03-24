package app

import (
	"context"
	"log"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
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

	// Capabilities provider: real client if configured, stub otherwise.
	var capProvider port.CapabilitiesProvider
	if cfg.AgentPlatform.Enabled() {
		capProvider = agentplatform.NewClient(cfg.AgentPlatform)
		log.Printf("capabilities: using agent-platform at %s", cfg.AgentPlatform.BaseURL)
	} else {
		capProvider = agentplatform.NewStubClient()
		log.Println("capabilities: using stub provider (set AGENT_PLATFORM_* env vars for real provider)")
	}

	// Object storage: real client if configured, stub otherwise.
	var storage port.ObjectStorage
	if cfg.S3.Enabled() {
		s3Client, err := s3store.NewClient(context.Background(), cfg.S3)
		if err != nil {
			log.Fatalf("failed to initialize S3 client: %v", err)
		}
		storage = s3Client
		log.Printf("storage: using S3 at %s (bucket=%s)", cfg.S3.Endpoint, cfg.S3.Bucket)
	} else {
		storage = s3store.NewStubClient()
		log.Println("storage: using stub (set S3_* env vars for real storage)")
	}

	capService := capapp.NewService(capProvider, storage)

	httpServer := transporthttp.NewRouter(transporthttp.Dependencies{
		Config:              cfg,
		BuildInfo:           info,
		SystemService:       systemService,
		LoginService:        loginService,
		ImageService:        imageService,
		CapabilitiesService: capService,
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
