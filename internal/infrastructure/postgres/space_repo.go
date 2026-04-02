package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type SpaceRepo struct {
	db sqlstore.DBTX
}

func NewSpaceRepo(db sqlstore.DBTX) *SpaceRepo {
	return &SpaceRepo{db: db}
}

func (r *SpaceRepo) GetByOwnerUserID(ctx context.Context, ownerUserID int64) (*model.Space, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("space repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, owner_user_id, name, storage_used_bytes, drive_node_count, page_site_count, created_at
		FROM spaces
		WHERE owner_user_id = $1
	`, ownerUserID)

	space, err := scanSpace(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get space by owner user id: %w", err)
	}
	return space, nil
}

func (r *SpaceRepo) CreatePersonalSpace(ctx context.Context, ownerUserID int64, name string) (*model.Space, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("space repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO spaces (owner_user_id, name)
		VALUES ($1, $2)
		RETURNING id, owner_user_id, name, storage_used_bytes, drive_node_count, page_site_count, created_at
	`, ownerUserID, name)

	space, err := scanSpace(row)
	if err != nil {
		return nil, fmt.Errorf("create personal space: %w", err)
	}
	return space, nil
}

func scanSpace(row rowScanner) (*model.Space, error) {
	var space model.Space
	if err := row.Scan(&space.ID, &space.OwnerUserID, &space.Name, &space.StorageUsedBytes, &space.DriveNodeCount, &space.PageSiteCount, &space.CreatedAt); err != nil {
		return nil, err
	}
	return &space, nil
}

// IncrementStorageAndMarkSessionCompleted atomically increments storage counters
// and marks the upload session as completed using a single CTE statement.
// Returns false if quota would be exceeded.
//
// The session_update includes a status = 'pending' guard so that concurrent
// retries for the same session cannot double-count storage. If the space is
// incremented but the session was already completed by a concurrent call,
// the increment is compensated with a decrement (idempotent).
func (r *SpaceRepo) IncrementStorageAndMarkSessionCompleted(ctx context.Context, spaceID int64, sessionID int64, deltaBytes int64, deltaDriveNodes int, quotaBytes int64) (bool, error) {
	if r == nil || r.db == nil {
		return false, fmt.Errorf("space repo db is not configured")
	}

	var spaceUpdated, sessionUpdated int64
	err := r.db.QueryRowContext(ctx, `
		WITH space_update AS (
			UPDATE spaces
			SET storage_used_bytes = storage_used_bytes + $2,
			    drive_node_count = drive_node_count + $3
			WHERE id = $1
			  AND storage_used_bytes + $2 <= $4
			RETURNING id
		),
		session_update AS (
			UPDATE upload_sessions
			SET status = 'completed'
			WHERE id = $5
			  AND status = 'pending'
			  AND EXISTS (SELECT 1 FROM space_update)
			RETURNING id
		)
		SELECT
			(SELECT COUNT(*) FROM space_update),
			(SELECT COUNT(*) FROM session_update)
	`, spaceID, deltaBytes, deltaDriveNodes, quotaBytes, sessionID).Scan(&spaceUpdated, &sessionUpdated)
	if err != nil {
		return false, fmt.Errorf("increment storage and mark session completed: %w", err)
	}

	// Compensate: space was incremented but session was already completed by
	// a concurrent call. Decrement the orphaned increment to prevent over-count.
	if spaceUpdated > 0 && sessionUpdated == 0 {
		_, _ = r.db.ExecContext(ctx, `
			UPDATE spaces
			SET storage_used_bytes = GREATEST(0, storage_used_bytes - $2),
			    drive_node_count = GREATEST(0, drive_node_count - $3)
			WHERE id = $1
		`, spaceID, deltaBytes, deltaDriveNodes)
		// Treat as idempotent success: another call already completed this session.
		return true, nil
	}

	return spaceUpdated > 0, nil
}

// IncrementDriveNodeCount atomically increments drive_node_count if below maxNodes.
func (r *SpaceRepo) IncrementDriveNodeCount(ctx context.Context, spaceID int64, maxNodes int) (bool, error) {
	if r == nil || r.db == nil {
		return false, fmt.Errorf("space repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE spaces
		SET drive_node_count = drive_node_count + 1
		WHERE id = $1
		  AND drive_node_count < $2
	`, spaceID, maxNodes)
	if err != nil {
		return false, fmt.Errorf("increment drive node count: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("rows affected for increment drive node count: %w", err)
	}
	return affected > 0, nil
}

// DecrementDriveStorage decrements storage_used_bytes and drive_node_count, clamped to 0.
func (r *SpaceRepo) DecrementDriveStorage(ctx context.Context, spaceID int64, deltaBytes int64, deltaRealNodes int) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("space repo db is not configured")
	}

	_, err := r.db.ExecContext(ctx, `
		UPDATE spaces
		SET storage_used_bytes = GREATEST(0, storage_used_bytes - $2),
		    drive_node_count = GREATEST(0, drive_node_count - $3)
		WHERE id = $1
	`, spaceID, deltaBytes, deltaRealNodes)
	if err != nil {
		return fmt.Errorf("decrement drive storage: %w", err)
	}
	return nil
}

// IncrementPageSiteCount atomically increments page_site_count if below maxSites.
func (r *SpaceRepo) IncrementPageSiteCount(ctx context.Context, spaceID int64, maxSites int) (bool, error) {
	if r == nil || r.db == nil {
		return false, fmt.Errorf("space repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE spaces
		SET page_site_count = page_site_count + 1
		WHERE id = $1
		  AND page_site_count < $2
	`, spaceID, maxSites)
	if err != nil {
		return false, fmt.Errorf("increment page site count: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("rows affected for increment page site count: %w", err)
	}
	return affected > 0, nil
}

// DecrementPageSiteStorage decrements storage_used_bytes and page_site_count by 1, clamped to 0.
func (r *SpaceRepo) DecrementPageSiteStorage(ctx context.Context, spaceID int64, deltaBytes int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("space repo db is not configured")
	}

	_, err := r.db.ExecContext(ctx, `
		UPDATE spaces
		SET storage_used_bytes = GREATEST(0, storage_used_bytes - $2),
		    page_site_count = GREATEST(0, page_site_count - 1)
		WHERE id = $1
	`, spaceID, deltaBytes)
	if err != nil {
		return fmt.Errorf("decrement page site storage: %w", err)
	}
	return nil
}
