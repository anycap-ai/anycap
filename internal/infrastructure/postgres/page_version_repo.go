package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type PageVersionRepo struct {
	db sqlstore.DBTX
}

func NewPageVersionRepo(db sqlstore.DBTX) *PageVersionRepo {
	return &PageVersionRepo{db: db}
}

func (r *PageVersionRepo) CreateDraft(ctx context.Context, pageID int64, createdBy string, assetPrefix string) (*model.PageVersion, error) {
	return r.createDraft(ctx, pageID, createdBy, assetPrefix, nil)
}

func (r *PageVersionRepo) CreateDraftFromSource(ctx context.Context, pageID int64, createdBy string, assetPrefix string, sourceVersionID int64) (*model.PageVersion, error) {
	return r.createDraft(ctx, pageID, createdBy, assetPrefix, &sourceVersionID)
}

func (r *PageVersionRepo) createDraft(ctx context.Context, pageID int64, createdBy string, assetPrefix string, sourceVersionID *int64) (*model.PageVersion, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page version repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		WITH next_version AS (
			SELECT COALESCE(MAX(version_no), 0) + 1 AS version_no
			FROM page_versions
			WHERE page_id = $1
		)
		INSERT INTO page_versions (page_id, version_no, source_version_id, status, asset_prefix, created_by)
		SELECT
			$1,
			version_no,
			$4,
			$2,
			CASE
				WHEN $3 = '' THEN CONCAT('page/sites/', $1::text, '/versions/', version_no::text)
				ELSE CONCAT($3, '/', version_no::text)
			END,
			$5
		FROM next_version
		RETURNING id, page_id, version_no, source_version_id, status, asset_prefix, created_by, created_at
	`, pageID, string(model.PageVersionStatusDraft), assetPrefix, sourceVersionID, createdBy)

	version, err := scanPageVersion(row)
	if err != nil {
		return nil, fmt.Errorf("create page version draft: %w", err)
	}
	return version, nil
}

func (r *PageVersionRepo) GetByID(ctx context.Context, id int64) (*model.PageVersion, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page version repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, page_id, version_no, source_version_id, status, asset_prefix, created_by, created_at
		FROM page_versions
		WHERE id = $1
	`, id)

	version, err := scanPageVersion(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get page version: %w", err)
	}
	return version, nil
}

func (r *PageVersionRepo) UpdateStatus(ctx context.Context, id int64, status model.PageVersionStatus) (*model.PageVersion, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page version repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE page_versions
		SET status = $2
		WHERE id = $1
		RETURNING id, page_id, version_no, source_version_id, status, asset_prefix, created_by, created_at
	`, id, string(status))

	version, err := scanPageVersion(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("update page version status: %w", err)
	}
	return version, nil
}

func (r *PageVersionRepo) ListByPageID(ctx context.Context, pageID int64) ([]model.PageVersion, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("page version repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, page_id, version_no, source_version_id, status, asset_prefix, created_by, created_at
		FROM page_versions
		WHERE page_id = $1
		ORDER BY version_no DESC, id DESC
	`, pageID)
	if err != nil {
		return nil, fmt.Errorf("list page versions by page id: %w", err)
	}
	defer rows.Close()

	items := make([]model.PageVersion, 0)
	for rows.Next() {
		version, scanErr := scanPageVersion(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan page version: %w", scanErr)
		}
		items = append(items, *version)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate page versions: %w", err)
	}
	return items, nil
}

func scanPageVersion(row rowScanner) (*model.PageVersion, error) {
	var (
		version         model.PageVersion
		sourceVersionID sql.NullInt64
		status          string
	)

	if err := row.Scan(
		&version.ID,
		&version.PageID,
		&version.VersionNo,
		&sourceVersionID,
		&status,
		&version.AssetPrefix,
		&version.CreatedBy,
		&version.CreatedAt,
	); err != nil {
		return nil, err
	}

	version.Status = model.PageVersionStatus(status)
	if sourceVersionID.Valid {
		version.SourceVersionID = &sourceVersionID.Int64
	}
	return &version, nil
}
