package model

import "strings"

const AnonymousUserIDPrefix = "anon:"

type Principal struct {
	UserID         string   `json:"user_id"`
	APIKeyID       string   `json:"api_key_id,omitempty"`
	AuthType       string   `json:"auth_type"`
	CreatedUser    bool     `json:"created_user,omitempty"`
	Scopes         []string `json:"scopes,omitempty"`
	ExternalUserID string   `json:"external_user_id,omitempty"`
	Email          string   `json:"email,omitempty"`
	Name           string   `json:"name,omitempty"`
	Picture        string   `json:"picture,omitempty"`
	IsPro          bool     `json:"is_pro,omitempty"`
}

func IsAnonymousUserID(userID string) bool {
	return strings.HasPrefix(userID, AnonymousUserIDPrefix)
}

type AuthUser struct {
	UserID        string `json:"user_id"`
	Email         string `json:"email,omitempty"`
	EmailVerified bool   `json:"email_verified,omitempty"`
	Name          string `json:"name,omitempty"`
	Picture       string `json:"picture,omitempty"`
}

type DeviceAuthorization struct {
	DeviceCode      string `json:"device_code"`
	UserCode        string `json:"user_code"`
	VerificationURI string `json:"verification_uri"`
	ExpiresIn       int    `json:"expires_in"`
	Interval        int    `json:"interval"`
}

type DeviceAuthorizationStatus struct {
	Status string   `json:"status"`
	User   AuthUser `json:"user,omitempty"`
}
