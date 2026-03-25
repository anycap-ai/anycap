package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	transporthttp "gitlab.knoffice.tech/engineering/anycap/internal/transport/http"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app/server"
)

var (
	openPostgres          = apikey.OpenPostgres
	runPostgresMigrations = func(ctx context.Context, db any) error {
		dbtx, ok := db.(apikey.DBTX)
		if !ok {
			return fmt.Errorf("migration db does not implement DBTX: %T", db)
		}

		return apikey.ApplyMigrations(ctx, dbtx)
	}
)

type Server struct {
	config     config.Config
	buildInfo  buildinfo.Info
	httpServer *server.Hertz
}

func NewServer(cfg config.Config, info buildinfo.Info) *Server {
	deps, err := buildServerDependencies(cfg, info)
	if err != nil {
		panic(err)
	}

	httpServer := transporthttp.NewRouter(deps)

	return &Server{
		config:     cfg,
		buildInfo:  info,
		httpServer: httpServer,
	}
}

func buildServerDependencies(cfg config.Config, info buildinfo.Info) (transporthttp.Dependencies, error) {
	systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info)

	switch cfg.RuntimeMode {
	case "", "stub":
		apiKeys := apikey.NewMemoryService()
		callLogs := apikey.NewMemoryCallLogRepo()

		return transporthttp.Dependencies{
			Config:        cfg,
			BuildInfo:     info,
			SystemService: systemService,
			LoginService:  loginapp.NewService(auth.NewStubClient("https://auth.anycap.local/authorize", nil), apiKeys, nil),
			ImageService:  imageapp.NewService(nexushub.NewStubClient(), credit.NewStubClient(nil), callLogs),
			APIKeyService: apiKeys,
			RateLimiter:   ratelimit.NewInMemoryLimiter(),
			ProtectedRPM:  cfg.RateLimitRPM,
		}, nil
	case "dev", "prod", "integration":
		sqlDB, err := openPostgres(cfg.PGDSN)
		if err != nil {
			return transporthttp.Dependencies{}, err
		}
		db, err := newExternalDB(cfg, sqlDB)
		if err != nil {
			return transporthttp.Dependencies{}, err
		}
		apiKeyRepo := apikey.NewAPIKeyRepo(db)
		callLogs := apikey.NewCallLogDBRepo(db)
		apiKeyService := auth.NewRepositoryAPIKeyService(apiKeyRepo, nil, nil)
		redisClient := ratelimit.NewRedisClient(cfg.RedisAddr, cfg.RedisUsername, cfg.RedisPassword, cfg.RedisDB)

		return transporthttp.Dependencies{
			Config:        cfg,
			BuildInfo:     info,
			SystemService: systemService,
			LoginService:  loginapp.NewService(auth.NewStubClient("https://auth.anycap.local/authorize", nil), apiKeyService, nil),
			ImageService:  imageapp.NewService(nexushub.NewStubClient(), credit.NewStubClient(nil), callLogs),
			APIKeyService: apiKeyService,
			RateLimiter:   ratelimit.NewRedisLimiter(redisClient),
			ProtectedRPM:  cfg.RateLimitRPM,
		}, nil
	default:
		return transporthttp.Dependencies{}, fmt.Errorf("unsupported runtime mode: %s", cfg.RuntimeMode)
	}
}

func newExternalDB(cfg config.Config, sqlDB *sql.DB) (*apikey.SQLDB, error) {
	db := apikey.NewSQLDB(sqlDB)
	if !cfg.PGAutoMigrate {
		return db, nil
	}

	if err := runPostgresMigrations(context.Background(), db); err != nil {
		return nil, err
	}

	return db, nil
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
