package db

import "testing"

func TestLoadConfig_FromDiscreteEnv(t *testing.T) {
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_PORT", "5432")
	t.Setenv("ANYCAP_PG_USER", "demo")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")
	t.Setenv("ANYCAP_PG_DATABASE", "anycap")
	t.Setenv("ANYCAP_PG_SSL_MODE", "require")
	t.Setenv("ANYCAP_PG_CONFIG", `{"Host":"legacy","Port":"5432","User":"legacy","DBName":"legacy"}`)

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() error = %v", err)
	}
	if cfg.Host != "pg.example.com" || cfg.User != "demo" || cfg.DBName != "anycap" {
		t.Fatalf("expected discrete env config, got %+v", cfg)
	}
	if cfg.SSLMode != "require" {
		t.Fatalf("expected ssl mode require, got %q", cfg.SSLMode)
	}
}

func TestLoadConfig_FromLegacyJSONFallback(t *testing.T) {
	t.Setenv("ANYCAP_PG_CONFIG", `{"Host":"legacy.example.com","Port":"5432","User":"legacy","Password":"secret","DBName":"anycap","SSLMode":"disable"}`)

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() error = %v", err)
	}
	if cfg.Host != "legacy.example.com" || cfg.User != "legacy" {
		t.Fatalf("expected legacy config, got %+v", cfg)
	}
}

func TestLoadConfig_DiscreteEnvRequiresHostUserPassword(t *testing.T) {
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_USER", "")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")

	_, err := LoadConfig()
	if err == nil {
		t.Fatal("expected error for incomplete discrete config")
	}
}

func TestLoadConfig_DiscreteEnvDefaultsPortDatabaseSSLMode(t *testing.T) {
	t.Setenv("ANYCAP_PG_HOST", "pg.example.com")
	t.Setenv("ANYCAP_PG_USER", "demo")
	t.Setenv("ANYCAP_PG_PASSWORD", "secret")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() error = %v", err)
	}
	if cfg.Port != "5432" {
		t.Fatalf("expected default port 5432, got %q", cfg.Port)
	}
	if cfg.DBName != "postgres" {
		t.Fatalf("expected default db postgres, got %q", cfg.DBName)
	}
	if cfg.SSLMode != "prefer" {
		t.Fatalf("expected default sslmode prefer, got %q", cfg.SSLMode)
	}
}
