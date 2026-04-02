package drive

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) CreateFolder(c context.Context, ctx *app.RequestContext) {
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

	var req createFolderRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	parentID, err := h.resolveOptionalDriveNodeIDFromRaw(c, req.ParentID)
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_parent_id", err)
		return
	}

	node, err := h.service.CreateFolder(c, userID, parentID, req.Name)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForDriveError(err), "create_drive_folder_failed", err.Error())
		return
	}

	presented, err := h.presentDriveNode(c, node)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_node_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) ListNodes(c context.Context, ctx *app.RequestContext) {
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

	parentID, err := h.resolveOptionalDriveNodeIDFromQuery(c, string(ctx.Query("parent_id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_parent_id", err)
		return
	}

	limit, offset := handlers.ParseLimitOffset(
		string(ctx.Query("limit")),
		string(ctx.Query("offset")),
	)

	filter := model.ListDriveNodesFilter{
		Limit:  limit,
		Offset: offset,
	}

	items, total, err := h.service.ListNodes(c, userID, parentID, filter)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForDriveError(err), "list_drive_nodes_failed", err.Error())
		return
	}

	presentedItems, err := h.presentDriveNodes(c, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_nodes_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, map[string]any{
		"items": presentedItems,
		"total": total,
	})
}

func (h *Handler) UpdateNode(c context.Context, ctx *app.RequestContext) {
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

	nodeID, err := h.resolver.ResolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}

	var payload map[string]json.RawMessage
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	var (
		name         *string
		parentID     *int64
		updateParent bool
	)

	if raw, exists := payload["name"]; exists {
		if err := json.Unmarshal(raw, &name); err != nil {
			handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_name", "name must be string")
			return
		}
	}
	if raw, exists := payload["parent_id"]; exists {
		updateParent = true
		parentID, err = h.resolveOptionalDriveNodeIDFromRaw(c, raw)
		if err != nil {
			idresolver.WriteIDResolveError(c, ctx, "invalid_parent_id", err)
			return
		}
	}

	node, err := h.service.UpdateNode(c, userID, nodeID, name, parentID, updateParent)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForDriveError(err), "update_drive_node_failed", err.Error())
		return
	}

	presented, err := h.presentDriveNode(c, node)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_drive_node_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) DeleteNode(c context.Context, ctx *app.RequestContext) {
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

	rawID := string(ctx.Param("id"))
	nodeID, err := h.resolver.ResolveDriveNodeID(c, rawID)
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}

	deletedCount, err := h.service.DeleteNode(c, userID, nodeID)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForDriveError(err), "delete_drive_node_failed", err.Error())
		return
	}

	handlers.WriteSuccess(c, ctx, map[string]any{
		"id":            rawID,
		"deleted":       true,
		"deleted_count": deletedCount,
	})
}
