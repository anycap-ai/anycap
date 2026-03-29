package model

import "time"

const DefaultPersonalSpaceName = "Personal Space"

type Space struct {
	ID          int64
	OwnerUserID string
	Name        string
	CreatedAt   time.Time
}
