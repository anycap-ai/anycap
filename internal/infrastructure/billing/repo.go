package billing

import (
	"context"
	"database/sql"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

type Repo struct {
	db sqlstore.DBTX
}

func NewRepo(db sqlstore.DBTX) *Repo {
	return &Repo{db: db}
}

func (r *Repo) CreateOrGetIntent(ctx context.Context, intent model.BillingIntent) (model.BillingIntent, error) {
	numericUserID, err := userid.Parse(intent.UserID)
	if err != nil {
		return model.BillingIntent{}, err
	}
	row := r.db.QueryRowContext(ctx, `
		INSERT INTO billing_intents (
			id, user_id, api_key_id, provider, capability, trace_id, provider_task_id,
			credit_cost, billing_status, provider_status, deduct_source_id, last_error,
			recovery_attempts, next_retry_at, created_at, updated_at, deducted_at, released_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			$8, $9, $10, $11, $12,
			$13, $14, $15, $16, $17, $18
		)
		ON CONFLICT (provider, trace_id) DO UPDATE
		SET provider = EXCLUDED.provider
		RETURNING id, user_id, COALESCE(api_key_id, ''), provider, capability, trace_id, COALESCE(provider_task_id, ''),
		          credit_cost, billing_status, COALESCE(provider_status, ''), deduct_source_id, COALESCE(last_error, ''),
		          recovery_attempts, next_retry_at, created_at, updated_at, deducted_at, released_at
	`, intent.ID, numericUserID, nullableString(intent.APIKeyID), intent.Provider, intent.Capability, intent.TraceID, nullableString(intent.ProviderTaskID), intent.CreditCost, intent.BillingStatus, nullableString(intent.ProviderStatus), intent.DeductSourceID, nullableString(intent.LastError), intent.RecoveryAttempts, intent.NextRetryAt, intent.CreatedAt, intent.UpdatedAt, intent.DeductedAt, intent.ReleasedAt)
	return scanBillingIntent(row)
}

func (r *Repo) GetIntentByTrace(ctx context.Context, provider, traceID string) (*model.BillingIntent, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, COALESCE(api_key_id, ''), provider, capability, trace_id, COALESCE(provider_task_id, ''),
		       credit_cost, billing_status, COALESCE(provider_status, ''), deduct_source_id, COALESCE(last_error, ''),
		       recovery_attempts, next_retry_at, created_at, updated_at, deducted_at, released_at
		FROM billing_intents
		WHERE provider = $1 AND trace_id = $2
	`, provider, traceID)
	intent, err := scanBillingIntent(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &intent, nil
}

func (r *Repo) RecordProviderSuccess(ctx context.Context, update model.BillingIntentProviderSuccessUpdate) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE billing_intents
		SET provider_task_id = $1,
		    provider_status = $2,
		    credit_cost = $3,
		    billing_status = $4,
		    last_error = '',
		    updated_at = $5
		WHERE provider = $6 AND trace_id = $7
	`, update.ProviderTaskID, update.ProviderStatus, update.CreditCost, model.BillingStatusProviderSucceededPendingDeduct, update.UpdatedAt, update.Provider, update.TraceID)
	return err
}

func (r *Repo) RecordProviderFailure(ctx context.Context, update model.BillingIntentProviderFailureUpdate) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE billing_intents
		SET provider_status = $1,
		    billing_status = $2,
		    last_error = $3,
		    updated_at = $4
		WHERE provider = $5 AND trace_id = $6
	`, update.ProviderStatus, model.BillingStatusProviderFailed, update.LastError, update.UpdatedAt, update.Provider, update.TraceID)
	return err
}

func (r *Repo) MarkUncertain(ctx context.Context, update model.BillingIntentRetryUpdate) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE billing_intents
		SET billing_status = $1,
		    last_error = $2,
		    recovery_attempts = $3,
		    next_retry_at = $4,
		    updated_at = $5
		WHERE provider = $6 AND trace_id = $7
	`, model.BillingStatusUncertainRetryable, update.LastError, update.RecoveryAttempts, update.NextRetryAt, update.UpdatedAt, update.Provider, update.TraceID)
	return err
}

func (r *Repo) MarkDeducted(ctx context.Context, update model.BillingIntentDeductedUpdate) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE billing_intents
		SET billing_status = $1,
		    deducted_at = $2,
		    last_error = '',
		    updated_at = $3
		WHERE provider = $4 AND trace_id = $5
	`, model.BillingStatusDeducted, update.DeductedAt, update.UpdatedAt, update.Provider, update.TraceID)
	return err
}

func (r *Repo) MarkReleased(ctx context.Context, update model.BillingIntentReleaseUpdate) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE billing_intents
		SET billing_status = $1,
		    last_error = $2,
		    released_at = $3,
		    updated_at = $4
		WHERE provider = $5 AND trace_id = $6
	`, model.BillingStatusReleased, update.LastError, update.ReleasedAt, update.UpdatedAt, update.Provider, update.TraceID)
	return err
}

func (r *Repo) ListRecoverableIntents(ctx context.Context, now time.Time, limit int) ([]model.BillingIntent, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, COALESCE(api_key_id, ''), provider, capability, trace_id, COALESCE(provider_task_id, ''),
		       credit_cost, billing_status, COALESCE(provider_status, ''), deduct_source_id, COALESCE(last_error, ''),
		       recovery_attempts, next_retry_at, created_at, updated_at, deducted_at, released_at
		FROM billing_intents
		WHERE billing_status = $1
		   OR (billing_status = $2 AND (next_retry_at IS NULL OR next_retry_at <= $3))
		ORDER BY created_at ASC
		LIMIT $4
	`, model.BillingStatusProviderSucceededPendingDeduct, model.BillingStatusUncertainRetryable, now, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	intents := make([]model.BillingIntent, 0, limit)
	for rows.Next() {
		intent, scanErr := scanBillingIntent(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		intents = append(intents, intent)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return intents, nil
}

type billingScanner interface {
	Scan(dest ...any) error
}

func scanBillingIntent(scanner billingScanner) (model.BillingIntent, error) {
	var (
		intent        model.BillingIntent
		numericUserID int64
	)
	err := scanner.Scan(
		&intent.ID,
		&numericUserID,
		&intent.APIKeyID,
		&intent.Provider,
		&intent.Capability,
		&intent.TraceID,
		&intent.ProviderTaskID,
		&intent.CreditCost,
		&intent.BillingStatus,
		&intent.ProviderStatus,
		&intent.DeductSourceID,
		&intent.LastError,
		&intent.RecoveryAttempts,
		&intent.NextRetryAt,
		&intent.CreatedAt,
		&intent.UpdatedAt,
		&intent.DeductedAt,
		&intent.ReleasedAt,
	)
	if err != nil {
		return model.BillingIntent{}, err
	}
	intent.UserID = userid.Format(numericUserID)
	return intent, nil
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}
