package model

import "time"

type APIKeyUsageSummary struct {
	UsageCount   int64  `json:"usage_count"`
	SuccessCount int64  `json:"success_count"`
	FailureCount int64  `json:"failure_count"`
	Cost         int64  `json:"cost"`
	LastAction   string `json:"last_action,omitempty"`
}

type ManagedAPIKey struct {
	ID           string             `json:"id"`
	Name         string             `json:"name"`
	Status       string             `json:"status"`
	LastUsedAt   *time.Time         `json:"last_used_at,omitempty"`
	CreatedAt    time.Time          `json:"created_at"`
	UsageSummary APIKeyUsageSummary `json:"usage_summary"`
}

type APIKeyListResult struct {
	Items []ManagedAPIKey `json:"items"`
}

type UsageQuery struct {
	Limit       int    `json:"limit,omitempty"`
	APIKeyID    string `json:"api_key_id,omitempty"`
	ProductArea string `json:"product_area,omitempty"`
	Action      string `json:"action,omitempty"`
	Provider    string `json:"provider,omitempty"`
	Status      string `json:"status,omitempty"`
}

type UsageSummaryResult struct {
	TotalEvents   int64 `json:"total_events"`
	SuccessEvents int64 `json:"success_events"`
	FailureEvents int64 `json:"failure_events"`
	TotalCost     int64 `json:"total_cost"`
}

type UsageEvent struct {
	ID            string     `json:"id"`
	APIKeyID      string     `json:"api_key_id,omitempty"`
	ProductArea   string     `json:"product_area,omitempty"`
	Action        string     `json:"action"`
	Provider      string     `json:"provider,omitempty"`
	ProviderRunID string     `json:"provider_run_id,omitempty"`
	RequestID     string     `json:"request_id,omitempty"`
	Status        string     `json:"status"`
	EstimatedCost int64      `json:"estimated_cost,omitempty"`
	FinalCost     int64      `json:"final_cost,omitempty"`
	Quantity      int64      `json:"quantity,omitempty"`
	Unit          string     `json:"unit,omitempty"`
	OccurredAt    time.Time  `json:"occurred_at"`
	CompletedAt   *time.Time `json:"completed_at,omitempty"`
}

type UsageEventListResult struct {
	Items      []UsageEvent `json:"items"`
	NextCursor string       `json:"next_cursor,omitempty"`
}
