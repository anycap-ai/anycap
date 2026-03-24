package handlers

import (
	"context"
	"encoding/json"
	"errors"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type CapabilitiesHandler struct {
	service *capapp.Service
}

func NewCapabilitiesHandler(service *capapp.Service) *CapabilitiesHandler {
	return &CapabilitiesHandler{service: service}
}

// presignResponse is the public API shape for presign results.
// It intentionally omits ObjectKey which is an internal field.
type presignResponse struct {
	UploadURL string `json:"upload_url"`
	ObjectURL string `json:"object_url"`
	ExpiresIn int    `json:"expires_in"`
}

func (h *CapabilitiesHandler) Presign(c context.Context, ctx *app.RequestContext) {
	var req model.PresignRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.Presign(c, req)
	if err != nil {
		code, errCode, msg := classifyCapError(err)
		writeError(ctx, code, errCode, msg)
		return
	}

	writeSuccess(ctx, presignResponse{
		UploadURL: result.UploadURL,
		ObjectURL: result.ObjectURL,
		ExpiresIn: result.ExpiresIn,
	})
}

func (h *CapabilitiesHandler) ImageUnderstand(c context.Context, ctx *app.RequestContext) {
	var req model.ImageUnderstandRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.ImageUnderstand(c, req)
	if err != nil {
		code, errCode, msg := classifyCapError(err)
		writeError(ctx, code, errCode, msg)
		return
	}

	writeSuccess(ctx, result)
}

func (h *CapabilitiesHandler) VideoRead(c context.Context, ctx *app.RequestContext) {
	var req model.VideoReadRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.VideoRead(c, req)
	if err != nil {
		code, errCode, msg := classifyCapError(err)
		writeError(ctx, code, errCode, msg)
		return
	}

	writeSuccess(ctx, result)
}

func classifyCapError(err error) (httpStatus int, code string, message string) {
	// Domain validation errors -> 422
	if errors.Is(err, model.ErrMissingInput) {
		return consts.StatusUnprocessableEntity, "missing_input", err.Error()
	}
	if errors.Is(err, model.ErrAmbiguousInput) {
		return consts.StatusUnprocessableEntity, "ambiguous_input", err.Error()
	}
	if errors.Is(err, model.ErrMissingMIME) {
		return consts.StatusUnprocessableEntity, "missing_input", err.Error()
	}
	if errors.Is(err, model.ErrStorageNotConfigured) {
		return consts.StatusBadGateway, "storage_not_configured", err.Error()
	}

	// Upstream errors from agent-platform
	var ue *agentplatform.UpstreamError
	if errors.As(err, &ue) {
		return consts.StatusBadGateway, ue.Code, ue.Message
	}

	// Content-type / filename validation
	if err.Error() == "content_type must be image/* or video/*" {
		return consts.StatusBadRequest, "invalid_content_type", err.Error()
	}
	if err.Error() == "filename is required" || err.Error() == "content_type is required" {
		return consts.StatusBadRequest, "invalid_param", err.Error()
	}

	// Default
	return consts.StatusInternalServerError, "internal_error", err.Error()
}
