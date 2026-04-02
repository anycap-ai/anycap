package drive

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) PresignFile(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(c, ctx, principal.UserID)
	if !ok {
		return
	}

	var req presignFileRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	parentID, err := h.resolveOptionalDriveNodeIDFromRaw(c, req.ParentID)
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_parent_id", err)
		return
	}

	result, err := h.service.PresignFileUpload(c, userID, parentID, req.Name, req.ContentType, req.ContentLength)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForDriveError(err), "presign_drive_file_failed", err.Error())
		return
	}

	presented, err := h.presentDrivePresign(c, result)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_presign_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) CompleteFile(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(c, ctx, principal.UserID)
	if !ok {
		return
	}

	var req completeFileRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	uploadSessionID, err := h.resolveRequiredUploadSessionIDFromRaw(c, req.UploadSessionID)
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_upload_session_id", err)
		return
	}
	fileID, err := h.resolveRequiredDriveNodeIDFromRaw(c, req.FileID)
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_file_id", err)
		return
	}

	node, err := h.service.CompleteFileUpload(c, userID, uploadSessionID, fileID)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForDriveError(err), "complete_drive_file_failed", err.Error())
		return
	}

	presented, err := h.presentDriveNode(c, node)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_node_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}
