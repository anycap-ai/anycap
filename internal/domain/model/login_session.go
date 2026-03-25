package model

import "time"

const (
	LoginFlowLocalhost = "localhost"
	LoginFlowDevice    = "device"
)

const (
	LoginSessionStatusPending    = "pending"
	LoginSessionStatusAuthorized = "authorized"
	LoginSessionStatusComplete   = "complete"
	LoginSessionStatusCompleted  = LoginSessionStatusComplete
	LoginSessionStatusExpired    = "expired"
	LoginSessionStatusSlowDown   = "slow_down"
)

type LoginSession struct {
	ID           string    `json:"id"`
	FlowType     string    `json:"flow_type"`
	State        string    `json:"state,omitempty"`
	CodeVerifier string    `json:"code_verifier,omitempty"`
	RedirectURI  string    `json:"redirect_uri,omitempty"`
	DeviceCode   string    `json:"device_code,omitempty"`
	UserCode     string    `json:"user_code,omitempty"`
	Auth0Subject string    `json:"auth0_subject,omitempty"`
	APIKeyID     string    `json:"api_key_id,omitempty"`
	Status       string    `json:"status"`
	ExpiresAt    time.Time `json:"expires_at"`
	CreatedAt    time.Time `json:"created_at"`
}
