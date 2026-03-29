package postgres

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type PageSlugRepo struct {
	db sqlstore.DBTX
}

func NewPageSlugRepo(db sqlstore.DBTX) *PageSlugRepo {
	return &PageSlugRepo{db: db}
}

func (r *PageSlugRepo) Create(ctx context.Context, slug string, pageID int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("page slug repo db is not configured")
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO page_slug_registry (slug, status, page_id)
		VALUES ($1, $2, $3)
	`, slug, string(model.PageSlugStatusActive), pageID)
	if err != nil {
		return fmt.Errorf("create page slug: %w", err)
	}
	return nil
}

func (r *PageSlugRepo) MarkTombstone(ctx context.Context, slug string, pageID int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("page slug repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE page_slug_registry
		SET status = $2
		WHERE slug = $1 AND page_id = $3
	`, slug, string(model.PageSlugStatusTombstone), pageID)
	if err != nil {
		return fmt.Errorf("mark page slug tombstone: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for mark page slug tombstone: %w", err)
	}
	if affected > 0 {
		return nil
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO page_slug_registry (slug, status, page_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, page_id = EXCLUDED.page_id
	`, slug, string(model.PageSlugStatusTombstone), pageID)
	if err != nil {
		return fmt.Errorf("upsert page slug tombstone: %w", err)
	}
	return nil
}
