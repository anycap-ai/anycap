package dto

import (
	"errors"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type ErrorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// InvocationDiagnostics contains the allow-listed identifiers and stage exposed
// for product-facing provider invocations.
type InvocationDiagnostics struct {
	TraceID           string                `json:"trace_id"`
	RequestID         string                `json:"request_id"`
	TaskID            string                `json:"task_id,omitempty"`
	UpstreamRequestID string                `json:"upstream_request_id,omitempty"`
	Stage             model.InvocationStage `json:"stage,omitempty"`
}

type Envelope struct {
	ID          string                 `json:"id,omitempty"`
	Status      string                 `json:"status"`
	Data        any                    `json:"data,omitempty"`
	Error       *ErrorPayload          `json:"error,omitempty"`
	Diagnostics *InvocationDiagnostics `json:"diagnostics,omitempty"`
}

func NewInvocationDiagnostics(traceID, requestID string, meta model.InvocationMeta) InvocationDiagnostics {
	return InvocationDiagnostics{
		TraceID:           traceID,
		RequestID:         requestID,
		TaskID:            meta.TaskID,
		UpstreamRequestID: meta.UpstreamRequestID,
		Stage:             meta.Stage,
	}
}

func SuccessEnvelope(requestID string, data any) Envelope {
	return Envelope{
		ID:     requestID,
		Status: "success",
		Data:   data,
	}
}

func SuccessInvocationEnvelope(requestID string, data any, diagnostics InvocationDiagnostics) Envelope {
	envelope := SuccessEnvelope(requestID, data)
	envelope.Diagnostics = &diagnostics
	return envelope
}

func ErrorEnvelope(requestID, code, message string) Envelope {
	return Envelope{
		ID:     requestID,
		Status: "error",
		Error: &ErrorPayload{
			Code:    code,
			Message: message,
		},
	}
}

func ErrorInvocationEnvelope(requestID, code, message string, diagnostics InvocationDiagnostics) Envelope {
	envelope := ErrorEnvelope(requestID, code, message)
	envelope.Diagnostics = &diagnostics
	return envelope
}

func MapDomainError(err error) (int, Envelope) {
	var invocationErr *model.InvocationError
	if errors.As(err, &invocationErr) {
		switch invocationErr.Code {
		case model.InvocationErrorCodeUpstreamTimeout:
			return consts.StatusGatewayTimeout, ErrorEnvelope("", invocationErr.Code, "upstream provider timed out")
		case model.InvocationErrorCodeUpstreamEmptyResult:
			return consts.StatusBadGateway, ErrorEnvelope("", invocationErr.Code, "provider completed without a usable result")
		}
	}

	switch {
	case isDomainError(err, "validation"):
		return consts.StatusBadRequest, ErrorEnvelope("", "validation", err.Error())
	case isDomainError(err, "not_configured"):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "not_configured", err.Error())
	case isDomainError(err, "conflict"):
		return consts.StatusConflict, ErrorEnvelope("", "conflict", err.Error())
	case isDomainError(err, "not_found"):
		return consts.StatusNotFound, ErrorEnvelope("", "not_found", err.Error())
	case errors.Is(err, model.ErrAuthInvalid):
		return consts.StatusUnauthorized, ErrorEnvelope("", model.ErrAuthInvalid.Code, model.ErrAuthInvalid.Message)
	case errors.Is(err, model.ErrAuthExpired):
		return consts.StatusUnauthorized, ErrorEnvelope("", model.ErrAuthExpired.Code, model.ErrAuthExpired.Message)
	case errors.Is(err, model.ErrRateLimited):
		return consts.StatusTooManyRequests, ErrorEnvelope("", model.ErrRateLimited.Code, model.ErrRateLimited.Message)
	case errors.Is(err, model.ErrUpstreamUnavailable):
		message := model.ErrUpstreamUnavailable.Message
		if err != nil {
			message = err.Error()
		}
		return consts.StatusServiceUnavailable, ErrorEnvelope("", model.ErrUpstreamUnavailable.Code, message)
	case errors.Is(err, model.ErrAuthProviderNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "AUTH_PROVIDER_NOT_CONFIGURED", model.ErrAuthProviderNotConfigured.Error())
	case errors.Is(err, model.ErrImageExecutionNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "IMAGE_PROVIDER_NOT_CONFIGURED", model.ErrImageExecutionNotConfigured.Error())
	case errors.Is(err, model.ErrVideoExecutionNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "VIDEO_PROVIDER_NOT_CONFIGURED", model.ErrVideoExecutionNotConfigured.Error())
	case errors.Is(err, model.ErrMusicExecutionNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "MUSIC_PROVIDER_NOT_CONFIGURED", model.ErrMusicExecutionNotConfigured.Error())
	case errors.Is(err, model.ErrInsufficientCredit):
		return consts.StatusPaymentRequired, ErrorEnvelope("", model.ErrInsufficientCredit.Code, model.ErrInsufficientCredit.Message)
	case errors.Is(err, model.ErrBillingUncertain):
		return consts.StatusBadGateway, ErrorEnvelope("", model.ErrBillingUncertain.Code, model.ErrBillingUncertain.Message)
	case errors.Is(err, model.ErrModelRouteNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", model.ErrModelRouteNotConfigured.Code, err.Error())
	case errors.Is(err, model.ErrModeRequired):
		return consts.StatusBadRequest, ErrorEnvelope("", model.ErrModeRequired.Code, err.Error())
	case errors.Is(err, model.ErrModeNotSupported):
		return consts.StatusBadRequest, ErrorEnvelope("", model.ErrModeNotSupported.Code, err.Error())
	case errors.Is(err, model.ErrPromptRequired), errors.Is(err, model.ErrModelRequired), errors.Is(err, model.ErrInvalidParam):
		message := model.ErrInvalidParam.Message
		if err != nil {
			message = err.Error()
		}
		return consts.StatusBadRequest, ErrorEnvelope("", model.ErrInvalidParam.Code, message)
	case errors.Is(err, model.ErrUploadReferenceInvalid):
		return consts.StatusBadRequest, ErrorEnvelope("", "INVALID_PARAM", model.ErrUploadReferenceInvalid.Error())
	case errors.Is(err, model.ErrUploadReferenceForbidden):
		return consts.StatusForbidden, ErrorEnvelope("", "FORBIDDEN", model.ErrUploadReferenceForbidden.Error())
	case errors.Is(err, model.ErrUploadReferenceNotFound), errors.Is(err, model.ErrUploadObjectNotFound):
		return consts.StatusNotFound, ErrorEnvelope("", "NOT_FOUND", err.Error())
	default:
		return consts.StatusInternalServerError, ErrorEnvelope("", model.ErrInternal.Code, model.ErrInternal.Message)
	}
}

func isDomainError(err error, code string) bool {
	var domainErr *model.DomainError
	return errors.As(err, &domainErr) && domainErr.Code == code
}
