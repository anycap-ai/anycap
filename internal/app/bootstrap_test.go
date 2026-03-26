package app

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
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

func TestBuildServerFeatures_LoginEnabledWhenAuth0Configured(t *testing.T) {
	features := buildServerFeatures(config.Config{Auth0Enabled: true})
	if !features[feature.Login] {
		t.Fatal("expected login feature enabled when Auth0 is enabled")
	}
}

func TestBuildServerFeatures_LoginDisabledWhenAuth0NotConfigured(t *testing.T) {
	features := buildServerFeatures(config.Config{})
	if features[feature.Login] {
		t.Fatal("expected login feature disabled when Auth0 is not enabled")
	}
}

func TestBuildServerDependencies_Auth0EnabledUsesRealClient(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:           "anycap-server",
		AppEnv:            "test",
		HTTPAddr:          ":0",
		RuntimeMode:       "stub",
		RateLimitRPM:      60,
		Auth0Enabled:      true,
		Auth0Issuer:       "https://example.auth0.com/",
		Auth0Audience:     "https://api.anycap.local",
		Auth0ClientID:     "client-123",
		Auth0ClientSecret: "secret-123",
		Auth0RedirectURL:  "https://anycap.local/auth/callback",
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}

	result, err := deps.loginService.Init(context.Background(), model.LoginFlowLocalhost, 14565, "")
	if err != nil {
		t.Fatalf("loginService.Init() error = %v", err)
	}
	if !strings.Contains(result.AuthorizeURL, "example.auth0.com/authorize") {
		t.Fatalf("expected real auth0 authorize url, got %q", result.AuthorizeURL)
	}
}

func TestBuildDeviceVerificationURL_UsesAuth0RedirectHost(t *testing.T) {
	got := buildDeviceVerificationURL(config.Config{
		Auth0RedirectURL: "https://anycap.ai/auth/callback",
	})
	if got != "https://anycap.ai/device" {
		t.Fatalf("expected https://anycap.ai/device, got %q", got)
	}
}

func TestBuildDeviceVerificationURL_FallsBackWhenRedirectURLMissing(t *testing.T) {
	got := buildDeviceVerificationURL(config.Config{})
	if got != "https://anycap.local/device" {
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
