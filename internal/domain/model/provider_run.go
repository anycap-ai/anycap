package model

import "time"

type ProviderRunRecord struct {
	ID             string
	Provider       string
	ProviderTaskID string
	UsageEventID   string
	AuthMode       string
	AbilityKey     string
	ProviderStatus string
	ProviderUsage  map[string]any
	ProviderCost   int64
	RawResult      map[string]any
	SubmittedAt    time.Time
	FinishedAt     *time.Time
	LastSyncedAt   *time.Time
}

type ProviderRunSyncUpdate struct {
	Provider       string
	ProviderTaskID string
	ProviderStatus string
	ProviderUsage  map[string]any
	ProviderCost   int64
	RawResult      map[string]any
	FinishedAt     *time.Time
	LastSyncedAt   time.Time
}

type UsageEventResultUpdate struct {
	ID          string
	Status      string
	FinalCost   int64
	CompletedAt *time.Time
}

type ProviderTaskResult struct {
	TaskID       string
	Status       string
	Progress     float64
	AbilityKey   string
	Usage        map[string]any
	CreditCost   int64
	NexusCost    float64
	ErrorCode    int
	ErrorMessage string
	RawResult    map[string]any
}
