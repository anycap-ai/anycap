package calllog

import (
	"context"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

type CallLogDBRepo struct {
	db sqlstore.DBTX
}

func NewCallLogDBRepo(db sqlstore.DBTX) *CallLogDBRepo {
	return &CallLogDBRepo{db: db}
}

func (r *CallLogDBRepo) Insert(ctx context.Context, entry model.CallLog) error {
	numericUserID, err := userid.Parse(entry.UserID)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO call_logs (
			request_id, user_id, api_key_id, capability, model, status, latency_ms, credit_cost, error_code
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, entry.RequestID, numericUserID, entry.APIKeyID, entry.Capability, entry.Model, entry.Status, entry.LatencyMS, entry.CreditCost, entry.ErrorCode)
	return err
}

func (r *CallLogDBRepo) ListByUserID(ctx context.Context, userID string, limit int) ([]model.CallLog, error) {
	numericUserID, err := userid.Parse(userID)
	if err != nil {
		return nil, err
	}
	if limit <= 0 {
		limit = 20
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT request_id, user_id, COALESCE(api_key_id, ''), capability, COALESCE(model, ''), status,
		       latency_ms, credit_cost, COALESCE(error_code, ''), created_at
		FROM call_logs
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`, numericUserID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := make([]model.CallLog, 0, limit)
	for rows.Next() {
		var item model.CallLog
		var userIDValue int64
		if err := rows.Scan(
			&item.RequestID,
			&userIDValue,
			&item.APIKeyID,
			&item.Capability,
			&item.Model,
			&item.Status,
			&item.LatencyMS,
			&item.CreditCost,
			&item.ErrorCode,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		item.UserID = userid.Format(userIDValue)
		logs = append(logs, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return logs, nil
}

type MemoryCallLogRepo struct {
	mu   sync.Mutex
	logs []model.CallLog
}

func NewMemoryCallLogRepo() *MemoryCallLogRepo {
	return &MemoryCallLogRepo{}
}

func (r *MemoryCallLogRepo) Insert(_ context.Context, entry model.CallLog) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now().UTC()
	}
	r.logs = append(r.logs, entry)
	return nil
}

func (r *MemoryCallLogRepo) ListByUserID(_ context.Context, userID string, limit int) ([]model.CallLog, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	result := make([]model.CallLog, 0, len(r.logs))
	for i := len(r.logs) - 1; i >= 0; i-- {
		if r.logs[i].UserID == userID {
			result = append(result, r.logs[i])
			if limit > 0 && len(result) >= limit {
				break
			}
		}
	}
	return result, nil
}

func (r *MemoryCallLogRepo) Count() int {
	r.mu.Lock()
	defer r.mu.Unlock()

	return len(r.logs)
}
