package apikey

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

type APIKeyRepo struct {
	db sqlstore.DBTX
}

func NewAPIKeyRepo(db sqlstore.DBTX) *APIKeyRepo {
	return &APIKeyRepo{db: db}
}

func (r *APIKeyRepo) Insert(ctx context.Context, key model.APIKey) error {
	numericUserID, err := userid.Parse(key.UserID)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO api_keys (
			id, user_id, name, key_prefix, key_hash, status, expires_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, key.ID, numericUserID, key.Name, key.KeyPrefix, key.KeyHash, key.Status, key.ExpiresAt, key.CreatedAt)
	return err
}

func (r *APIKeyRepo) FindByPrefix(ctx context.Context, prefix string) (model.APIKey, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, name, key_prefix, key_hash, status, expires_at, last_used_at, created_at
		FROM api_keys
		WHERE key_prefix = $1
	`, prefix)

	var key model.APIKey
	var numericUserID int64
	err := row.Scan(
		&key.ID,
		&numericUserID,
		&key.Name,
		&key.KeyPrefix,
		&key.KeyHash,
		&key.Status,
		&key.ExpiresAt,
		&key.LastUsedAt,
		&key.CreatedAt,
	)
	if err != nil {
		return model.APIKey{}, err
	}
	key.UserID = userid.Format(numericUserID)

	return key, nil
}

func (r *APIKeyRepo) TouchLastUsedAt(ctx context.Context, keyID string, usedAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `UPDATE api_keys SET last_used_at = $2 WHERE id = $1`, keyID, usedAt)
	return err
}

func (r *APIKeyRepo) Revoke(ctx context.Context, keyID string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE api_keys SET status = $2 WHERE id = $1`, keyID, model.APIKeyStatusRevoked)
	return err
}

func (r *APIKeyRepo) ListByUserID(ctx context.Context, userID string) ([]model.APIKey, error) {
	numericUserID, err := userid.Parse(userID)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id, name, key_prefix, key_hash, status, expires_at, last_used_at, created_at, deleted_at
		FROM api_keys
		WHERE user_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
	`, numericUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	keys := make([]model.APIKey, 0)
	for rows.Next() {
		var key model.APIKey
		var numericUserIDValue int64
		if err := rows.Scan(
			&key.ID,
			&numericUserIDValue,
			&key.Name,
			&key.KeyPrefix,
			&key.KeyHash,
			&key.Status,
			&key.ExpiresAt,
			&key.LastUsedAt,
			&key.CreatedAt,
			&key.DeletedAt,
		); err != nil {
			return nil, err
		}
		key.UserID = userid.Format(numericUserIDValue)
		keys = append(keys, key)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return keys, nil
}

func (r *APIKeyRepo) DisableByUserID(ctx context.Context, userID, keyID string) error {
	numericUserID, err := userid.Parse(userID)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		UPDATE api_keys
		SET status = $3
		WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
	`, keyID, numericUserID, model.APIKeyStatusRevoked)
	return err
}

func (r *APIKeyRepo) SoftDeleteByUserID(ctx context.Context, userID, keyID string) error {
	numericUserID, err := userid.Parse(userID)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		UPDATE api_keys
		SET deleted_at = NOW()
		WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
	`, keyID, numericUserID)
	return err
}
