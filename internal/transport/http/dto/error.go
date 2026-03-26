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

type Envelope struct {
	ID     string        `json:"id,omitempty"`
	Status string        `json:"status"`
	Data   any           `json:"data,omitempty"`
	Error  *ErrorPayload `json:"error,omitempty"`
}

func SuccessEnvelope(requestID string, data any) Envelope {
	return Envelope{
		ID:     requestID,
		Status: "success",
		Data:   data,
	}
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

func MapDomainError(err error) (int, Envelope) {
	switch {
	case errors.Is(err, model.ErrAuthInvalid):
		return consts.StatusUnauthorized, ErrorEnvelope("", model.ErrAuthInvalid.Code, model.ErrAuthInvalid.Message)
	case errors.Is(err, model.ErrAuthExpired):
		return consts.StatusUnauthorized, ErrorEnvelope("", model.ErrAuthExpired.Code, model.ErrAuthExpired.Message)
	case errors.Is(err, model.ErrRateLimited):
		return consts.StatusTooManyRequests, ErrorEnvelope("", model.ErrRateLimited.Code, model.ErrRateLimited.Message)
	case errors.Is(err, model.ErrAuthProviderNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "AUTH_PROVIDER_NOT_CONFIGURED", model.ErrAuthProviderNotConfigured.Error())
	case errors.Is(err, model.ErrImageExecutionNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "IMAGE_PROVIDER_NOT_CONFIGURED", model.ErrImageExecutionNotConfigured.Error())
	case errors.Is(err, model.ErrVideoExecutionNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", "VIDEO_PROVIDER_NOT_CONFIGURED", model.ErrVideoExecutionNotConfigured.Error())
	case errors.Is(err, model.ErrInsufficientCredit):
		return consts.StatusPaymentRequired, ErrorEnvelope("", model.ErrInsufficientCredit.Code, model.ErrInsufficientCredit.Message)
	case errors.Is(err, model.ErrBillingUncertain):
		return consts.StatusBadGateway, ErrorEnvelope("", model.ErrBillingUncertain.Code, model.ErrBillingUncertain.Message)
	case errors.Is(err, model.ErrModelRouteNotConfigured):
		return consts.StatusServiceUnavailable, ErrorEnvelope("", model.ErrModelRouteNotConfigured.Code, err.Error())
	case errors.Is(err, model.ErrPromptRequired), errors.Is(err, model.ErrModelRequired), errors.Is(err, model.ErrInvalidParam):
		message := model.ErrInvalidParam.Message
		if err != nil {
			message = err.Error()
		}
		return consts.StatusBadRequest, ErrorEnvelope("", model.ErrInvalidParam.Code, message)
	default:
		return consts.StatusInternalServerError, ErrorEnvelope("", model.ErrInternal.Code, model.ErrInternal.Message)
	}
}
