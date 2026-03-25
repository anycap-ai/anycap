package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/lark"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	userstore "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/user"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	transporthttp "gitlab.knoffice.tech/engineering/anycap/internal/transport/http"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

	hertzapp "github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/route"
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
	newCatalogRepoFromEnv = func(ctx context.Context) (*postgres.CatalogRepo, error) {
		return postgres.NewCatalogRepoFromEnv(ctx)
	}
)

type serverDependencies struct {
	config              config.Config
	buildInfo           buildinfo.Info
	systemService       *systemapp.Service
	loginService        *loginapp.Service
	imageService        *imageapp.Service
	catalogService      *catalogapp.Service
	capabilitiesService *capapp.Service
	feedbackService     *feedbackapp.Service
	apiKeyService       port.APIKeyService
	rateLimiter         port.RateLimiter
	protectedRPM        int
}

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

	// Determine feature flags based on configured providers.
	serverFeatures := map[string]bool{
		feature.Login:           false, // auth provider is stub
		feature.ImageGenerate:   false, // nexushub image generation not wired yet
		feature.ImageModels:     false, // nexushub image models not wired yet
		feature.ImageUnderstand: cfg.AgentPlatform.Enabled(),
		feature.VideoRead:       cfg.AgentPlatform.Enabled(),
	}
	deps.systemService.SetFeatures(serverFeatures)
	systemHandler := handlers.NewSystemHandler(deps.systemService)
	loginHandler := handlers.NewLoginHandler(deps.loginService)
	imageHandler := handlers.NewImageHandler(deps.imageService)
	capHandler := handlers.NewCapabilitiesHandler(deps.capabilitiesService)
	imageCatalog := handlers.NewCatalogHandler(deps.catalogService, model.CapabilityImage)
	videoCatalog := handlers.NewCatalogHandler(deps.catalogService, model.CapabilityVideo)
	audioCatalog := handlers.NewCatalogHandler(deps.catalogService, model.CapabilityAudio)
	modelRouteHandler := handlers.NewModelRouteHandler(modelrouteapp.NewService(buildModelRouteRepo()))
	feedbackHandler := handlers.NewFeedbackHandler(deps.feedbackService)

	httpServer := transporthttp.NewRouter(transporthttp.RouterConfig{
		Addr: deps.config.HTTPAddr,
		Middlewares: []hertzapp.HandlerFunc{
			middleware.Recover(),
			middleware.RequestID(),
			middleware.AccessLog(),
		},
		Root: []transporthttp.RouteRegistrar{
			transporthttp.RouteRegistrarFunc(systemHandler.RegisterRootRoutes),
		},
		V1: []transporthttp.RouteRegistrar{
			systemHandler,
			loginHandler,
			imageCatalog,
			videoCatalog,
			audioCatalog,
			modelRouteHandler,
			transporthttp.RouteRegistrarFunc(func(group *route.RouterGroup) {
				protected := group.Group("", middleware.Auth(deps.apiKeyService), middleware.RateLimit(deps.rateLimiter, deps.protectedRPM))
				systemHandler.RegisterProtectedRoutes(protected)
				imageHandler.RegisterRoutes(protected)
				capHandler.RegisterRoutes(protected)
				feedbackHandler.RegisterRoutes(protected)
			}),
		},
	})

	return &Server{config: cfg, buildInfo: info, httpServer: httpServer}
}

func buildServerDependencies(cfg config.Config, info buildinfo.Info) (serverDependencies, error) {
	catalogService := catalogapp.NewService(buildCatalogRepo(cfg))
	capService := capapp.NewService(buildCapabilitiesProvider(cfg), buildObjectStorage(cfg))
	authClient := buildAuthClient(cfg)

	switch cfg.RuntimeMode {
	case "", "stub":
		apiKeys := apikey.NewMemoryService()
		callLogs := apikey.NewMemoryCallLogRepo()
		loginSessions := apikey.NewMemoryLoginSessionRepo()
		users := userstore.NewMemoryProvisioner()
		creditClient := buildCreditClient(cfg)
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, apiKeys)
		return serverDependencies{
			config:              cfg,
			buildInfo:           info,
			systemService:       systemService,
			loginService:        loginapp.NewService(authClient, users, apiKeys, loginSessions, "https://anycap.local/device", nil, nil, nil, nil, cfg.LoginAPIKeyTTL),
			imageService:        imageapp.NewService(nexushub.NewStubClient(), creditClient, callLogs),
			catalogService:      catalogService,
			capabilitiesService: capService,
			feedbackService:     feedbackapp.NewService(apikey.NewMemoryFeedbackRepo(), buildFeedbackNotifier(cfg), cfg.AppEnv),
			apiKeyService:       apiKeys,
			rateLimiter:         ratelimit.NewInMemoryLimiter(),
			protectedRPM:        cfg.RateLimitRPM,
		}, nil
	case "dev", "prod", "integration":
		sqlDB, err := openPostgres(cfg.PGDSN)
		if err != nil {
			return serverDependencies{}, err
		}
		db, err := newExternalDB(cfg, sqlDB)
		if err != nil {
			return serverDependencies{}, err
		}
		apiKeyRepo := apikey.NewAPIKeyRepo(db)
		loginSessionRepo := apikey.NewLoginSessionRepo(db)
		callLogs := apikey.NewCallLogDBRepo(db)
		users := userstore.NewProvisioner(db)
		apiKeyService := auth.NewRepositoryAPIKeyService(apiKeyRepo, nil, nil)
		creditClient := buildCreditClient(cfg)
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, apiKeyService)
		redisClient := ratelimit.NewRedisClient(cfg.RedisAddr, cfg.RedisUsername, cfg.RedisPassword, cfg.RedisDB)
		return serverDependencies{
			config:              cfg,
			buildInfo:           info,
			systemService:       systemService,
			loginService:        loginapp.NewService(authClient, users, apiKeyService, loginSessionRepo, "https://anycap.local/device", nil, nil, nil, nil, cfg.LoginAPIKeyTTL),
			imageService:        imageapp.NewService(nexushub.NewStubClient(), creditClient, callLogs),
			catalogService:      catalogService,
			capabilitiesService: capService,
			feedbackService:     feedbackapp.NewService(apikey.NewFeedbackDBRepo(db), buildFeedbackNotifier(cfg), cfg.AppEnv),
			apiKeyService:       apiKeyService,
			rateLimiter:         ratelimit.NewRedisLimiter(redisClient),
			protectedRPM:        cfg.RateLimitRPM,
		}, nil
	default:
		return serverDependencies{}, fmt.Errorf("unsupported runtime mode: %s", cfg.RuntimeMode)
	}
}

func buildAuthClient(cfg config.Config) port.Auth0Client {
	if cfg.Auth0Enabled {
		log.Printf("auth: using Auth0 issuer %s", cfg.Auth0Issuer)
		return auth.NewClient(auth.ClientConfig{
			Issuer:       cfg.Auth0Issuer,
			Audience:     cfg.Auth0Audience,
			ClientID:     cfg.Auth0ClientID,
			ClientSecret: cfg.Auth0ClientSecret,
			RedirectURL:  cfg.Auth0RedirectURL,
		}, nil)
	}
	log.Println("auth: using stub client (set ANYCAP_AUTH0_ENABLED=true for real Auth0)")
	return auth.NewStubClient("https://auth.anycap.local/authorize", nil)
}

func buildCapabilitiesProvider(cfg config.Config) port.CapabilitiesProvider {
	if cfg.AgentPlatform.Enabled() {
		log.Printf("capabilities: using agent-platform at %s", cfg.AgentPlatform.BaseURL)
		return agentplatform.NewClient(cfg.AgentPlatform)
	}
	log.Println("capabilities: using stub provider (set AGENT_PLATFORM_* env vars for real provider)")
	return agentplatform.NewStubClient()
}

func buildFeedbackNotifier(cfg config.Config) port.FeedbackNotifier {
	if cfg.Lark.Enabled() {
		log.Printf("feedback: using lark webhook notifier via %s", cfg.Lark.MsgAPI)
		return lark.NewWebhookNotifier(cfg.Lark.MsgAPI, cfg.Lark.WebhookURL, cfg.Lark.WebhookSecret)
	}
	log.Println("feedback: using stub notifier (set ANYCAP_LARK_WEBHOOK_URL and ANYCAP_LARK_WEBHOOK_SECRET for Lark notifications)")
	return lark.NewStubNotifier()
}

func buildCreditClient(cfg config.Config) port.CreditClient {
	if cfg.Credit.Enabled() {
		log.Printf("credit: using credit service at %s", cfg.Credit.BaseURL)
		return credit.NewHTTPClient(cfg.Credit, nil)
	}
	log.Println("credit: using stub (set ANYCAP_CREDIT_* env vars for real credit)")
	return credit.NewStubClient(nil)
}

func buildObjectStorage(cfg config.Config) port.ObjectStorage {
	if cfg.S3.Enabled() {
		s3Client, err := s3store.NewClient(context.Background(), cfg.S3)
		if err != nil {
			log.Printf("storage: failed to initialize S3 client, falling back to stub: %v", err)
			return s3store.NewStubClient()
		}
		log.Printf("storage: using S3 at %s (bucket=%s)", cfg.S3.Endpoint, cfg.S3.Bucket)
		return s3Client
	}
	log.Println("storage: using stub (set S3_* env vars for real storage)")
	return s3store.NewStubClient()
}

func buildCatalogRepo(cfg config.Config) port.CatalogRepository {
	if os.Getenv("ANYCAP_PG_CONFIG") != "" {
		repo, err := newCatalogRepoFromEnv(context.Background())
		if err != nil {
			log.Printf("catalog: failed to initialize postgres repo, falling back: %v", err)
		} else {
			if cfg.NexusHubBaseURL != "" {
				log.Printf("catalog: using postgres anycap_model_routes table with nexushub schema enrichment via %s", cfg.NexusHubBaseURL)
				return nexushub.NewCatalogSchemaEnricher(
					repo,
					nexushub.NewPlatformClient(nexushub.PlatformClientConfig{
						BaseURL: cfg.NexusHubBaseURL,
						Token:   cfg.NexusHubToken,
					}),
				)
			}

			log.Println("catalog: using postgres anycap_model_routes table without schema enrichment")
			return repo
		}
	}

	if cfg.NexusHubBaseURL == "" {
		log.Println("catalog: using stub (set NEXUSHUB_BASE_URL for real catalog)")
		return nexushub.NewCatalogStubWith([]model.ModelSpec{
			{
				ModelID:     "flux-dev",
				Capability:  model.CapabilityImage,
				DisplayName: "FLUX Dev",
				Status:      "active",
				Operations: map[model.Operation]model.OperationSpec{
					model.OperationGenerate: {RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}, "model": map[string]any{"type": "string", "default": "flux-dev"}}},
				},
			},
			{
				ModelID:     "gpt-image-1.5",
				Capability:  model.CapabilityImage,
				DisplayName: "GPT Image 1.5",
				Status:      "active",
				Operations: map[model.Operation]model.OperationSpec{
					model.OperationGenerate: {RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}, "model": map[string]any{"type": "string", "default": "gpt-image-1.5"}}},
				},
			},
		})
	}

	log.Printf("catalog: using nexushub platform at %s", cfg.NexusHubBaseURL)
	return nexushub.NewPlatformClient(nexushub.PlatformClientConfig{BaseURL: cfg.NexusHubBaseURL, Token: cfg.NexusHubToken})
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
	log.Printf("%s listening on %s (env=%s version=%s)", s.config.AppName, s.config.HTTPAddr, s.config.AppEnv, s.buildInfo.Version)
	s.httpServer.Spin()
}

func buildModelRouteRepo() port.ModelRouteRepository {
	if os.Getenv("ANYCAP_PG_CONFIG") == "" {
		log.Println("model-routes: postgres is not configured; admin CRUD endpoints will be unavailable")
		return nil
	}

	repo, err := newCatalogRepoFromEnv(context.Background())
	if err != nil {
		log.Fatalf("failed to initialize postgres model route repo: %v", err)
	}
	log.Println("model-routes: using postgres anycap_model_routes table")
	return repo
}
