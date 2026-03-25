package app

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/postgres"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
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

func TestBuildCatalogRepo_PrefersPostgresWhenConfigured(t *testing.T) {
	t.Setenv("ANYCAP_PG_CONFIG", `{"Host":"localhost","Port":"5432","User":"demo","DBName":"anycap"}`)

	original := newCatalogRepoFromEnv
	newCatalogRepoFromEnv = func(context.Context) (*postgres.CatalogRepo, error) {
		return &postgres.CatalogRepo{}, nil
	}
	t.Cleanup(func() {
		newCatalogRepoFromEnv = original
	})

	repo := buildCatalogRepo(config.Config{
		NexusHubBaseURL: "http://localhost:8080",
	})

	if _, ok := repo.(*postgres.CatalogRepo); !ok {
		t.Fatalf("expected postgres catalog repo, got %T", repo)
	}
}

func TestBuildCatalogRepo_FallsBackToNexusHubWhenPostgresNotConfigured(t *testing.T) {
	t.Setenv("ANYCAP_PG_CONFIG", "")

	repo := buildCatalogRepo(config.Config{
		NexusHubBaseURL: "http://localhost:8080",
	})

	if _, ok := repo.(*nexushub.PlatformClient); !ok {
		t.Fatalf("expected nexushub platform client, got %T", repo)
	}
}
