package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const (
	defaultConnectTimeout  = 10 * time.Second
	defaultPoolMaxConns    = 10
	defaultPoolMinConns    = 1
	defaultPoolMaxLifetime = 30 * time.Minute
	defaultPoolMaxIdle     = 5 * time.Minute
)

// CatalogRepo implements port.CatalogRepository with a single table:
// anycap_model_routes(model_id, capability, operation, ability_key, algo_type, ...).
type CatalogRepo struct {
	pool *pgxpool.Pool
}

func NewCatalogRepo(pool *pgxpool.Pool) *CatalogRepo {
	return &CatalogRepo{pool: pool}
}

func NewCatalogRepoFromDSN(ctx context.Context, dsn string) (*CatalogRepo, error) {
	poolCfg, err := pgxpool.ParseConfig(dsn)
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
	routes, err := r.listActiveModelRoutes(ctx, capability, "")
	if err != nil {
		return nil, err
	}
	return aggregateModelSpecs(routes), nil
}

func (r *CatalogRepo) GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	routes, err := r.listActiveModelRoutes(ctx, capability, modelID)
	if err != nil {
		return nil, err
	}
	specs := aggregateModelSpecs(routes)
	if len(specs) == 0 {
		return nil, fmt.Errorf("model %q not found in capability %s", modelID, capability)
	}
	return &specs[0], nil
}

func (r *CatalogRepo) listActiveModelRoutes(ctx context.Context, capability model.Capability, modelID string) ([]model.ModelRoute, error) {
	rows, err := r.pool.Query(
		ctx,
		`SELECT id, model_id, capability, operation, ability_key, algo_type, mode, display_name, mode_description, model_description, status, extra, created_at, updated_at
		 FROM anycap_model_routes
		 WHERE capability = $1
		   AND status = 'active'
		   AND ($2 = '' OR model_id = $2)
		 ORDER BY model_id ASC, operation ASC, updated_at DESC, id DESC`,
		string(capability),
		modelID,
	)
	if err != nil {
		return nil, fmt.Errorf("query active model routes: %w", err)
	}
	defer rows.Close()

	routes := make([]model.ModelRoute, 0)
	for rows.Next() {
		route, err := scanModelRoute(rows)
		if err != nil {
			return nil, fmt.Errorf("scan active model route: %w", err)
		}
		routes = append(routes, *route)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate active model routes: %w", err)
	}
	return routes, nil
}

func aggregateModelSpecs(routes []model.ModelRoute) []model.ModelSpec {
	byModel := make(map[string]*model.ModelSpec)
	order := make([]string, 0)

	// Track modes per (model, operation) to deduplicate
	type opKey struct {
		modelID   string
		operation model.Operation
	}
	seenModes := make(map[opKey]map[model.Mode]bool)

	for _, route := range routes {
		spec, ok := byModel[route.ModelID]
		if !ok {
			spec = &model.ModelSpec{
				ModelID:          route.ModelID,
				Capability:       route.Capability,
				DisplayName:      displayNameOrFallback(route.DisplayName, route.ModelID),
				ModelDescription: route.ModelDescription,
				Status:           route.Status,
				Operations:       make(map[model.Operation]model.OperationSpec),
			}
			byModel[route.ModelID] = spec
			order = append(order, route.ModelID)
		}
		// Use latest non-empty model_description
		if spec.ModelDescription == "" && route.ModelDescription != "" {
			spec.ModelDescription = route.ModelDescription
		}

		opSpec := spec.Operations[route.Operation]
		opSpec.Routes = append(opSpec.Routes, route.ToRouteBinding())

		// Add mode if not already seen for this (model, operation)
		ok2 := opKey{modelID: route.ModelID, operation: route.Operation}
		if seenModes[ok2] == nil {
			seenModes[ok2] = make(map[model.Mode]bool)
		}
		if route.Mode != "" && !seenModes[ok2][route.Mode] {
			seenModes[ok2][route.Mode] = true
			opSpec.Modes = append(opSpec.Modes, model.ModeSpec{
				Mode:        route.Mode,
				Description: route.ModeDescription,
			})
		}

		spec.Operations[route.Operation] = opSpec
	}

	specs := make([]model.ModelSpec, 0, len(order))
	for _, modelID := range order {
		specs = append(specs, *byModel[modelID])
	}
	return specs
}

func displayNameOrFallback(displayName, modelID string) string {
	if strings.TrimSpace(displayName) == "" {
		return modelID
	}
	return displayName
}
