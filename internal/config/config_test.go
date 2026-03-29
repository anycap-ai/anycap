package config

import (
	"strings"
	"testing"
	"time"
)

func clearLegacyPGConfig(t *testing.T) {
	t.Helper()
	t.Setenv("ANYCAP_PG_CONFIG", "")
}

func TestLoadFromEnv_Defaults(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_APP_NAME", "")
	t.Setenv("ANYCAP_APP_ENV", "")
	t.Setenv("ANYCAP_HTTP_ADDR", "")
	t.Setenv("ANYCAP_RUNTIME_MODE", "")
	t.Setenv("ANYCAP_RATE_LIMIT_RPM", "")
	t.Setenv("NEXUSHUB_BASE_URL", "")
	t.Setenv("NEXUSHUB_TOKEN", "")
	t.Setenv("NEXUSHUB_PLATFORM_BASE_URL", "")
	t.Setenv("NEXUSHUB_PLATFORM_TOKEN", "")
	t.Setenv("NEXUSHUB_CORE_BASE_URL", "")
	t.Setenv("NEXUSHUB_CORE_TOKEN", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if cfg.AppName != "anycap-server" {
		t.Fatalf("expected default app name, got %q", cfg.AppName)
	}
	if cfg.HTTPAddr != ":18080" {
		t.Fatalf("expected default addr, got %q", cfg.HTTPAddr)
	}
	if cfg.RuntimeMode != "stub" {
		t.Fatalf("expected runtime mode stub, got %q", cfg.RuntimeMode)
	}
	if cfg.RateLimitRPM != 60 {
		t.Fatalf("expected default rate limit 60, got %d", cfg.RateLimitRPM)
	}
	if cfg.LoginAPIKeyTTL != 7*24*time.Hour {
		t.Fatalf("expected default login api key ttl 7d, got %v", cfg.LoginAPIKeyTTL)
	}
	if cfg.Credit.Timeout != 10*time.Second {
		t.Fatalf("expected default credit timeout 10s, got %v", cfg.Credit.Timeout)
	}
	if cfg.PasswordPepper != "" {
		t.Fatalf("expected default password pepper empty, got %q", cfg.PasswordPepper)
	}
	if cfg.PageHostFormat != "page-%s.anycap.cloud" {
		t.Fatalf("expected default page host format page-%%s.anycap.cloud, got %q", cfg.PageHostFormat)
	}
}

func TestLoadFromEnv_ReadsPasswordPepper(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_PASSWORD_PEPPER", "pepper-value")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PasswordPepper != "pepper-value" {
		t.Fatalf("expected password pepper from env, got %q", cfg.PasswordPepper)
	}
}

func TestLoadFromEnv_ReadsPageHostFormat(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_PAGE_HOST_FORMAT", "PAGEDEV-%s.ANYCAP.CLOUD")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PageHostFormat != "pagedev-%s.anycap.cloud" {
		t.Fatalf("expected normalized page host format, got %q", cfg.PageHostFormat)
	}
}

func TestLoadFromEnv_IntegrationRequiresInfra(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RUNTIME_MODE", "integration")
	t.Setenv("ANYCAP_PG_DSN", "")
	t.Setenv("ANYCAP_REDIS_ADDR", "")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error when integration infra config missing")
	}
}

func TestLoadFromEnv_ReadsSplitNexusHubConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("NEXUSHUB_BASE_URL", "http://legacy.example.com")
	t.Setenv("NEXUSHUB_TOKEN", "legacy-token")
	t.Setenv("NEXUSHUB_PLATFORM_BASE_URL", "http://platform.example.com")
	t.Setenv("NEXUSHUB_PLATFORM_TOKEN", "platform-token")
	t.Setenv("NEXUSHUB_CORE_BASE_URL", "http://core.example.com")
	t.Setenv("NEXUSHUB_CORE_TOKEN", "core-token")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.ResolvedNexusHubPlatformBaseURL() != "http://platform.example.com" {
		t.Fatalf("expected platform base url override, got %q", cfg.ResolvedNexusHubPlatformBaseURL())
	}
	if cfg.ResolvedNexusHubPlatformToken() != "platform-token" {
		t.Fatalf("expected platform token override, got %q", cfg.ResolvedNexusHubPlatformToken())
	}
	if cfg.ResolvedNexusHubCoreBaseURL() != "http://core.example.com" {
		t.Fatalf("expected core base url override, got %q", cfg.ResolvedNexusHubCoreBaseURL())
	}
	if cfg.ResolvedNexusHubCoreToken() != "core-token" {
		t.Fatalf("expected core token override, got %q", cfg.ResolvedNexusHubCoreToken())
	}
}

func TestLoadFromEnv_NexusHubSplitConfigFallsBackToLegacy(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("NEXUSHUB_BASE_URL", "http://legacy.example.com")
	t.Setenv("NEXUSHUB_TOKEN", "legacy-token")
	t.Setenv("NEXUSHUB_PLATFORM_BASE_URL", "")
	t.Setenv("NEXUSHUB_PLATFORM_TOKEN", "")
	t.Setenv("NEXUSHUB_CORE_BASE_URL", "")
	t.Setenv("NEXUSHUB_CORE_TOKEN", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.ResolvedNexusHubPlatformBaseURL() != "http://legacy.example.com" {
		t.Fatalf("expected legacy platform fallback, got %q", cfg.ResolvedNexusHubPlatformBaseURL())
	}
	if cfg.ResolvedNexusHubPlatformToken() != "legacy-token" {
		t.Fatalf("expected legacy platform token fallback, got %q", cfg.ResolvedNexusHubPlatformToken())
	}
	if cfg.ResolvedNexusHubCoreBaseURL() != "http://legacy.example.com" {
		t.Fatalf("expected legacy core fallback, got %q", cfg.ResolvedNexusHubCoreBaseURL())
	}
	if cfg.ResolvedNexusHubCoreToken() != "legacy-token" {
		t.Fatalf("expected legacy core token fallback, got %q", cfg.ResolvedNexusHubCoreToken())
	}
}

func TestLoadFromEnv_RejectsAmbiguousPostgresConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_PG_DSN", "postgres://demo:secret@pg.example.com:5432/postgres?sslmode=require")
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error for ambiguous postgres config")
	}
}

func TestLoadFromEnv_RejectsAmbiguousPostgresTimezoneConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_PG_DSN", "postgres://demo:secret@pg.example.com:5432/postgres?sslmode=require")
	t.Setenv("ANYCAP_PG_TIMEZONE", "UTC")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error for ambiguous postgres timezone config")
	}
}

func TestLoadFromEnv_RejectsAmbiguousRedisConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_REDIS_ADDR", "redis.example.com:6379")
	t.Setenv("ANYCAP_REDIS_HOST", "redis.example.com")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error for ambiguous redis config")
	}
}

func TestConfig_postgresDSN_IncludesTimezoneWhenConfigured(t *testing.T) {
	clearLegacyPGConfig(t)
	cfg := Config{
		PGHost:     "pg.example.com",
		PGPort:     5432,
		PGUser:     "demo",
		PGPassword: "secret",
		PGDatabase: "postgres",
		PGSSLMode:  "require",
		PGTimezone: "UTC",
	}

	dsn := cfg.postgresDSN()
	if !strings.Contains(dsn, "timezone=UTC") {
		t.Fatalf("expected dsn to contain timezone=UTC, got %q", dsn)
	}
}

func TestLoadFromEnv_FallsBackToLegacyPGConfig(t *testing.T) {
	t.Setenv("ANYCAP_PG_CONFIG", `{"Host":"legacy.example.com","Port":"5432","User":"legacy","Password":"secret","DBName":"anycap","SSLMode":"disable","TimeZone":"Asia/Shanghai"}`)

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PGDSN == "" {
		t.Fatal("expected postgres dsn to be derived from legacy config")
	}
	if !strings.Contains(cfg.PGDSN, "legacy.example.com:5432") {
		t.Fatalf("expected legacy host in dsn, got %q", cfg.PGDSN)
	}
	if !strings.Contains(cfg.PGDSN, "timezone=Asia%2FShanghai") {
		t.Fatalf("expected legacy timezone in dsn, got %q", cfg.PGDSN)
	}
}
