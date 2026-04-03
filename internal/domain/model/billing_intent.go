package model

import "time"

const (
	BillingProviderNexusHub      = "nexushub"
	BillingProviderAgentPlatform = "agentplatform"
)

const (
	BillingStatusCreated                        = "created"
	BillingStatusUncertainRetryable             = "uncertain_retryable"
	BillingStatusProviderSucceededPendingDeduct = "provider_succeeded_pending_deduct"
	BillingStatusDeducted                       = "deducted"
	BillingStatusProviderFailed                 = "provider_failed"
	BillingStatusReleased                       = "released"
)

type BillingIntent struct {
	ID               string
	UserID           string
	APIKeyID         string
	Provider         string
	Capability       string
	TraceID          string
	ProviderTaskID   string
	CreditCost       int64
	BillingStatus    string
	ProviderStatus   string
	DeductSourceID   string
	LastError        string
	RecoveryAttempts int
	NextRetryAt      *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeductedAt       *time.Time
	ReleasedAt       *time.Time
}

type CreateBillingIntentInput struct {
	ID         string
	UserID     string
	APIKeyID   string
	Provider   string
	Capability string
	TraceID    string
	CreditCost int64
}

type RecordBillingProviderSuccessInput struct {
	Provider       string
	TraceID        string
	ProviderTaskID string
	ProviderStatus string
	CreditCost     int64
}

type BillingIntentProviderSuccessUpdate struct {
	Provider       string
	TraceID        string
	ProviderTaskID string
	ProviderStatus string
	CreditCost     int64
	UpdatedAt      time.Time
}

type BillingIntentProviderFailureUpdate struct {
	Provider       string
	TraceID        string
	ProviderStatus string
	LastError      string
	UpdatedAt      time.Time
}

type BillingIntentRetryUpdate struct {
	Provider         string
	TraceID          string
	LastError        string
	RecoveryAttempts int
	NextRetryAt      *time.Time
	UpdatedAt        time.Time
}

type BillingIntentDeductedUpdate struct {
	Provider   string
	TraceID    string
	DeductedAt time.Time
	UpdatedAt  time.Time
}

type BillingIntentReleaseUpdate struct {
	Provider   string
	TraceID    string
	LastError  string
	ReleasedAt time.Time
	UpdatedAt  time.Time
}
