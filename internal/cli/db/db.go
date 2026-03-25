package db

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
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

// Config is the normalized PostgreSQL config used by CLI-side DB helpers.
// Preferred source is discrete ANYCAP_PG_* fields. ANYCAP_PG_CONFIG remains as
// a backward-compatible fallback only.
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

// LoadConfig reads PostgreSQL config from environment.
//
// Resolution order:
//  1. Discrete ANYCAP_PG_* fields
//  2. Legacy ANYCAP_PG_CONFIG JSON
//
// Returns an error if no valid config is found.
func LoadConfig() (Config, error) {
	if cfg, ok, err := loadDiscreteConfig(); err != nil {
		return Config{}, err
	} else if ok {
		return cfg, nil
	}

	raw := os.Getenv(envKey)
	if raw == "" {
		return Config{}, fmt.Errorf("postgres config is not set: use ANYCAP_PG_* fields (preferred) or legacy %s", envKey)
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

func loadDiscreteConfig() (Config, bool, error) {
	host := strings.TrimSpace(os.Getenv("ANYCAP_PG_HOST"))
	port := strings.TrimSpace(os.Getenv("ANYCAP_PG_PORT"))
	user := strings.TrimSpace(os.Getenv("ANYCAP_PG_USER"))
	password := os.Getenv("ANYCAP_PG_PASSWORD")
	dbName := strings.TrimSpace(os.Getenv("ANYCAP_PG_DATABASE"))
	sslMode := strings.TrimSpace(os.Getenv("ANYCAP_PG_SSL_MODE"))

	anySet := host != "" || port != "" || user != "" || password != "" || dbName != "" || sslMode != ""
	if !anySet {
		return Config{}, false, nil
	}

	if host == "" || user == "" || password == "" {
		return Config{}, true, fmt.Errorf("pg config: ANYCAP_PG_HOST, ANYCAP_PG_USER, and ANYCAP_PG_PASSWORD are required when using discrete ANYCAP_PG_* fields")
	}
	if port == "" {
		port = "5432"
	} else if _, err := strconv.Atoi(port); err != nil {
		return Config{}, true, fmt.Errorf("pg config: ANYCAP_PG_PORT must be numeric")
	}
	if dbName == "" {
		dbName = "postgres"
	}
	if sslMode == "" {
		sslMode = "prefer"
	}

	cfg := Config{
		Host:     host,
		Port:     port,
		User:     user,
		Password: password,
		DBName:   dbName,
		SSLMode:  sslMode,
		TimeZone: strings.TrimSpace(os.Getenv("ANYCAP_PG_TIME_ZONE")),
	}
	if err := cfg.validate(); err != nil {
		return Config{}, true, err
	}
	return cfg, true, nil
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

// Connect creates a connection pool using environment-derived config.
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
