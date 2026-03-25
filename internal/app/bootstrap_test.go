package app

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
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
