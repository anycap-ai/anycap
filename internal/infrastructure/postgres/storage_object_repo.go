package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type StorageObjectRepo struct {
	db sqlstore.DBTX
}

func NewStorageObjectRepo(db sqlstore.DBTX) *StorageObjectRepo {
	return &StorageObjectRepo{db: db}
}

func (r *StorageObjectRepo) Create(ctx context.Context, input model.StorageObject) (*model.StorageObject, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("storage object repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO storage_objects (space_id, bucket, object_key, size, mime, etag, sha256)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, space_id, bucket, object_key, size, mime, etag, sha256, created_at
	`, input.SpaceID, input.Bucket, input.ObjectKey, input.Size, input.MIME, input.ETag, input.SHA256)

	obj, err := scanStorageObject(row)
	if err != nil {
		return nil, fmt.Errorf("create storage object: %w", err)
	}
	return obj, nil
}

func (r *StorageObjectRepo) GetByID(ctx context.Context, id int64) (*model.StorageObject, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("storage object repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, space_id, bucket, object_key, size, mime, etag, sha256, created_at
		FROM storage_objects
		WHERE id = $1
	`, id)
	obj, err := scanStorageObject(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get storage object: %w", err)
	}
	return obj, nil
}

func (r *StorageObjectRepo) ListByPrefix(ctx context.Context, spaceID int64, objectKeyPrefix string) ([]model.StorageObject, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("storage object repo db is not configured")
	}

	trimmedPrefix := strings.TrimSpace(objectKeyPrefix)
	if trimmedPrefix == "" {
		return nil, fmt.Errorf("object key prefix is required")
	}
	if !strings.HasSuffix(trimmedPrefix, "/") {
		trimmedPrefix += "/"
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, space_id, bucket, object_key, size, mime, etag, sha256, created_at
		FROM storage_objects
		WHERE space_id = $1 AND object_key LIKE $2
		ORDER BY object_key ASC, id ASC
	`, spaceID, trimmedPrefix+"%")
	if err != nil {
		return nil, fmt.Errorf("list storage objects by prefix: %w", err)
	}
	defer rows.Close()

	items := make([]model.StorageObject, 0)
	for rows.Next() {
		obj, scanErr := scanStorageObject(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan storage object: %w", scanErr)
		}
		items = append(items, *obj)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate storage objects: %w", err)
	}
	return items, nil
}

func scanStorageObject(row rowScanner) (*model.StorageObject, error) {
	var (
		obj    model.StorageObject
		sha256 sql.NullString
	)
	if err := row.Scan(
		&obj.ID,
		&obj.SpaceID,
		&obj.Bucket,
		&obj.ObjectKey,
		&obj.Size,
		&obj.MIME,
		&obj.ETag,
		&sha256,
		&obj.CreatedAt,
	); err != nil {
		return nil, err
	}
	if sha256.Valid {
		obj.SHA256 = &sha256.String
	}
	return &obj, nil
}
