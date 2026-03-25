package app

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	infraratelimit "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestBuildServerDependencies_DevModeUsesRealInfraAdapters(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:       "anycap-server",
		AppEnv:        "dev",
		HTTPAddr:      ":0",
		RuntimeMode:   "dev",
		PGDSN:         "postgres://kntech:secret@pg.example.com:5432/postgres?sslmode=require",
		RedisAddr:     "redis.example.com:6379",
		RedisUsername: "default",
		RedisPassword: "secret",
		RateLimitRPM:  60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.apiKeyService == nil {
		t.Fatal("expected api key service")
	}
	if _, ok := deps.rateLimiter.(*infraratelimit.RedisLimiter); !ok {
		t.Fatalf("expected redis limiter, got %T", deps.rateLimiter)
	}
}

func TestBuildServerDependencies_ProdModeUsesRealInfraAdapters(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:       "anycap-server",
		AppEnv:        "prod",
		HTTPAddr:      ":0",
		RuntimeMode:   "prod",
		PGDSN:         "postgres://kntech:secret@pg.example.com:5432/postgres?sslmode=require",
		RedisAddr:     "redis.example.com:6379",
		RedisUsername: "default",
		RedisPassword: "secret",
		RateLimitRPM:  60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.apiKeyService == nil {
		t.Fatal("expected api key service")
	}
	if _, ok := deps.rateLimiter.(*infraratelimit.RedisLimiter); !ok {
		t.Fatalf("expected redis limiter, got %T", deps.rateLimiter)
	}
}
