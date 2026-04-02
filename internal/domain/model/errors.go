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
	ErrUpstreamUnavailable     = &Error{Code: "UPSTREAM_UNAVAILABLE", Message: "upstream service unavailable"}
	ErrInsufficientCredit      = &Error{Code: "INSUFFICIENT_CREDIT", Message: "insufficient credit"}
	ErrBillingUncertain        = &Error{Code: "BILLING_UNCERTAIN", Message: "billing status uncertain"}
	ErrModelRouteNotConfigured = &Error{Code: "MODEL_ROUTE_NOT_CONFIGURED", Message: "model route is not configured"}
	ErrModeRequired            = &Error{Code: "MODE_REQUIRED", Message: "mode is required when multiple modes are available"}
	ErrModeNotSupported        = &Error{Code: "MODE_NOT_SUPPORTED", Message: "requested mode is not supported by this model"}
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

// ErrQuotaExceeded returns a domain error indicating a storage quota limit was exceeded (HTTP 400).
func ErrQuotaExceeded(msg string) error { return &DomainError{Code: "quota_exceeded", Message: msg} }

// ErrLimitReached returns a domain error indicating a resource count limit was reached (HTTP 400).
func ErrLimitReached(msg string) error { return &DomainError{Code: "limit_reached", Message: msg} }

// ErrPayloadTooLarge returns a domain error indicating a single file exceeds size limits (HTTP 413).
func ErrPayloadTooLarge(msg string) error {
	return &DomainError{Code: "payload_too_large", Message: msg}
}

// ErrTooManyRequests returns a domain error indicating too many concurrent operations (HTTP 429).
func ErrTooManyRequests(msg string) error {
	return &DomainError{Code: "too_many_requests", Message: msg}
}
