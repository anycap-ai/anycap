package model

import "time"

const (
	UserStatusActive = "active"
)

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email,omitempty"`
	Name      string    `json:"name,omitempty"`
	AvatarURL string    `json:"avatar_url,omitempty"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}

type AuthIdentity struct {
	UserID          string    `json:"user_id"`
	Provider        string    `json:"provider"`
	ExternalSubject string    `json:"external_subject"`
	Email           string    `json:"email,omitempty"`
	RawProfile      []byte    `json:"raw_profile,omitempty"`
	CreatedAt       time.Time `json:"created_at,omitempty"`
	UpdatedAt       time.Time `json:"updated_at,omitempty"`
}
