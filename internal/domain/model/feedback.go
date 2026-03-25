package model

import "time"

// Feedback represents a user-submitted feedback entry (bug report, feature request, etc.).
type Feedback struct {
	ID        string         `json:"id"`
	UserID    string         `json:"user_id,omitempty"`
	Type      string         `json:"type"`
	Message   string         `json:"message"`
	Context   map[string]any `json:"context,omitempty"`
	RequestID string         `json:"request_id,omitempty"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"created_at"`
}
