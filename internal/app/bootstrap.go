package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

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
	newCatalogRepoFromDSN = func(ctx context.Context, dsn string) (*postgres.CatalogRepo, error) {
		return postgres.NewCatalogRepoFromDSN(ctx, dsn)
	}
)

const (
	localAuthBypassEnvKey       = "ANYCAP_BYPASS_AUTH_FOR_LOCAL_TEST"
	localAuthBypassUserIDEnvKey = "ANYCAP_BYPASS_AUTH_USER_ID"
	defaultBypassUserID         = "123"
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
		feature.ImageGenerate:   hasImageExecutionProvider(cfg),
		feature.ImageModels:     hasCatalogProvider(cfg),
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
	modelRouteHandler := handlers.NewModelRouteHandler(modelrouteapp.NewService(buildModelRouteRepo(cfg)))
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
				protected := group.Group("", buildAuthMiddleware(deps.config, deps.apiKeyService), middleware.RateLimit(deps.rateLimiter, deps.protectedRPM))
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
	catalogRepo := buildCatalogRepo(cfg)
	catalogService := catalogapp.NewService(catalogRepo)
	capService := capapp.NewService(buildCapabilitiesProvider(cfg), buildObjectStorage(cfg))
	authClient := buildAuthClient(cfg)
	imageExecutionClient := buildImageExecutionClient(cfg)
	creditClient := buildCreditClient(cfg)

	switch cfg.RuntimeMode {
	case "", "stub":
		apiKeys := apikey.NewMemoryService()
		callLogs := apikey.NewMemoryCallLogRepo()
		loginSessions := apikey.NewMemoryLoginSessionRepo()
		users := userstore.NewMemoryProvisioner()
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, apiKeys)
		return serverDependencies{
			config:              cfg,
			buildInfo:           info,
			systemService:       systemService,
			loginService:        loginapp.NewService(authClient, users, creditClient, apiKeys, loginSessions, "https://anycap.local/device", nil, nil, nil, nil, cfg.LoginAPIKeyTTL),
			imageService:        imageapp.NewService(catalogRepo, imageExecutionClient, creditClient, callLogs),
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
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, apiKeyService)
		redisClient := ratelimit.NewRedisClient(cfg.RedisAddr, cfg.RedisUsername, cfg.RedisPassword, cfg.RedisDB)
		return serverDependencies{
			config:              cfg,
			buildInfo:           info,
			systemService:       systemService,
			loginService:        loginapp.NewService(authClient, users, creditClient, apiKeyService, loginSessionRepo, "https://anycap.local/device", nil, nil, nil, nil, cfg.LoginAPIKeyTTL),
			imageService:        imageapp.NewService(catalogRepo, imageExecutionClient, creditClient, callLogs),
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
	platformBaseURL := cfg.ResolvedNexusHubPlatformBaseURL()
	platformToken := cfg.ResolvedNexusHubPlatformToken()
	if cfg.PGDSN != "" {
		repo, err := newCatalogRepoFromDSN(context.Background(), cfg.PGDSN)
		if err != nil {
			log.Printf("catalog: failed to initialize postgres repo, falling back: %v", err)
		} else {
			if platformBaseURL != "" {
				log.Printf("catalog: using postgres anycap_model_routes table with nexushub schema enrichment via %s", platformBaseURL)
				return nexushub.NewCatalogSchemaEnricher(
					repo,
					nexushub.NewPlatformClient(nexushub.PlatformClientConfig{
						BaseURL: platformBaseURL,
						Token:   platformToken,
					}),
				)
			}

			log.Println("catalog: using postgres anycap_model_routes table without schema enrichment")
			return repo
		}
	}

	if platformBaseURL == "" {
		log.Println("catalog: using stub (set NEXUSHUB_PLATFORM_BASE_URL or NEXUSHUB_BASE_URL for real catalog)")
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

	log.Printf("catalog: using nexushub platform at %s", platformBaseURL)
	return nexushub.NewPlatformClient(nexushub.PlatformClientConfig{BaseURL: platformBaseURL, Token: platformToken})
}

func buildImageExecutionClient(cfg config.Config) port.NexusHubClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasImageExecutionProvider(cfg) {
		log.Printf("image-execution: using nexushub client at %s", coreBaseURL)
		return nexushub.NewClient(nexushub.ClientConfig{
			BaseURL: coreBaseURL,
			Token:   coreToken,
		})
	}

	log.Println("image-execution: using stub client (set NEXUSHUB_CORE_BASE_URL/NEXUSHUB_CORE_TOKEN or legacy NEXUSHUB_BASE_URL/NEXUSHUB_TOKEN for real generation)")
	return nexushub.NewStubClient()
}

func hasCatalogProvider(cfg config.Config) bool {
	return cfg.PGDSN != "" || cfg.ResolvedNexusHubPlatformBaseURL() != ""
}

func hasImageExecutionProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubCoreBaseURL() != "" && cfg.ResolvedNexusHubCoreToken() != ""
}

func buildAuthMiddleware(cfg config.Config, apiKeys port.APIKeyService) hertzapp.HandlerFunc {
	if shouldBypassAuthForLocalTest(cfg) {
		principal := buildBypassPrincipal()
		log.Printf("auth: bypass enabled for local testing with user_id=%s", principal.UserID)
		return middleware.LocalBypassAuth(principal)
	}
	return middleware.Auth(apiKeys)
}

func shouldBypassAuthForLocalTest(_ config.Config) bool {
	value := strings.TrimSpace(strings.ToLower(os.Getenv(localAuthBypassEnvKey)))
	return value == "1" || value == "true"
}

func buildBypassPrincipal() model.Principal {
	userID := strings.TrimSpace(os.Getenv(localAuthBypassUserIDEnvKey))
	if userID == "" {
		userID = defaultBypassUserID
	}
	return model.Principal{
		UserID:   userID,
		AuthType: "local_bypass",
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
	log.Printf("%s listening on %s (env=%s version=%s)", s.config.AppName, s.config.HTTPAddr, s.config.AppEnv, s.buildInfo.Version)
	s.httpServer.Spin()
}

func buildModelRouteRepo(cfg config.Config) port.ModelRouteRepository {
	if cfg.PGDSN == "" {
		log.Println("model-routes: postgres is not configured; admin CRUD endpoints will be unavailable")
		return nil
	}

	repo, err := newCatalogRepoFromDSN(context.Background(), cfg.PGDSN)
	if err != nil {
		log.Fatalf("failed to initialize postgres model route repo: %v", err)
	}
	log.Println("model-routes: using postgres anycap_model_routes table")
	return repo
}
