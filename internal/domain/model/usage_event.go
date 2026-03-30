package model

import "time"

type UsageEventRecord struct {
	ID            string
	UserID        string
	APIKeyID      string
	ProductArea   string
	Action        string
	Provider      string
	RequestID     string
	Status        string
	EstimatedCost int64
	FinalCost     int64
	Quantity      int64
	Unit          string
	OccurredAt    time.Time
	CompletedAt   *time.Time
}
