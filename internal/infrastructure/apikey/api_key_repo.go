package apikey

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type APIKeyRepo struct {
	db DBTX
}

func NewAPIKeyRepo(db DBTX) *APIKeyRepo {
	return &APIKeyRepo{db: db}
}

func (r *APIKeyRepo) Insert(ctx context.Context, key model.APIKey) error {
	numericUserID, err := parseUserID(key.UserID)
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
	key.UserID = formatUserID(numericUserID)

	return key, nil
}

func (r *APIKeyRepo) TouchLastUsedAt(ctx context.Context, keyID string, usedAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `UPDATE api_keys SET last_used_at = $2 WHERE id = $1`, keyID, usedAt)
	return err
}

func (r *APIKeyRepo) Revoke(ctx context.Context, keyID string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE api_keys SET status = 'revoked' WHERE id = $1`, keyID)
	return err
}
