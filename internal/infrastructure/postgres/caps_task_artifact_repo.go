package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type CapsTaskArtifactRepo struct {
	db sqlstore.DBTX
}

func NewCapsTaskArtifactRepo(db sqlstore.DBTX) *CapsTaskArtifactRepo {
	return &CapsTaskArtifactRepo{db: db}
}

func (r *CapsTaskArtifactRepo) Create(ctx context.Context, input model.CapsTaskArtifact) (*model.CapsTaskArtifact, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps task artifact repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO caps_task_artifacts (task_id, role, position, storage_object_id, source_kind, source_url)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, task_id, role, position, storage_object_id, source_kind, source_url, created_at
	`, input.TaskID, string(input.Role), input.Position, input.StorageObjectID, string(input.SourceKind), input.SourceURL)

	item, err := scanCapsTaskArtifact(row)
	if err != nil {
		return nil, fmt.Errorf("create caps task artifact: %w", err)
	}
	return item, nil
}

func scanCapsTaskArtifact(row rowScanner) (*model.CapsTaskArtifact, error) {
	var (
		item            model.CapsTaskArtifact
		role            string
		sourceKind      string
		storageObjectID sql.NullInt64
		sourceURL       sql.NullString
	)

	if err := row.Scan(
		&item.ID,
		&item.TaskID,
		&role,
		&item.Position,
		&storageObjectID,
		&sourceKind,
		&sourceURL,
		&item.CreatedAt,
	); err != nil {
		return nil, err
	}

	item.Role = model.CapsTaskArtifactRole(role)
	item.SourceKind = model.CapsTaskArtifactSourceKind(sourceKind)
	if storageObjectID.Valid {
		item.StorageObjectID = &storageObjectID.Int64
	}
	if sourceURL.Valid {
		item.SourceURL = &sourceURL.String
	}
	return &item, nil
}
