package model

import "errors"

// InvocationStage identifies a stable, client-visible phase of a provider invocation.
type InvocationStage string

const (
	InvocationStagePrepare        InvocationStage = "prepare"
	InvocationStageSubmit         InvocationStage = "submit"
	InvocationStagePoll           InvocationStage = "poll"
	InvocationStageDecodeResult   InvocationStage = "decode_result"
	InvocationStageValidateResult InvocationStage = "validate_result"
	InvocationStagePublish        InvocationStage = "publish"
	InvocationStageBilling        InvocationStage = "billing"
)

const (
	InvocationErrorCodeUpstreamTimeout     = "UPSTREAM_TIMEOUT"
	InvocationErrorCodeUpstreamEmptyResult = "UPSTREAM_EMPTY_RESULT"
)

// InvocationMeta contains provider-neutral execution facts learned during an invocation.
type InvocationMeta struct {
	TaskID            string
	UpstreamRequestID string
	ProviderStatus    string
	Stage             InvocationStage
}

// InvocationResult carries a capability result together with provider-neutral metadata.
type InvocationResult[T any] struct {
	Value T
	Meta  InvocationMeta
}

// InvocationError preserves invocation metadata while retaining normal Go error chaining.
type InvocationError struct {
	Code  string
	Cause error
	Meta  InvocationMeta
}

func (e *InvocationError) Error() string {
	if e == nil {
		return ""
	}
	if e.Cause != nil {
		return e.Cause.Error()
	}
	return e.Code
}

func (e *InvocationError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

// MergeInvocationMeta retains identifiers already learned and advances non-empty state.
func MergeInvocationMeta(known, update InvocationMeta) InvocationMeta {
	merged := known
	if merged.TaskID == "" {
		merged.TaskID = update.TaskID
	}
	if merged.UpstreamRequestID == "" {
		merged.UpstreamRequestID = update.UpstreamRequestID
	}
	if update.ProviderStatus != "" {
		merged.ProviderStatus = update.ProviderStatus
	}
	if update.Stage != "" {
		merged.Stage = update.Stage
	}
	return merged
}

// InvocationMetaFromError returns metadata attached anywhere in an error chain.
func InvocationMetaFromError(err error) (InvocationMeta, bool) {
	var invocationErr *InvocationError
	if !errors.As(err, &invocationErr) {
		return InvocationMeta{}, false
	}
	return invocationErr.Meta, true
}

// WrapInvocationError attaches or advances invocation diagnostics without losing the cause.
func WrapInvocationError(code string, cause error, update InvocationMeta) error {
	if cause == nil && code == "" {
		return nil
	}

	known, _ := InvocationMetaFromError(cause)
	var existing *InvocationError
	if code == "" && errors.As(cause, &existing) {
		code = existing.Code
	}

	return &InvocationError{
		Code:  code,
		Cause: cause,
		Meta:  MergeInvocationMeta(known, update),
	}
}
