package page

import (
	"context"
	"encoding/json"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) CreateVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	version, err := h.service.CreateVersion(c, userID, siteID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "create_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) PresignVersionAsset(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	var req presignPageVersionAssetRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	result, err := h.service.PresignVersionAsset(c, userID, siteID, versionID, req.AssetPath, req.ContentType, req.ContentLength)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "presign_page_version_asset_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersionPresign(c, result)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_presign_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) CompleteVersionAsset(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	var req completePageVersionAssetRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	rawUploadSessionID, err := idresolver.ParseRequiredIDRaw(req.UploadSessionID, "upload_session_id")
	if err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_upload_session_id", err.Error())
		return
	}
	uploadSessionID, err := h.resolveUploadSessionID(c, rawUploadSessionID)
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_upload_session_id", err)
		return
	}

	version, err := h.service.CompleteVersionAsset(c, userID, siteID, versionID, uploadSessionID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "complete_page_version_asset_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) FinalizeVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	version, err := h.service.FinalizeVersion(c, userID, siteID, versionID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "finalize_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) ListVersions(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	limit, offset := handlers.ParseLimitOffset(
		string(ctx.Query("limit")),
		string(ctx.Query("offset")),
	)

	filter := model.ListPageVersionsFilter{
		Limit:  limit,
		Offset: offset,
	}

	versions, total, err := h.service.ListVersions(c, userID, siteID, filter)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "list_page_versions_failed", err.Error())
		return
	}

	presentedVersions, err := h.presentPageVersions(c, versions)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_versions_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, map[string]any{
		"items": presentedVersions,
		"total": total,
	})
}

func (h *Handler) GetVersionByNumber(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	versionNo, err := strconv.ParseInt(string(ctx.Param("no")), 10, 64)
	if err != nil || versionNo <= 0 {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_version_number", "version number must be a positive integer")
		return
	}

	version, err := h.service.GetVersionByNumber(c, userID, siteID, versionNo)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "get_page_version_by_number_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) PublishVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	version, err := h.service.PublishVersion(c, userID, siteID, versionID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "publish_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) CreatePreviewHost(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	result, err := h.service.CreatePreviewHost(c, userID, siteID, versionID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "create_page_preview_host_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, map[string]any{
		"preview_url": result.PreviewURL,
		"expires_at":  result.ExpiresAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *Handler) RollbackCloneVersion(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(ctx, principal.UserID)
	if !ok {
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}
	versionID, err := h.resolvePageVersionID(c, string(ctx.Param("vid")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_version_id", err)
		return
	}

	version, err := h.service.RollbackCloneVersion(c, userID, siteID, versionID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "rollback_clone_page_version_failed", err.Error())
		return
	}

	presented, err := h.presentPageVersion(c, version)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_version_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}
