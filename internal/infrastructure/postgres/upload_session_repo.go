package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type UploadSessionRepo struct {
	db sqlstore.DBTX
}

func NewUploadSessionRepo(db sqlstore.DBTX) *UploadSessionRepo {
	return &UploadSessionRepo{db: db}
}

func (r *UploadSessionRepo) Create(ctx context.Context, input model.UploadSession) (*model.UploadSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("upload session repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO upload_sessions (space_id, target_type, target_id, object_key, status, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, space_id, target_type, target_id, object_key, status, expires_at, created_at
	`, input.SpaceID, string(input.TargetType), input.TargetID, input.ObjectKey, string(input.Status), input.ExpiresAt)

	session, err := scanUploadSession(row)
	if err != nil {
		return nil, fmt.Errorf("create upload session: %w", err)
	}
	return session, nil
}

func (r *UploadSessionRepo) GetByID(ctx context.Context, id int64) (*model.UploadSession, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("upload session repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, space_id, target_type, target_id, object_key, status, expires_at, created_at
		FROM upload_sessions
		WHERE id = $1
	`, id)

	session, err := scanUploadSession(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get upload session: %w", err)
	}
	return session, nil
}

func (r *UploadSessionRepo) MarkCompleted(ctx context.Context, id int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("upload session repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE upload_sessions
		SET status = $2
		WHERE id = $1
	`, id, string(model.UploadSessionStatusCompleted))
	if err != nil {
		return fmt.Errorf("mark upload session completed: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for mark upload session completed: %w", err)
	}
	if affected == 0 {
		return fmt.Errorf("upload session not found")
	}
	return nil
}

func (r *UploadSessionRepo) CountCompletedByTarget(ctx context.Context, targetType model.UploadTargetType, targetID int64) (int64, error) {
	if r == nil || r.db == nil {
		return 0, fmt.Errorf("upload session repo db is not configured")
	}

	var count int64
	if err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(1)
		FROM upload_sessions
		WHERE target_type = $1
		  AND target_id = $2
		  AND status = $3
	`, string(targetType), targetID, string(model.UploadSessionStatusCompleted)).Scan(&count); err != nil {
		return 0, fmt.Errorf("count completed upload sessions by target: %w", err)
	}
	return count, nil
}

func scanUploadSession(row rowScanner) (*model.UploadSession, error) {
	var (
		session    model.UploadSession
		targetType string
		status     string
	)
	if err := row.Scan(
		&session.ID,
		&session.SpaceID,
		&targetType,
		&session.TargetID,
		&session.ObjectKey,
		&status,
		&session.ExpiresAt,
		&session.CreatedAt,
	); err != nil {
		return nil, err
	}

	session.TargetType = model.UploadTargetType(targetType)
	session.Status = model.UploadSessionStatus(status)
	return &session, nil
}
