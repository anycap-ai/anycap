package apikey

import (
	"context"
	"sync"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CallLogDBRepo struct {
	db DBTX
}

func NewCallLogDBRepo(db DBTX) *CallLogDBRepo {
	return &CallLogDBRepo{db: db}
}

func (r *CallLogDBRepo) Insert(ctx context.Context, entry model.CallLog) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO call_logs (
			request_id, user_id, api_key_id, capability, model, status, latency_ms, credit_cost, error_code
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, entry.RequestID, entry.UserID, entry.APIKeyID, entry.Capability, entry.Model, entry.Status, entry.LatencyMS, entry.CreditCost, entry.ErrorCode)
	return err
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

	r.logs = append(r.logs, entry)
	return nil
}

func (r *MemoryCallLogRepo) Count() int {
	r.mu.Lock()
	defer r.mu.Unlock()

	return len(r.logs)
}
