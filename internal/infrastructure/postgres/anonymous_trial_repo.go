package postgres

import (
	"context"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type AnonymousTrialRepo struct {
	db sqlstore.TxStarter
}

func NewAnonymousTrialRepo(db sqlstore.TxStarter) *AnonymousTrialRepo {
	return &AnonymousTrialRepo{db: db}
}

func (r *AnonymousTrialRepo) ConsumeAnonymousTrial(ctx context.Context, key string, now time.Time, limit int, window time.Duration) (model.AnonymousTrialState, error) {
	if r == nil || r.db == nil {
		return model.AnonymousTrialState{}, fmt.Errorf("anonymous trial store is not configured")
	}
	if limit <= 0 {
		return model.AnonymousTrialState{Key: key, Limit: limit, Allowed: false}, nil
	}
	if window <= 0 {
		window = 30 * 24 * time.Hour
	}

	resetAt := now.Add(window)
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return model.AnonymousTrialState{}, fmt.Errorf("begin anonymous trial tx: %w", err)
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	result, err := tx.ExecContext(ctx, `
		INSERT INTO anonymous_trial_buckets (
			bucket_key, request_count, window_start, reset_at, created_at, updated_at
		) VALUES ($1, 1, $2, $3, $2, $2)
		ON CONFLICT (bucket_key) DO NOTHING
	`, key, now, resetAt)
	if err != nil {
		return model.AnonymousTrialState{}, fmt.Errorf("insert anonymous trial bucket: %w", err)
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return model.AnonymousTrialState{}, fmt.Errorf("read anonymous trial insert result: %w", err)
	}
	if affected > 0 {
		if err := tx.Commit(); err != nil {
			return model.AnonymousTrialState{}, fmt.Errorf("commit anonymous trial insert: %w", err)
		}
		committed = true
		return model.AnonymousTrialState{Key: key, Count: 1, Limit: limit, ResetAt: resetAt, Allowed: true}, nil
	}

	var count int
	var currentResetAt time.Time
	if err := tx.QueryRowContext(ctx, `
		SELECT request_count, reset_at
		FROM anonymous_trial_buckets
		WHERE bucket_key = $1
		FOR UPDATE
	`, key).Scan(&count, &currentResetAt); err != nil {
		return model.AnonymousTrialState{}, fmt.Errorf("select anonymous trial bucket: %w", err)
	}

	if !currentResetAt.After(now) {
		count = 1
		currentResetAt = resetAt
		if _, err := tx.ExecContext(ctx, `
			UPDATE anonymous_trial_buckets
			SET request_count = $2,
			    window_start = $3,
			    reset_at = $4,
			    updated_at = $3
			WHERE bucket_key = $1
		`, key, count, now, currentResetAt); err != nil {
			return model.AnonymousTrialState{}, fmt.Errorf("reset anonymous trial bucket: %w", err)
		}
		if err := tx.Commit(); err != nil {
			return model.AnonymousTrialState{}, fmt.Errorf("commit anonymous trial reset: %w", err)
		}
		committed = true
		return model.AnonymousTrialState{Key: key, Count: count, Limit: limit, ResetAt: currentResetAt, Allowed: true}, nil
	}

	if count >= limit {
		if err := tx.Commit(); err != nil {
			return model.AnonymousTrialState{}, fmt.Errorf("commit anonymous trial block: %w", err)
		}
		committed = true
		return model.AnonymousTrialState{Key: key, Count: count, Limit: limit, ResetAt: currentResetAt, Allowed: false}, nil
	}

	count++
	if _, err := tx.ExecContext(ctx, `
		UPDATE anonymous_trial_buckets
		SET request_count = $2,
		    updated_at = $3
		WHERE bucket_key = $1
	`, key, count, now); err != nil {
		return model.AnonymousTrialState{}, fmt.Errorf("increment anonymous trial bucket: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return model.AnonymousTrialState{}, fmt.Errorf("commit anonymous trial increment: %w", err)
	}
	committed = true
	return model.AnonymousTrialState{Key: key, Count: count, Limit: limit, ResetAt: currentResetAt, Allowed: true}, nil
}
