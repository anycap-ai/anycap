package handlers

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

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

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	presentedItems, err := h.presentPageSites(c, items)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_sites_failed", err.Error())
		return
	}
	writeSuccess(ctx, map[string]any{
		"items": presentedItems,
		"total": len(presentedItems),
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	site, err := h.service.GetSite(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "get_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
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

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	site, err := h.service.Unpublish(c, principal.UserID, siteID)
	if err != nil {
		writeError(ctx, statusCodeForPageError(err), "unpublish_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}
