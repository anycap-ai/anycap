package dto

import "encoding/json"

// SubmitFeedbackRequest is the JSON body for POST /v1/feedback.
type SubmitFeedbackRequest struct {
	Type      string          `json:"type"`
	Message   string          `json:"message"`
	Context   json.RawMessage `json:"context,omitempty"`
	RequestID string          `json:"request_id,omitempty"`
	TraceID   string          `json:"trace_id,omitempty"`
	Metadata  map[string]any  `json:"metadata"`
}
