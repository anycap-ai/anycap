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
	ID                string    `json:"id"`
	FlowType          string    `json:"flow_type"`
	State             string    `json:"state,omitempty"`
	CodeVerifier      string    `json:"code_verifier,omitempty"`
	RedirectURI       string    `json:"redirect_uri,omitempty"`
	DeviceCode        string    `json:"device_code,omitempty"`
	UserCode          string    `json:"user_code,omitempty"`
	UserCodeExpiresAt time.Time `json:"user_code_expires_at,omitempty"`
	AuthorizedUserID  string    `json:"authorized_user_id,omitempty"`
	Auth0Subject      string    `json:"auth0_subject,omitempty"`
	AuthUserEmail     string    `json:"auth_user_email,omitempty"`
	AuthUserName      string    `json:"auth_user_name,omitempty"`
	AuthUserPicture   string    `json:"auth_user_picture,omitempty"`
	APIKeyID          string    `json:"api_key_id,omitempty"`
	LastPolledAt      time.Time `json:"last_polled_at,omitempty"`
	Status            string    `json:"status"`
	ExpiresAt         time.Time `json:"expires_at"`
	CreatedAt         time.Time `json:"created_at"`
}
