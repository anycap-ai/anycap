package app

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"
	"path"
	"slices"
	"strings"
	"time"

	billingeventsapp "gitlab.knoffice.tech/engineering/anycap/internal/application/billingevents"
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
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/edgegrant"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/feedbackstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/kvsync"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/lark"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/loginsession"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/migration"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	paymentinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/payment"
	paymenteventsinfra "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/paymentevents"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/usage"
	userstore "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/user"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	transporthttp "gitlab.knoffice.tech/engineering/anycap/internal/transport/http"
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
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/video"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

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
	config              config.Config
	buildInfo           buildinfo.Info
	systemService       *systemapp.Service
	loginService        *loginapp.Service
	imageService        *imageapp.Service
	videoService        *videoapp.Service
	musicService        *musicapp.Service
	spaceService        *spaceapp.Service
	driveService        *driveapp.Service
	pageService         *pageapp.Service
	catalogService      *catalogapp.Service
	modelRouteService   *modelrouteapp.Service
	capabilitiesService *capapp.Service
	feedbackService     *feedbackapp.Service
	apiKeyService       port.APIKeyService
	identityTokens      port.IdentityTokenAuthenticator
	rateLimiter         port.RateLimiter
	rateLimitResolver   middleware.CapabilityRateLimitResolver
	kvSyncWorker        *kvsync.Worker
	usageSyncWorker     *usageapp.Worker
	paymentEventsWorker *paymenteventsinfra.Worker
	idResolver          idresolver.IDResolver
	idMapper            presenter.IDMapper
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

	if deps.kvSyncWorker != nil {
		go func() {
			if err := deps.kvSyncWorker.Run(context.Background()); err != nil {
				log.Printf("kvsync worker stopped: %v", err)
			}
		}()
	}
	if deps.usageSyncWorker != nil {
		go func() {
			if err := deps.usageSyncWorker.Run(context.Background()); err != nil {
				log.Printf("usage sync worker stopped: %v", err)
			}
		}()
	}
	log.Printf("payment events: %s", describePaymentEventsConfig(cfg.PaymentEvents))
	if deps.paymentEventsWorker != nil {
		go func() {
			if err := deps.paymentEventsWorker.Run(context.Background()); err != nil {
				log.Printf("payment events worker stopped: %v", err)
			}
		}()
	}

	serverFeatures := buildServerFeatures(cfg)
	deps.systemService.SetFeatures(serverFeatures)
	featureProvider := config.NewFeatureProvider(cfg, serverFeatures)
	deps.systemService.SetFeatureProvider(featureProvider)
	systemHandler := system.NewHandler(deps.systemService, deps.idMapper)
	loginHandler := login.NewHandler(deps.loginService, deps.idMapper)
	imageHandler := image.NewHandler(deps.imageService)
	videoHandler := video.NewHandler(deps.videoService)
	musicHandler := music.NewHandler(deps.musicService)
	driveHandler := drive.NewHandler(deps.driveService, deps.idResolver, deps.idMapper)
	pageHandler := page.NewHandler(deps.pageService, deps.idResolver, deps.idMapper)
	capHandler := capabilities.NewHandler(deps.capabilitiesService)
	imageCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityImage)
	videoCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityVideo)
	audioCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityAudio)
	musicCatalog := catalog.NewHandler(deps.catalogService, model.CapabilityMusic)
	modelRouteHandler := modelroute.NewHandler(deps.modelRouteService, deps.idResolver, deps.idMapper)
	feedbackHandler := feedback.NewHandler(deps.feedbackService)

	httpServer := transporthttp.NewRouter(transporthttp.RouterConfig{
		Addr: deps.config.HTTPAddr,
		Middlewares: []hertzapp.HandlerFunc{
			middleware.Recover(),
			middleware.RequestID(),
			middleware.AccessLog(),
			middleware.CORS(buildCORSAllowedOrigins(cfg)),
		},
		Root: []transporthttp.RouteRegistrar{
			transporthttp.RouteRegistrarFunc(systemHandler.RegisterRootRoutes),
			transporthttp.RouteRegistrarFunc(loginHandler.RegisterRootRoutes),
		},
		V1: []transporthttp.RouteRegistrar{
			systemHandler,
			loginHandler,
			imageCatalog,
			videoCatalog,
			audioCatalog,
			musicCatalog,
			transporthttp.RouteRegistrarFunc(func(group *route.RouterGroup) {
				protected := group.Group("", buildAuthMiddleware(deps.config, deps.apiKeyService, deps.identityTokens), middleware.RateLimit(deps.rateLimiter, deps.rateLimitResolver), middleware.FeatureGate(featureProvider))
				systemHandler.RegisterProtectedRoutes(protected)
				loginHandler.RegisterProtectedRoutes(protected)
				imageHandler.RegisterRoutes(protected)
				videoHandler.RegisterRoutes(protected)
				musicHandler.RegisterRoutes(protected)
				modelRouteHandler.RegisterRoutes(protected)
				driveHandler.RegisterRoutes(protected)
				pageHandler.RegisterRoutes(protected)
				capHandler.RegisterRoutes(protected)
				feedbackHandler.RegisterRoutes(protected)
			}),
		},
	})

	return &Server{config: cfg, buildInfo: info, httpServer: httpServer}
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
		feature.MusicGenerate: hasMusicExecutionProvider(cfg),
		feature.MusicModels:   hasCatalogProvider(cfg),
		feature.Drive:         true,
		feature.Page:          true,
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
	catalogRepo, modelRouteRepo := buildCatalogAndModelRouteRepos(cfg)
	catalogService := catalogapp.NewService(catalogRepo)
	modelRouteService := modelrouteapp.NewService(modelRouteRepo)
	capProvider := buildCapabilitiesProvider(cfg)
	cloudObjectStore := buildCloudObjectStorage(cfg)
	capGetExpiry := time.Duration(cfg.CloudS3.PresignGetExpiry) * time.Second
	imageExecutionClient := buildImageExecutionClient(cfg)
	videoExecutionClient := buildVideoExecutionClient(cfg)
	musicExecutionClient := buildMusicExecutionClient(cfg)
	creditClient := buildCreditClient(cfg)
	paymentClient := buildPaymentClient(cfg)
	creditPacks := buildCreditPackSpecs(cfg.CreditPacks)

	switch cfg.RuntimeMode {
	case "", "stub":
		apiKeys := apikey.NewMemoryService()
		callLogs := calllog.NewMemoryCallLogRepo()
		usageRepo := usage.NewMemoryRepo()
		loginSessions := loginsession.NewMemoryLoginSessionRepo()
		users := userstore.NewMemoryProvisioner()
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, apiKeys)
		systemService.SetUserReader(users)
		systemService.SetCreditClient(creditClient)
		systemService.SetPaymentClient(paymentClient)
		systemService.SetCallLogRepo(callLogs)
		systemService.SetCreditPacks(creditPacks)
		systemService.SetUsageReader(usageRepo)
		imageService := imageapp.NewService(catalogRepo, imageExecutionClient, creditClient, callLogs)
		imageService.SetUsageWriter(usageRepo)
		videoService := videoapp.NewService(catalogRepo, videoExecutionClient, creditClient, callLogs)
		videoService.SetUsageWriter(usageRepo)
		musicService := musicapp.NewService(catalogRepo, musicExecutionClient, creditClient, callLogs)
		musicService.SetUsageWriter(usageRepo)
		capService := capapp.NewService(capProvider, cloudObjectStore, capapp.WithPresignGetExpiry(capGetExpiry))
		return serverDependencies{
			config:              cfg,
			buildInfo:           info,
			systemService:       systemService,
			loginService:        loginapp.NewService(users, creditClient, apiKeys, loginSessions, buildDeviceVerificationURL(cfg), nil, nil, nil, nil, cfg.LoginAPIKeyTTL, cfg.Credit.SignupRewardDeadline),
			imageService:        imageService,
			videoService:        videoService,
			musicService:        musicService,
			spaceService:        nil,
			driveService:        nil,
			pageService:         nil,
			catalogService:      catalogService,
			modelRouteService:   modelRouteService,
			capabilitiesService: capService,
			feedbackService:     feedbackapp.NewService(feedbackstore.NewMemoryFeedbackRepo(), buildFeedbackNotifier(cfg), cfg.AppEnv),
			apiKeyService:       apiKeys,
			identityTokens:      buildIdentityTokenAuthenticator(cfg, users),
			rateLimiter:         ratelimit.NewInMemoryLimiter(),
			usageSyncWorker:     nil,
			paymentEventsWorker: nil,
			rateLimitResolver:   config.NewRateLimitProvider(cfg),
			idResolver:          idresolver.PassthroughIDResolver{},
			idMapper:            presenter.PassthroughIDMapper{},
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
		spaceRepo := postgres.NewSpaceRepo(db)
		spaceService := spaceapp.NewService(spaceRepo)
		driveNodeRepo := postgres.NewDriveNodeRepo(db)
		driveShareRepo := postgres.NewDriveShareRepo(db)
		uploadSessionRepo := postgres.NewUploadSessionRepo(db)
		storageObjectRepo := postgres.NewStorageObjectRepo(db)
		pageSiteRepo := postgres.NewPageSiteRepo(db)
		pageSlugRepo := postgres.NewPageSlugRepo(db)
		pageVersionRepo := postgres.NewPageVersionRepo(db)
		kvSyncJobRepo := postgres.NewKVSyncJobRepo(db)
		kvClient := buildKVSyncClient(cfg)
		edgeGrantStore := buildEdgeGrantStore(cfg)
		driveProjector := kvsync.NewDriveProjector(kvClient, driveNodeRepo, driveShareRepo)
		pageProjector := kvsync.NewPageProjector(kvClient, pageSiteRepo, pageVersionRepo, cfg.PageHostFormat)
		kvSyncWorker := kvsync.NewWorker(kvSyncJobRepo, map[string]kvsync.Projector{
			model.KVSyncJobTypeDriveFileMetaSync:    driveProjector,
			model.KVSyncJobTypeDriveDirChildrenSync: driveProjector,
			model.KVSyncJobTypeDriveDirMetaSync:     driveProjector,
			model.KVSyncJobTypeDriveShareSync:       driveProjector,
			model.KVSyncJobTypeDriveDirTreeDelete:   driveProjector,
			model.KVSyncJobTypePageHostSync:         pageProjector,
			model.KVSyncJobTypePageHostDelete:       pageProjector,
		}, kvsync.WorkerConfig{
			WorkerID:     "anycap-server",
			PollInterval: cfg.KVSyncPollInterval,
			LockTTL:      cfg.KVSyncLockTTL,
		})
		kvSyncWaiter := kvsync.NewWaiter(kvSyncJobRepo, kvsync.WaiterConfig{
			Timeout: cfg.KVSyncWaitTimeout,
		})
		var driveKVSyncOption driveapp.ServiceOption
		var pageKVSyncOption pageapp.ServiceOption
		if cfg.KVSyncEnabled {
			driveKVSyncOption = driveapp.WithKVSync(kvSyncJobRepo, kvSyncWaiter, cfg.KVSyncWaitEnabled)
			pageKVSyncOption = pageapp.WithKVSync(kvSyncJobRepo, kvSyncWaiter, cfg.KVSyncWaitEnabled)
		}
		apiKeyRepo := apikey.NewAPIKeyRepo(db)
		loginSessionRepo := loginsession.NewLoginSessionRepo(db)
		callLogs := calllog.NewCallLogDBRepo(db)
		usageRepo := usage.NewRepo(db)
		users := userstore.NewProvisioner(db)
		apiKeyService := auth.NewRepositoryAPIKeyService(apiKeyRepo, users, nil, nil)
		systemService := systemapp.NewService(cfg.AppName, cfg.AppEnv, cfg.RuntimeMode, info, apiKeyService)
		systemService.SetUserReader(users)
		systemService.SetCreditClient(creditClient)
		systemService.SetPaymentClient(paymentClient)
		systemService.SetCallLogRepo(callLogs)
		systemService.SetCreditPacks(creditPacks)
		systemService.SetUsageReader(usageRepo)
		var externalIDMapper interface {
			idresolver.IDResolver
			presenter.IDMapper
		}
		if shouldBypassAuthForLocalTest(cfg) {
			log.Println("external-id: using passthrough mapper (bypass auth enabled)")
			externalIDMapper = passthroughIDMapperResolver{}
		} else {
			externalIDMapper = idresolver.NewPostgresExternalIDMapper(db)
		}
		capsUploadRepo := postgres.NewCapsUploadRepo(db)
		capsTaskRepo := postgres.NewCapsTaskRepo(db)
		capsTaskArtifactRepo := postgres.NewCapsTaskArtifactRepo(db)
		capService := capapp.NewService(
			capProvider,
			cloudObjectStore,
			capapp.WithAudit(spaceService, capsUploadRepo, storageObjectRepo, capsTaskRepo, capsTaskArtifactRepo),
			capapp.WithPresignGetExpiry(capGetExpiry),
		)
		redisClient := ratelimit.NewRedisClient(cfg.RedisAddr, cfg.RedisUsername, cfg.RedisPassword, cfg.RedisDB)
		imageService := imageapp.NewService(catalogRepo, imageExecutionClient, creditClient, callLogs)
		imageService.SetUsageWriter(usageRepo)
		imageService.SetUploadRefResolver(capService)
		videoService := videoapp.NewService(catalogRepo, videoExecutionClient, creditClient, callLogs)
		videoService.SetUsageWriter(usageRepo)
		videoService.SetUploadRefResolver(capService)
		musicService := musicapp.NewService(catalogRepo, musicExecutionClient, creditClient, callLogs)
		musicService.SetUsageWriter(usageRepo)
		var usageSyncWorker *usageapp.Worker
		if cfg.UsageSyncEnabled && hasImageExecutionProvider(cfg) {
			usageSyncWorker = usageapp.NewWorker(
				usageapp.NewService(usageRepo, imageExecutionClient),
				usageapp.WorkerConfig{
					PollInterval: cfg.UsageSyncPollInterval,
					BatchSize:    cfg.UsageSyncBatchSize,
				},
			)
		}
		var paymentEventsWorker *paymenteventsinfra.Worker
		if cfg.PaymentEvents.Enabled {
			if !cfg.PaymentEvents.Configured() {
				return serverDependencies{}, fmt.Errorf("payment events mq is enabled but not fully configured")
			}
			receiptRepo := paymenteventsinfra.NewRepo(db)
			billingEventsService := billingeventsapp.NewService(receiptRepo, billingeventsapp.Config{
				BizID: cfg.PaymentEvents.BizID,
			})
			handler := paymenteventsinfra.NewMessageHandler(billingEventsService)
			worker, err := paymenteventsinfra.NewWorker(paymenteventsinfra.NewWorkerConfig(cfg.PaymentEvents), handler)
			if err != nil {
				return serverDependencies{}, err
			}
			paymentEventsWorker = worker
		}
		return serverDependencies{
			config:        cfg,
			buildInfo:     info,
			systemService: systemService,
			loginService:  loginapp.NewService(users, creditClient, apiKeyService, loginSessionRepo, buildDeviceVerificationURL(cfg), nil, nil, nil, nil, cfg.LoginAPIKeyTTL, cfg.Credit.SignupRewardDeadline),
			imageService:  imageService,
			videoService:  videoService,
			musicService:  musicService,
			spaceService:  spaceService,
			driveService: driveapp.NewService(
				spaceService,
				driveNodeRepo,
				driveapp.WithUpload(uploadSessionRepo, storageObjectRepo, cloudObjectStore),
				driveapp.WithShare(driveShareRepo, cfg.PasswordPepper, cfg.DriveShareBaseURL),
				driveapp.WithEdgeAccess(edgeGrantStore, cfg.DriveAccessTTLSeconds, deriveDriveAccessBaseURL(cfg.DriveShareBaseURL)),
				driveKVSyncOption,
			),
			pageService: pageapp.NewService(
				spaceService,
				pageSiteRepo,
				pageSlugRepo,
				cfg.PasswordPepper,
				pageapp.WithVersioning(pageVersionRepo, uploadSessionRepo, storageObjectRepo, cloudObjectStore),
				pageapp.WithPageHostFormat(cfg.PageHostFormat),
				pageapp.WithPreviewHost(edgeGrantStore, cfg.PagePreviewHostFormat, cfg.PagePreviewTTLSeconds),
				pageKVSyncOption,
			),
			catalogService:      catalogService,
			modelRouteService:   modelRouteService,
			capabilitiesService: capService,
			feedbackService:     feedbackapp.NewService(feedbackstore.NewFeedbackDBRepo(db), buildFeedbackNotifier(cfg), cfg.AppEnv),
			apiKeyService:       apiKeyService,
			identityTokens:      buildIdentityTokenAuthenticator(cfg, users),
			rateLimiter:         ratelimit.NewRedisLimiter(redisClient),
			usageSyncWorker:     usageSyncWorker,
			paymentEventsWorker: paymentEventsWorker,
			rateLimitResolver:   config.NewRateLimitProvider(cfg),
			idResolver:          externalIDMapper,
			idMapper:            externalIDMapper,
			kvSyncWorker: func() *kvsync.Worker {
				if cfg.KVSyncEnabled {
					return kvSyncWorker
				}
				return nil
			}(),
		}, nil
	default:
		return serverDependencies{}, fmt.Errorf("unsupported runtime mode: %s", cfg.RuntimeMode)
	}
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
	if shouldBypassAuthForLocalTest(cfg) {
		log.Println("credit: using stub (bypass auth enabled, skipping real billing)")
		return credit.NewStubClient(nil)
	}
	if cfg.Credit.Enabled() {
		log.Printf("credit: using credit service at %s", cfg.Credit.BaseURL)
		return credit.NewHTTPClient(cfg.Credit, nil)
	}
	log.Println("credit: using stub (set ANYCAP_CREDIT_* env vars for real credit)")
	return credit.NewStubClient(nil)
}

func buildPaymentClient(cfg config.Config) port.PaymentClient {
	if cfg.Payment.Enabled() {
		log.Printf("payment: using payment service at %s", cfg.Payment.BaseURL)
		return paymentinfra.NewHTTPClient(cfg.Payment, nil)
	}
	log.Println("payment: using stub (set ANYCAP_PAYMENT_* env vars for real payment)")
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

func buildCloudObjectStorage(cfg config.Config) port.CloudObjectStore {
	if cfg.CloudS3.Enabled() {
		s3Client, err := s3store.NewClient(context.Background(), cfg.CloudS3)
		if err != nil {
			log.Printf("cloud-storage: failed to initialize S3 client, falling back to stub: %v", err)
			return s3store.NewStubClient()
		}
		log.Printf("cloud-storage: using S3 at %s (bucket=%s)", cfg.CloudS3.Endpoint, cfg.CloudS3.Bucket)
		return s3Client
	}
	log.Println("cloud-storage: using stub (set ANYCAP_CLOUD_S3_* env vars for real storage)")
	return s3store.NewStubClient()
}

func buildKVSyncClient(cfg config.Config) kvsync.KVClient {
	client, err := buildCloudflareKVClient(cfg)
	if err == nil {
		log.Printf("kvsync: using cloudflare kv namespace %s", cfg.CloudflareKV.NamespaceID)
		return client
	}
	if cfg.CloudflareKV.Enabled() {
		log.Printf("kvsync: failed to initialize cloudflare kv client, using noop client: %v", err)
	}
	log.Println("kvsync: using noop kv client (set ANYCAP_CLOUDFLARE_* env vars for real KV)")
	return kvsync.NewNoopKVClient()
}

func buildEdgeGrantStore(cfg config.Config) port.EdgeGrantStore {
	client, err := buildCloudflareKVClient(cfg)
	if err == nil {
		log.Printf("edge-grant: using cloudflare kv namespace %s", cfg.CloudflareKV.NamespaceID)
		return edgegrant.NewKVStore(client)
	}
	if cfg.CloudflareKV.Enabled() {
		log.Printf("edge-grant: failed to initialize cloudflare kv client, using unavailable store: %v", err)
	} else {
		log.Println("edge-grant: unavailable store (set ANYCAP_CLOUDFLARE_* env vars for preview/access grants)")
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
	catalogRepo, _ := buildCatalogAndModelRouteRepos(cfg)
	return catalogRepo
}

func buildCatalogAndModelRouteRepos(cfg config.Config) (port.CatalogRepository, port.ModelRouteRepository) {
	platformBaseURL := cfg.ResolvedNexusHubPlatformBaseURL()
	platformToken := cfg.ResolvedNexusHubPlatformToken()
	modelRouteUnavailableMessage := "model-routes: postgres is not configured; admin CRUD endpoints will be unavailable"
	if cfg.PGDSN != "" {
		repo, err := newCatalogRepoFromDSN(context.Background(), cfg.PGDSN)
		if err != nil {
			log.Printf("catalog: failed to initialize postgres repo, falling back: %v", err)
			modelRouteUnavailableMessage = "model-routes: postgres repo unavailable; admin CRUD endpoints will be unavailable"
		} else {
			if platformBaseURL != "" {
				log.Printf("catalog: using postgres anycap_model_routes table with nexushub schema enrichment via %s", platformBaseURL)
				return nexushub.NewCatalogSchemaEnricher(
					repo,
					nexushub.NewPlatformClient(nexushub.PlatformClientConfig{
						BaseURL: platformBaseURL,
						Token:   platformToken,
					}),
				), repo
			}

			log.Println("catalog: using postgres anycap_model_routes table without schema enrichment")
			return repo, repo
		}
	}

	log.Println(modelRouteUnavailableMessage)
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
		}), nil
	}

	log.Printf("catalog: using nexushub platform at %s", platformBaseURL)
	return nexushub.NewPlatformClient(nexushub.PlatformClientConfig{BaseURL: platformBaseURL, Token: platformToken}), nil
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

func buildVideoExecutionClient(cfg config.Config) port.NexusHubClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasVideoExecutionProvider(cfg) {
		log.Printf("video-execution: using nexushub client at %s", coreBaseURL)
		return nexushub.NewClient(nexushub.ClientConfig{
			BaseURL: coreBaseURL,
			Token:   coreToken,
		})
	}

	log.Println("video-execution: using stub client (set NEXUSHUB_CORE_BASE_URL/NEXUSHUB_CORE_TOKEN or legacy NEXUSHUB_BASE_URL/NEXUSHUB_TOKEN for real generation)")
	return nexushub.NewStubClient()
}

func buildMusicExecutionClient(cfg config.Config) port.NexusHubClient {
	coreBaseURL := cfg.ResolvedNexusHubCoreBaseURL()
	coreToken := cfg.ResolvedNexusHubCoreToken()

	if hasMusicExecutionProvider(cfg) {
		log.Printf("music-execution: using nexushub client at %s", coreBaseURL)
		return nexushub.NewClient(nexushub.ClientConfig{
			BaseURL: coreBaseURL,
			Token:   coreToken,
		})
	}

	log.Println("music-execution: using stub client (set NEXUSHUB_CORE_BASE_URL/NEXUSHUB_CORE_TOKEN or legacy NEXUSHUB_BASE_URL/NEXUSHUB_TOKEN for real generation)")
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

func buildAuthMiddleware(cfg config.Config, apiKeys port.APIKeyService, identityTokens port.IdentityTokenAuthenticator) hertzapp.HandlerFunc {
	if shouldBypassAuthForLocalTest(cfg) {
		principal := buildBypassPrincipal()
		log.Printf("auth: bypass enabled for local testing with user_id=%s", principal.UserID)
		return middleware.LocalBypassAuth(principal)
	}
	return middleware.Auth(apiKeys, identityTokens)
}

func buildIdentityTokenAuthenticator(cfg config.Config, users port.UserProvisioner) port.IdentityTokenAuthenticator {
	if !cfg.Auth0Enabled || users == nil {
		return nil
	}
	return auth.NewIdentityTokenAuthenticator(auth.NewJWTVerifier(auth.JWTVerifierConfig{
		Issuer:   cfg.Auth0Issuer,
		Audience: cfg.Auth0Audience,
	}, nil), users, nil)
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
	log.Printf("%s listening on %s (env=%s version=%s)", s.config.AppName, s.config.HTTPAddr, s.config.AppEnv, s.buildInfo.Version)
	s.httpServer.Spin()
}

func buildModelRouteRepo(cfg config.Config) port.ModelRouteRepository {
	_, modelRouteRepo := buildCatalogAndModelRouteRepos(cfg)
	return modelRouteRepo
}
