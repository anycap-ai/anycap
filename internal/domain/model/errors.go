package model

// Error is a legacy typed error used by capabilities, auth, and billing.
type Error struct {
	Code    string
	Message string
}

func (e *Error) Error() string {
	return e.Message
}

var (
	ErrInvalidParam            = &Error{Code: "INVALID_PARAM", Message: "invalid request"}
	ErrPromptRequired          = &Error{Code: "INVALID_PARAM", Message: "prompt is required"}
	ErrAuthInvalid             = &Error{Code: "AUTH_INVALID", Message: "invalid api key"}
	ErrAuthExpired             = &Error{Code: "AUTH_EXPIRED", Message: "login session expired"}
	ErrRateLimited             = &Error{Code: "RATE_LIMITED", Message: "rate limit exceeded"}
	ErrInsufficientCredit      = &Error{Code: "INSUFFICIENT_CREDIT", Message: "insufficient credit"}
	ErrBillingUncertain        = &Error{Code: "BILLING_UNCERTAIN", Message: "billing status uncertain"}
	ErrModelRouteNotConfigured = &Error{Code: "MODEL_ROUTE_NOT_CONFIGURED", Message: "model route is not configured"}
	ErrInternal                = &Error{Code: "INTERNAL_ERROR", Message: "internal server error"}
)

// DomainError represents a categorized application-level error for page/drive features.
// Handler helpers use errors.As to map these to HTTP status codes.
type DomainError struct {
	Code    string // e.g. "not_found", "validation", "conflict", "not_configured"
	Message string
}

func (e *DomainError) Error() string { return e.Message }

// ErrNotFound returns a domain error indicating a resource was not found (HTTP 404).
func ErrNotFound(msg string) error { return &DomainError{Code: "not_found", Message: msg} }

// ErrValidation returns a domain error indicating invalid input (HTTP 400).
func ErrValidation(msg string) error { return &DomainError{Code: "validation", Message: msg} }

// ErrConflict returns a domain error indicating a uniqueness or state conflict (HTTP 409).
func ErrConflict(msg string) error { return &DomainError{Code: "conflict", Message: msg} }

// ErrNotConfigured returns a domain error indicating a service dependency is missing (HTTP 503).
func ErrNotConfigured(msg string) error { return &DomainError{Code: "not_configured", Message: msg} }
