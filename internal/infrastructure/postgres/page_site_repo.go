package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"

	"github.com/jackc/pgx/v5/pgconn"
)

type PageSiteRepo struct {
	db sqlstore.DBTX
}

func NewPageSiteRepo(db sqlstore.DBTX) *PageSiteRepo {
	return &PageSiteRepo{db: db}
}

func (r *PageSiteRepo) Create(ctx context.Context, input model.CreatePageSiteInput) (*model.PageSite, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page site repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO page_sites (
			space_id,
			name,
			page_name,
			access_mode,
			password_hash,
			password_salt,
			spa_fallback
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, spa_fallback, edge_version, created_at, updated_at, deleted_at
	`, input.SpaceID, strings.TrimSpace(input.Name), input.PageName, string(input.AccessMode), input.PasswordHash, input.PasswordSalt, input.SPAFallback)

	site, err := scanPageSite(row)
	if err != nil {
		return nil, translatePageWriteError("create page site", err)
	}
	return site, nil
}

func (r *PageSiteRepo) ListBySpace(ctx context.Context, spaceID int64) ([]model.PageSite, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page site repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, spa_fallback, edge_version, created_at, updated_at, deleted_at
		FROM page_sites
		WHERE space_id = $1 AND deleted_at IS NULL
		ORDER BY updated_at DESC, id DESC
	`, spaceID)
	if err != nil {
		return nil, fmt.Errorf("list page sites by space: %w", err)
	}
	defer rows.Close()

	items := make([]model.PageSite, 0)
	for rows.Next() {
		site, scanErr := scanPageSite(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan page site: %w", scanErr)
		}
		items = append(items, *site)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate page sites: %w", err)
	}
	return items, nil
}

func (r *PageSiteRepo) GetByID(ctx context.Context, id int64) (*model.PageSite, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page site repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, spa_fallback, edge_version, created_at, updated_at, deleted_at
		FROM page_sites
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	site, err := scanPageSite(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get page site: %w", err)
	}
	return site, nil
}

func (r *PageSiteRepo) Update(ctx context.Context, input model.UpdatePageSiteInput) (*model.PageSite, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page site repo db is not configured")
	}

	existing, err := r.getByIDInSpace(ctx, input.ID, input.SpaceID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, nil
	}

	name := existing.Name
	if input.Name != nil {
		name = strings.TrimSpace(*input.Name)
	}

	accessMode := existing.AccessMode
	if input.AccessMode != nil {
		accessMode = *input.AccessMode
	}

	spaFallback := existing.SPAFallback
	if input.SPAFallback != nil {
		spaFallback = *input.SPAFallback
	}

	passwordHash := existing.PasswordHash
	passwordSalt := existing.PasswordSalt
	if input.UpdatePassword {
		passwordHash = input.PasswordHash
		passwordSalt = input.PasswordSalt
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE page_sites
		SET name = $3,
			access_mode = $4,
			password_hash = $5,
			password_salt = $6,
			spa_fallback = $7,
			edge_version = edge_version + 1,
			updated_at = NOW()
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
		RETURNING id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, spa_fallback, edge_version, created_at, updated_at, deleted_at
	`, input.ID, input.SpaceID, name, string(accessMode), passwordHash, passwordSalt, spaFallback)

	site, err := scanPageSite(row)
	if err != nil {
		return nil, translatePageWriteError("update page site", err)
	}
	return site, nil
}

func (r *PageSiteRepo) SetCurrentVersion(ctx context.Context, spaceID, id int64, versionID *int64) (*model.PageSite, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page site repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE page_sites
		SET current_version_id = $3,
			edge_version = edge_version + 1,
			updated_at = NOW()
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
		RETURNING id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, spa_fallback, edge_version, created_at, updated_at, deleted_at
	`, id, spaceID, versionID)

	site, err := scanPageSite(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("set page site current version: %w", err)
	}
	return site, nil
}

func (r *PageSiteRepo) SoftDelete(ctx context.Context, spaceID, id int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("page site repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE page_sites
		SET deleted_at = NOW(),
			updated_at = NOW(),
			edge_version = edge_version + 1
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
	`, id, spaceID)
	if err != nil {
		return fmt.Errorf("soft delete page site: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for soft delete page site: %w", err)
	}
	if affected == 0 {
		return fmt.Errorf("page site not found")
	}
	return nil
}

func (r *PageSiteRepo) getByIDInSpace(ctx context.Context, id, spaceID int64) (*model.PageSite, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, spa_fallback, edge_version, created_at, updated_at, deleted_at
		FROM page_sites
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
	`, id, spaceID)

	site, err := scanPageSite(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get page site in space: %w", err)
	}
	return site, nil
}

func scanPageSite(row rowScanner) (*model.PageSite, error) {
	var (
		site             model.PageSite
		currentVersionID sql.NullInt64
		accessMode       string
		passwordHash     sql.NullString
		passwordSalt     sql.NullString
		deletedAt        sql.NullTime
	)

	if err := row.Scan(
		&site.ID,
		&site.SpaceID,
		&site.Name,
		&site.PageName,
		&currentVersionID,
		&accessMode,
		&passwordHash,
		&passwordSalt,
		&site.SPAFallback,
		&site.EdgeVersion,
		&site.CreatedAt,
		&site.UpdatedAt,
		&deletedAt,
	); err != nil {
		return nil, err
	}

	site.AccessMode = model.PageAccessMode(accessMode)
	if currentVersionID.Valid {
		site.CurrentVersionID = &currentVersionID.Int64
	}
	if passwordHash.Valid {
		site.PasswordHash = &passwordHash.String
	}
	if passwordSalt.Valid {
		site.PasswordSalt = &passwordSalt.String
	}
	if deletedAt.Valid {
		site.DeletedAt = &deletedAt.Time
	}

	return &site, nil
}

func translatePageWriteError(action string, err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == uniqueViolationCode {
		return fmt.Errorf("%s: duplicate value", action)
	}
	return fmt.Errorf("%s: %w", action, err)
}
