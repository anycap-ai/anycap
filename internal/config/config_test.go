package config

import "testing"

func TestLoadFromEnv_Defaults(t *testing.T) {
	t.Setenv("ANYCAP_APP_NAME", "")
	t.Setenv("ANYCAP_APP_ENV", "")
	t.Setenv("ANYCAP_HTTP_ADDR", "")
	t.Setenv("ANYCAP_RUNTIME_MODE", "")
	t.Setenv("ANYCAP_RATE_LIMIT_RPM", "")

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
