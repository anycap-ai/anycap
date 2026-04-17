package app

import (
	"context"
	"strings"
	"testing"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"
)

func TestBuildServerDependencies_StubMode(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.apiKeyService == nil || deps.imageService == nil || deps.loginService == nil {
		t.Fatal("expected stub dependencies to be initialized")
	}
	if deps.rateLimitResolver == nil {
		t.Fatal("expected rate limit resolver to be initialized")
	}
	if got := deps.rateLimitResolver.ResolveCapabilityRateLimitRPM("image.generate"); got != 60 {
		t.Fatalf("expected default rate limit resolver value 60, got %d", got)
	}
}

func TestBuildFixedRunnerResolver_ResolvesConfiguredBotToRunner(t *testing.T) {
	resolver := buildFixedRunnerResolver(config.Config{
		AgentControl: config.AgentControlConfig{
			FixedRunners: []config.AgentControlFixedRunnerConfig{
				{
					Platform: "feishu",
					BotID:    "cli_bot",
					RunnerID: "21",
				},
			},
		},
	}, idresolver.PassthroughIDResolver{})
	if resolver == nil {
		t.Fatal("expected fixed runner resolver")
	}

	id, err := resolver(model.IMPlatformFeishu, "cli_bot")
	if err != nil {
		t.Fatalf("resolver() error = %v", err)
	}
	if id != 21 {
		t.Fatalf("expected runner id 21, got %d", id)
	}
}

func TestBuildFeishuAdapter_ReturnsNilWhenConfigMissing(t *testing.T) {
	if adapter := buildFeishuAdapter(config.Config{}); adapter != nil {
		t.Fatalf("expected nil adapter when config missing, got %T", adapter)
	}
}

func TestBuildFeishuAdapter_ReturnsAdapterWhenConfigured(t *testing.T) {
	adapter := buildFeishuAdapter(config.Config{
		AgentControl: config.AgentControlConfig{
			Feishu: config.AgentControlFeishuConfig{
				VerificationToken: "verify_token",
				EncryptKey:        "encrypt_key",
				ReplyAPI:          "https://reply.anycap.dev",
			},
		},
	})
	if adapter == nil {
		t.Fatal("expected configured feishu adapter")
	}
}

func TestBuildFeishuAdapter_ReturnsAdapterWhenDirectAPIConfigured(t *testing.T) {
	adapter := buildFeishuAdapter(config.Config{
		AgentControl: config.AgentControlConfig{
			Feishu: config.AgentControlFeishuConfig{
				AppID:     "cli_appid",
				AppSecret: "cli_secret",
			},
		},
	})
	if adapter == nil {
		t.Fatal("expected configured feishu adapter")
	}
}

func TestBuildLegacyFeishuLongConnBot_ReturnsNilEvenWhenConfigured(t *testing.T) {
	bot := buildLegacyFeishuLongConnBot(
		config.Config{
			AgentControl: config.AgentControlConfig{
				Feishu: config.AgentControlFeishuConfig{
					AppID:           "cli_appid",
					AppSecret:       "cli_secret",
					LongConnEnabled: true,
				},
			},
		},
		&agentcontrolapp.BindingService{},
		&agentcontrolapp.ConversationService{},
		buildFeishuAdapter(config.Config{
			AgentControl: config.AgentControlConfig{
				Feishu: config.AgentControlFeishuConfig{
					AppID:     "cli_appid",
					AppSecret: "cli_secret",
				},
			},
		}),
	)
	if bot != nil {
		t.Fatalf("expected legacy feishu long connection bot to be disabled, got %T", bot)
	}
}

func TestDescribePaymentEventsConfig(t *testing.T) {
	got := describePaymentEventsConfig(config.PaymentEventsConfig{
		Enabled:       true,
		Topic:         "payment-events",
		ConsumerGroup: "GID-anycap-dev-payment-events",
		BizID:         "anycap",
		Tags:          []string{"credits_granted", "payment_failed"},
	})

	if !strings.Contains(got, "enabled=true") {
		t.Fatalf("expected enabled flag in description, got %q", got)
	}
	if !strings.Contains(got, "topic=payment-events") {
		t.Fatalf("expected topic in description, got %q", got)
	}
	if !strings.Contains(got, "group=GID-anycap-dev-payment-events") {
		t.Fatalf("expected consumer group in description, got %q", got)
	}
	if !strings.Contains(got, "biz_id=anycap") {
		t.Fatalf("expected biz_id in description, got %q", got)
	}
	if !strings.Contains(got, "tags=credits_granted,payment_failed") {
		t.Fatalf("expected tags in description, got %q", got)
	}
}

func TestBuildServerDependencies_IntegrationModeUsesComposableInfra(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "integration",
		PGDSN:        "postgres://demo",
		RedisAddr:    "127.0.0.1:6379",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.apiKeyService == nil || deps.rateLimiter == nil {
		t.Fatal("expected integration dependencies to be initialized")
	}
}

func TestBuildServerDependencies_PaymentEventsEnabledRequiresCompleteConfig(t *testing.T) {
	_, err := buildServerDependencies(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "integration",
		PGDSN:        "postgres://demo",
		RedisAddr:    "127.0.0.1:6379",
		RateLimitRPM: 60,
		PaymentEvents: config.PaymentEventsConfig{
			Enabled: true,
			Topic:   "payment-events",
		},
	}, buildinfo.Info{Version: "dev"})
	if err == nil {
		t.Fatal("expected error when payment events config is incomplete")
	}
}

func TestBuildSharedComposition_InitializesSharedServices(t *testing.T) {
	shared := buildSharedComposition(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})

	if shared.catalogService == nil {
		t.Fatal("expected catalog service")
	}
	if shared.modelRouteService == nil {
		t.Fatal("expected model route service")
	}
	if shared.creditClient == nil {
		t.Fatal("expected credit client")
	}
	if shared.paymentClient == nil {
		t.Fatal("expected payment client")
	}
}

func TestBuildStubAuthComposition_InitializesLoginAndPassthroughIDs(t *testing.T) {
	shared := buildSharedComposition(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})

	authComp := buildStubAuthComposition(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, shared)

	if authComp.loginService == nil {
		t.Fatal("expected login service")
	}
	if authComp.apiKeyService == nil {
		t.Fatal("expected api key service")
	}
	if _, ok := authComp.idResolver.(idresolver.PassthroughIDResolver); !ok {
		t.Fatalf("expected passthrough id resolver, got %T", authComp.idResolver)
	}
	if _, ok := authComp.idMapper.(presenter.PassthroughIDMapper); !ok {
		t.Fatalf("expected passthrough id mapper, got %T", authComp.idMapper)
	}
}

func TestBuildStubBillingComposition_InitializesBillingAndUsage(t *testing.T) {
	billingComp := buildStubBillingComposition(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildSharedComposition(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"}))

	if billingComp.billingService == nil {
		t.Fatal("expected billing service")
	}
	if billingComp.callLogs == nil {
		t.Fatal("expected call log repo")
	}
	if billingComp.usageWriter == nil {
		t.Fatal("expected usage writer")
	}
}

func TestNewServer_UsesSingleSharedPostgresRepoForCatalogAndModelRoutes(t *testing.T) {
	original := newCatalogRepoFromDSN
	callCount := 0
	newCatalogRepoFromDSN = func(context.Context, string) (*postgres.CatalogRepo, error) {
		callCount++
		return &postgres.CatalogRepo{}, nil
	}
	t.Cleanup(func() {
		newCatalogRepoFromDSN = original
	})

	_ = NewServer(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		PGDSN:        "postgres://demo",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})

	if callCount != 1 {
		t.Fatalf("expected postgres repo to be initialized once, got %d", callCount)
	}
}

func TestBuildCatalogRepo_UsesSchemaEnricherWhenPostgresAndNexusHubAreConfigured(t *testing.T) {
	original := newCatalogRepoFromDSN
	newCatalogRepoFromDSN = func(context.Context, string) (*postgres.CatalogRepo, error) {
		return &postgres.CatalogRepo{}, nil
	}
	t.Cleanup(func() {
		newCatalogRepoFromDSN = original
	})

	repo := buildCatalogRepo(config.Config{
		PGDSN:           "postgres://demo",
		NexusHubBaseURL: "http://localhost:8080",
	})

	if _, ok := repo.(*nexushub.CatalogSchemaEnricher); !ok {
		t.Fatalf("expected catalog schema enricher, got %T", repo)
	}
}

func TestBuildCatalogRepo_UsesPostgresDirectlyWhenNexusHubIsNotConfigured(t *testing.T) {
	original := newCatalogRepoFromDSN
	newCatalogRepoFromDSN = func(context.Context, string) (*postgres.CatalogRepo, error) {
		return &postgres.CatalogRepo{}, nil
	}
	t.Cleanup(func() {
		newCatalogRepoFromDSN = original
	})

	repo := buildCatalogRepo(config.Config{PGDSN: "postgres://demo"})

	if _, ok := repo.(*postgres.CatalogRepo); !ok {
		t.Fatalf("expected postgres catalog repo without enrichment, got %T", repo)
	}
}

func TestBuildCatalogRepo_FallsBackToNexusHubWhenPostgresNotConfigured(t *testing.T) {
	repo := buildCatalogRepo(config.Config{
		NexusHubBaseURL: "http://localhost:8080",
	})

	if _, ok := repo.(*nexushub.PlatformClient); !ok {
		t.Fatalf("expected nexushub platform client, got %T", repo)
	}
}

func TestBuildServerFeatures_DriveAndPageEnabledByDefault(t *testing.T) {
	features := buildServerFeatures(config.Config{})
	if !features[feature.Drive] {
		t.Fatal("expected drive feature enabled by default")
	}
	if !features[feature.Page] {
		t.Fatal("expected page feature enabled by default")
	}
}

func TestBuildServerDependencies_Auth0EnabledUsesRealClient(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:          "anycap-server",
		AppEnv:           "test",
		HTTPAddr:         ":0",
		RuntimeMode:      "stub",
		RateLimitRPM:     60,
		Auth0Enabled:     true,
		Auth0Issuer:      "https://example.auth0.com/",
		Auth0Audience:    "https://api.anycap.local",
		Auth0RedirectURL: "https://anycap.local/auth/callback",
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}

	result, err := deps.loginService.Init(context.Background(), model.LoginFlowBrowserPoll)
	if err != nil {
		t.Fatalf("loginService.Init() error = %v", err)
	}
	if !strings.Contains(result.BrowserURL, "https://anycap.local/auth/cli-login") {
		t.Fatalf("expected browser login URL on auth redirect host, got %q", result.BrowserURL)
	}
}

func TestBuildServerDependencies_Auth0EnabledBuildsIdentityTokenAuthenticator(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:          "anycap-server",
		AppEnv:           "test",
		HTTPAddr:         ":0",
		RuntimeMode:      "stub",
		RateLimitRPM:     60,
		Auth0Enabled:     true,
		Auth0Issuer:      "https://example.auth0.com/",
		Auth0Audience:    "https://api.anycap.local",
		Auth0RedirectURL: "https://anycap.local/auth/callback",
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.identityTokens == nil {
		t.Fatal("expected identity token authenticator when Auth0 is enabled")
	}
}

func TestBuildServerDependencies_Auth0DisabledDoesNotBuildIdentityTokenAuthenticator(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.identityTokens != nil {
		t.Fatalf("expected identity token authenticator to be nil, got %T", deps.identityTokens)
	}
}

func TestBuildDeviceVerificationURL_UsesAuth0RedirectHost(t *testing.T) {
	got := buildDeviceVerificationURL(config.Config{
		Auth0RedirectURL: "https://anycap.ai/auth/callback",
	})
	if got != "https://anycap.ai/auth/device" {
		t.Fatalf("expected https://anycap.ai/auth/device, got %q", got)
	}
}

func TestBuildDeviceVerificationURL_FallsBackWhenRedirectURLMissing(t *testing.T) {
	got := buildDeviceVerificationURL(config.Config{})
	if got != "https://anycap.local/auth/device" {
		t.Fatalf("expected fallback device url, got %q", got)
	}
}

func TestBuildCORSAllowedOrigins_IncludesRedirectOriginAndLocalDevOrigins(t *testing.T) {
	got := buildCORSAllowedOrigins(config.Config{
		AppEnv:           "dev",
		Auth0RedirectURL: "https://preview.anycap-web.pages.dev/auth/callback",
	})

	want := map[string]bool{
		"https://preview.anycap-web.pages.dev": true,
		"https://anycap.ai":                    true,
		"http://localhost:3000":                true,
		"http://127.0.0.1:3000":                true,
	}
	for _, origin := range got {
		delete(want, origin)
	}
	if len(want) != 0 {
		t.Fatalf("missing expected origins: %#v got=%v", want, got)
	}
}

func TestBuildCORSAllowedOrigins_OnlyIncludesValidOrigins(t *testing.T) {
	got := buildCORSAllowedOrigins(config.Config{
		AppEnv:           "prod",
		Auth0RedirectURL: "not-a-url",
	})
	if len(got) != 1 || got[0] != "https://anycap.ai" {
		t.Fatalf("expected only production anycap origin, got %v", got)
	}
}

func TestBuildServerDependencies_CreditEnabledUsesRealClient(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
		Credit: config.CreditConfig{
			BaseURL:  "https://credit.example.com",
			BizToken: "biz-token-123",
		},
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.imageService == nil {
		t.Fatal("expected image service to be initialized")
	}
}

func TestBuildCatalogRepo_UsesPlatformConfigWhenSplitEndpointsAreConfigured(t *testing.T) {
	repo := buildCatalogRepo(config.Config{
		NexusHubPlatformBaseURL: "http://platform.example.com",
	})

	if _, ok := repo.(*nexushub.PlatformClient); !ok {
		t.Fatalf("expected nexushub platform client, got %T", repo)
	}
}

func TestBuildCatalogRepo_UsesPostgresDSNWhenConfigured(t *testing.T) {
	original := newCatalogRepoFromDSN
	newCatalogRepoFromDSN = func(context.Context, string) (*postgres.CatalogRepo, error) {
		return &postgres.CatalogRepo{}, nil
	}
	t.Cleanup(func() {
		newCatalogRepoFromDSN = original
	})

	repo := buildCatalogRepo(config.Config{PGDSN: "postgres://demo:demo@localhost:5432/anycap?sslmode=disable"})

	if _, ok := repo.(*postgres.CatalogRepo); !ok {
		t.Fatalf("expected postgres catalog repo without enrichment, got %T", repo)
	}
}

func TestBuildCatalogRepo_FallsBackToNexusHubWhenNoPostgresConfigIsPresent(t *testing.T) {
	t.Setenv("ANYCAP_PG_CONFIG", "")

	repo := buildCatalogRepo(config.Config{
		NexusHubBaseURL: "http://localhost:8080",
	})

	if _, ok := repo.(*nexushub.PlatformClient); !ok {
		t.Fatalf("expected nexushub platform client, got %T", repo)
	}
}

func TestBuildImageExecutionClient_UsesCoreConfigWhenSplitEndpointsAreConfigured(t *testing.T) {
	client := buildImageExecutionClient(config.Config{
		NexusHubCoreBaseURL: "http://core.example.com",
		NexusHubCoreToken:   "core-token",
	})

	if _, ok := client.(*nexushub.Client); !ok {
		t.Fatalf("expected real nexushub execution client, got %T", client)
	}
}

func TestBuildImageExecutionClient_DoesNotUsePlatformConfigForExecution(t *testing.T) {
	client := buildImageExecutionClient(config.Config{
		NexusHubPlatformBaseURL: "http://platform.example.com",
		NexusHubPlatformToken:   "platform-token",
	})

	if _, ok := client.(*nexushub.StubClient); !ok {
		t.Fatalf("expected stub client when only platform config is set, got %T", client)
	}
}

func TestBuildCreditClient_UsesStubWhenDisabled(t *testing.T) {
	client := buildCreditClient(config.Config{})
	if _, ok := client.(*credit.StubClient); !ok {
		t.Fatalf("expected credit stub client, got %T", client)
	}
}
