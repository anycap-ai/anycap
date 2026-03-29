package handlers

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *DriveHandler) PresignFile(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	var req presignFileRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	parentID, err := h.resolveOptionalDriveNodeIDFromRaw(c, req.ParentID)
	if err != nil {
		writeIDResolveError(ctx, "invalid_parent_id", err)
		return
	}

	result, err := h.service.PresignFileUpload(c, principal.UserID, parentID, req.Name, req.ContentType, req.ContentLength)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "presign_drive_file_failed", err.Error())
		return
	}

	presented, err := h.presentDrivePresign(c, result)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_presign_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *DriveHandler) CompleteFile(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	var req completeFileRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	uploadSessionID, err := h.resolveRequiredUploadSessionIDFromRaw(c, req.UploadSessionID)
	if err != nil {
		writeIDResolveError(ctx, "invalid_upload_session_id", err)
		return
	}
	fileID, err := h.resolveRequiredDriveNodeIDFromRaw(c, req.FileID)
	if err != nil {
		writeIDResolveError(ctx, "invalid_file_id", err)
		return
	}

	node, err := h.service.CompleteFileUpload(c, principal.UserID, uploadSessionID, fileID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "complete_drive_file_failed", err.Error())
		return
	}

	presented, err := h.presentDriveNode(c, node)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_node_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}
