package config

import (
	"testing"
	"time"
)

func TestLoadFromEnv_Defaults(t *testing.T) {
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
	if cfg.HTTPAddr != ":8080" {
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
}

func TestLoadFromEnv_IntegrationRequiresInfra(t *testing.T) {
	t.Setenv("ANYCAP_RUNTIME_MODE", "integration")
	t.Setenv("ANYCAP_PG_DSN", "")
	t.Setenv("ANYCAP_REDIS_ADDR", "")

	_, err := LoadFromEnv()
	if err == nil {
		t.Fatal("expected error when integration infra config missing")
	}
}

func TestLoadFromEnv_ReadsSplitNexusHubConfig(t *testing.T) {
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
