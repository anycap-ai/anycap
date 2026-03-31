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
	if cfg.PagePreviewHostFormat != "preview-page-%s.anycap.cloud" {
		t.Fatalf("expected default page preview host format preview-page-%%s.anycap.cloud, got %q", cfg.PagePreviewHostFormat)
	}
	if cfg.DriveAccessTTLSeconds != 300 {
		t.Fatalf("expected default drive access ttl 300, got %d", cfg.DriveAccessTTLSeconds)
	}
	if cfg.PagePreviewTTLSeconds != 300 {
		t.Fatalf("expected default page preview ttl 300, got %d", cfg.PagePreviewTTLSeconds)
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

func TestConfig_ResolveCapabilityRateLimitRPM_UsesOverride(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RATE_LIMIT_RPM", "60")
	t.Setenv("ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM", "10")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if got := cfg.ResolveCapabilityRateLimitRPM("image.generate"); got != 10 {
		t.Fatalf("expected image.generate override 10, got %d", got)
	}
}

func TestConfig_ResolveCapabilityRateLimitRPM_FallsBackToDefault(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RATE_LIMIT_RPM", "60")
	t.Setenv("ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if got := cfg.ResolveCapabilityRateLimitRPM("video.generate"); got != 60 {
		t.Fatalf("expected default rate limit 60, got %d", got)
	}
}

func TestConfig_ResolveCapabilityRateLimitRPM_NormalizesCapabilityName(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RATE_LIMIT_RPM", "60")
	t.Setenv("ANYCAP_RATE_LIMIT_DRIVE_FILE_UPLOAD_PREPARE_RPM", "15")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if got := cfg.ResolveCapabilityRateLimitRPM("drive.file.upload.prepare"); got != 15 {
		t.Fatalf("expected drive.file.upload.prepare override 15, got %d", got)
	}
}

func TestLoadFromEnv_LoadsRateLimitDConfConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RATE_LIMIT_DCONF_ENABLED", "true")
	t.Setenv("ANYCAP_RATE_LIMIT_DCONF_GROUP", "rl-group")
	t.Setenv("ANYCAP_RATE_LIMIT_DCONF_DATA_ID", "rl-data")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if !cfg.RateLimitDConfEnabled {
		t.Fatal("expected rate limit dconf enabled")
	}
	if cfg.RateLimitDConfGroup != "rl-group" {
		t.Fatalf("expected rate limit dconf group rl-group, got %q", cfg.RateLimitDConfGroup)
	}
	if cfg.RateLimitDConfDataID != "rl-data" {
		t.Fatalf("expected rate limit dconf data id rl-data, got %q", cfg.RateLimitDConfDataID)
	}
}

func TestLoadFromEnv_UsesDefaultRateLimitDConfValues(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_RATE_LIMIT_DCONF_ENABLED", "")
	t.Setenv("ANYCAP_RATE_LIMIT_DCONF_GROUP", "")
	t.Setenv("ANYCAP_RATE_LIMIT_DCONF_DATA_ID", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if cfg.RateLimitDConfEnabled {
		t.Fatal("expected rate limit dconf disabled by default")
	}
	if cfg.RateLimitDConfGroup != "anycap" {
		t.Fatalf("expected default rate limit dconf group anycap, got %q", cfg.RateLimitDConfGroup)
	}
	if cfg.RateLimitDConfDataID != "rate_limit" {
		t.Fatalf("expected default rate limit dconf data id rate_limit, got %q", cfg.RateLimitDConfDataID)
	}
}

func TestLoadFromEnv_LoadsFeatureDConfConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_FEATURE_DCONF_ENABLED", "true")
	t.Setenv("ANYCAP_FEATURE_DCONF_GROUP", "feature-group")
	t.Setenv("ANYCAP_FEATURE_DCONF_DATA_ID", "feature-data")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if !cfg.FeatureDConfEnabled {
		t.Fatal("expected feature dconf enabled")
	}
	if cfg.FeatureDConfGroup != "feature-group" {
		t.Fatalf("expected feature dconf group feature-group, got %q", cfg.FeatureDConfGroup)
	}
	if cfg.FeatureDConfDataID != "feature-data" {
		t.Fatalf("expected feature dconf data id feature-data, got %q", cfg.FeatureDConfDataID)
	}
}

func TestLoadFromEnv_UsesDefaultFeatureDConfValues(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_FEATURE_DCONF_ENABLED", "")
	t.Setenv("ANYCAP_FEATURE_DCONF_GROUP", "")
	t.Setenv("ANYCAP_FEATURE_DCONF_DATA_ID", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}

	if cfg.FeatureDConfEnabled {
		t.Fatal("expected feature dconf disabled by default")
	}
	if cfg.FeatureDConfGroup != "anycap" {
		t.Fatalf("expected default feature dconf group anycap, got %q", cfg.FeatureDConfGroup)
	}
	if cfg.FeatureDConfDataID != "feature_access" {
		t.Fatalf("expected default feature dconf data id feature_access, got %q", cfg.FeatureDConfDataID)
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

func TestLoadFromEnv_DerivesPreviewHostFormatFromPageHostFormat(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_PAGE_HOST_FORMAT", "page-%s.anycap.dev")
	t.Setenv("ANYCAP_PAGE_PREVIEW_HOST_FORMAT", "")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.PagePreviewHostFormat != "preview-page-%s.anycap.dev" {
		t.Fatalf("expected derived preview host format preview-page-%%s.anycap.dev, got %q", cfg.PagePreviewHostFormat)
	}
}

func TestLoadFromEnv_ClampsEdgeGrantTTLs(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_DRIVE_ACCESS_TTL_SECONDS", "10")
	t.Setenv("ANYCAP_PAGE_PREVIEW_TTL_SECONDS", "7200")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.DriveAccessTTLSeconds != 60 {
		t.Fatalf("expected drive access ttl clamped to 60, got %d", cfg.DriveAccessTTLSeconds)
	}
	if cfg.PagePreviewTTLSeconds != 3600 {
		t.Fatalf("expected page preview ttl clamped to 3600, got %d", cfg.PagePreviewTTLSeconds)
	}
}

func TestLoadFromEnv_LoadsPaymentConfig(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_PAYMENT_BASE_URL", "https://payment.example.com")
	t.Setenv("ANYCAP_PAYMENT_BIZ_TOKEN", "biz-token")
	t.Setenv("ANYCAP_PAYMENT_TIMEOUT_SECONDS", "15")

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if cfg.Payment.BaseURL != "https://payment.example.com" {
		t.Fatalf("expected payment base url, got %q", cfg.Payment.BaseURL)
	}
	if cfg.Payment.BizToken != "biz-token" {
		t.Fatalf("expected payment biz token, got %q", cfg.Payment.BizToken)
	}
	if cfg.Payment.Timeout != 15*time.Second {
		t.Fatalf("expected payment timeout 15s, got %v", cfg.Payment.Timeout)
	}
}

func TestLoadFromEnv_LoadsCreditPacks(t *testing.T) {
	clearLegacyPGConfig(t)
	t.Setenv("ANYCAP_CREDIT_PACKS_JSON", `[{"id":"credits_500","name":"500 credits","description":"starter","price_cent":500,"currency":"USD","credits":500,"price_id":"price_500"},{"id":"credits_2000","name":"2,000 credits","description":"best value","price_cent":1800,"currency":"USD","credits":2000,"featured":true,"badge":"Best value","price_id":"price_2000"}]`)

	cfg, err := LoadFromEnv()
	if err != nil {
		t.Fatalf("LoadFromEnv() error = %v", err)
	}
	if len(cfg.CreditPacks) != 2 {
		t.Fatalf("expected 2 credit packs, got %d", len(cfg.CreditPacks))
	}
	if cfg.CreditPacks[0].ID != "credits_500" || cfg.CreditPacks[0].PriceID != "price_500" {
		t.Fatalf("unexpected first pack: %+v", cfg.CreditPacks[0])
	}
	if !cfg.CreditPacks[1].Featured || cfg.CreditPacks[1].Badge != "Best value" {
		t.Fatalf("unexpected second pack: %+v", cfg.CreditPacks[1])
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
