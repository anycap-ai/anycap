package app

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"path"
	"slices"
	"strings"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	artifactapp "gitlab.knoffice.tech/engineering/anycap/internal/application/artifact"
	audioapp "gitlab.knoffice.tech/engineering/anycap/internal/application/audio"
	billingapp "gitlab.knoffice.tech/engineering/anycap/internal/application/billing"
	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	musicapp "gitlab.knoffice.tech/engineering/anycap/internal/application/music"
	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
	spaceapp "gitlab.knoffice.tech/engineering/anycap/internal/application/space"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	usageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/usage"
	videoapp "gitlab.knoffice.tech/engineering/anycap/internal/application/video"
	webapp "gitlab.knoffice.tech/engineering/anycap/internal/application/web"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/artifactingest"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/curatedcatalog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/edgegrant"
	infraim "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/kvsync"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/lark"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/migration"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	paymentinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/payment"
	paymenteventsinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/paymentevents"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	transporthttp "gitlab.knoffice.tech/engineering/anycap/internal/transport/http"
	agentcontrolhandler "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/audio"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/capabilities"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/catalog"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/drive"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/feedback"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/modelroute"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/music"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/page"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/telemetry"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/video"
	web "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/web"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"
	"gitlab.knoffice.tech/open/common-go/logging"

	hertzapp "github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/route"
)

var (
	openPostgres          = sqlstore.OpenPostgres
	runPostgresMigrations = func(ctx context.Context, db any) error {
		dbtx, ok := db.(sqlstore.DBTX)
		if !ok {
			return fmt.Errorf("migration db does not implement DBTX: %T", db)
		}
		return migration.ApplyMigrations(ctx, dbtx)
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
	config                  config.Config
	buildInfo               buildinfo.Info
	systemService           *systemapp.Service
	loginService            *loginapp.Service
	imageService            *imageapp.Service
	videoService            *videoapp.Service
	musicService            *musicapp.Service
	audioService            *audioapp.Service
	spaceService            *spaceapp.Service
	driveService            *driveapp.Service
	pageService             *pageapp.Service
	catalogService          *catalogapp.Service
	modelRouteService       *modelrouteapp.Service
	bindingService          *agentcontrolapp.BindingService
	conversationService     *agentcontrolapp.ConversationService
	taskService             *agentcontrolapp.TaskService
	capabilitiesService     *capapp.Service
	webService              *webapp.Service
	feedbackService         *feedbackapp.Service
	agentBindingRepo        port.IMBindingRepository
	agentRunnerRepo         port.AgentRunnerRepository
	agentConversationRepo   port.AgentConversationRepository
	agentSessionRepo        port.AgentSessionRepository
	agentTaskRepo           port.AgentTaskRepository
	imAdapter               *infraim.FeishuAdapter
	legacyFeishuLongConnBot *infraim.FeishuLongConnBot
	apiKeyService           port.APIKeyService
	identityTokens          port.IdentityTokenAuthenticator
	rateLimiter             port.RateLimiter
	rateLimitResolver       middleware.CapabilityRateLimitResolver
	kvSyncWorker            *kvsync.Worker
	usageSyncWorker         *usageapp.Worker
	billingWorker           *billingapp.Worker
	paymentEventsWorker     *paymenteventsinfra.Worker
	discoveryRefresher      *curatedcatalog.Refresher
	idResolver              idresolver.IDResolver
	idMapper                presenter.IDMapper
	quotaProvider           port.StorageQuotaProvider
}

type Server struct {
	config          config.Config
	buildInfo       buildinfo.Info
	httpServer      *server.Hertz
	adminHTTPServer *server.Hertz
	runtime         *serverRuntime
}

func NewServer(cfg config.Config, info buildinfo.Info) *Server {
	deps, err := buildServerDependencies(cfg, info)
	if err != nil {
		panic(err)
	}
	runtime := newServerRuntime()
	registerRuntimeTasks(runtime, deps)
	logging.WithField("config", describePaymentEventsConfig(cfg.PaymentEvents)).Info("payment events")

	serverFeatures := buildServerFeatures(cfg)
	deps.systemService.SetFeatures(serverFeatures)
	featureProvider := config.NewFeatureProvider(cfg, serverFeatures)
	deps.systemService.SetFeatureProvider(featureProvider)
	systemHandler := system.NewHandler(deps.systemService, deps.idMapper)
	if deps.quotaProvider != nil && deps.spaceService != nil {
		systemHandler.SetStorageQuota(deps.spaceService, deps.quotaProvider)
	}
	loginHandler := login.NewHandler(deps.loginService, deps.idMapper)
	imageHandler := image.NewHandler(deps.imageService)
	videoHandler := video.NewHandler(deps.videoService)
	musicHandler := music.NewHandler(deps.musicService)
	audioHandler := audio.NewHandler(deps.audioService)
	driveHandler := drive.NewHandler(deps.driveService, deps.idResolver, deps.idMapper)
	pageHandler := page.NewHandler(deps.pageService, deps.idResolver, deps.idMapper)
	capHandler := capabilities.NewHandler(deps.capabilitiesService)
	webHandler := web.NewHandler(deps.webService)
	imageCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityImage)
	videoCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityVideo)
	audioCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityAudio)
	musicCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityMusic)
	modelRouteHandler := modelroute.NewHandler(deps.modelRouteService, deps.idResolver, deps.idMapper)
	feedbackHandler := feedback.NewHandler(deps.feedbackService)
	telemetryHandler := telemetry.NewHandler()
	httpMiddlewares := []hertzapp.HandlerFunc{
		middleware.Recover(),
		commonmw.TraceMiddleware(),
		commonmw.AccessMiddleware("/ping", "/healthz"),
		commonmw.MetricsMiddleware(),
		middleware.CORS(buildCORSAllowedOrigins(cfg)),
	}
	authMiddleware := buildAuthMiddleware(deps.config, deps.apiKeyService, deps.identityTokens)
	rateLimitMiddleware := middleware.RateLimit(deps.rateLimiter, deps.rateLimitResolver)
	featureGateMiddleware := middleware.FeatureGate(featureProvider)
	webhookHandler := agentcontrolhandler.NewWebhookHandler(deps.bindingService, deps.conversationService, deps.taskService, deps.imAdapter)
	bindingHandler := agentcontrolhandler.NewBindingHandler(deps.bindingService, deps.agentBindingRepo, deps.idResolver, deps.idMapper)
	conversationHandler := agentcontrolhandler.NewConversationHandler(deps.conversationService, deps.agentConversationRepo, deps.agentSessionRepo, deps.idResolver, deps.idMapper)
	taskHandler := agentcontrolhandler.NewTaskHandler(deps.taskService, deps.agentTaskRepo, deps.idResolver, deps.idMapper)
	runnerHandler := agentcontrolhandler.NewRunnerHandler(
		deps.agentBindingRepo,
		deps.agentRunnerRepo,
		deps.agentConversationRepo,
		deps.taskService,
		deps.conversationService,
		deps.imAdapter,
		deps.idResolver,
		deps.idMapper,
	)

	httpServer := transporthttp.NewRouter(transporthttp.RouterConfig{
		Addr:        deps.config.HTTPAddr,
		Middlewares: httpMiddlewares,
		Root: []transporthttp.RouteRegistrar{
			transporthttp.RouteRegistrarFunc(systemHandler.RegisterRootRoutes),
			transporthttp.RouteRegistrarFunc(loginHandler.RegisterRootRoutes),
			transporthttp.RouteRegistrarFunc(func(group *route.RouterGroup) {
				rootProtected := group.Group("", middleware.FeatureGate(featureProvider))
				webhookHandler.RegisterRoutes(rootProtected)
			}),
		},
		V1: []transporthttp.RouteRegistrar{
			systemHandler,
			loginHandler,
			telemetryHandler,
			imageCatalog,
			videoCatalog,
			audioCatalog,
			musicCatalog,
			transporthttp.RouteRegistrarFunc(func(group *route.RouterGroup) {
				protected := group.Group("", authMiddleware, rateLimitMiddleware, featureGateMiddleware)
				systemHandler.RegisterProtectedRoutes(protected)
				loginHandler.RegisterProtectedRoutes(protected)
				imageHandler.RegisterRoutes(protected)
				videoHandler.RegisterRoutes(protected)
				musicHandler.RegisterRoutes(protected)
				audioHandler.RegisterRoutes(protected)
				driveHandler.RegisterRoutes(protected)
				pageHandler.RegisterRoutes(protected)
				capHandler.RegisterRoutes(protected)
				webHandler.RegisterRoutes(protected)
				feedbackHandler.RegisterRoutes(protected)
				bindingHandler.RegisterRoutes(protected)
				conversationHandler.RegisterRoutes(protected)
				taskHandler.RegisterRoutes(protected)
				runnerHandler.RegisterRoutes(protected)
			}),
		},
	})

	adminHTTPServer := transporthttp.NewRouter(transporthttp.RouterConfig{
		Addr:        deps.config.AdminHTTPAddr,
		Middlewares: httpMiddlewares,
		V1: []transporthttp.RouteRegistrar{
			transporthttp.RouteRegistrarFunc(func(group *route.RouterGroup) {
				protected := group.Group("", rateLimitMiddleware)
				modelRouteHandler.RegisterRoutes(protected)
			}),
		},
	})

	return &Server{config: cfg, buildInfo: info, httpServer: httpServer, adminHTTPServer: adminHTTPServer, runtime: runtime}
}

func buildServerFeatures(cfg config.Config) map[string]bool {
	// Defaults derived from infrastructure configuration.
	// Each can be overridden by ANYCAP_FEATURE_<NAME>=true/false.
	defaults := map[string]bool{
		feature.ImageGenerate: hasImageExecutionProvider(cfg),
		feature.ImageEdit:     hasImageExecutionProvider(cfg),
		feature.ImageModels:   hasCatalogProvider(cfg),
		feature.ImageRead:     cfg.AgentPlatform.Enabled(),
		feature.VideoGenerate: hasVideoExecutionProvider(cfg),
		feature.VideoModels:   hasCatalogProvider(cfg),
		feature.VideoRead:     cfg.AgentPlatform.Enabled(),
		feature.AudioRead:     cfg.AgentPlatform.Enabled(),
		feature.AudioModels:   hasCatalogProvider(cfg),
		feature.AudioGenerate: hasAudioExecutionProvider(cfg) && hasDiscoveryCatalogProvider(cfg),
		feature.MusicGenerate: hasMusicExecutionProvider(cfg),
		feature.MusicModels:   hasCatalogProvider(cfg),
		feature.Drive:         true,
		feature.Page:          true,
		feature.WebSearch:     hasWebExecutionProvider(cfg) || cfg.AgentPlatform.Enabled(),
		feature.WebCrawl:      hasWebExecutionProvider(cfg),
		feature.AgentControl:  true,
	}

	for name, defVal := range defaults {
		defaults[name] = resolveFeatureEnv(name, defVal)
	}
	return defaults
}

// resolveFeatureEnv checks for an environment variable override for a feature.
// Env var: ANYCAP_FEATURE_IMAGE_GENERATE for "image.generate".
// "true"/"1" forces on, "false"/"0" forces off, unset keeps the default.
func resolveFeatureEnv(name string, autoVal bool) bool {
	envKey := "ANYCAP_FEATURE_" + strings.ToUpper(strings.ReplaceAll(name, ".", "_"))
	v := os.Getenv(envKey)
	switch strings.ToLower(v) {
	case "true", "1":
		return true
	case "false", "0":
		return false
	default:
		return autoVal
	}
}

func describePaymentEventsConfig(cfg config.PaymentEventsConfig) string {
	tags := strings.Join(cfg.Tags, ",")
	if tags == "" {
		tags = "*"
	}
	return fmt.Sprintf(
		"enabled=%t topic=%s group=%s biz_id=%s tags=%s",
		cfg.Enabled,
		fallbackLogValue(cfg.Topic),
		fallbackLogValue(cfg.ConsumerGroup),
		fallbackLogValue(cfg.BizID),
		tags,
	)
}

func fallbackLogValue(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "-"
	}
	return trimmed
}

func buildServerDependencies(cfg config.Config, info buildinfo.Info) (serverDependencies, error) {
	shared := buildSharedComposition(cfg, info)

	switch cfg.RuntimeMode {
	case "", "stub":
		authComp := buildStubAuthComposition(cfg, shared)
		billingComp := buildStubBillingComposition(cfg, shared)
		mediaComp := buildStubMediaComposition(cfg, shared, billingComp)
		webComp := buildStubWebComposition(cfg, shared, billingComp)
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, authComp.apiKeyService)
		systemService.SetUserReader(authComp.userReader)
		systemService.SetCreditClient(shared.creditClient)
		systemService.SetSignupRewarder(shared.signupReward)
		systemService.SetPaymentClient(shared.paymentClient)
		systemService.SetCallLogRepo(billingComp.callLogs)
		systemService.SetCreditPacks(shared.creditPacks)
		systemService.SetAllowedCheckoutReturnOrigins(buildCORSAllowedOrigins(cfg))
		systemService.SetUsageReader(billingComp.usageReader)
		return serverDependencies{
			config:                cfg,
			buildInfo:             info,
			systemService:         systemService,
			loginService:          authComp.loginService,
			imageService:          mediaComp.imageService,
			videoService:          mediaComp.videoService,
			musicService:          mediaComp.musicService,
			audioService:          mediaComp.audioService,
			spaceService:          nil,
			driveService:          nil,
			pageService:           nil,
			catalogService:        shared.catalogService,
			modelRouteService:     shared.modelRouteService,
			bindingService:        nil,
			conversationService:   nil,
			taskService:           nil,
			capabilitiesService:   mediaComp.capabilitiesService,
			webService:            webComp.webService,
			feedbackService:       webComp.feedbackService,
			agentBindingRepo:      nil,
			agentRunnerRepo:       nil,
			agentConversationRepo: nil,
			agentSessionRepo:      nil,
			agentTaskRepo:         nil,
			imAdapter:             nil,
			apiKeyService:         authComp.apiKeyService,
			identityTokens:        authComp.identityTokens,
			rateLimiter:           ratelimit.NewInMemoryLimiter(),
			usageSyncWorker:       mediaComp.usageSyncWorker,
			billingWorker:         mediaComp.billingWorker,
			paymentEventsWorker:   billingComp.paymentEventsWorker,
			discoveryRefresher:    shared.discoveryRefresher,
			rateLimitResolver:     config.NewRateLimitProvider(cfg),
			idResolver:            authComp.idResolver,
			idMapper:              authComp.idMapper,
		}, nil
	case "dev", "prod", "integration":
		sqlDB, err := openPostgres(cfg.PGDSN)
		if err != nil {
			return serverDependencies{}, err
		}
		storageComp, err := buildPersistentStorageComposition(cfg, sqlDB, shared)
		if err != nil {
			return serverDependencies{}, err
		}
		authComp := buildPersistentAuthComposition(cfg, storageComp.db, shared)
		billingComp, err := buildPersistentBillingComposition(cfg, storageComp.db, shared)
		if err != nil {
			return serverDependencies{}, err
		}
		mediaComp := buildPersistentMediaComposition(cfg, shared, billingComp, storageComp)
		webComp := buildPersistentWebComposition(cfg, storageComp.db, shared, billingComp)
		agentControlRepo := postgres.NewAgentControlRepo(storageComp.db)
		bindingService := agentcontrolapp.NewBindingService(agentControlRepo, agentControlRepo)
		conversationService := agentcontrolapp.NewConversationService(
			agentControlRepo,
			agentControlRepo,
			agentControlRepo,
			agentControlRepo,
			agentControlRepo,
			agentcontrolapp.WithConversationFixedRunnerResolver(buildFixedRunnerResolver(cfg, authComp.idResolver)),
			agentcontrolapp.WithConversationFollowups(agentControlRepo),
		)
		taskService := agentcontrolapp.NewTaskService(
			agentControlRepo,
			agentControlRepo,
			agentControlRepo,
			agentcontrolapp.NewPollingDispatcher(),
			agentcontrolapp.WithFixedRunnerResolver(buildFixedRunnerResolver(cfg, authComp.idResolver)),
		)
		imAdapter := buildFeishuAdapter(cfg)
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, authComp.apiKeyService)
		systemService.SetUserReader(authComp.userReader)
		systemService.SetCreditClient(shared.creditClient)
		systemService.SetSignupRewarder(shared.signupReward)
		systemService.SetPaymentClient(shared.paymentClient)
		systemService.SetCallLogRepo(billingComp.callLogs)
		systemService.SetCreditPacks(shared.creditPacks)
		systemService.SetAllowedCheckoutReturnOrigins(buildCORSAllowedOrigins(cfg))
		systemService.SetCheckoutIdempotencyClaimer(billingComp.checkoutIdempotencyClaimer)
		systemService.SetUsageReader(billingComp.usageReader)
		redisClient := ratelimit.NewRedisClient(cfg.RedisAddr, cfg.RedisUsername, cfg.RedisPassword, cfg.RedisDB)
		return serverDependencies{
			config:                  cfg,
			buildInfo:               info,
			systemService:           systemService,
			loginService:            authComp.loginService,
			imageService:            mediaComp.imageService,
			videoService:            mediaComp.videoService,
			musicService:            mediaComp.musicService,
			audioService:            mediaComp.audioService,
			spaceService:            storageComp.spaceService,
			driveService:            storageComp.driveService,
			pageService:             storageComp.pageService,
			catalogService:          shared.catalogService,
			modelRouteService:       shared.modelRouteService,
			bindingService:          bindingService,
			conversationService:     conversationService,
			taskService:             taskService,
			capabilitiesService:     mediaComp.capabilitiesService,
			webService:              webComp.webService,
			feedbackService:         webComp.feedbackService,
			agentBindingRepo:        agentControlRepo,
			agentRunnerRepo:         agentControlRepo,
			agentConversationRepo:   agentControlRepo,
			agentSessionRepo:        agentControlRepo,
			agentTaskRepo:           agentControlRepo,
			imAdapter:               imAdapter,
			legacyFeishuLongConnBot: buildLegacyFeishuLongConnBot(cfg, bindingService, conversationService, imAdapter),
			apiKeyService:           authComp.apiKeyService,
			identityTokens:          authComp.identityTokens,
			rateLimiter:             ratelimit.NewRedisLimiter(redisClient),
			usageSyncWorker:         mediaComp.usageSyncWorker,
			billingWorker:           mediaComp.billingWorker,
			paymentEventsWorker:     billingComp.paymentEventsWorker,
			discoveryRefresher:      shared.discoveryRefresher,
			rateLimitResolver:       config.NewRateLimitProvider(cfg),
			idResolver:              authComp.idResolver,
			idMapper:                authComp.idMapper,
			kvSyncWorker:            storageComp.kvSyncWorker,
			quotaProvider:           storageComp.quotaProvider,
		}, nil
	default:
		return serverDependencies{}, fmt.Errorf("unsupported runtime mode: %s", cfg.RuntimeMode)
	}
}

func buildFixedRunnerResolver(cfg config.Config, resolver idresolver.IDResolver) agentcontrolapp.FixedRunnerResolver {
	if resolver == nil || len(cfg.AgentControl.FixedRunners) == 0 {
		return nil
	}

	type runnerTarget struct {
		platform string
		botID    string
		runnerID string
	}

	mappings := make(map[string]runnerTarget, len(cfg.AgentControl.FixedRunners))
	for _, item := range cfg.AgentControl.FixedRunners {
		platform := strings.ToLower(strings.TrimSpace(item.Platform))
		botID := strings.TrimSpace(item.BotID)
		runnerID := strings.TrimSpace(item.RunnerID)
		if platform == "" || botID == "" || runnerID == "" {
			continue
		}
		mappings[platform+"::"+botID] = runnerTarget{
			platform: platform,
			botID:    botID,
			runnerID: runnerID,
		}
	}
	if len(mappings) == 0 {
		return nil
	}

	return func(platform string, botID string) (int64, error) {
		key := strings.ToLower(strings.TrimSpace(platform)) + "::" + strings.TrimSpace(botID)
		target, ok := mappings[key]
		if !ok {
			return 0, model.ErrNotFound("fixed runner mapping not found")
		}
		return resolver.ResolveRunnerID(context.Background(), target.runnerID)
	}
}

func buildFeishuAdapter(cfg config.Config) *infraim.FeishuAdapter {
	if !cfg.AgentControl.Feishu.Enabled() {
		return nil
	}
	return infraim.NewFeishuAdapter(infraim.FeishuAdapterConfig{
		VerificationToken: cfg.AgentControl.Feishu.VerificationToken,
		EncryptKey:        cfg.AgentControl.Feishu.EncryptKey,
		ReplyAPI:          cfg.AgentControl.Feishu.ReplyAPI,
		AppID:             cfg.AgentControl.Feishu.AppID,
		AppSecret:         cfg.AgentControl.Feishu.AppSecret,
	})
}

func buildLegacyFeishuLongConnBot(cfg config.Config, bindingService *agentcontrolapp.BindingService, conversationService *agentcontrolapp.ConversationService, adapter *infraim.FeishuAdapter) *infraim.FeishuLongConnBot {
	_ = cfg
	_ = bindingService
	_ = conversationService
	_ = adapter
	// Legacy server-owned Feishu long connections are disabled. The supported
	// path is now the personal Feishu bot owned by the local daemon.
	return nil
}

func buildDeviceVerificationURL(cfg config.Config) string {
	if strings.TrimSpace(cfg.Auth0RedirectURL) == "" {
		return "https://anycap.local/auth/device"
	}
	parsed, err := url.Parse(cfg.Auth0RedirectURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return "https://anycap.local/auth/device"
	}
	parsed.Path = path.Join("/", "auth", "device")
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed.String()
}

func buildCORSAllowedOrigins(cfg config.Config) []string {
	origins := map[string]struct{}{}
	addOrigin := func(raw string) {
		parsed, err := url.Parse(strings.TrimSpace(raw))
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			return
		}
		origins[parsed.Scheme+"://"+parsed.Host] = struct{}{}
	}

	addOrigin(cfg.Auth0RedirectURL)
	origins["https://anycap.ai"] = struct{}{}

	switch strings.ToLower(strings.TrimSpace(cfg.AppEnv)) {
	case "", "local", "dev", "test":
		origins["http://localhost:3000"] = struct{}{}
		origins["http://127.0.0.1:3000"] = struct{}{}
	}

	result := make([]string, 0, len(origins))
	for origin := range origins {
		result = append(result, origin)
	}
	slices.Sort(result)
	return result
}

func buildCapabilitiesProvider(cfg config.Config) port.CapabilitiesProvider {
	if cfg.AgentPlatform.Enabled() {
		logging.WithField("base_url", cfg.AgentPlatform.BaseURL).Info("capabilities using agent-platform")
		return agentplatform.NewClient(cfg.AgentPlatform)
	}
	logging.GetLogger().Info("capabilities using stub provider")
	return agentplatform.NewStubClient()
}

func buildWebCrawler(cfg config.Config) port.WebCrawler {
	if hasWebExecutionProvider(cfg) {
		baseURL := cfg.ResolvedNexusHubCoreBaseURL()
		logging.WithField("base_url", baseURL).Info("web crawler using nexushub")
		return nexushub.NewWebClient(nexushub.WebClientConfig{
			BaseURL:          baseURL,
			Token:            cfg.ResolvedNexusHubCoreToken(),
			SearchAbilityKey: cfg.Web.SearchAbilityKey,
			ScrapeAbilityKey: cfg.Web.ScrapeAbilityKey,
		})
	}
	logging.GetLogger().Info("web crawler not configured (NexusHub Core not set)")
	return nil
}

func buildWebSearchProvider(cfg config.Config) port.WebSearchProvider {
	if cfg.AgentPlatform.Enabled() {
		logging.WithField("base_url", cfg.AgentPlatform.BaseURL).Info("web search grounding using agent-platform")
		return agentplatform.NewClient(cfg.AgentPlatform)
	}
	logging.GetLogger().Info("web search grounding not configured (AGENT_PLATFORM not set)")
	return nil
}

func buildWebGeneralSearchProvider(cfg config.Config) port.WebGeneralSearchProvider {
	if hasWebExecutionProvider(cfg) {
		baseURL := cfg.ResolvedNexusHubCoreBaseURL()
		logging.WithField("base_url", baseURL).Info("web general search using nexushub")
		return nexushub.NewWebClient(nexushub.WebClientConfig{
			BaseURL:          baseURL,
			Token:            cfg.ResolvedNexusHubCoreToken(),
			SearchAbilityKey: cfg.Web.SearchAbilityKey,
			ScrapeAbilityKey: cfg.Web.ScrapeAbilityKey,
		})
	}
	logging.GetLogger().Info("web general search not configured (NexusHub Core not set)")
	return nil
}

func buildWebService(cfg config.Config, creditClient port.CreditClient, callLogs port.CallLogRepo) *webapp.Service {
	crawler := buildWebCrawler(cfg)
	svc := webapp.NewService(crawler)
	svc.SetSearchProvider(buildWebSearchProvider(cfg))
	svc.SetGeneralSearchProvider(buildWebGeneralSearchProvider(cfg))
	svc.SetCreditClient(creditClient)
	svc.SetCallLogRepo(callLogs)
	return svc
}

func buildFeedbackNotifier(cfg config.Config) port.FeedbackNotifier {
	if cfg.Lark.Enabled() {
		logging.WithField("msg_api", cfg.Lark.MsgAPI).Info("feedback using lark webhook notifier")
		return lark.NewWebhookNotifier(cfg.Lark.MsgAPI, cfg.Lark.WebhookURL, cfg.Lark.WebhookSecret)
	}
	logging.GetLogger().Info("feedback using stub notifier")
	return lark.NewStubNotifier()
}

func buildCreditClient(cfg config.Config) port.CreditClient {
	if shouldBypassAuthForLocalTest(cfg) {
		logging.GetLogger().Warn("credit using stub because bypass auth is enabled")
		return credit.NewStubClient(nil)
	}
	if cfg.Credit.Enabled() {
		logging.WithField("base_url", cfg.Credit.BaseURL).Info("credit using credit service")
		return credit.NewHTTPClient(cfg.Credit, nil)
	}
	logging.GetLogger().Info("credit using stub client")
	return credit.NewStubClient(nil)
}

func buildPaymentClient(cfg config.Config) port.PaymentClient {
	if cfg.Payment.Enabled() {
		logging.WithField("base_url", cfg.Payment.BaseURL).Info("payment using payment service")
		return paymentinfra.NewHTTPClient(cfg.Payment, nil)
	}
	logging.GetLogger().Info("payment using stub client")
	return paymentinfra.NewStubClient()
}

func buildCreditPackSpecs(configs []config.CreditPackConfig) []model.CreditPackSpec {
	result := make([]model.CreditPackSpec, 0, len(configs))
	for _, item := range configs {
		result = append(result, model.CreditPackSpec{
			CreditPack: model.CreditPack{
				ID:          item.ID,
				Name:        item.Name,
				Description: item.Description,
				PriceCent:   item.PriceCent,
				Currency:    item.Currency,
				Credits:     item.Credits,
				Featured:    item.Featured,
				Badge:       item.Badge,
			},
			PriceID: item.PriceID,
		})
	}
	return result
}

func buildArtifactIngestClient(cfg config.Config) port.ArtifactIngestClient {
	if !cfg.Artifact.Enabled() {
		logging.GetLogger().Info("artifact-ingest: disabled (set ANYCAP_ARTIFACT_PUBLIC_BASE_URL / ANYCAP_ARTIFACT_INGEST_BASE_URL / ANYCAP_ARTIFACT_INGEST_TOKEN)")
		return nil
	}

	client, err := artifactingest.NewClient(artifactingest.ClientConfig{
		BaseURL: cfg.Artifact.IngestBaseURL,
		Token:   cfg.Artifact.IngestToken,
	})
	if err != nil {
		logging.GetLogger().WithError(err).Error("artifact-ingest: failed to initialize client")
		return nil
	}
	return client
}

func buildArtifactPublisher(
	cfg config.Config,
	ingestClient port.ArtifactIngestClient,
	capsArtifactRepo port.CapsArtifactRepository,
	storageRepo port.StorageObjectRepository,
	linkStore port.EdgeGrantStore,
	spaceService port.SpaceService,
	objectStore port.CloudObjectStore,
) port.ArtifactPublisher {
	if !cfg.Artifact.Enabled() {
		return nil
	}
	if ingestClient == nil || capsArtifactRepo == nil || storageRepo == nil || linkStore == nil || spaceService == nil || objectStore == nil {
		logging.GetLogger().Info("artifact-publisher: disabled due to incomplete dependencies")
		return nil
	}
	if _, unavailable := linkStore.(*edgegrant.UnavailableStore); unavailable {
		logging.GetLogger().Info("artifact-publisher: disabled because cloudflare kv edge grant store is unavailable")
		return nil
	}

	publisher, err := artifactapp.NewPublisher(
		artifactapp.PublisherConfig{
			PublicBaseURL:  cfg.Artifact.PublicBaseURL,
			LinkTTLSeconds: cfg.Artifact.LinkTTLSeconds,
		},
		ingestClient,
		capsArtifactRepo,
		storageRepo,
		linkStore,
		spaceService,
		objectStore,
	)
	if err != nil {
		logging.GetLogger().WithError(err).Error("artifact-publisher: failed to initialize")
		return nil
	}
	logging.GetLogger().WithFields(logging.Fields{
		"public_base": cfg.Artifact.PublicBaseURL,
		"ttl_seconds": cfg.Artifact.LinkTTLSeconds,
	}).Info("artifact-publisher: enabled")
	return publisher
}

func buildCloudObjectStorage(cfg config.Config) port.CloudObjectStore {
	if cfg.CloudS3.Enabled() {
		s3Client, err := s3store.NewClient(context.Background(), cfg.CloudS3)
		if err != nil {
			logging.WithError(err).Warn("cloud-storage failed to initialize S3 client; falling back to stub")
			return s3store.NewStubClient()
		}
		logging.WithFields(logging.Fields{
			"endpoint": cfg.CloudS3.Endpoint,
			"bucket":   cfg.CloudS3.Bucket,
		}).Info("cloud-storage using S3")
		return s3Client
	}
	logging.GetLogger().Info("cloud-storage using stub client")
	return s3store.NewStubClient()
}

func buildKVSyncClient(cfg config.Config) kvsync.KVClient {
	client, err := buildCloudflareKVClient(cfg)
	if err == nil {
		logging.WithField("namespace_id", cfg.CloudflareKV.NamespaceID).Info("kvsync using cloudflare kv")
		return client
	}
	if cfg.CloudflareKV.Enabled() {
		logging.WithError(err).Warn("kvsync failed to initialize cloudflare kv client; using noop client")
	}
	logging.GetLogger().Info("kvsync using noop kv client")
	return kvsync.NewNoopKVClient()
}

func buildEdgeGrantStore(cfg config.Config) port.EdgeGrantStore {
	client, err := buildCloudflareKVClient(cfg)
	if err == nil {
		logging.WithField("namespace_id", cfg.CloudflareKV.NamespaceID).Info("edge-grant using cloudflare kv")
		return edgegrant.NewKVStore(client)
	}
	if cfg.CloudflareKV.Enabled() {
		logging.WithError(err).Warn("edge-grant failed to initialize cloudflare kv client; using unavailable store")
	} else {
		logging.GetLogger().Info("edge-grant using unavailable store")
	}
	return edgegrant.NewUnavailableStore()
}

func buildCloudflareKVClient(cfg config.Config) (*kvsync.CloudflareKVClient, error) {
	if !cfg.CloudflareKV.Enabled() {
		return nil, fmt.Errorf("cloudflare kv is not configured")
	}
	return kvsync.NewCloudflareKVClient(kvsync.CloudflareKVClientConfig{
		AccountID:   cfg.CloudflareKV.AccountID,
		NamespaceID: cfg.CloudflareKV.NamespaceID,
		APIToken:    cfg.CloudflareKV.APIToken,
		APIBaseURL:  cfg.CloudflareKV.APIBaseURL,
	})
}

func deriveDriveAccessBaseURL(shareBaseURL string) string {
	const fallback = "https://drive.anycap.cloud"

	parsed, err := url.Parse(strings.TrimSpace(shareBaseURL))
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return fallback
	}
	return parsed.Scheme + "://" + parsed.Host
}

func buildCatalogRepo(cfg config.Config) port.CatalogRepository {
	catalogRepo, _, _ := buildCatalogAndModelRouteRepos(cfg)
	return catalogRepo
}

// buildCatalogAndModelRouteRepos picks the catalog backend.
//
// Preferred path (production): NexusHub Platform configured -> CuratedCatalog
// (curated list from dconf/embedded defaults, enriched with NexusHub Discovery).
// This path bypasses Postgres for catalog reads. The legacy
// modelRouteRepository remains backed by Postgres if available so that the
// (largely unused) /v1/admin/model-routes endpoints keep working.
//
// Legacy fallback (kept for safety / stub mode): postgres CatalogRepo with the
// old NexusHub Platform schema enricher.
//
// Stub fallback: a static in-memory list used only when no NexusHub Platform
// and no Postgres are configured (smoke tests, offline dev).
func buildCatalogAndModelRouteRepos(cfg config.Config) (port.CatalogRepository, port.ModelRouteRepository, *curatedcatalog.Refresher) {
	platformBaseURL := cfg.ResolvedNexusHubPlatformBaseURL()
	platformToken := cfg.ResolvedNexusHubPlatformToken()

	// Optional postgres repo only used to back the legacy admin endpoints.
	var modelRouteRepo port.ModelRouteRepository
	modelRouteUnavailableMessage := "model-routes: postgres is not configured; admin CRUD endpoints will be unavailable"
	if cfg.PGDSN != "" {
		repo, err := newCatalogRepoFromDSN(context.Background(), cfg.PGDSN)
		if err != nil {
			logging.WithError(err).Warn("model-routes: postgres repo init failed; admin CRUD endpoints will be unavailable")
			modelRouteUnavailableMessage = "model-routes: postgres repo unavailable; admin CRUD endpoints will be unavailable"
		} else {
			modelRouteRepo = repo
			modelRouteUnavailableMessage = ""
		}
	}
	if modelRouteUnavailableMessage != "" {
		logging.WithField("message", modelRouteUnavailableMessage).Warn("catalog model-route repository unavailable")
	}

	// Preferred: NexusHub Discovery + curated list.
	if platformBaseURL != "" {
		discoveryClient := nexushub.NewDiscoveryClient(nexushub.DiscoveryClientConfig{
			BaseURL: platformBaseURL,
			Token:   platformToken,
		})
		ttl := cfg.NexusHubDiscoveryCacheTTL
		if ttl <= 0 {
			ttl = 5 * time.Minute
		}
		discoveryCache := nexushub.NewDiscoveryCache(discoveryClient, ttl)
		curationProvider := config.NewModelCurationProvider(cfg)
		curated := curatedcatalog.New(curationProvider, discoveryCache)
		refresher := curatedcatalog.NewRefresher(curated, discoveryCache, ttl/2)

		logging.WithFields(logging.Fields{
			"platform_base_url": platformBaseURL,
			"curation_source":   curationProvider.Source(),
			"discovery_ttl":     ttl.String(),
		}).Info("catalog using curated list + nexushub discovery")
		return curated, modelRouteRepo, refresher
	}

	// Stub: no platform, no postgres -> hardcoded list (used by tests/offline).
	logging.GetLogger().Info("catalog using stub provider (no NexusHub Platform configured)")
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
		{
			ModelID:     "mureka-v6",
			Capability:  model.CapabilityMusic,
			DisplayName: "Mureka V6",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {RequestHints: map[string]any{
					"prompt":            map[string]any{"type": "string"},
					"model":             map[string]any{"type": "string", "default": "mureka-v6"},
					"make_instrumental": map[string]any{"type": "boolean"},
					"tags":              map[string]any{"type": "string"},
					"lyrics":            map[string]any{"type": "string"},
				}},
			},
		},
	}), modelRouteRepo, nil
}

func buildImageExecutionClient(cfg config.Config) port.NexusHubClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasImageExecutionProvider(cfg) {
		logging.WithField("base_url", coreBaseURL).Info("image-execution using nexushub client")
		return nexushub.NewClient(nexushub.ClientConfig{
			BaseURL: coreBaseURL,
			Token:   coreToken,
		})
	}

	logging.GetLogger().Info("image-execution using stub client")
	return nexushub.NewStubClient()
}

func hasCatalogProvider(cfg config.Config) bool {
	return cfg.PGDSN != "" || cfg.ResolvedNexusHubPlatformBaseURL() != ""
}

func buildVideoExecutionClient(cfg config.Config) port.NexusHubClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasVideoExecutionProvider(cfg) {
		logging.WithField("base_url", coreBaseURL).Info("video-execution using nexushub client")
		return nexushub.NewClient(nexushub.ClientConfig{
			BaseURL: coreBaseURL,
			Token:   coreToken,
		})
	}

	logging.GetLogger().Info("video-execution using stub client")
	return nexushub.NewStubClient()
}

func buildMusicExecutionClient(cfg config.Config) port.NexusHubClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasMusicExecutionProvider(cfg) {
		logging.WithField("base_url", coreBaseURL).Info("music-execution using nexushub client")
		return nexushub.NewClient(nexushub.ClientConfig{
			BaseURL: coreBaseURL,
			Token:   coreToken,
		})
	}

	logging.GetLogger().Info("music-execution using stub client")
	return nexushub.NewStubClient()
}

func buildAudioExecutionClient(cfg config.Config) port.AudioGenerationClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasAudioExecutionProvider(cfg) {
		logging.WithField("base_url", coreBaseURL).Info("audio-execution using nexushub client")
		return nexushub.NewClient(nexushub.ClientConfig{BaseURL: coreBaseURL, Token: coreToken})
	}

	logging.GetLogger().Info("audio-execution using stub client")
	return nexushub.NewStubClient()
}

func hasImageExecutionProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubCoreBaseURL() != "" && cfg.ResolvedNexusHubCoreToken() != ""
}

func hasVideoExecutionProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubCoreBaseURL() != "" && cfg.ResolvedNexusHubCoreToken() != ""
}

func hasMusicExecutionProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubCoreBaseURL() != "" && cfg.ResolvedNexusHubCoreToken() != ""
}

func hasAudioExecutionProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubCoreBaseURL() != "" && cfg.ResolvedNexusHubCoreToken() != ""
}

func hasDiscoveryCatalogProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubPlatformBaseURL() != ""
}

func hasWebExecutionProvider(cfg config.Config) bool {
	return cfg.ResolvedNexusHubCoreBaseURL() != "" && cfg.ResolvedNexusHubCoreToken() != ""
}

func buildAuthMiddleware(cfg config.Config, apiKeys port.APIKeyService, identityTokens port.IdentityTokenAuthenticator) hertzapp.HandlerFunc {
	if shouldBypassAuthForLocalTest(cfg) {
		principal := buildBypassPrincipal()
		logging.WithField("user_id", principal.UserID).Warn("auth bypass enabled for local testing")
		return middleware.LocalBypassAuth(principal)
	}
	return middleware.Auth(apiKeys, identityTokens)
}

func buildIdentityTokenAuthenticator(cfg config.Config, users port.UserProvisioner, signupReward port.SignupRewarder) port.IdentityTokenAuthenticator {
	if !cfg.Auth0Enabled || users == nil {
		return nil
	}
	return auth.NewIdentityTokenAuthenticator(auth.NewJWTVerifier(auth.JWTVerifierConfig{
		Issuer:   cfg.Auth0Issuer,
		Audience: cfg.Auth0Audience,
	}, nil), users, signupReward, nil)
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

// passthroughIDMapperResolver combines PassthroughIDResolver and PassthroughIDMapper
// into a single value for use in bypass-auth dev mode.
type passthroughIDMapperResolver struct {
	idresolver.PassthroughIDResolver
	presenter.PassthroughIDMapper
}

func newExternalDB(cfg config.Config, sqlDB *sql.DB) (*sqlstore.SQLDB, error) {
	db := sqlstore.NewSQLDB(sqlDB)
	if !cfg.PGAutoMigrate {
		return db, nil
	}
	if err := runPostgresMigrations(context.Background(), db); err != nil {
		return nil, err
	}
	return db, nil
}

func (s *Server) Run() {
	if err := s.Start(context.Background()); err != nil {
		panic(err)
	}
	defer func() {
		_ = s.Shutdown(context.Background())
	}()

	if s.adminHTTPServer != nil {
		logging.WithFields(logging.Fields{
			"app":     s.config.AppName,
			"addr":    s.config.AdminHTTPAddr,
			"env":     s.config.AppEnv,
			"version": s.buildInfo.Version,
		}).Info("admin server listening")
		go s.adminHTTPServer.Spin()
	}

	logging.WithFields(logging.Fields{
		"app":     s.config.AppName,
		"addr":    s.config.HTTPAddr,
		"env":     s.config.AppEnv,
		"version": s.buildInfo.Version,
	}).Info("server listening")
	s.httpServer.Spin()
}

func (s *Server) Start(ctx context.Context) error {
	if s == nil || s.runtime == nil {
		return nil
	}
	return s.runtime.Start(ctx)
}

func (s *Server) Shutdown(ctx context.Context) error {
	if s == nil {
		return nil
	}
	var firstErr error
	if s.runtime != nil {
		if err := s.runtime.Shutdown(ctx); err != nil {
			firstErr = err
		}
	}
	if s.adminHTTPServer != nil && s.adminHTTPServer.IsRunning() {
		if err := s.adminHTTPServer.Shutdown(ctx); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	if s.httpServer != nil && s.httpServer.IsRunning() {
		if err := s.httpServer.Shutdown(ctx); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}

func hasSeparateAdminHTTPServer(cfg config.Config) bool {
	return strings.TrimSpace(cfg.AdminHTTPAddr) != ""
}
