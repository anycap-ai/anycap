package app

import (
	"context"
	"database/sql"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	infraratelimit "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestBuildServerDependencies_DevModeRunsMigrationsWhenEnabled(t *testing.T) {
	originalOpenPostgres := openPostgres
	originalRunPostgresMigrations := runPostgresMigrations
	t.Cleanup(func() {
		openPostgres = originalOpenPostgres
		runPostgresMigrations = originalRunPostgresMigrations
	})

	openPostgres = func(_ string) (*sql.DB, error) {
		return &sql.DB{}, nil
	}

	called := false
	runPostgresMigrations = func(_ context.Context, _ any) error {
		called = true
		return nil
	}

	deps, err := buildServerDependencies(config.Config{
		AppName:       "anycap-server",
		AppEnv:        "dev",
		HTTPAddr:      ":0",
		RuntimeMode:   "dev",
		PGDSN:         "postgres://kntech:secret@pg.example.com:5432/postgres?sslmode=require",
		PGAutoMigrate: true,
		RedisAddr:     "redis.example.com:6379",
		RedisUsername: "default",
		RedisPassword: "secret",
		RateLimitRPM:  60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if !called {
		t.Fatal("expected migrations to run")
	}
	if _, ok := deps.rateLimiter.(*infraratelimit.RedisLimiter); !ok {
		t.Fatalf("expected redis limiter, got %T", deps.rateLimiter)
	}
}
