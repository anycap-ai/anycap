package config

import (
	"testing"
	"time"
)

func TestLoadFromEnv_DevModeRequiresDiscreteInfraConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_HOST", "")
	t.Setenv("ANYCAP_REDIS_HOST", "")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error when dev infra config missing")
	}
}

func TestLoadFromEnv_DevModeBuildsDiscreteInfraConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_PORT", "5432")
	t.Setenv("ANYCAP_PG_USER", "kntech")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")
	t.Setenv("ANYCAP_PG_DATABASE", "postgres")
	t.Setenv("ANYCAP_PG_TIMEZONE", "UTC")
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
	if cfg.PGTimezone != "UTC" {
		t.Fatalf("expected postgres timezone UTC, got %q", cfg.PGTimezone)
	}
	if cfg.RedisAddr != "redis.example.com:6379" {
		t.Fatalf("expected redis addr to be derived, got %q", cfg.RedisAddr)
	}
	if cfg.RedisUsername != "default" {
		t.Fatalf("expected redis username default, got %q", cfg.RedisUsername)
	}
}

func TestLoadFromEnv_DevModeReadsAutoMigrate(t *testing.T) {
	clearLegacyPGConfig(t)
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

func TestLoadFromEnv_ReadsLoginAPIKeyTTL(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_LOGIN_API_KEY_TTL", "72h")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.LoginAPIKeyTTL != 72*time.Hour {
		t.Fatalf("expected login api key ttl 72h, got %v", cfg.LoginAPIKeyTTL)
	}
}

func TestLoadFromEnv_ReadsCreditConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_CREDIT_BASE_URL", "https://credit.example.com")
	t.Setenv("ANYCAP_CREDIT_BIZ_TOKEN", "biz-token-123")
	t.Setenv("ANYCAP_CREDIT_TIMEOUT_SECONDS", "15")
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_ENABLED", "true")
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_DEADLINE", "2026-04-10T23:59:59Z")
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_TYPE", "REWARD")
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_SUBTYPE", "SIGNUP_BONUS")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.Credit.BaseURL != "https://credit.example.com" {
		t.Fatalf("expected credit base url, got %q", cfg.Credit.BaseURL)
	}
	if cfg.Credit.BizToken != "biz-token-123" {
		t.Fatalf("expected credit biz token, got %q", cfg.Credit.BizToken)
	}
	if cfg.Credit.Timeout != 15*time.Second {
		t.Fatalf("expected credit timeout 15s, got %v", cfg.Credit.Timeout)
	}
	if !cfg.Credit.SignupRewardEnabled {
		t.Fatal("expected signup reward to be enabled")
	}
	if got := cfg.Credit.SignupRewardDeadline; !got.Equal(time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC)) {
		t.Fatalf("expected signup reward deadline to be parsed, got %v", got)
	}
	if cfg.Credit.SignupRewardPackageType != "REWARD" {
		t.Fatalf("expected signup reward package type, got %q", cfg.Credit.SignupRewardPackageType)
	}
	if cfg.Credit.SignupRewardPackageSubtype != "SIGNUP_BONUS" {
		t.Fatalf("expected signup reward package subtype, got %q", cfg.Credit.SignupRewardPackageSubtype)
	}
}

func TestLoadFromEnv_InvalidSignupRewardDeadline(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_DEADLINE", "2026/04/10")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected invalid signup reward deadline to fail")
	}
}

func TestLoadFromEnv_SignupRewardDisabledByDefault(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_CREDIT_BASE_URL", "https://credit.example.com")
	t.Setenv("ANYCAP_CREDIT_BIZ_TOKEN", "biz-token-123")
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_TYPE", "REWARD")
	t.Setenv("ANYCAP_CREDIT_SIGNUP_REWARD_PACKAGE_SUBTYPE", "SIGNUP_BONUS")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.Credit.SignupRewardEnabled {
		t.Fatal("expected signup reward to be disabled by default")
	}
}

func TestLoadFromEnv_AllowsPostgresDSNWithoutDiscreteFields(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_DSN", "postgres://demo:secret@pg.example.com:5432/postgres?sslmode=require")
	t.Setenv("ANYCAP_PG_HOST", "")
	t.Setenv("ANYCAP_PG_USER", "")
	t.Setenv("ANYCAP_PG_PASSWORD", "")
	t.Setenv("ANYCAP_REDIS_HOST", "redis.example.com")
	t.Setenv("ANYCAP_REDIS_PASSWORD", "secret")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PGDSN == "" {
		t.Fatal("expected postgres dsn to be preserved")
	}
}

func TestLoadFromEnv_AllowsRedisAddrWithoutDiscreteFields(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_USER", "demo")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")
	t.Setenv("ANYCAP_REDIS_ADDR", "redis.example.com:6379")
	t.Setenv("ANYCAP_REDIS_HOST", "")
	t.Setenv("ANYCAP_REDIS_PASSWORD", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.RedisAddr != "redis.example.com:6379" {
		t.Fatalf("expected redis addr to be preserved, got %q", cfg.RedisAddr)
	}
}

func TestLoadFromEnv_DevModeFallsBackToLegacyPGConfig(t *testing.T) {
	t.Setenv("ANYCAP_RUNTIME_MODE", "dev")
	t.Setenv("ANYCAP_PG_CONFIG", `{"Host":"legacy.example.com","Port":"5432","User":"legacy","Password":"secret","DBName":"anycap","SSLMode":"disable","TimeZone":"UTC"}`)
	t.Setenv("ANYCAP_REDIS_HOST", "redis.example.com")
	t.Setenv("ANYCAP_REDIS_PASSWORD", "secret")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PGDSN == "" {
		t.Fatal("expected postgres dsn to be derived from legacy config")
	}
}
