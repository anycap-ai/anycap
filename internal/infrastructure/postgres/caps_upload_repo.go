package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

type CapsUploadRepo struct {
	db sqlstore.DBTX
}

func NewCapsUploadRepo(db sqlstore.DBTX) *CapsUploadRepo {
	return &CapsUploadRepo{db: db}
}

func (r *CapsUploadRepo) Create(ctx context.Context, input model.CapsUpload) (*model.CapsUpload, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps upload repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO caps_uploads (external_id, space_id, object_key, filename, mime, size, sha256, status, expires_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, external_id, space_id, object_key, filename, mime, size, sha256, status, expires_at, last_used_at, use_count, created_by, created_at
	`,
		externalid.Generate(externalid.PrefixCapsUpload),
		input.SpaceID,
		input.ObjectKey,
		strings.TrimSpace(input.Filename),
		strings.TrimSpace(input.MIME),
		input.Size,
		input.SHA256,
		string(input.Status),
		input.ExpiresAt,
		strings.TrimSpace(input.CreatedBy),
	)

	item, err := scanCapsUpload(row)
	if err != nil {
		return nil, fmt.Errorf("create caps upload: %w", err)
	}
	return item, nil
}

func (r *CapsUploadRepo) GetByID(ctx context.Context, id int64) (*model.CapsUpload, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps upload repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, external_id, space_id, object_key, filename, mime, size, sha256, status, expires_at, last_used_at, use_count, created_by, created_at
		FROM caps_uploads
		WHERE id = $1
	`, id)

	item, err := scanCapsUpload(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get caps upload: %w", err)
	}
	return item, nil
}

func (r *CapsUploadRepo) GetByExternalID(ctx context.Context, externalID string) (*model.CapsUpload, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps upload repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, external_id, space_id, object_key, filename, mime, size, sha256, status, expires_at, last_used_at, use_count, created_by, created_at
		FROM caps_uploads
		WHERE external_id = $1
	`, strings.TrimSpace(externalID))

	item, err := scanCapsUpload(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get caps upload by external id: %w", err)
	}
	return item, nil
}

func (r *CapsUploadRepo) FindReusable(ctx context.Context, spaceID int64, sha256 string, size int64, mime string) (*model.CapsUpload, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps upload repo db is not configured")
	}
	trimmedSHA := strings.TrimSpace(sha256)
	trimmedMIME := strings.TrimSpace(mime)
	if trimmedSHA == "" || trimmedMIME == "" || size <= 0 {
		return nil, nil
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, external_id, space_id, object_key, filename, mime, size, sha256, status, expires_at, last_used_at, use_count, created_by, created_at
		FROM caps_uploads
		WHERE space_id = $1
		  AND sha256 = $2
		  AND size = $3
		  AND mime = $4
		  AND status = $5
		  AND expires_at > NOW()
		ORDER BY id DESC
		LIMIT 1
	`, spaceID, trimmedSHA, size, trimmedMIME, string(model.CapsUploadStatusUploaded))

	item, err := scanCapsUpload(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("find reusable caps upload: %w", err)
	}
	return item, nil
}

func (r *CapsUploadRepo) MarkUsed(ctx context.Context, id int64, usedAt time.Time) (*model.CapsUpload, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps upload repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE caps_uploads
		SET status = $2,
			last_used_at = $3,
			use_count = use_count + 1
		WHERE id = $1
		RETURNING id, external_id, space_id, object_key, filename, mime, size, sha256, status, expires_at, last_used_at, use_count, created_by, created_at
	`, id, string(model.CapsUploadStatusUploaded), usedAt.UTC())

	item, err := scanCapsUpload(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("mark caps upload used: %w", err)
	}
	return item, nil
}

func scanCapsUpload(row rowScanner) (*model.CapsUpload, error) {
	var (
		item       model.CapsUpload
		sha256     sql.NullString
		status     string
		lastUsedAt sql.NullTime
	)

	if err := row.Scan(
		&item.ID,
		&item.ExternalID,
		&item.SpaceID,
		&item.ObjectKey,
		&item.Filename,
		&item.MIME,
		&item.Size,
		&sha256,
		&status,
		&item.ExpiresAt,
		&lastUsedAt,
		&item.UseCount,
		&item.CreatedBy,
		&item.CreatedAt,
	); err != nil {
		return nil, err
	}

	item.Status = model.CapsUploadStatus(status)
	if sha256.Valid {
		item.SHA256 = &sha256.String
	}
	if lastUsedAt.Valid {
		item.LastUsedAt = &lastUsedAt.Time
	}
	return &item, nil
}
