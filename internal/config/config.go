package config

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

const (
	defaultAppName              = "anycap-server"
	defaultAppEnv               = "local"
	defaultHTTPAddr             = ":8080"
	defaultRuntimeMode          = "stub"
	defaultRateLimitRPM         = 60
	defaultLoginAPIKeyTTL       = 7 * 24 * time.Hour
	defaultAgentPlatformTimeout = 120 * time.Second
	defaultPresignExpiry        = 600  // seconds (10 minutes)
	maxPresignExpiry            = 3600 // seconds (1 hour hard cap)
)

type Config struct {
	AppName           string
	AppEnv            string
	HTTPAddr          string
	RuntimeMode       string
	PGDSN             string
	PGHost            string
	PGPort            int
	PGUser            string
	PGPassword        string
	PGDatabase        string
	PGSSLMode         string
	PGAutoMigrate     bool
	RedisAddr         string
	RedisHost         string
	RedisPort         int
	RedisUsername     string
	RedisPassword     string
	RedisDB           int
	RateLimitRPM      int
	LoginAPIKeyTTL    time.Duration
	Auth0Enabled      bool
	Auth0Issuer       string
	Auth0Audience     string
	Auth0ClientID     string
	Auth0ClientSecret string
	Auth0RedirectURL  string
	NexusHubBaseURL   string
	NexusHubToken     string
	Credit            CreditConfig
	AgentPlatform     AgentPlatformConfig
	S3                S3Config
}

type CreditConfig struct {
	BaseURL  string
	BizToken string
	Timeout  time.Duration
}

func (c CreditConfig) Enabled() bool {
	return c.BaseURL != "" && c.BizToken != ""
}

type AgentPlatformConfig struct {
	BaseURL  string
	APIKey   string
	TenantID string
	Timeout  time.Duration
}

func (c AgentPlatformConfig) Enabled() bool {
	return c.BaseURL != "" && c.APIKey != ""
}

type S3Config struct {
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	Region          string
	PublicURL       string
	KeyPrefix       string
	PresignExpiry   int
	ForcePathStyle  bool
}

func (c S3Config) Enabled() bool {
	return c.Endpoint != "" && c.AccessKeyID != "" && c.SecretAccessKey != "" && c.Bucket != ""
}

func Load() Config {
	cfg, err := LoadFromEnv()
	if err != nil {
		panic(err)
	}
	return cfg
}

func LoadFromEnv() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		AppName:           getEnv("ANYCAP_APP_NAME", defaultAppName),
		AppEnv:            getEnv("ANYCAP_APP_ENV", defaultAppEnv),
		HTTPAddr:          getEnv("ANYCAP_HTTP_ADDR", defaultHTTPAddr),
		RuntimeMode:       getEnv("ANYCAP_RUNTIME_MODE", defaultRuntimeMode),
		PGDSN:             os.Getenv("ANYCAP_PG_DSN"),
		PGHost:            os.Getenv("ANYCAP_PG_HOST"),
		PGPort:            getEnvInt("ANYCAP_PG_PORT", 5432),
		PGUser:            os.Getenv("ANYCAP_PG_USER"),
		PGPassword:        os.Getenv("ANYCAP_PG_PASSWORD"),
		PGDatabase:        getEnv("ANYCAP_PG_DATABASE", "postgres"),
		PGSSLMode:         getEnv("ANYCAP_PG_SSL_MODE", "prefer"),
		PGAutoMigrate:     getEnvBool("ANYCAP_PG_AUTO_MIGRATE", false),
		RedisAddr:         os.Getenv("ANYCAP_REDIS_ADDR"),
		RedisHost:         os.Getenv("ANYCAP_REDIS_HOST"),
		RedisPort:         getEnvInt("ANYCAP_REDIS_PORT", 6379),
		RedisUsername:     getEnv("ANYCAP_REDIS_USERNAME", "default"),
		RedisPassword:     os.Getenv("ANYCAP_REDIS_PASSWORD"),
		RedisDB:           getEnvInt("ANYCAP_REDIS_DB", 0),
		RateLimitRPM:      getEnvInt("ANYCAP_RATE_LIMIT_RPM", defaultRateLimitRPM),
		LoginAPIKeyTTL:    getEnvDuration("ANYCAP_LOGIN_API_KEY_TTL", defaultLoginAPIKeyTTL),
		Auth0Enabled:      getEnvBool("ANYCAP_AUTH0_ENABLED", false),
		Auth0Issuer:       os.Getenv("ANYCAP_AUTH0_ISSUER"),
		Auth0Audience:     os.Getenv("ANYCAP_AUTH0_AUDIENCE"),
		Auth0ClientID:     os.Getenv("ANYCAP_AUTH0_CLIENT_ID"),
		Auth0ClientSecret: os.Getenv("ANYCAP_AUTH0_CLIENT_SECRET"),
		Auth0RedirectURL:  os.Getenv("ANYCAP_AUTH0_REDIRECT_URL"),
		NexusHubBaseURL:   getEnv("NEXUSHUB_BASE_URL", ""),
		NexusHubToken:     getEnv("NEXUSHUB_TOKEN", ""),
		Credit:            loadCreditConfig(),
		AgentPlatform:     loadAgentPlatformConfig(),
		S3:                loadS3Config(),
	}

	if cfg.requiresExternalInfra() {
		if cfg.PGDSN == "" {
			if cfg.PGHost == "" || cfg.PGUser == "" || cfg.PGPassword == "" {
				return Config{}, fmt.Errorf("%s mode requires postgres dsn or host/user/password", cfg.RuntimeMode)
			}
			cfg.PGDSN = cfg.postgresDSN()
		}
		if cfg.RedisAddr == "" {
			if cfg.RedisHost == "" || cfg.RedisPassword == "" {
				return Config{}, fmt.Errorf("%s mode requires redis addr or host/password", cfg.RuntimeMode)
			}
			cfg.RedisAddr = net.JoinHostPort(cfg.RedisHost, strconv.Itoa(cfg.RedisPort))
		}
	}

	return cfg, nil
}

func loadCreditConfig() CreditConfig {
	timeout := 10 * time.Second
	if s := os.Getenv("ANYCAP_CREDIT_TIMEOUT_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			timeout = time.Duration(n) * time.Second
		}
	}

	return CreditConfig{
		BaseURL:  getEnv("ANYCAP_CREDIT_BASE_URL", ""),
		BizToken: getEnv("ANYCAP_CREDIT_BIZ_TOKEN", ""),
		Timeout:  timeout,
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

	if expiry > maxPresignExpiry {
		expiry = maxPresignExpiry
	}

	return S3Config{
		Endpoint:        getEnv("S3_ENDPOINT", ""),
		AccessKeyID:     getEnv("S3_ACCESS_KEY_ID", ""),
		SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY", ""),
		Bucket:          getEnv("S3_BUCKET", "anycap-tmp"),
		Region:          getEnv("S3_REGION", "auto"),
		PublicURL:       getEnv("S3_PUBLIC_URL", ""),
		KeyPrefix:       getEnv("S3_KEY_PREFIX", "user_upload"),
		PresignExpiry:   expiry,
		ForcePathStyle:  forcePathStyle,
	}
}

func (c Config) requiresExternalInfra() bool {
	switch strings.ToLower(c.RuntimeMode) {
	case "dev", "prod", "integration":
		return true
	default:
		return false
	}
}

func (c Config) postgresDSN() string {
	u := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(c.PGUser, c.PGPassword),
		Host:   net.JoinHostPort(c.PGHost, strconv.Itoa(c.PGPort)),
		Path:   c.PGDatabase,
	}
	query := u.Query()
	query.Set("sslmode", c.PGSSLMode)
	u.RawQuery = query.Encode()
	return u.String()
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func getEnvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}
