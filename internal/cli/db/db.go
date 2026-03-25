package db

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	envKey = "ANYCAP_PG_CONFIG"

	defaultMaxConns          = 10
	defaultMinConns          = 1
	defaultMaxConnLifetime   = 30 * time.Minute
	defaultMaxConnIdleTime   = 5 * time.Minute
	defaultHealthCheckPeriod = 1 * time.Minute
	defaultConnectTimeout    = 10 * time.Second
)

// Config mirrors the JSON object stored in ANYCAP_PG_CONFIG.
type Config struct {
	Host     string `json:"Host"`
	Port     string `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	DBName   string `json:"DBName"`
	SSLMode  string `json:"SSLMode"`
	TimeZone string `json:"TimeZone"`
}

// DSN builds a PostgreSQL connection string from the config.
func (c Config) DSN() string {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
	if c.TimeZone != "" {
		dsn += fmt.Sprintf(" TimeZone=%s", c.TimeZone)
	}
	return dsn
}

// LoadConfig reads and parses ANYCAP_PG_CONFIG from the environment.
// Returns an error if the variable is missing or the JSON is malformed.
func LoadConfig() (Config, error) {
	raw := os.Getenv(envKey)
	if raw == "" {
		return Config{}, fmt.Errorf("environment variable %s is not set", envKey)
	}

	var cfg Config
	if err := json.Unmarshal([]byte(raw), &cfg); err != nil {
		return Config{}, fmt.Errorf("failed to parse %s: %w", envKey, err)
	}

	if err := cfg.validate(); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

func (c Config) validate() error {
	if c.Host == "" {
		return fmt.Errorf("pg config: Host is required")
	}
	if c.Port == "" {
		return fmt.Errorf("pg config: Port is required")
	}
	if c.User == "" {
		return fmt.Errorf("pg config: User is required")
	}
	if c.DBName == "" {
		return fmt.Errorf("pg config: DBName is required")
	}
	return nil
}

// Pool is a thin wrapper around pgxpool.Pool that carries its config.
type Pool struct {
	*pgxpool.Pool
	cfg Config
}

// Connect creates a connection pool using the config parsed from ANYCAP_PG_CONFIG.
// The pool is validated via Ping before being returned.
func Connect(ctx context.Context) (*Pool, error) {
	cfg, err := LoadConfig()
	if err != nil {
		return nil, err
	}
	return ConnectWithConfig(ctx, cfg)
}

// ConnectWithConfig creates a connection pool from an explicit Config.
func ConnectWithConfig(ctx context.Context, cfg Config) (*Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("failed to parse DSN: %w", err)
	}

	poolCfg.MaxConns = defaultMaxConns
	poolCfg.MinConns = defaultMinConns
	poolCfg.MaxConnLifetime = defaultMaxConnLifetime
	poolCfg.MaxConnIdleTime = defaultMaxConnIdleTime
	poolCfg.HealthCheckPeriod = defaultHealthCheckPeriod

	connectCtx, cancel := context.WithTimeout(ctx, defaultConnectTimeout)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(connectCtx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err = pool.Ping(connectCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to reach postgres at %s:%s — %w", cfg.Host, cfg.Port, err)
	}

	return &Pool{Pool: pool, cfg: cfg}, nil
}

// Config returns the parsed configuration used to open this pool.
func (p *Pool) Config() Config {
	return p.cfg
}
