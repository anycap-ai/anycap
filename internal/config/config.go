package config

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
)

const (
	defaultAppName      = "anycap-server"
	defaultAppEnv       = "local"
	defaultHTTPAddr     = ":8080"
	defaultRuntimeMode  = "stub"
	defaultRateLimitRPM = 60
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
	Auth0Enabled      bool
	Auth0Issuer       string
	Auth0Audience     string
	Auth0ClientID     string
	Auth0ClientSecret string
	Auth0RedirectURL  string
}

func Load() Config {
	cfg, err := LoadFromEnv()
	if err != nil {
		panic(err)
	}

	return cfg
}

func LoadFromEnv() (Config, error) {
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
		Auth0Enabled:      getEnvBool("ANYCAP_AUTH0_ENABLED", false),
		Auth0Issuer:       os.Getenv("ANYCAP_AUTH0_ISSUER"),
		Auth0Audience:     os.Getenv("ANYCAP_AUTH0_AUDIENCE"),
		Auth0ClientID:     os.Getenv("ANYCAP_AUTH0_CLIENT_ID"),
		Auth0ClientSecret: os.Getenv("ANYCAP_AUTH0_CLIENT_SECRET"),
		Auth0RedirectURL:  os.Getenv("ANYCAP_AUTH0_REDIRECT_URL"),
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
