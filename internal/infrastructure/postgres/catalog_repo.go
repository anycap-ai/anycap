package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const (
	pgConfigEnvKey         = "ANYCAP_PG_CONFIG"
	defaultConnectTimeout  = 10 * time.Second
	defaultPoolMaxConns    = 10
	defaultPoolMinConns    = 1
	defaultPoolMaxLifetime = 30 * time.Minute
	defaultPoolMaxIdle     = 5 * time.Minute
)

type pgConfig struct {
	Host     string `json:"Host"`
	Port     string `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	DBName   string `json:"DBName"`
	SSLMode  string `json:"SSLMode"`
	TimeZone string `json:"TimeZone"`
}

func (c pgConfig) dsn() string {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.sslModeOrDefault(),
	)
	if c.TimeZone != "" {
		dsn += fmt.Sprintf(" TimeZone=%s", c.TimeZone)
	}
	return dsn
}

func (c pgConfig) validate() error {
	if c.Host == "" || c.Port == "" || c.User == "" || c.DBName == "" {
		return fmt.Errorf("invalid %s: Host/Port/User/DBName are required", pgConfigEnvKey)
	}
	return nil
}

func (c pgConfig) sslModeOrDefault() string {
	if c.SSLMode == "" {
		return "disable"
	}
	return c.SSLMode
}

func loadConfigFromEnv() (pgConfig, error) {
	raw := os.Getenv(pgConfigEnvKey)
	if strings.TrimSpace(raw) == "" {
		return pgConfig{}, fmt.Errorf("%s is not set", pgConfigEnvKey)
	}

	var cfg pgConfig
	if err := json.Unmarshal([]byte(raw), &cfg); err != nil {
		return pgConfig{}, fmt.Errorf("parse %s: %w", pgConfigEnvKey, err)
	}
	if err := cfg.validate(); err != nil {
		return pgConfig{}, err
	}
	return cfg, nil
}

// CatalogRepo implements port.CatalogRepository with a single table:
// anycap_model_routes(model_id, capability, operation, ability_key, algo_type, ...).
type CatalogRepo struct {
	pool *pgxpool.Pool
}

func NewCatalogRepo(pool *pgxpool.Pool) *CatalogRepo {
	return &CatalogRepo{pool: pool}
}

func NewCatalogRepoFromEnv(ctx context.Context) (*CatalogRepo, error) {
	cfg, err := loadConfigFromEnv()
	if err != nil {
		return nil, err
	}

	poolCfg, err := pgxpool.ParseConfig(cfg.dsn())
	if err != nil {
		return nil, fmt.Errorf("parse pg dsn: %w", err)
	}
	poolCfg.MaxConns = defaultPoolMaxConns
	poolCfg.MinConns = defaultPoolMinConns
	poolCfg.MaxConnLifetime = defaultPoolMaxLifetime
	poolCfg.MaxConnIdleTime = defaultPoolMaxIdle

	connectCtx, cancel := context.WithTimeout(ctx, defaultConnectTimeout)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(connectCtx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("create pg pool: %w", err)
	}
	if err := pool.Ping(connectCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return NewCatalogRepo(pool), nil
}

func (r *CatalogRepo) Close() {
	if r.pool != nil {
		r.pool.Close()
	}
}

func (r *CatalogRepo) ListModels(ctx context.Context, capability model.Capability) ([]model.ModelSpec, error) {
	rows, err := r.pool.Query(
		ctx,
		`SELECT model_id, capability, display_name, status, operation, ability_key, algo_type
		 FROM anycap_model_routes
		 WHERE capability = $1 AND status = 'active'
		 ORDER BY model_id ASC, operation ASC, algo_type ASC`,
		string(capability),
	)
	if err != nil {
		return nil, fmt.Errorf("query models: %w", err)
	}
	defer rows.Close()

	return aggregateModelSpecs(rows)
}

func (r *CatalogRepo) GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	rows, err := r.pool.Query(
		ctx,
		`SELECT model_id, capability, display_name, status, operation, ability_key, algo_type
		 FROM anycap_model_routes
		 WHERE capability = $1 AND model_id = $2 AND status = 'active'
		 ORDER BY operation ASC, algo_type ASC`,
		string(capability),
		modelID,
	)
	if err != nil {
		return nil, fmt.Errorf("query model: %w", err)
	}
	defer rows.Close()

	specs, err := aggregateModelSpecs(rows)
	if err != nil {
		return nil, err
	}
	if len(specs) == 0 {
		return nil, fmt.Errorf("model %q not found in capability %s", modelID, capability)
	}
	return &specs[0], nil
}

type modelRouteRowScanner interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}

func aggregateModelSpecs(rows modelRouteRowScanner) ([]model.ModelSpec, error) {
	byModel := make(map[string]*model.ModelSpec)
	order := make([]string, 0)

	for rows.Next() {
		var (
			modelID     string
			capability  string
			displayName string
			status      string
			operation   string
			abilityKey  string
			algoType    string
		)

		if err := rows.Scan(&modelID, &capability, &displayName, &status, &operation, &abilityKey, &algoType); err != nil {
			return nil, fmt.Errorf("scan row: %w", err)
		}

		spec, ok := byModel[modelID]
		if !ok {
			spec = &model.ModelSpec{
				ModelID:     modelID,
				Capability:  model.Capability(capability),
				DisplayName: displayNameOrFallback(displayName, modelID),
				Status:      status,
				Operations:  make(map[model.Operation]model.OperationSpec),
			}
			byModel[modelID] = spec
			order = append(order, modelID)
		}

		op := model.Operation(operation)
		opSpec := spec.Operations[op]
		opSpec.Routes = append(opSpec.Routes, model.RouteBinding{
			RouteType:  model.RouteTypeDirect,
			AbilityKey: abilityKey,
			GenType:    capability,
			AlgoType:   algoType,
			Priority:   100,
			Enabled:    true,
		})
		spec.Operations[op] = opSpec
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate rows: %w", err)
	}

	specs := make([]model.ModelSpec, 0, len(order))
	for _, modelID := range order {
		specs = append(specs, *byModel[modelID])
	}
	return specs, nil
}

func displayNameOrFallback(displayName, modelID string) string {
	if strings.TrimSpace(displayName) == "" {
		return modelID
	}
	return displayName
}
