package model

import "time"

type CapsTaskStatus string

const (
	CapsTaskStatusPending   CapsTaskStatus = "pending"
	CapsTaskStatusRunning   CapsTaskStatus = "running"
	CapsTaskStatusSucceeded CapsTaskStatus = "succeeded"
	CapsTaskStatusFailed    CapsTaskStatus = "failed"
)

type CapsTask struct {
	ID          int64          `json:"id"`
	SpaceID     int64          `json:"space_id"`
	Capability  string         `json:"capability"`
	Status      CapsTaskStatus `json:"status"`
	RequestMeta map[string]any `json:"request_meta,omitempty"`
	ResultMeta  map[string]any `json:"result_meta,omitempty"`
	CreatedBy   string         `json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	CompletedAt *time.Time     `json:"completed_at,omitempty"`
}
