package model

import "time"

const DefaultPersonalSpaceName = "Personal Space"

type Space struct {
	ID          int64     `json:"id"`
	OwnerUserID string    `json:"owner_user_id"`
	Name        string    `json:"name"`
	CreatedAt   time.Time `json:"created_at"`
}
