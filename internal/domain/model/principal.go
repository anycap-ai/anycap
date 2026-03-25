package model

type Principal struct {
	UserID   string   `json:"user_id"`
	APIKeyID string   `json:"api_key_id,omitempty"`
	AuthType string   `json:"auth_type"`
	Scopes   []string `json:"scopes,omitempty"`
}

type AuthUser struct {
	UserID string `json:"user_id"`
	Email  string `json:"email,omitempty"`
	Name   string `json:"name,omitempty"`
}
