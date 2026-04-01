package system

import (
	"context"
	"sort"
	"strconv"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service *systemapp.Service
	mapper  presenter.IDMapper
}

func NewHandler(service *systemapp.Service, mapper presenter.IDMapper) *Handler {
	return &Handler{service: service, mapper: mapper}
}

func (h *Handler) RegisterRootRoutes(group *route.RouterGroup) {
	group.GET("/ping", h.Ping)
	group.GET("/healthz", h.Healthz)
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/healthz", h.Healthz)
	group.GET("/features", h.Features)
}

func (h *Handler) RegisterProtectedRoutes(group *route.RouterGroup) {
	group.GET("/status", h.Status)
	group.GET("/dashboard/summary", h.DashboardSummary)
	group.GET("/me", h.Me)
	group.GET("/me/features", h.MeFeatures)
	group.GET("/credits/balance", h.CreditBalance)
	group.GET("/logs", h.Logs)
	group.GET("/api-keys", h.APIKeys)
	group.POST("/api-keys/:id/disable", h.DisableAPIKey)
	group.DELETE("/api-keys/:id", h.DeleteAPIKey)
	group.GET("/usage/summary", h.UsageSummary)
	group.GET("/usage/events", h.UsageEvents)
	group.POST("/auth/logout", h.Logout)
}

func (h *Handler) Features(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]any{
		"features": h.service.Features(),
	}))
}

func (h *Handler) MeFeatures(_ context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]any{
		"features": h.service.UserFeatures(principal),
	}))
}

func (h *Handler) Ping(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]string{"message": "pong"}))
}

func (h *Handler) Healthz(_ context.Context, ctx *app.RequestContext) {
	status := h.service.Status(nil)
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), status.Service))
}

func (h *Handler) Status(c context.Context, ctx *app.RequestContext) {
	principal, _ := middleware.GetPrincipal(ctx)
	result := h.service.Status(principal)
	effectiveScopes := statusScopes(principal, h.service.UserFeatures(principal))

	userDTO, err := presenter.PresentStatusUser(c, h.mapper, result.User, effectiveScopes)
	if err != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "resolve_user_id_failed", err.Error())
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]any{
		"service":      result.Service,
		"runtime_mode": result.RuntimeMode,
		"user":         userDTO,
	}))
}

func statusScopes(principal *model.Principal, features map[string]bool) []string {
	if principal == nil {
		return nil
	}

	merged := make(map[string]struct{}, len(principal.Scopes)+len(features))
	for feature, allowed := range features {
		if allowed {
			merged[feature] = struct{}{}
		}
	}
	for _, scope := range principal.Scopes {
		allowed, tracked := features[scope]
		if tracked && !allowed {
			continue
		}
		merged[scope] = struct{}{}
	}
	if len(merged) == 0 {
		return nil
	}

	scopes := make([]string, 0, len(merged))
	for scope := range merged {
		scopes = append(scopes, scope)
	}
	sort.Strings(scopes)
	return scopes
}

func (h *Handler) Logout(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	if err := h.service.Logout(c, principal); err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]string{"message": "logged out"}))
}

func (h *Handler) Me(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	user, err := h.service.CurrentUser(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	userDTO, resolveErr := presenter.PresentUser(c, h.mapper, user)
	if resolveErr != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "resolve_user_id_failed", resolveErr.Error())
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), userDTO))
}

func (h *Handler) CreditBalance(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	balance, err := h.service.CreditBalance(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), balance))
}

func (h *Handler) Logs(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	limit := 20
	if raw := string(ctx.Query("limit")); raw != "" {
		if value, err := strconv.Atoi(raw); err == nil {
			limit = value
		}
	}

	result, err := h.service.Logs(c, principal, limit)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *Handler) DashboardSummary(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.DashboardSummary(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	userDTO, resolveErr := presenter.PresentDashboardUser(c, h.mapper, result.User)
	if resolveErr != nil {
		handlers.WriteError(ctx, consts.StatusInternalServerError, "resolve_user_id_failed", resolveErr.Error())
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]any{
		"user":            userDTO,
		"balance":         result.Balance,
		"recent_activity": result.RecentActivity,
		"usage_summary":   result.UsageSummary,
		"error_summary":   result.ErrorSummary,
	}))
}

func (h *Handler) APIKeys(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.ListAPIKeys(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *Handler) DisableAPIKey(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	keyID := ctx.Param("id")
	if err := h.service.DisableAPIKey(c, principal, keyID); err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]any{
		"id":       keyID,
		"disabled": true,
	}))
}

func (h *Handler) DeleteAPIKey(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	keyID := ctx.Param("id")
	if err := h.service.DeleteAPIKey(c, principal, keyID); err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]any{
		"id":      keyID,
		"deleted": true,
	}))
}

func (h *Handler) UsageSummary(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.UsageSummary(c, principal, usageQueryFromRequest(ctx))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *Handler) UsageEvents(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.UsageEvents(c, principal, usageQueryFromRequest(ctx))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func usageQueryFromRequest(ctx *app.RequestContext) model.UsageQuery {
	query := model.UsageQuery{
		APIKeyID:    string(ctx.Query("api_key_id")),
		ProductArea: string(ctx.Query("product_area")),
		Action:      string(ctx.Query("action")),
		Provider:    string(ctx.Query("provider")),
		Status:      string(ctx.Query("status")),
	}
	if raw := string(ctx.Query("limit")); raw != "" {
		if value, err := strconv.Atoi(raw); err == nil {
			query.Limit = value
		}
	}
	return query
}
