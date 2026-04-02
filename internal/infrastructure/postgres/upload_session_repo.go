package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

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

// ExpireStaleBySpace marks pending sessions as expired and returns their target IDs.
func (r *UploadSessionRepo) ExpireStaleBySpace(ctx context.Context, spaceID int64, targetType model.UploadTargetType, now time.Time) ([]model.ExpiredSessionInfo, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("upload session repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		UPDATE upload_sessions
		SET status = 'expired'
		WHERE space_id = $1
		  AND target_type = $2
		  AND status = 'pending'
		  AND expires_at < $3
		RETURNING id, target_id
	`, spaceID, string(targetType), now)
	if err != nil {
		return nil, fmt.Errorf("expire stale upload sessions: %w", err)
	}
	defer rows.Close()

	var results []model.ExpiredSessionInfo
	for rows.Next() {
		var info model.ExpiredSessionInfo
		if err := rows.Scan(&info.SessionID, &info.TargetID); err != nil {
			return nil, fmt.Errorf("scan expired session info: %w", err)
		}
		results = append(results, info)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate expired session rows: %w", err)
	}
	return results, nil
}

// CountPendingBySpaceAndType counts non-expired pending sessions for quota enforcement.
func (r *UploadSessionRepo) CountPendingBySpaceAndType(ctx context.Context, spaceID int64, targetType model.UploadTargetType) (int64, error) {
	if r == nil || r.db == nil {
		return 0, fmt.Errorf("upload session repo db is not configured")
	}

	var count int64
	if err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(1)
		FROM upload_sessions
		WHERE space_id = $1
		  AND target_type = $2
		  AND status = 'pending'
	`, spaceID, string(targetType)).Scan(&count); err != nil {
		return 0, fmt.Errorf("count pending upload sessions: %w", err)
	}
	return count, nil
}

// CountByTargetAndStatuses counts sessions matching any of the given statuses for a target.
func (r *UploadSessionRepo) CountByTargetAndStatuses(ctx context.Context, targetType model.UploadTargetType, targetID int64, statuses []model.UploadSessionStatus) (int64, error) {
	if r == nil || r.db == nil {
		return 0, fmt.Errorf("upload session repo db is not configured")
	}
	if len(statuses) == 0 {
		return 0, nil
	}

	placeholders := make([]string, len(statuses))
	args := make([]any, 0, len(statuses)+2)
	args = append(args, string(targetType), targetID)
	for i, s := range statuses {
		placeholders[i] = fmt.Sprintf("$%d", i+3)
		args = append(args, string(s))
	}

	query := fmt.Sprintf(`
		SELECT COUNT(1)
		FROM upload_sessions
		WHERE target_type = $1
		  AND target_id = $2
		  AND status IN (%s)
	`, strings.Join(placeholders, ", "))

	var count int64
	if err := r.db.QueryRowContext(ctx, query, args...).Scan(&count); err != nil {
		return 0, fmt.Errorf("count upload sessions by target and statuses: %w", err)
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
