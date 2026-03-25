package config

import "testing"

func TestLoadFromEnv_DevModeRequiresDiscreteInfraConfig(t *testing.T) {
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_HOST", "")
	t.Setenv("ANYCAP_REDIS_HOST", "")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error when dev infra config missing")
	}
}

func TestLoadFromEnv_DevModeBuildsDiscreteInfraConfig(t *testing.T) {
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_PORT", "5432")
	t.Setenv("ANYCAP_PG_USER", "kntech")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")
	t.Setenv("ANYCAP_PG_DATABASE", "postgres")
	t.Setenv("ANYCAP_REDIS_HOST", "redis.example.com")
	t.Setenv("ANYCAP_REDIS_PORT", "6379")
	t.Setenv("ANYCAP_REDIS_USERNAME", "default")
	t.Setenv("ANYCAP_REDIS_PASSWORD", "secret")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PGDSN == "" {
		t.Fatal("expected postgres dsn to be derived")
	}
	if cfg.RedisAddr != "redis.example.com:6379" {
		t.Fatalf("expected redis addr to be derived, got %q", cfg.RedisAddr)
	}
	if cfg.RedisUsername != "default" {
		t.Fatalf("expected redis username default, got %q", cfg.RedisUsername)
	}
}

func TestLoadFromEnv_DevModeReadsAutoMigrate(t *testing.T) {
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_PORT", "5432")
	t.Setenv("ANYCAP_PG_USER", "kntech")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")
	t.Setenv("ANYCAP_REDIS_HOST", "redis.example.com")
	t.Setenv("ANYCAP_REDIS_PASSWORD", "secret")
	t.Setenv("ANYCAP_PG_AUTO_MIGRATE", "true")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if !cfg.PGAutoMigrate {
		t.Fatal("expected auto migrate to be enabled")
	}
}
