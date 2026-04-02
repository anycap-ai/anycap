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

type CapsArtifactRepo struct {
	db sqlstore.DBTX
}

func NewCapsArtifactRepo(db sqlstore.DBTX) *CapsArtifactRepo {
	return &CapsArtifactRepo{db: db}
}

func (r *CapsArtifactRepo) Create(ctx context.Context, input model.CapsArtifact) (*model.CapsArtifact, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps artifact repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO caps_artifacts (
			external_id, space_id, provider, provider_task_id, capability, media_type, position, status,
			source_url, source_mime, source_size, storage_object_id, error_code, error_message, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULLIF($10, ''), $11, $12, $13, $14, $15)
		RETURNING id, external_id, space_id, provider, provider_task_id, capability, media_type, position, status,
		          source_url, source_mime, source_size, storage_object_id, error_code, error_message, created_by, created_at, ready_at
	`,
		externalid.Generate(externalid.PrefixCapsArtifact),
		input.SpaceID,
		strings.TrimSpace(input.Provider),
		strings.TrimSpace(input.ProviderTaskID),
		strings.TrimSpace(input.Capability),
		string(input.MediaType),
		input.Position,
		string(input.Status),
		strings.TrimSpace(input.SourceURL),
		trimNilString(input.SourceMIME),
		input.SourceSize,
		input.StorageObjectID,
		trimNilString(input.ErrorCode),
		trimNilString(input.ErrorMessage),
		strings.TrimSpace(input.CreatedBy),
	)

	item, err := scanCapsArtifact(row)
	if err != nil {
		return nil, fmt.Errorf("create caps artifact: %w", err)
	}
	return item, nil
}

func (r *CapsArtifactRepo) MarkReady(ctx context.Context, id int64, storageObjectID int64, sourceMIME string, sourceSize int64, readyAt time.Time) (*model.CapsArtifact, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps artifact repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE caps_artifacts
		SET status = $2,
			source_mime = NULLIF($3, ''),
			source_size = $4,
			storage_object_id = $5,
			error_code = NULL,
			error_message = NULL,
			ready_at = $6
		WHERE id = $1
		RETURNING id, external_id, space_id, provider, provider_task_id, capability, media_type, position, status,
		          source_url, source_mime, source_size, storage_object_id, error_code, error_message, created_by, created_at, ready_at
	`, id, string(model.CapsArtifactStatusReady), strings.TrimSpace(sourceMIME), sourceSize, storageObjectID, readyAt.UTC())

	item, err := scanCapsArtifact(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("mark caps artifact ready: %w", err)
	}
	return item, nil
}

func (r *CapsArtifactRepo) MarkFailed(ctx context.Context, id int64, errorCode string, errorMessage string) (*model.CapsArtifact, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps artifact repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE caps_artifacts
		SET status = $2,
			error_code = NULLIF($3, ''),
			error_message = NULLIF($4, '')
		WHERE id = $1
		RETURNING id, external_id, space_id, provider, provider_task_id, capability, media_type, position, status,
		          source_url, source_mime, source_size, storage_object_id, error_code, error_message, created_by, created_at, ready_at
	`, id, string(model.CapsArtifactStatusFailed), strings.TrimSpace(errorCode), strings.TrimSpace(errorMessage))

	item, err := scanCapsArtifact(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("mark caps artifact failed: %w", err)
	}
	return item, nil
}

func scanCapsArtifact(row rowScanner) (*model.CapsArtifact, error) {
	var (
		item            model.CapsArtifact
		mediaType       string
		status          string
		sourceMIME      sql.NullString
		sourceSize      sql.NullInt64
		storageObjectID sql.NullInt64
		errorCode       sql.NullString
		errorMessage    sql.NullString
		readyAt         sql.NullTime
	)

	if err := row.Scan(
		&item.ID,
		&item.ExternalID,
		&item.SpaceID,
		&item.Provider,
		&item.ProviderTaskID,
		&item.Capability,
		&mediaType,
		&item.Position,
		&status,
		&item.SourceURL,
		&sourceMIME,
		&sourceSize,
		&storageObjectID,
		&errorCode,
		&errorMessage,
		&item.CreatedBy,
		&item.CreatedAt,
		&readyAt,
	); err != nil {
		return nil, err
	}

	item.MediaType = model.CapsArtifactMediaType(mediaType)
	item.Status = model.CapsArtifactStatus(status)
	if sourceMIME.Valid {
		item.SourceMIME = &sourceMIME.String
	}
	if sourceSize.Valid {
		item.SourceSize = &sourceSize.Int64
	}
	if storageObjectID.Valid {
		item.StorageObjectID = &storageObjectID.Int64
	}
	if errorCode.Valid {
		item.ErrorCode = &errorCode.String
	}
	if errorMessage.Valid {
		item.ErrorMessage = &errorMessage.String
	}
	if readyAt.Valid {
		item.ReadyAt = &readyAt.Time
	}

	return &item, nil
}

func trimNilString(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
