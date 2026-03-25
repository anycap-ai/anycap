package model

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
	ErrRateLimited             = &Error{Code: "RATE_LIMITED", Message: "rate limit exceeded"}
	ErrInsufficientCredit      = &Error{Code: "INSUFFICIENT_CREDIT", Message: "insufficient credit"}
	ErrBillingUncertain        = &Error{Code: "BILLING_UNCERTAIN", Message: "billing status uncertain"}
	ErrModelRouteNotConfigured = &Error{Code: "MODEL_ROUTE_NOT_CONFIGURED", Message: "model route is not configured"}
	ErrInternal                = &Error{Code: "INTERNAL_ERROR", Message: "internal server error"}
)
