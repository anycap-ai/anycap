package model

import "time"

type RequestMeta struct {
	RequestID string    `json:"request_id"`
	StartedAt time.Time `json:"started_at"`
}
