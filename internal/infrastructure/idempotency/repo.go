package idempotency

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type IdempotencyRepo struct {
	db sqlstore.DBTX
}

func NewIdempotencyRepo(db sqlstore.DBTX) *IdempotencyRepo {
	return &IdempotencyRepo{db: db}
}

func (r *IdempotencyRepo) Claim(ctx context.Context, scope, key string) (bool, error) {
	result, err := r.db.ExecContext(ctx, `
		INSERT INTO idempotency_keys (scope, idempotency_key)
		VALUES ($1, $2)
		ON CONFLICT (scope, idempotency_key) DO NOTHING
	`, scope, key)
	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected == 1, nil
}
