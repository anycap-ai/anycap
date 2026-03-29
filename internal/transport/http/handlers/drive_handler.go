package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type DriveHandler struct {
	service *driveapp.Service
}

func NewDriveHandler(service *driveapp.Service) *DriveHandler {
	return &DriveHandler{service: service}
}

func (h *DriveHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/drive/folders", h.CreateFolder)
	group.POST("/drive/files/presign", h.PresignFile)
	group.POST("/drive/files/complete", h.CompleteFile)
	group.GET("/drive/nodes", h.ListNodes)
	group.PATCH("/drive/nodes/:id", h.UpdateNode)
	group.DELETE("/drive/nodes/:id", h.DeleteNode)
	group.PUT("/drive/nodes/:id/share", h.UpsertShare)
	group.POST("/drive/nodes/:id/share/rotate", h.RotateShare)
	group.DELETE("/drive/nodes/:id/share", h.RevokeShare)
}

type createFolderRequest struct {
	ParentID *int64 `json:"parent_id"`
	Name     string `json:"name"`
}

type presignFileRequest struct {
	ParentID      *int64 `json:"parent_id"`
	Name          string `json:"name"`
	ContentType   string `json:"content_type"`
	ContentLength int64  `json:"content_length"`
}

type completeFileRequest struct {
	UploadSessionID int64 `json:"upload_session_id"`
	FileID          int64 `json:"file_id"`
}

type upsertShareRequest struct {
	ExpiresInSeconds *int64  `json:"expires_in_seconds"`
	NoExpire         bool    `json:"no_expire"`
	Password         *string `json:"password"`
	NoPassword       bool    `json:"no_password"`
}

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

	node, err := h.service.CreateFolder(c, principal.UserID, req.ParentID, req.Name)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "create_drive_folder_failed", err.Error())
		return
	}

	writeSuccess(ctx, node)
}

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

	result, err := h.service.PresignFileUpload(c, principal.UserID, req.ParentID, req.Name, req.ContentType, req.ContentLength)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "presign_drive_file_failed", err.Error())
		return
	}

	writeSuccess(ctx, result)
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

	node, err := h.service.CompleteFileUpload(c, principal.UserID, req.UploadSessionID, req.FileID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "complete_drive_file_failed", err.Error())
		return
	}

	writeSuccess(ctx, node)
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

	parentID, err := parseOptionalInt64Query(ctx.Query("parent_id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_parent_id", err.Error())
		return
	}

	items, err := h.service.ListNodes(c, principal.UserID, parentID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "list_drive_nodes_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"items": items,
		"total": len(items),
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

	nodeID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_drive_node_id", err.Error())
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
		if err := json.Unmarshal(raw, &parentID); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_parent_id", "parent_id must be integer or null")
			return
		}
	}

	node, err := h.service.UpdateNode(c, principal.UserID, nodeID, name, parentID, updateParent)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "update_drive_node_failed", err.Error())
		return
	}

	writeSuccess(ctx, node)
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

	nodeID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_drive_node_id", err.Error())
		return
	}

	deletedCount, err := h.service.DeleteNode(c, principal.UserID, nodeID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "delete_drive_node_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"id":            nodeID,
		"deleted":       true,
		"deleted_count": deletedCount,
	})
}

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

	nodeID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_drive_node_id", err.Error())
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

	writeSuccess(ctx, view)
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

	nodeID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_drive_node_id", err.Error())
		return
	}

	view, err := h.service.RotateShare(c, principal.UserID, nodeID)
	if err != nil {
		writeError(ctx, statusCodeForDriveError(err), "rotate_drive_share_failed", err.Error())
		return
	}

	writeSuccess(ctx, view)
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

	nodeID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_drive_node_id", err.Error())
		return
	}

	if err := h.service.RevokeShare(c, principal.UserID, nodeID); err != nil {
		writeError(ctx, statusCodeForDriveError(err), "revoke_drive_share_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"id":      nodeID,
		"revoked": true,
	})
}

func statusCodeForDriveError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case containsAny(err.Error(), "required", "must be", "invalid"):
		return consts.StatusBadRequest
	case containsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case containsAny(err.Error(), "duplicate", "unique"):
		return consts.StatusConflict
	case containsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}

func parseOptionalInt64Query(raw string) (*int64, error) {
	if raw == "" {
		return nil, nil
	}
	parsed, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || parsed <= 0 {
		return nil, fmt.Errorf("must be a positive integer")
	}
	return &parsed, nil
}
