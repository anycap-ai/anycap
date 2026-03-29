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

func (h *Handler) UpsertShare(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_drive_node_id", err)
		return
	}

	var req upsertShareRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}

	view, err := h.service.UpsertShare(c, principal.UserID, nodeID, req.ExpiresInSeconds, req.NoExpire, req.Password, req.NoPassword)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForDriveError(err), "upsert_drive_share_failed", err.Error())
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) RotateShare(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_drive_node_id", err)
		return
	}

	view, err := h.service.RotateShare(c, principal.UserID, nodeID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForDriveError(err), "rotate_drive_share_failed", err.Error())
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) RevokeShare(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_drive_node_id", err)
		return
	}

	if err := h.service.RevokeShare(c, principal.UserID, nodeID); err != nil {
		handlers.WriteError(ctx, statusCodeForDriveError(err), "revoke_drive_share_failed", err.Error())
		return
	}

	ids, err := h.mapper.ResolveDriveNodeExternalIDs(c, []int64{nodeID})
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "resolve_drive_node_id_failed", err.Error())
		return
	}

	handlers.WriteSuccess(ctx, map[string]any{
		"id":      ids[nodeID],
		"revoked": true,
	})
}
