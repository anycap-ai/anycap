package usage

import (
	"context"
	"sort"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type CallLogReader struct {
	callLogs port.CallLogRepo
}

func NewCallLogReader(callLogs port.CallLogRepo) *CallLogReader {
	return &CallLogReader{callLogs: callLogs}
}

func (r *CallLogReader) SummarizeUsageByUser(ctx context.Context, userID string, query model.UsageQuery) (model.UsageSummaryResult, error) {
	logs, err := r.listLogs(ctx, userID, query)
	if err != nil {
		return model.UsageSummaryResult{}, err
	}
	var result model.UsageSummaryResult
	for _, item := range logs {
		result.TotalEvents++
		result.TotalCost += item.CreditCost
		if item.Status == "success" || item.Status == "ok" {
			result.SuccessEvents++
		} else {
			result.FailureEvents++
		}
	}
	return result, nil
}

func (r *CallLogReader) ListUsageEventsByUser(ctx context.Context, userID string, query model.UsageQuery) (model.UsageEventListResult, error) {
	logs, err := r.listLogs(ctx, userID, query)
	if err != nil {
		return model.UsageEventListResult{}, err
	}

	items := make([]model.UsageEvent, 0, len(logs))
	for _, item := range logs {
		items = append(items, model.UsageEvent{
			ID:          item.RequestID,
			APIKeyID:    item.APIKeyID,
			ProductArea: "capability",
			Action:      item.Capability,
			Provider:    "nexushub",
			RequestID:   item.RequestID,
			Status:      item.Status,
			FinalCost:   item.CreditCost,
			OccurredAt:  item.CreatedAt,
		})
	}
	return model.UsageEventListResult{Items: items}, nil
}

func (r *CallLogReader) SummarizeUsageByAPIKey(ctx context.Context, userID string, query model.UsageQuery) (map[string]model.APIKeyUsageSummary, error) {
	logs, err := r.listLogs(ctx, userID, query)
	if err != nil {
		return nil, err
	}
	result := make(map[string]model.APIKeyUsageSummary)
	for _, item := range logs {
		if item.APIKeyID == "" {
			continue
		}
		summary := result[item.APIKeyID]
		summary.UsageCount++
		summary.Cost += item.CreditCost
		if item.Status == "success" || item.Status == "ok" {
			summary.SuccessCount++
		} else {
			summary.FailureCount++
		}
		summary.LastAction = item.Capability
		result[item.APIKeyID] = summary
	}
	return result, nil
}

func (r *CallLogReader) listLogs(ctx context.Context, userID string, query model.UsageQuery) ([]model.CallLog, error) {
	if r == nil || r.callLogs == nil {
		return nil, nil
	}
	limit := query.Limit
	if limit <= 0 {
		limit = 100
	}
	logs, err := r.callLogs.ListByUserID(ctx, userID, limit)
	if err != nil {
		return nil, err
	}
	filtered := make([]model.CallLog, 0, len(logs))
	for _, item := range logs {
		if query.APIKeyID != "" && item.APIKeyID != query.APIKeyID {
			continue
		}
		if query.Action != "" && item.Capability != query.Action {
			continue
		}
		if query.Status != "" && item.Status != query.Status {
			continue
		}
		filtered = append(filtered, item)
	}
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].CreatedAt.After(filtered[j].CreatedAt)
	})
	if query.Limit > 0 && len(filtered) > query.Limit {
		filtered = filtered[:query.Limit]
	}
	return filtered, nil
}
