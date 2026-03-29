package handlers

import (
	"context"
	"encoding/json"

	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type PageHandler struct {
	service *pageapp.Service
}

func NewPageHandler(service *pageapp.Service) *PageHandler {
	return &PageHandler{service: service}
}

func (h *PageHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/pages", h.CreateSite)
	group.GET("/pages", h.ListSites)
	group.GET("/pages/:id", h.GetSite)
	group.PATCH("/pages/:id", h.UpdateSite)
	group.POST("/pages/:id/versions", h.CreateVersion)
	group.POST("/pages/:id/versions/:vid/files/presign", h.PresignVersionAsset)
	group.POST("/pages/:id/versions/:vid/files/complete", h.CompleteVersionAsset)
	group.POST("/pages/:id/versions/:vid/finalize", h.FinalizeVersion)
	group.POST("/pages/:id/versions/:vid/publish", h.PublishVersion)
	group.POST("/pages/:id/versions/:vid/rollback-clone", h.RollbackCloneVersion)
	group.POST("/pages/:id/unpublish", h.Unpublish)
	group.GET("/pages/:id/versions", h.ListVersions)
}

type createPageSiteRequest struct {
	Name string `json:"name"`
}

type presignPageVersionAssetRequest struct {
	AssetPath     string `json:"asset_path"`
	ContentType   string `json:"content_type"`
	ContentLength int64  `json:"content_length"`
}

type completePageVersionAssetRequest struct {
	UploadSessionID int64 `json:"upload_session_id"`
}

func (h *PageHandler) CreateSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	var req createPageSiteRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}

	site, err := h.service.CreateSite(c, principal.UserID, req.Name)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "create_page_site_failed", err.Error())
		return
	}

	writeSuccess(ctx, site)
}

func (h *PageHandler) ListSites(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	items, err := h.service.ListSites(c, principal.UserID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "list_page_sites_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"items": items,
		"total": len(items),
	})
}

func (h *PageHandler) GetSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}

	site, err := h.service.GetSite(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "get_page_site_failed", err.Error())
		return
	}

	writeSuccess(ctx, site)
}

func (h *PageHandler) UpdateSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}

	var payload map[string]json.RawMessage
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	input := model.UpdatePageSiteInput{ID: siteID}

	if raw, exists := payload["name"]; exists {
		var name *string
		if err := json.Unmarshal(raw, &name); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_name", "name must be string")
			return
		}
		input.Name = name
	}

	if raw, exists := payload["access_mode"]; exists {
		var accessMode string
		if err := json.Unmarshal(raw, &accessMode); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_access_mode", "access_mode must be string")
			return
		}
		mode := model.PageAccessMode(accessMode)
		input.AccessMode = &mode
	}

	if raw, exists := payload["spa_fallback"]; exists {
		var spaFallback bool
		if err := json.Unmarshal(raw, &spaFallback); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_spa_fallback", "spa_fallback must be boolean")
			return
		}
		input.SPAFallback = &spaFallback
	}

	if raw, exists := payload["password"]; exists {
		var password *string
		if err := json.Unmarshal(raw, &password); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_password", "password must be string")
			return
		}
		input.UpdatePassword = true
		input.PasswordHash = password
	}

	if raw, exists := payload["no_password"]; exists {
		var noPassword bool
		if err := json.Unmarshal(raw, &noPassword); err != nil {
			writeError(ctx, consts.StatusBadRequest, "invalid_no_password", "no_password must be boolean")
			return
		}
		if noPassword {
			if input.UpdatePassword {
				writeError(ctx, consts.StatusBadRequest, "invalid_password_flags", "password and no_password cannot be set together")
				return
			}
			input.UpdatePassword = true
			input.PasswordHash = nil
			input.PasswordSalt = nil
		}
	}

	if input.Name == nil && input.AccessMode == nil && input.SPAFallback == nil && !input.UpdatePassword {
		writeError(ctx, consts.StatusBadRequest, "empty_update", "at least one field must be updated")
		return
	}

	site, err := h.service.UpdateSite(c, principal.UserID, input)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "update_page_site_failed", err.Error())
		return
	}

	writeSuccess(ctx, site)
}

func (h *PageHandler) CreateVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}

	version, err := h.service.CreateVersion(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "create_page_version_failed", err.Error())
		return
	}

	writeSuccess(ctx, version)
}

func (h *PageHandler) PresignVersionAsset(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}
	versionID, err := parsePathID(ctx.Param("vid"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_version_id", err.Error())
		return
	}

	var req presignPageVersionAssetRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	result, err := h.service.PresignVersionAsset(c, principal.UserID, siteID, versionID, req.AssetPath, req.ContentType, req.ContentLength)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "presign_page_version_asset_failed", err.Error())
		return
	}

	writeSuccess(ctx, result)
}

func (h *PageHandler) CompleteVersionAsset(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}
	versionID, err := parsePathID(ctx.Param("vid"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_version_id", err.Error())
		return
	}

	var req completePageVersionAssetRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	version, err := h.service.CompleteVersionAsset(c, principal.UserID, siteID, versionID, req.UploadSessionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "complete_page_version_asset_failed", err.Error())
		return
	}

	writeSuccess(ctx, version)
}

func (h *PageHandler) FinalizeVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}
	versionID, err := parsePathID(ctx.Param("vid"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_version_id", err.Error())
		return
	}

	version, err := h.service.FinalizeVersion(c, principal.UserID, siteID, versionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "finalize_page_version_failed", err.Error())
		return
	}

	writeSuccess(ctx, version)
}

func (h *PageHandler) ListVersions(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}

	versions, err := h.service.ListVersions(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "list_page_versions_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"items": versions,
		"total": len(versions),
	})
}

func (h *PageHandler) PublishVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}
	versionID, err := parsePathID(ctx.Param("vid"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_version_id", err.Error())
		return
	}

	version, err := h.service.PublishVersion(c, principal.UserID, siteID, versionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "publish_page_version_failed", err.Error())
		return
	}

	writeSuccess(ctx, version)
}

func (h *PageHandler) RollbackCloneVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}
	versionID, err := parsePathID(ctx.Param("vid"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_version_id", err.Error())
		return
	}

	version, err := h.service.RollbackCloneVersion(c, principal.UserID, siteID, versionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "rollback_clone_page_version_failed", err.Error())
		return
	}

	writeSuccess(ctx, version)
}

func (h *PageHandler) Unpublish(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		writeError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_page_site_id", err.Error())
		return
	}

	site, err := h.service.Unpublish(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "unpublish_page_failed", err.Error())
		return
	}

	writeSuccess(ctx, site)
}

func statusCodeForPageError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case containsAny(err.Error(), "required", "must be", "invalid", "expired", "pending", "accepting uploads", "cannot be finalized", "move forward", "before publish", "finalized", "no assets"):
		return consts.StatusBadRequest
	case containsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case containsAny(err.Error(), "duplicate"):
		return consts.StatusConflict
	case containsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}
