package capabilities

import (
	"context"
	"encoding/json"
	"errors"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service *capapp.Service
}

func NewHandler(service *capapp.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/capabilities")
	g.POST("/presign", h.Presign)
	g.POST("/image/read", h.ImageRead)
	g.POST("/video/read", h.VideoRead)
	g.POST("/audio/read", h.AudioRead)
}

// presignResponse is the public API shape for presign results.
// It intentionally omits ObjectKey which is an internal field.
type presignResponse struct {
	UploadURL string `json:"upload_url"`
	ObjectURL string `json:"object_url"`
	ExpiresIn int    `json:"expires_in"`
	Reused    bool   `json:"reused,omitempty"`
}

func userRequestContext(c context.Context, ctx *app.RequestContext) (context.Context, bool) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return nil, false
	}
	return middleware.ContextWithUserID(c, principal.UserID), true
}

func (h *Handler) Presign(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}
	reqCtx, ok := userRequestContext(c, ctx)
	if !ok {
		return
	}

	var req model.PresignRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.Presign(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyCapError(err)
		handlers.WriteError(ctx, code, errCode, msg)
		return
	}

	handlers.WriteSuccess(ctx, presignResponse{
		UploadURL: result.UploadURL,
		ObjectURL: result.ObjectURL,
		ExpiresIn: result.ExpiresIn,
		Reused:    result.Reused,
	})
}

func (h *Handler) ImageRead(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}
	reqCtx, ok := userRequestContext(c, ctx)
	if !ok {
		return
	}

	var req model.ImageReadRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.ImageRead(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyCapError(err)
		handlers.WriteError(ctx, code, errCode, msg)
		return
	}

	handlers.WriteSuccess(ctx, result)
}

func (h *Handler) VideoRead(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}
	reqCtx, ok := userRequestContext(c, ctx)
	if !ok {
		return
	}

	var req model.VideoReadRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.VideoRead(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyCapError(err)
		handlers.WriteError(ctx, code, errCode, msg)
		return
	}

	handlers.WriteSuccess(ctx, result)
}

func (h *Handler) AudioRead(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "capabilities_service_unavailable", "capabilities service is not configured")
		return
	}
	reqCtx, ok := userRequestContext(c, ctx)
	if !ok {
		return
	}

	var req model.AudioReadRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.AudioRead(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyCapError(err)
		handlers.WriteError(ctx, code, errCode, msg)
		return
	}

	handlers.WriteSuccess(ctx, result)
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
	if errors.Is(err, model.ErrInvalidSHA256) {
		return consts.StatusBadRequest, "invalid_sha256", err.Error()
	}
	if errors.Is(err, model.ErrContentLengthRequired) {
		return consts.StatusBadRequest, "invalid_param", err.Error()
	}
	if errors.Is(err, model.ErrFileTooLarge) {
		return 413, "file_too_large", err.Error()
	}
	if errors.Is(err, model.ErrUploadReferenceInvalid) {
		return consts.StatusBadRequest, "invalid_upload_reference", err.Error()
	}
	if errors.Is(err, model.ErrUploadReferenceForbidden) {
		return consts.StatusForbidden, "upload_reference_forbidden", err.Error()
	}
	if errors.Is(err, model.ErrUploadReferenceNotFound) || errors.Is(err, model.ErrUploadObjectNotFound) {
		return consts.StatusNotFound, "upload_reference_not_found", err.Error()
	}

	// Upstream errors from agent-platform
	var ue *agentplatform.UpstreamError
	if errors.As(err, &ue) {
		return consts.StatusBadGateway, ue.Code, ue.Message
	}

	// Remaining param validation (filename/content_type required)
	msg := err.Error()
	if msg == "user_id is required" {
		return consts.StatusUnauthorized, "auth_invalid", msg
	}
	if msg == "filename is required" || msg == "content_type is required" {
		return consts.StatusBadRequest, "invalid_param", msg
	}

	// Default
	return consts.StatusInternalServerError, "internal_error", msg
}
