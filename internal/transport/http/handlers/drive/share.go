package drive

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/open/common-go/logging"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) GetShare(c context.Context, ctx *app.RequestContext) {
	logging.WithFields(logging.Fields{"path_id": string(ctx.Param("id"))}).Debug("drive get-share entered")

	if h.service == nil {
		logging.GetLogger().Warn("drive get-share service is nil")
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		logging.GetLogger().Warn("drive get-share missing principal")
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	logging.WithField("user_id", principal.UserID).Debug("drive get-share principal resolved")

	userID, ok := handlers.ParseUserID(c, ctx, principal.UserID)
	if !ok {
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		logging.WithError(err).Warn("drive get-share failed to resolve drive node id")
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}
	logging.WithField("node_id", nodeID).Debug("drive get-share resolved node id")

	view, err := h.service.GetShare(c, userID, nodeID)
	if err != nil {
		logging.WithError(err).Warn("drive get-share service call failed")
		writeDriveError(c, ctx, err, "get_drive_share_failed")
		return
	}
	if view == nil {
		logging.GetLogger().Debug("drive get-share no active share found")
		handlers.WriteSuccess(c, ctx, nil)
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		logging.WithError(err).Warn("drive get-share present failed")
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	logging.GetLogger().Debug("drive get-share success")
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) UpsertShare(c context.Context, ctx *app.RequestContext) {
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

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}

	var req upsertShareRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}

	view, err := h.service.UpsertShare(c, userID, nodeID, req.ExpiresInSeconds, req.NoExpire, req.Password, req.NoPassword)
	if err != nil {
		writeDriveError(c, ctx, err, "upsert_drive_share_failed")
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) RotateShare(c context.Context, ctx *app.RequestContext) {
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

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}

	view, err := h.service.RotateShare(c, userID, nodeID)
	if err != nil {
		writeDriveError(c, ctx, err, "rotate_drive_share_failed")
		return
	}

	presented, err := h.presentDriveShareView(c, view)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_share_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) RevokeShare(c context.Context, ctx *app.RequestContext) {
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

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}

	rawID := string(ctx.Param("id"))

	if err := h.service.RevokeShare(c, userID, nodeID); err != nil {
		writeDriveError(c, ctx, err, "revoke_drive_share_failed")
		return
	}

	handlers.WriteSuccess(c, ctx, map[string]any{
		"id":      rawID,
		"revoked": true,
	})
}
