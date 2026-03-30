package usage

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"
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

func (r *Repo) InsertUsageEvent(ctx context.Context, event model.UsageEventRecord) error {
	numericUserID, err := userid.Parse(event.UserID)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO usage_events (
			id, user_id, api_key_id, product_area, action, provider, request_id, status,
			estimated_cost, final_cost, quantity, unit, occurred_at, completed_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`, event.ID, numericUserID, event.APIKeyID, event.ProductArea, event.Action, event.Provider, event.RequestID, event.Status, event.EstimatedCost, event.FinalCost, event.Quantity, event.Unit, event.OccurredAt, event.CompletedAt)
	return err
}

func (r *Repo) InsertProviderRun(ctx context.Context, run model.ProviderRunRecord) error {
	providerUsage, err := json.Marshal(run.ProviderUsage)
	if err != nil {
		return err
	}
	rawResult, err := json.Marshal(run.RawResult)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO provider_runs (
			id, provider, provider_task_id, usage_event_id, auth_mode, ability_key, provider_status,
			provider_usage, provider_cost, raw_result, submitted_at, finished_at, last_synced_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb, $11, $12, $13)
	`, run.ID, run.Provider, run.ProviderTaskID, run.UsageEventID, run.AuthMode, run.AbilityKey, run.ProviderStatus, string(providerUsage), run.ProviderCost, string(rawResult), run.SubmittedAt, run.FinishedAt, run.LastSyncedAt)
	return err
}

func (r *Repo) SummarizeUsageByUser(ctx context.Context, userID string, query model.UsageQuery) (model.UsageSummaryResult, error) {
	events, err := r.listUsageEvents(ctx, userID, query)
	if err != nil {
		return model.UsageSummaryResult{}, err
	}
	var result model.UsageSummaryResult
	for _, item := range events {
		result.TotalEvents++
		result.TotalCost += item.FinalCost
		if item.Status == "success" || item.Status == "ok" {
			result.SuccessEvents++
		} else {
			result.FailureEvents++
		}
	}
	return result, nil
}

func (r *Repo) ListUsageEventsByUser(ctx context.Context, userID string, query model.UsageQuery) (model.UsageEventListResult, error) {
	events, err := r.listUsageEvents(ctx, userID, query)
	if err != nil {
		return model.UsageEventListResult{}, err
	}
	items := make([]model.UsageEvent, 0, len(events))
	for _, item := range events {
		items = append(items, model.UsageEvent{
			ID:            item.ID,
			APIKeyID:      item.APIKeyID,
			ProductArea:   item.ProductArea,
			Action:        item.Action,
			Provider:      item.Provider,
			RequestID:     item.RequestID,
			Status:        item.Status,
			EstimatedCost: item.EstimatedCost,
			FinalCost:     item.FinalCost,
			Quantity:      item.Quantity,
			Unit:          item.Unit,
			OccurredAt:    item.OccurredAt,
			CompletedAt:   item.CompletedAt,
		})
	}
	return model.UsageEventListResult{Items: items}, nil
}

func (r *Repo) ListProviderRunsForSync(ctx context.Context, provider string, limit int) ([]model.ProviderRunRecord, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, provider, provider_task_id, usage_event_id, auth_mode, COALESCE(ability_key, ''), provider_status,
		       provider_cost, submitted_at, finished_at, last_synced_at
		FROM provider_runs
		WHERE provider = $1
		  AND (last_synced_at IS NULL OR provider_status NOT IN ('success', 'failed', 'canceled'))
		ORDER BY submitted_at ASC
		LIMIT $2
	`, provider, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	runs := make([]model.ProviderRunRecord, 0, limit)
	for rows.Next() {
		var item model.ProviderRunRecord
		if err := rows.Scan(
			&item.ID,
			&item.Provider,
			&item.ProviderTaskID,
			&item.UsageEventID,
			&item.AuthMode,
			&item.AbilityKey,
			&item.ProviderStatus,
			&item.ProviderCost,
			&item.SubmittedAt,
			&item.FinishedAt,
			&item.LastSyncedAt,
		); err != nil {
			return nil, err
		}
		runs = append(runs, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return runs, nil
}

func (r *Repo) GetProviderRunByTaskID(ctx context.Context, provider, taskID string) (*model.ProviderRunRecord, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, provider, provider_task_id, usage_event_id, auth_mode, COALESCE(ability_key, ''), provider_status,
		       provider_cost, submitted_at, finished_at, last_synced_at
		FROM provider_runs
		WHERE provider = $1 AND provider_task_id = $2
		LIMIT 1
	`, provider, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, nil
	}
	var item model.ProviderRunRecord
	if err := rows.Scan(
		&item.ID,
		&item.Provider,
		&item.ProviderTaskID,
		&item.UsageEventID,
		&item.AuthMode,
		&item.AbilityKey,
		&item.ProviderStatus,
		&item.ProviderCost,
		&item.SubmittedAt,
		&item.FinishedAt,
		&item.LastSyncedAt,
	); err != nil {
		return nil, err
	}
	return &item, rows.Err()
}

func (r *Repo) UpdateProviderRunSync(ctx context.Context, update model.ProviderRunSyncUpdate) error {
	providerUsage, err := json.Marshal(update.ProviderUsage)
	if err != nil {
		return err
	}
	rawResult, err := json.Marshal(update.RawResult)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		UPDATE provider_runs
		SET provider_status = $3,
		    provider_usage = $4::jsonb,
		    provider_cost = $5,
		    raw_result = $6::jsonb,
		    finished_at = $7,
		    last_synced_at = $8
		WHERE provider = $1 AND provider_task_id = $2
	`, update.Provider, update.ProviderTaskID, update.ProviderStatus, string(providerUsage), update.ProviderCost, string(rawResult), update.FinishedAt, update.LastSyncedAt)
	return err
}

func (r *Repo) UpdateUsageEventResult(ctx context.Context, update model.UsageEventResultUpdate) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE usage_events
		SET status = $2,
		    final_cost = $3,
		    completed_at = $4
		WHERE id = $1
	`, update.ID, update.Status, update.FinalCost, update.CompletedAt)
	return err
}

func (r *Repo) SummarizeUsageByAPIKey(ctx context.Context, userID string, query model.UsageQuery) (map[string]model.APIKeyUsageSummary, error) {
	events, err := r.listUsageEvents(ctx, userID, query)
	if err != nil {
		return nil, err
	}
	result := make(map[string]model.APIKeyUsageSummary)
	for _, item := range events {
		if item.APIKeyID == "" {
			continue
		}
		summary := result[item.APIKeyID]
		summary.UsageCount++
		summary.Cost += item.FinalCost
		if item.Status == "success" || item.Status == "ok" {
			summary.SuccessCount++
		} else {
			summary.FailureCount++
		}
		if summary.LastAction == "" {
			summary.LastAction = item.Action
		}
		result[item.APIKeyID] = summary
	}
	return result, nil
}

func (r *Repo) listUsageEvents(ctx context.Context, userID string, query model.UsageQuery) ([]model.UsageEventRecord, error) {
	numericUserID, err := userid.Parse(userID)
	if err != nil {
		return nil, err
	}

	limit := query.Limit
	if limit <= 0 {
		limit = 100
	}

	args := []any{numericUserID}
	var filters []string
	if query.APIKeyID != "" {
		args = append(args, query.APIKeyID)
		filters = append(filters, fmt.Sprintf("api_key_id = $%d", len(args)))
	}
	if query.ProductArea != "" {
		args = append(args, query.ProductArea)
		filters = append(filters, fmt.Sprintf("product_area = $%d", len(args)))
	}
	if query.Action != "" {
		args = append(args, query.Action)
		filters = append(filters, fmt.Sprintf("action = $%d", len(args)))
	}
	if query.Provider != "" {
		args = append(args, query.Provider)
		filters = append(filters, fmt.Sprintf("provider = $%d", len(args)))
	}
	if query.Status != "" {
		args = append(args, query.Status)
		filters = append(filters, fmt.Sprintf("status = $%d", len(args)))
	}
	args = append(args, limit)

	stmt := `
		SELECT id, user_id, COALESCE(api_key_id, ''), product_area, action, provider, COALESCE(request_id, ''),
		       status, estimated_cost, final_cost, quantity, COALESCE(unit, ''), occurred_at, completed_at
		FROM usage_events
		WHERE user_id = $1
	`
	if len(filters) > 0 {
		stmt += " AND " + strings.Join(filters, " AND ")
	}
	stmt += fmt.Sprintf(" ORDER BY occurred_at DESC LIMIT $%d", len(args))

	rows, err := r.db.QueryContext(ctx, stmt, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := make([]model.UsageEventRecord, 0, limit)
	for rows.Next() {
		var item model.UsageEventRecord
		var ignoredUserID int64
		if err := rows.Scan(
			&item.ID,
			&ignoredUserID,
			&item.APIKeyID,
			&item.ProductArea,
			&item.Action,
			&item.Provider,
			&item.RequestID,
			&item.Status,
			&item.EstimatedCost,
			&item.FinalCost,
			&item.Quantity,
			&item.Unit,
			&item.OccurredAt,
			&item.CompletedAt,
		); err != nil {
			return nil, err
		}
		item.UserID = userID
		events = append(events, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return events, nil
}

type MemoryRepo struct {
	mu     sync.Mutex
	events []model.UsageEventRecord
	runs   []model.ProviderRunRecord
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{}
}

func (r *MemoryRepo) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.events = append(r.events, event)
	return nil
}

func (r *MemoryRepo) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.runs = append(r.runs, run)
	return nil
}

func (r *MemoryRepo) SummarizeUsageByUser(_ context.Context, userID string, query model.UsageQuery) (model.UsageSummaryResult, error) {
	events := r.listUsageEvents(userID, query)
	var result model.UsageSummaryResult
	for _, item := range events {
		result.TotalEvents++
		result.TotalCost += item.FinalCost
		if item.Status == "success" || item.Status == "ok" {
			result.SuccessEvents++
		} else {
			result.FailureEvents++
		}
	}
	return result, nil
}

func (r *MemoryRepo) ListProviderRunsForSync(_ context.Context, provider string, limit int) ([]model.ProviderRunRecord, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if limit <= 0 {
		limit = 50
	}
	result := make([]model.ProviderRunRecord, 0, len(r.runs))
	for _, item := range r.runs {
		if item.Provider != provider {
			continue
		}
		if item.LastSyncedAt != nil && isTerminalProviderStatus(item.ProviderStatus) {
			continue
		}
		result = append(result, item)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].SubmittedAt.Before(result[j].SubmittedAt)
	})
	if len(result) > limit {
		result = result[:limit]
	}
	return result, nil
}

func (r *MemoryRepo) GetProviderRunByTaskID(_ context.Context, provider, taskID string) (*model.ProviderRunRecord, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, item := range r.runs {
		if item.Provider == provider && item.ProviderTaskID == taskID {
			copy := item
			return &copy, nil
		}
	}
	return nil, nil
}

func (r *MemoryRepo) UpdateProviderRunSync(_ context.Context, update model.ProviderRunSyncUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.runs {
		if r.runs[i].Provider == update.Provider && r.runs[i].ProviderTaskID == update.ProviderTaskID {
			r.runs[i].ProviderStatus = update.ProviderStatus
			r.runs[i].ProviderUsage = cloneMap(update.ProviderUsage)
			r.runs[i].ProviderCost = update.ProviderCost
			r.runs[i].RawResult = cloneMap(update.RawResult)
			r.runs[i].FinishedAt = update.FinishedAt
			r.runs[i].LastSyncedAt = timePtr(update.LastSyncedAt)
			return nil
		}
	}
	return nil
}

func (r *MemoryRepo) UpdateUsageEventResult(_ context.Context, update model.UsageEventResultUpdate) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.events {
		if r.events[i].ID == update.ID {
			r.events[i].Status = update.Status
			r.events[i].FinalCost = update.FinalCost
			r.events[i].CompletedAt = update.CompletedAt
			return nil
		}
	}
	return nil
}

func (r *MemoryRepo) ListUsageEventsByUser(_ context.Context, userID string, query model.UsageQuery) (model.UsageEventListResult, error) {
	events := r.listUsageEvents(userID, query)
	items := make([]model.UsageEvent, 0, len(events))
	for _, item := range events {
		items = append(items, model.UsageEvent{
			ID:            item.ID,
			APIKeyID:      item.APIKeyID,
			ProductArea:   item.ProductArea,
			Action:        item.Action,
			Provider:      item.Provider,
			RequestID:     item.RequestID,
			Status:        item.Status,
			EstimatedCost: item.EstimatedCost,
			FinalCost:     item.FinalCost,
			Quantity:      item.Quantity,
			Unit:          item.Unit,
			OccurredAt:    item.OccurredAt,
			CompletedAt:   item.CompletedAt,
		})
	}
	return model.UsageEventListResult{Items: items}, nil
}

func (r *MemoryRepo) SummarizeUsageByAPIKey(_ context.Context, userID string, query model.UsageQuery) (map[string]model.APIKeyUsageSummary, error) {
	events := r.listUsageEvents(userID, query)
	result := make(map[string]model.APIKeyUsageSummary)
	for _, item := range events {
		if item.APIKeyID == "" {
			continue
		}
		summary := result[item.APIKeyID]
		summary.UsageCount++
		summary.Cost += item.FinalCost
		if item.Status == "success" || item.Status == "ok" {
			summary.SuccessCount++
		} else {
			summary.FailureCount++
		}
		if summary.LastAction == "" {
			summary.LastAction = item.Action
		}
		result[item.APIKeyID] = summary
	}
	return result, nil
}

func (r *MemoryRepo) listUsageEvents(userID string, query model.UsageQuery) []model.UsageEventRecord {
	r.mu.Lock()
	defer r.mu.Unlock()

	limit := query.Limit
	if limit <= 0 {
		limit = 100
	}

	filtered := make([]model.UsageEventRecord, 0, len(r.events))
	for _, item := range r.events {
		if item.UserID != userID {
			continue
		}
		if query.APIKeyID != "" && item.APIKeyID != query.APIKeyID {
			continue
		}
		if query.ProductArea != "" && item.ProductArea != query.ProductArea {
			continue
		}
		if query.Action != "" && item.Action != query.Action {
			continue
		}
		if query.Provider != "" && item.Provider != query.Provider {
			continue
		}
		if query.Status != "" && item.Status != query.Status {
			continue
		}
		filtered = append(filtered, item)
	}
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].OccurredAt.After(filtered[j].OccurredAt)
	})
	if len(filtered) > limit {
		filtered = filtered[:limit]
	}
	return filtered
}

func isTerminalProviderStatus(status string) bool {
	switch strings.ToLower(status) {
	case "success", "failed", "canceled":
		return true
	default:
		return false
	}
}

func timePtr(v time.Time) *time.Time {
	return &v
}

func cloneMap(in map[string]any) map[string]any {
	if len(in) == 0 {
		return nil
	}
	out := make(map[string]any, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}
