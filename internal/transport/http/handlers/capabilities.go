package handlers

import (
	"context"
	"encoding/json"
	"errors"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type CapabilitiesHandler struct {
	service *capapp.Service
}

func NewCapabilitiesHandler(service *capapp.Service) *CapabilitiesHandler {
	return &CapabilitiesHandler{service: service}
}

func (h *CapabilitiesHandler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/capabilities")
	g.POST("/presign", h.Presign)
	g.POST("/image/understand", h.ImageUnderstand)
	g.POST("/video/read", h.VideoRead)
}

// presignResponse is the public API shape for presign results.
// It intentionally omits ObjectKey which is an internal field.
type presignResponse struct {
	UploadURL string `json:"upload_url"`
	ObjectURL string `json:"object_url"`
	ExpiresIn int    `json:"expires_in"`
}

func (h *CapabilitiesHandler) Presign(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}

	var req model.PresignRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.Presign(c, req)
	if err != nil {
		middleware.ReportError(ctx, err)
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
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}

	var req model.ImageUnderstandRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.ImageUnderstand(c, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyCapError(err)
		writeError(ctx, code, errCode, msg)
		return
	}

	writeSuccess(ctx, result)
}

func (h *CapabilitiesHandler) VideoRead(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}

	var req model.VideoReadRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.VideoRead(c, req)
	if err != nil {
		middleware.ReportError(ctx, err)
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
	if errors.Is(err, model.ErrCapabilitiesProviderNotConfigured) {
		return consts.StatusServiceUnavailable, "capabilities_service_unavailable", err.Error()
	}
	if errors.Is(err, model.ErrTooManyImages) {
		return consts.StatusUnprocessableEntity, "too_many_images", err.Error()
	}
	if errors.Is(err, model.ErrStorageNotConfigured) {
		return consts.StatusServiceUnavailable, "storage_not_configured", err.Error()
	}

	// Upload validation errors -> 400/413
	if errors.Is(err, model.ErrInvalidContentType) {
		return consts.StatusBadRequest, "invalid_content_type", err.Error()
	}
	if errors.Is(err, model.ErrInvalidFilename) {
		return consts.StatusBadRequest, "invalid_filename", err.Error()
	}
	if errors.Is(err, model.ErrContentLengthRequired) {
		return consts.StatusBadRequest, "invalid_param", err.Error()
	}
	if errors.Is(err, model.ErrFileTooLarge) {
		return 413, "file_too_large", err.Error()
	}

	// Upstream errors from agent-platform
	var ue *agentplatform.UpstreamError
	if errors.As(err, &ue) {
		return consts.StatusBadGateway, ue.Code, ue.Message
	}

	// Remaining param validation (filename/content_type required)
	msg := err.Error()
	if msg == "filename is required" || msg == "content_type is required" {
		return consts.StatusBadRequest, "invalid_param", msg
	}

	// Default
	return consts.StatusInternalServerError, "internal_error", msg
}
