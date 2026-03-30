package page

import (
	"context"
	"encoding/json"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) CreateSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	var req createPageSiteRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}

	site, err := h.service.CreateSite(c, principal.UserID, req.Name)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "create_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) ListSites(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	limit, offset := handlers.ParseLimitOffset(
		string(ctx.Query("limit")),
		string(ctx.Query("offset")),
	)

	filter := model.ListPageSitesFilter{
		Limit:  limit,
		Offset: offset,
	}
	if nameRaw := strings.TrimSpace(string(ctx.Query("name"))); nameRaw != "" {
		filter.Name = &nameRaw
	}

	items, total, err := h.service.ListSites(c, principal.UserID, filter)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "list_page_sites_failed", err.Error())
		return
	}

	presentedItems, err := h.presentPageSites(c, items)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_sites_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, map[string]any{
		"items": presentedItems,
		"total": total,
	})
}

func (h *Handler) GetSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	site, err := h.service.GetSite(c, principal.UserID, siteID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "get_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) UpdateSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	var payload map[string]json.RawMessage
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	input := model.UpdatePageSiteInput{ID: siteID}

	if raw, exists := payload["name"]; exists {
		var name *string
		if err := json.Unmarshal(raw, &name); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_name", "name must be string")
			return
		}
		input.Name = name
	}

	if raw, exists := payload["access_mode"]; exists {
		var accessMode string
		if err := json.Unmarshal(raw, &accessMode); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_access_mode", "access_mode must be string")
			return
		}
		mode := model.PageAccessMode(accessMode)
		input.AccessMode = &mode
	}

	if raw, exists := payload["spa_fallback"]; exists {
		var spaFallback bool
		if err := json.Unmarshal(raw, &spaFallback); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_spa_fallback", "spa_fallback must be boolean")
			return
		}
		input.SPAFallback = &spaFallback
	}

	if raw, exists := payload["show_badge"]; exists {
		var showBadge bool
		if err := json.Unmarshal(raw, &showBadge); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_show_badge", "show_badge must be boolean")
			return
		}
		input.ShowBadge = &showBadge
	}

	if raw, exists := payload["password"]; exists {
		var password *string
		if err := json.Unmarshal(raw, &password); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_password", "password must be string")
			return
		}
		input.UpdatePassword = true
		input.PasswordHash = password
	}

	if raw, exists := payload["no_password"]; exists {
		var noPassword bool
		if err := json.Unmarshal(raw, &noPassword); err != nil {
			handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_no_password", "no_password must be boolean")
			return
		}
		if noPassword {
			if input.UpdatePassword {
				handlers.WriteError(ctx, consts.StatusBadRequest, "invalid_password_flags", "password and no_password cannot be set together")
				return
			}
			input.UpdatePassword = true
			input.PasswordHash = nil
			input.PasswordSalt = nil
		}
	}

	if input.Name == nil && input.AccessMode == nil && input.SPAFallback == nil && input.ShowBadge == nil && !input.UpdatePassword {
		handlers.WriteError(ctx, consts.StatusBadRequest, "empty_update", "at least one field must be updated")
		return
	}

	site, err := h.service.UpdateSite(c, principal.UserID, input)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "update_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) DeleteSite(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	site, err := h.service.DeleteSite(c, principal.UserID, siteID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "delete_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}

func (h *Handler) Unpublish(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(ctx, consts.StatusServiceUnavailable, "page_service_unavailable", "page service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	siteID, err := h.resolvePageSiteID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(ctx, "invalid_page_site_id", err)
		return
	}

	site, err := h.service.Unpublish(c, principal.UserID, siteID)
	if err != nil {
		handlers.WriteError(ctx, statusCodeForPageError(err), "unpublish_page_site_failed", err.Error())
		return
	}

	presented, err := h.presentPageSite(c, site)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "present_page_site_failed", err.Error())
		return
	}
	handlers.WriteSuccess(ctx, presented)
}
