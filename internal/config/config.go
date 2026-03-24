package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

const (
	defaultAppName  = "anycap-server"
	defaultAppEnv   = "local"
	defaultHTTPAddr = ":18080"

	defaultAgentPlatformTimeout = 120 * time.Second
	defaultPresignExpiry        = 3600 // seconds
)

type Config struct {
	AppName  string
	AppEnv   string
	HTTPAddr string

	AgentPlatform AgentPlatformConfig
	S3            S3Config
}

// AgentPlatformConfig holds settings for the upstream agent-platform capabilities API.
type AgentPlatformConfig struct {
	BaseURL  string
	APIKey   string
	TenantID string
	Timeout  time.Duration
}

// Enabled returns true when the minimum required fields are set.
func (c AgentPlatformConfig) Enabled() bool {
	return c.BaseURL != "" && c.APIKey != ""
}

// S3Config holds settings for S3-compatible object storage (presigned uploads).
type S3Config struct {
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	Region          string
	PublicURL       string
	PresignExpiry   int // seconds
	ForcePathStyle  bool
}

// Enabled returns true when the minimum required fields are set.
func (c S3Config) Enabled() bool {
	return c.Endpoint != "" && c.AccessKeyID != "" && c.SecretAccessKey != "" && c.Bucket != ""
}

func Load() Config {
	// Best-effort load of .env file; ignore error if missing.
	_ = godotenv.Load()

	return Config{
		AppName:       getEnv("ANYCAP_APP_NAME", defaultAppName),
		AppEnv:        getEnv("ANYCAP_APP_ENV", defaultAppEnv),
		HTTPAddr:      getEnv("ANYCAP_HTTP_ADDR", defaultHTTPAddr),
		AgentPlatform: loadAgentPlatformConfig(),
		S3:            loadS3Config(),
	}
}

func loadAgentPlatformConfig() AgentPlatformConfig {
	timeout := defaultAgentPlatformTimeout
	if s := os.Getenv("AGENT_PLATFORM_TIMEOUT_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			timeout = time.Duration(n) * time.Second
		}
	}

	return AgentPlatformConfig{
		BaseURL:  getEnv("AGENT_PLATFORM_BASE_URL", ""),
		APIKey:   getEnv("AGENT_PLATFORM_API_KEY", ""),
		TenantID: getEnv("AGENT_PLATFORM_TENANT_ID", ""),
		Timeout:  timeout,
	}
}

func loadS3Config() S3Config {
	expiry := defaultPresignExpiry
	if s := os.Getenv("S3_PRESIGN_EXPIRY_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			expiry = n
		}
	}

	forcePathStyle := false
	if s := os.Getenv("S3_FORCE_PATH_STYLE"); s == "true" || s == "1" {
		forcePathStyle = true
	}

	return S3Config{
		Endpoint:        getEnv("S3_ENDPOINT", ""),
		AccessKeyID:     getEnv("S3_ACCESS_KEY_ID", ""),
		SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY", ""),
		Bucket:          getEnv("S3_BUCKET", "anycap-tmp"),
		Region:          getEnv("S3_REGION", "auto"),
		PublicURL:       getEnv("S3_PUBLIC_URL", ""),
		PresignExpiry:   expiry,
		ForcePathStyle:  forcePathStyle,
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
