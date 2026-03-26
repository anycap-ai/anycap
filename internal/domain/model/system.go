package model

import (
	"errors"
	"time"
)

var ErrAuthProviderNotConfigured = errors.New("auth provider is not configured")

type ServiceStatus struct {
	Name     string          `json:"name"`
	Env      string          `json:"env"`
	Version  string          `json:"version"`
	Commit   string          `json:"commit"`
	BuildAt  string          `json:"build_at"`
	Status   string          `json:"status"`
	Features map[string]bool `json:"features,omitempty"`
}

type LoginInitResult struct {
	FlowType        string `json:"flow_type"`
	LoginSessionID  string `json:"login_session_id"`
	AuthorizeURL    string `json:"authorize_url,omitempty"`
	BrowserURL      string `json:"browser_url,omitempty"`
	PollToken       string `json:"poll_token,omitempty"`
	VerificationURI string `json:"verification_uri,omitempty"`
	UserCode        string `json:"user_code,omitempty"`
	State           string `json:"state,omitempty"`
	ExpiresIn       int    `json:"expires_in,omitempty"`
	Interval        int    `json:"interval,omitempty"`
}

type LoginCallbackResult struct {
	CredentialType string     `json:"credential_type,omitempty"`
	AccessToken    string     `json:"access_token,omitempty"`
	RefreshToken   string     `json:"refresh_token,omitempty"`
	ExpiresIn      int        `json:"expires_in,omitempty"`
	APIKeyID       string     `json:"api_key_id,omitempty"`
	APIKey         string     `json:"api_key,omitempty"`
	User           *LoginUser `json:"user,omitempty"`
}

type LoginPollResult struct {
	Status         string     `json:"status"`
	CredentialType string     `json:"credential_type,omitempty"`
	AccessToken    string     `json:"access_token,omitempty"`
	RefreshToken   string     `json:"refresh_token,omitempty"`
	ExpiresIn      int        `json:"expires_in,omitempty"`
	APIKeyID       string     `json:"api_key_id,omitempty"`
	APIKey         string     `json:"api_key,omitempty"`
	User           *LoginUser `json:"user,omitempty"`
}

type DeviceCodeCheckResult struct {
	Valid bool `json:"valid"`
}

type DeviceVerifyResult struct {
	Message string `json:"message"`
}

type LoginUser struct {
	ID    string `json:"id"`
	Email string `json:"email,omitempty"`
	Name  string `json:"name,omitempty"`
}

type Balance struct {
	Available         int64  `json:"available"`
	Currency          string `json:"currency"`
	CreditCentBalance int64  `json:"credit_cent_balance,omitempty"`
}

type CreditTransaction struct {
	ID               string         `json:"id"`
	Type             string         `json:"type"`
	CreditCentAmount int64          `json:"credit_cent_amount"`
	SourceID         string         `json:"source_id,omitempty"`
	Description      string         `json:"description,omitempty"`
	CreditBatchType  string         `json:"credit_batch_type,omitempty"`
	Metadata         map[string]any `json:"metadata,omitempty"`
	CreatedAt        time.Time      `json:"created_at,omitempty"`
}

type TimelineItem struct {
	Type             string    `json:"type"`
	OccurredAt       time.Time `json:"occurred_at"`
	RequestID        string    `json:"request_id,omitempty"`
	Capability       string    `json:"capability,omitempty"`
	Model            string    `json:"model,omitempty"`
	Status           string    `json:"status,omitempty"`
	CreditCost       int64     `json:"credit_cost,omitempty"`
	ErrorCode        string    `json:"error_code,omitempty"`
	TransactionID    string    `json:"transaction_id,omitempty"`
	TransactionType  string    `json:"transaction_type,omitempty"`
	CreditCentAmount int64     `json:"credit_cent_amount,omitempty"`
	Description      string    `json:"description,omitempty"`
	SourceID         string    `json:"source_id,omitempty"`
	CreditBatchType  string    `json:"credit_batch_type,omitempty"`
}

type LogsResult struct {
	Items      []TimelineItem `json:"items"`
	NextCursor string         `json:"next_cursor,omitempty"`
}

type DashboardUsageSummary struct {
	LastCapability string     `json:"last_capability,omitempty"`
	LastModel      string     `json:"last_model,omitempty"`
	LastOccurredAt *time.Time `json:"last_occurred_at,omitempty"`
}

type DashboardErrorSummary struct {
	LastErrorCapability string     `json:"last_error_capability,omitempty"`
	LastErrorCode       string     `json:"last_error_code,omitempty"`
	LastErrorOccurredAt *time.Time `json:"last_error_occurred_at,omitempty"`
}

type DashboardSummaryResult struct {
	User           User                   `json:"user"`
	Balance        Balance                `json:"balance"`
	RecentActivity []TimelineItem         `json:"recent_activity"`
	UsageSummary   *DashboardUsageSummary `json:"usage_summary,omitempty"`
	ErrorSummary   *DashboardErrorSummary `json:"error_summary,omitempty"`
}

type StatusResult struct {
	Service     ServiceStatus `json:"service"`
	RuntimeMode string        `json:"runtime_mode"`
	User        *Principal    `json:"user,omitempty"`
}

type CheckoutSession struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

type PaymentEvent struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	UserID string `json:"user_id,omitempty"`
}
