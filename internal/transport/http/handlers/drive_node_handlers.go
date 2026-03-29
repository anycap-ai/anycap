package handlers

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *DriveHandler) CreateFolder(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	var req createFolderRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	parentID, err := h.resolveOptionalDriveNodeIDFromRaw(c, req.ParentID)
	if err != nil {
		writeIDResolveError(ctx, "invalid_parent_id", err)
		return
	}

	node, err := h.service.CreateFolder(c, principal.UserID, parentID, req.Name)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "create_drive_folder_failed", err.Error())
		return
	}

	presented, err := h.presentDriveNode(c, node)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_node_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *DriveHandler) ListNodes(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	parentID, err := h.resolveOptionalDriveNodeIDFromQuery(c, string(ctx.Query("parent_id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_parent_id", err)
		return
	}

	items, err := h.service.ListNodes(c, principal.UserID, parentID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "list_drive_nodes_failed", err.Error())
		return
	}
	if h.mapper == nil {
		writeSuccess(ctx, map[string]any{
			"items": items,
			"total": len(items),
		})
		return
	}

	presentedItems, err := h.presentDriveNodes(c, items)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_nodes_failed", err.Error())
		return
	}
	writeSuccess(ctx, map[string]any{
		"items": presentedItems,
		"total": len(presentedItems),
	})
}

func (h *DriveHandler) UpdateNode(c context.Context, ctx *app.RequestContext) {
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

	var payload map[string]json.RawMessage
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	var (
		name         *string
		parentID     *int64
		updateParent bool
	)

	if raw, exists := payload["name"]; exists {
		if err := json.Unmarshal(raw, &name); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_name", "name must be string")
			return
		}
	}
	if raw, exists := payload["parent_id"]; exists {
		updateParent = true
		parentID, err = h.resolveOptionalDriveNodeIDFromRaw(c, raw)
		if err != nil {
			writeIDResolveError(ctx, "invalid_parent_id", err)
			return
		}
	}

	node, err := h.service.UpdateNode(c, principal.UserID, nodeID, name, parentID, updateParent)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "update_drive_node_failed", err.Error())
		return
	}

	presented, err := h.presentDriveNode(c, node)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_drive_node_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *DriveHandler) DeleteNode(c context.Context, ctx *app.RequestContext) {
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

	deletedCount, err := h.service.DeleteNode(c, principal.UserID, nodeID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "delete_drive_node_failed", err.Error())
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
		"id":            responseID,
		"deleted":       true,
		"deleted_count": deletedCount,
	})
}
