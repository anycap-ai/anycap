package handlers

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	version, err := h.service.CreateVersion(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "create_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_version_id", err)
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

	presented, err := h.presentPageVersionPresign(c, result)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_version_presign_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	var req completePageVersionAssetRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	rawUploadSessionID, err := parseRequiredIDRaw(req.UploadSessionID, "upload_session_id")
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_upload_session_id", err.Error())
		return
	}
	uploadSessionID, err := h.resolveUploadSessionID(c, rawUploadSessionID)
	if err != nil {
		writeIDResolveError(ctx, "invalid_upload_session_id", err)
		return
	}

	version, err := h.service.CompleteVersionAsset(c, principal.UserID, siteID, versionID, uploadSessionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "complete_page_version_asset_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	version, err := h.service.FinalizeVersion(c, principal.UserID, siteID, versionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "finalize_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	versions, err := h.service.ListVersions(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "list_page_versions_failed", err.Error())
		return
	}

	presentedVersions, err := h.presentPageVersions(c, versions)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_versions_failed", err.Error())
		return
	}
	writeSuccess(ctx, map[string]any{
		"items": presentedVersions,
		"total": len(presentedVersions),
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	version, err := h.service.PublishVersion(c, principal.UserID, siteID, versionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "publish_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	version, err := h.service.RollbackCloneVersion(c, principal.UserID, siteID, versionID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "rollback_clone_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}
