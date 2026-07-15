package model

import "time"

// Feedback represents a user-submitted feedback entry (bug report, feature request, etc.).
type Feedback struct {
	ID          string              `json:"id"`
	UserID      string              `json:"user_id,omitempty"`
	Type        string              `json:"type"`
	Message     string              `json:"message"`
	Context     map[string]any      `json:"context,omitempty"`
	RequestID   string              `json:"request_id,omitempty"`
	Metadata    map[string]any      `json:"metadata"`
	Diagnostics FeedbackDiagnostics `json:"diagnostics,omitempty"`
	CreatedAt   time.Time           `json:"created_at"`
}

// FeedbackDiagnostics identifies the original model invocation being reported.
type FeedbackDiagnostics struct {
	TraceID           string `json:"trace_id,omitempty"`
	RequestID         string `json:"request_id,omitempty"`
	TaskID            string `json:"task_id,omitempty"`
	UpstreamRequestID string `json:"upstream_request_id,omitempty"`
	Capability        string `json:"capability,omitempty"`
	Model             string `json:"model,omitempty"`
	Stage             string `json:"stage,omitempty"`
	ErrorCode         string `json:"error_code,omitempty"`
	InvokedAt         string `json:"invoked_at,omitempty"`
}
