package paymentevents

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type Repo struct {
	db sqlstore.DBTX
}

func NewRepo(db sqlstore.DBTX) *Repo {
	return &Repo{db: db}
}

func (r *Repo) CreateIfAbsent(ctx context.Context, receipt model.PaymentEventReceipt) (bool, error) {
	now := time.Now().UTC()
	if receipt.CreatedAt.IsZero() {
		receipt.CreatedAt = now
	}
	if receipt.UpdatedAt.IsZero() {
		receipt.UpdatedAt = receipt.CreatedAt
	}

	result, err := r.db.ExecContext(ctx, `
		INSERT INTO payment_event_receipts (
			event_key, event_type, biz_id, user_id, status, payload,
			reward_id, session_id, last_error, created_at, updated_at, processed_at
		) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (event_key) DO NOTHING
	`,
		receipt.EventKey,
		receipt.EventType,
		receipt.BizID,
		receipt.UserID,
		receipt.Status,
		string(receipt.Payload),
		nullInt64(receipt.RewardID),
		nullString(receipt.SessionID),
		nullString(receipt.LastError),
		receipt.CreatedAt,
		receipt.UpdatedAt,
		receipt.ProcessedAt,
	)
	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return rowsAffected == 1, nil
}

func (r *Repo) GetByEventKey(ctx context.Context, eventKey string) (*model.PaymentEventReceipt, error) {
	var (
		receipt      model.PaymentEventReceipt
		payloadBytes []byte
	)
	err := r.db.QueryRowContext(ctx, `
		SELECT event_key, event_type, biz_id, user_id, status, payload,
		       COALESCE(reward_id, 0), COALESCE(session_id, ''), COALESCE(last_error, ''),
		       created_at, updated_at, processed_at
		FROM payment_event_receipts
		WHERE event_key = $1
		LIMIT 1
	`, eventKey).Scan(
		&receipt.EventKey,
		&receipt.EventType,
		&receipt.BizID,
		&receipt.UserID,
		&receipt.Status,
		&payloadBytes,
		&receipt.RewardID,
		&receipt.SessionID,
		&receipt.LastError,
		&receipt.CreatedAt,
		&receipt.UpdatedAt,
		&receipt.ProcessedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	receipt.Payload = json.RawMessage(payloadBytes)
	return &receipt, nil
}

func (r *Repo) MarkProcessed(ctx context.Context, eventKey string, processedAt time.Time) error {
	return r.updateStatus(ctx, eventKey, model.PaymentEventReceiptStatusProcessed, "", &processedAt)
}

func (r *Repo) MarkIgnored(ctx context.Context, eventKey, reason string, processedAt time.Time) error {
	return r.updateStatus(ctx, eventKey, model.PaymentEventReceiptStatusIgnored, reason, &processedAt)
}

func (r *Repo) MarkFailed(ctx context.Context, eventKey, reason string, processedAt time.Time) error {
	return r.updateStatus(ctx, eventKey, model.PaymentEventReceiptStatusFailed, reason, &processedAt)
}

func (r *Repo) updateStatus(ctx context.Context, eventKey, status, lastError string, processedAt *time.Time) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE payment_event_receipts
		SET status = $2,
		    last_error = $3,
		    processed_at = $4,
		    updated_at = $5
		WHERE event_key = $1
	`, eventKey, status, nullString(lastError), processedAt, time.Now().UTC())
	return err
}

func nullInt64(v int64) any {
	if v == 0 {
		return nil
	}
	return v
}

func nullString(v string) any {
	if v == "" {
		return nil
	}
	return v
}
