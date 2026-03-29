package handlers

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *DriveHandler) UpsertShare(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_drive_node_id", err)
		return
	}

	var req upsertShareRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}

	view, err := h.service.UpsertShare(c, principal.UserID, nodeID, req.ExpiresInSeconds, req.NoExpire, req.Password, req.NoPassword)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "upsert_drive_share_failed", err.Error())
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *DriveHandler) RotateShare(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_drive_node_id", err)
		return
	}

	view, err := h.service.RotateShare(c, principal.UserID, nodeID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "rotate_drive_share_failed", err.Error())
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *DriveHandler) RevokeShare(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_drive_node_id", err)
		return
	}

	if err := h.service.RevokeShare(c, principal.UserID, nodeID); err != nil {
		writeError(ctx, statusCodeForDriveError(err), "revoke_drive_share_failed", err.Error())
		return
	}

	responseID := any(nodeID)
	if h.mapper != nil {
		ids, resolveErr := h.mapper.ResolveDriveNodeExternalIDs(c, []int64{nodeID})
		if resolveErr != nil {
			writeError(ctx, consts.StatusInternalServerError, "resolve_drive_node_id_failed", resolveErr.Error())
			return
		}
		responseID = ids[nodeID]
	}

	writeSuccess(ctx, map[string]any{
		"id":      responseID,
		"revoked": true,
	})
}
