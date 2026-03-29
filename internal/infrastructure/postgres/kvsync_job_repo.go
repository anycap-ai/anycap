package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type KVSyncJobRepo struct {
	db sqlstore.TxStarter
}

func NewKVSyncJobRepo(db sqlstore.TxStarter) *KVSyncJobRepo {
	return &KVSyncJobRepo{db: db}
}

func (r *KVSyncJobRepo) Create(ctx context.Context, job model.KVSyncJob) (*model.KVSyncJob, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("kvsync job repo db is not configured")
	}

	if job.MaxAttempts <= 0 {
		job.MaxAttempts = model.KVSyncJobDefaultMaxAttempts
	}
	if job.Status == "" {
		job.Status = model.KVSyncJobStatusPending
	}
	if job.NextRetryAt.IsZero() {
		job.NextRetryAt = time.Now().UTC()
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO kv_sync_jobs (
			job_type,
			target_id,
			edge_version,
			payload,
			status,
			attempts,
			max_attempts,
			next_retry_at,
			locked_by,
			locked_at,
			last_error
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, NULL)
		RETURNING id, job_type, target_id, edge_version, payload, status, attempts, max_attempts, next_retry_at, locked_by, locked_at, last_error, created_at, updated_at
	`, job.JobType, job.TargetID, job.EdgeVersion, job.Payload, string(job.Status), job.Attempts, job.MaxAttempts, job.NextRetryAt)

	created, err := scanKVSyncJob(row)
	if err != nil {
		return nil, fmt.Errorf("create kvsync job: %w", err)
	}
	return created, nil
}

func (r *KVSyncJobRepo) GetByID(ctx context.Context, id int64) (*model.KVSyncJob, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("kvsync job repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, job_type, target_id, edge_version, payload, status, attempts, max_attempts, next_retry_at, locked_by, locked_at, last_error, created_at, updated_at
		FROM kv_sync_jobs
		WHERE id = $1
	`, id)

	job, err := scanKVSyncJob(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get kvsync job: %w", err)
	}
	return job, nil
}

func (r *KVSyncJobRepo) ClaimNext(ctx context.Context, workerID string, now time.Time) (*model.KVSyncJob, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("kvsync job repo db is not configured")
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin claim kvsync job tx: %w", err)
	}
	defer func() {
		_ = tx.Rollback()
	}()

	row := tx.QueryRowContext(ctx, `
		SELECT id
		FROM kv_sync_jobs
		WHERE status IN ($1, $2)
		  AND next_retry_at <= $3
		ORDER BY next_retry_at ASC, id ASC
		FOR UPDATE SKIP LOCKED
		LIMIT 1
	`, string(model.KVSyncJobStatusPending), string(model.KVSyncJobStatusFailed), now)

	var id int64
	if err := row.Scan(&id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("scan kvsync job id for claim: %w", err)
	}

	row = tx.QueryRowContext(ctx, `
		UPDATE kv_sync_jobs
		SET status = $2,
			locked_by = $3,
			locked_at = $4,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, job_type, target_id, edge_version, payload, status, attempts, max_attempts, next_retry_at, locked_by, locked_at, last_error, created_at, updated_at
	`, id, string(model.KVSyncJobStatusProcessing), workerID, now)

	job, err := scanKVSyncJob(row)
	if err != nil {
		return nil, fmt.Errorf("claim kvsync job: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit claim kvsync job tx: %w", err)
	}
	return job, nil
}

func (r *KVSyncJobRepo) MarkDone(ctx context.Context, id int64) error {
	return r.markStatus(ctx, id, model.KVSyncJobStatusDone)
}

func (r *KVSyncJobRepo) MarkObsolete(ctx context.Context, id int64) error {
	return r.markStatus(ctx, id, model.KVSyncJobStatusObsolete)
}

func (r *KVSyncJobRepo) MarkFailed(ctx context.Context, id int64, lastError string, nextRetryAt time.Time) (model.KVSyncJobStatus, error) {
	if r == nil || r.db == nil {
		return "", fmt.Errorf("kvsync job repo db is not configured")
	}
	if nextRetryAt.IsZero() {
		nextRetryAt = time.Now().UTC()
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE kv_sync_jobs
		SET attempts = attempts + 1,
			status = CASE
				WHEN attempts + 1 >= max_attempts THEN $2
				ELSE $3
			END,
			next_retry_at = CASE
				WHEN attempts + 1 >= max_attempts THEN next_retry_at
				ELSE $4
			END,
			last_error = $5,
			locked_by = NULL,
			locked_at = NULL,
			updated_at = NOW()
		WHERE id = $1
		RETURNING status
	`, id, string(model.KVSyncJobStatusDead), string(model.KVSyncJobStatusFailed), nextRetryAt, lastError)

	var status string
	if err := row.Scan(&status); err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("kvsync job not found")
		}
		return "", fmt.Errorf("mark kvsync job failed: %w", err)
	}
	return model.KVSyncJobStatus(status), nil
}

func (r *KVSyncJobRepo) RequeueStaleProcessing(ctx context.Context, staleBefore time.Time) (int64, error) {
	if r == nil || r.db == nil {
		return 0, fmt.Errorf("kvsync job repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE kv_sync_jobs
		SET status = $2,
			locked_by = NULL,
			locked_at = NULL,
			updated_at = NOW()
		WHERE status = $1
		  AND locked_at IS NOT NULL
		  AND locked_at < $3
	`, string(model.KVSyncJobStatusProcessing), string(model.KVSyncJobStatusPending), staleBefore)
	if err != nil {
		return 0, fmt.Errorf("requeue stale processing kvsync jobs: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("rows affected for requeue stale processing kvsync jobs: %w", err)
	}
	return affected, nil
}

func (r *KVSyncJobRepo) markStatus(ctx context.Context, id int64, status model.KVSyncJobStatus) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("kvsync job repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE kv_sync_jobs
		SET status = $2,
			locked_by = NULL,
			locked_at = NULL,
			updated_at = NOW()
		WHERE id = $1
	`, id, string(status))
	if err != nil {
		return fmt.Errorf("mark kvsync job %s: %w", status, err)
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for mark kvsync job %s: %w", status, err)
	}
	if affected == 0 {
		return fmt.Errorf("kvsync job not found")
	}
	return nil
}

func scanKVSyncJob(row rowScanner) (*model.KVSyncJob, error) {
	var (
		job      model.KVSyncJob
		status   string
		lockedBy sql.NullString
		lockedAt sql.NullTime
		lastErr  sql.NullString
		payload  []byte
	)
	if err := row.Scan(
		&job.ID,
		&job.JobType,
		&job.TargetID,
		&job.EdgeVersion,
		&payload,
		&status,
		&job.Attempts,
		&job.MaxAttempts,
		&job.NextRetryAt,
		&lockedBy,
		&lockedAt,
		&lastErr,
		&job.CreatedAt,
		&job.UpdatedAt,
	); err != nil {
		return nil, err
	}
	job.Status = model.KVSyncJobStatus(status)
	job.Payload = payload
	if lockedBy.Valid {
		job.LockedBy = &lockedBy.String
	}
	if lockedAt.Valid {
		job.LockedAt = &lockedAt.Time
	}
	if lastErr.Valid {
		job.LastError = &lastErr.String
	}
	return &job, nil
}
