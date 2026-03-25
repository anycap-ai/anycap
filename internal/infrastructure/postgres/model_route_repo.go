package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const uniqueViolationCode = "23505"

func (r *CatalogRepo) ListModelRoutes(ctx context.Context, filter model.ListModelRoutesFilter) ([]model.ModelRoute, error) {
	search := strings.TrimSpace(filter.Search)
	searchPattern := "%"
	if search != "" {
		searchPattern = "%" + search + "%"
	}

	rows, err := r.pool.Query(
		ctx,
		`SELECT id, model_id, capability, operation, ability_key, algo_type, display_name, status, extra, created_at, updated_at
		 FROM anycap_model_routes
		 WHERE ($1 = '' OR capability = $1)
		   AND ($2 = '' OR status = $2)
		   AND ($3 = '' OR model_id ILIKE $4 OR display_name ILIKE $4 OR ability_key ILIKE $4 OR operation ILIKE $4 OR algo_type ILIKE $4)
		 ORDER BY updated_at DESC, id DESC`,
		filter.Capability,
		filter.Status,
		search,
		searchPattern,
	)
	if err != nil {
		return nil, fmt.Errorf("query model routes: %w", err)
	}
	defer rows.Close()

	routes := make([]model.ModelRoute, 0)
	for rows.Next() {
		route, err := scanModelRoute(rows)
		if err != nil {
			return nil, err
		}
		routes = append(routes, *route)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate model routes: %w", err)
	}
	return routes, nil
}

func (r *CatalogRepo) GetModelRoute(ctx context.Context, id int64) (*model.ModelRoute, error) {
	row := r.pool.QueryRow(
		ctx,
		`SELECT id, model_id, capability, operation, ability_key, algo_type, display_name, status, extra, created_at, updated_at
		 FROM anycap_model_routes
		 WHERE id = $1`,
		id,
	)

	route, err := scanModelRoute(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("model route %d not found", id)
		}
		return nil, err
	}
	return route, nil
}

func (r *CatalogRepo) CreateModelRoute(ctx context.Context, input model.CreateModelRouteInput) (*model.ModelRoute, error) {
	extraBytes, err := marshalExtra(input.Extra)
	if err != nil {
		return nil, err
	}

	row := r.pool.QueryRow(
		ctx,
		`INSERT INTO anycap_model_routes (
			model_id, capability, operation, ability_key, algo_type, display_name, status, extra
		 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, model_id, capability, operation, ability_key, algo_type, display_name, status, extra, created_at, updated_at`,
		input.ModelID,
		string(input.Capability),
		string(input.Operation),
		input.AbilityKey,
		input.AlgoType,
		input.DisplayName,
		input.Status,
		extraBytes,
	)

	route, err := scanModelRoute(row)
	if err != nil {
		return nil, translateWriteError("create model route", err)
	}
	return route, nil
}

func (r *CatalogRepo) UpdateModelRoute(ctx context.Context, id int64, input model.UpdateModelRouteInput) (*model.ModelRoute, error) {
	extraBytes, err := marshalExtra(input.Extra)
	if err != nil {
		return nil, err
	}

	row := r.pool.QueryRow(
		ctx,
		`UPDATE anycap_model_routes
		 SET model_id = $2,
		     capability = $3,
		     operation = $4,
		     ability_key = $5,
		     algo_type = $6,
		     display_name = $7,
		     status = $8,
		     extra = $9,
		     updated_at = now()
		 WHERE id = $1
		 RETURNING id, model_id, capability, operation, ability_key, algo_type, display_name, status, extra, created_at, updated_at`,
		id,
		input.ModelID,
		string(input.Capability),
		string(input.Operation),
		input.AbilityKey,
		input.AlgoType,
		input.DisplayName,
		input.Status,
		extraBytes,
	)

	route, err := scanModelRoute(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("model route %d not found", id)
		}
		return nil, translateWriteError("update model route", err)
	}
	return route, nil
}

func (r *CatalogRepo) DeleteModelRoute(ctx context.Context, id int64) error {
	result, err := r.pool.Exec(ctx, `DELETE FROM anycap_model_routes WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete model route: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("model route %d not found", id)
	}
	return nil
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanModelRoute(row rowScanner) (*model.ModelRoute, error) {
	var (
		route      model.ModelRoute
		capability string
		operation  string
		extraBytes []byte
	)

	if err := row.Scan(
		&route.ID,
		&route.ModelID,
		&capability,
		&operation,
		&route.AbilityKey,
		&route.AlgoType,
		&route.DisplayName,
		&route.Status,
		&extraBytes,
		&route.CreatedAt,
		&route.UpdatedAt,
	); err != nil {
		return nil, err
	}

	route.Capability = model.Capability(capability)
	route.Operation = model.Operation(operation)
	if len(extraBytes) > 0 {
		if err := json.Unmarshal(extraBytes, &route.Extra); err != nil {
			return nil, fmt.Errorf("decode route extra: %w", err)
		}
	}
	if route.Extra == nil {
		route.Extra = map[string]any{}
	}

	return &route, nil
}

func marshalExtra(extra map[string]any) ([]byte, error) {
	if extra == nil {
		extra = map[string]any{}
	}
	data, err := json.Marshal(extra)
	if err != nil {
		return nil, fmt.Errorf("marshal route extra: %w", err)
	}
	return data, nil
}

func translateWriteError(action string, err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == uniqueViolationCode {
		return fmt.Errorf("%s: duplicate model_id + operation + algo_type", action)
	}
	return fmt.Errorf("%s: %w", action, err)
}
