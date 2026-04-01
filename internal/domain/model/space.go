package model

import "time"

const DefaultPersonalSpaceName = "Personal Space"

type Space struct {
	ID          int64
	OwnerUserID int64
	Name        string
	CreatedAt   time.Time
}
