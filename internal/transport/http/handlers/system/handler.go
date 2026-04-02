package system

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service       *systemapp.Service
	mapper        presenter.IDMapper
	spaceService  port.SpaceService
	quotaProvider port.StorageQuotaProvider
}

func NewHandler(service *systemapp.Service, mapper presenter.IDMapper) *Handler {
	return &Handler{service: service, mapper: mapper}
}

func (h *Handler) SetStorageQuota(spaceService port.SpaceService, quotaProvider port.StorageQuotaProvider) {
	h.spaceService = spaceService
	h.quotaProvider = quotaProvider
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
	group.GET("/me/storage", h.MeStorage)
	group.GET("/credits/balance", h.CreditBalance)
	group.GET("/pricing/credit-packs", h.CreditPacks)
	group.POST("/billing/checkout", h.BillingCheckout)
	group.GET("/logs", h.Logs)
	group.GET("/api-keys", h.APIKeys)
	group.POST("/api-keys/:id/disable", h.DisableAPIKey)
	group.DELETE("/api-keys/:id", h.DeleteAPIKey)
	group.GET("/usage/summary", h.UsageSummary)
	group.GET("/usage/events", h.UsageEvents)
	group.POST("/auth/logout", h.Logout)
}

func (h *Handler) Features(c context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"features": h.service.Features(),
	}))
}

func (h *Handler) MeFeatures(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithField("flow", "system.me_features")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for me features")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"features": h.service.UserFeatures(principal),
	}))
}

func (h *Handler) MeStorage(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.me_storage")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for storage query")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	if h.spaceService == nil || h.quotaProvider == nil {
		ctx.JSON(consts.StatusServiceUnavailable, dto.ErrorEnvelope(trace.GetTraceID(c), "SERVICE_UNAVAILABLE", "storage quota service is not configured"))
		return
	}

	userID, err := strconv.ParseInt(principal.UserID, 10, 64)
	if err != nil {
		logger.WithError(err).Error("invalid user id in principal")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	space, err := h.spaceService.GetOrCreatePersonalSpace(c, userID)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithError(err).Error("get space for storage query failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	quota := h.quotaProvider.ResolveQuota(principal)

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"storage_used_bytes":    space.StorageUsedBytes,
		"storage_used_display":  formatBytes(space.StorageUsedBytes),
		"storage_quota_bytes":   quota.StorageQuotaBytes,
		"storage_quota_display": formatBytes(quota.StorageQuotaBytes),
		"drive_node_count":      space.DriveNodeCount,
		"drive_node_limit":      quota.MaxDriveNodes,
		"page_site_count":       space.PageSiteCount,
		"page_site_limit":       quota.MaxPageSites,
	}))
}

func (h *Handler) Ping(c context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]string{"message": "pong"}))
}

func (h *Handler) Healthz(c context.Context, ctx *app.RequestContext) {
	status := h.service.Status(nil)
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), status.Service))
}

func (h *Handler) Status(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.status")
	principal, _ := middleware.GetPrincipal(ctx)
	result := h.service.Status(principal)
	effectiveScopes := statusScopes(principal, h.service.UserFeatures(principal))

	userDTO, err := presenter.PresentStatusUser(c, h.mapper, result.User, effectiveScopes)
	if err != nil {
		logger.WithError(err).Error("present status user failed")
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "resolve_user_id_failed", err.Error())
		return
	}

	data := map[string]any{
		"service":      result.Service,
		"runtime_mode": result.RuntimeMode,
		"user":         userDTO,
	}

	// Attach storage info when available (requires full mode with Postgres).
	if storage := h.resolveStorage(c, principal); storage != nil {
		data["storage"] = storage
	}

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), data))
}

// resolveStorage builds the storage summary for the status response.
// Returns nil when storage services are not configured (stub mode) or on any error.
func (h *Handler) resolveStorage(c context.Context, principal *model.Principal) map[string]any {
	if h.spaceService == nil || h.quotaProvider == nil || principal == nil {
		return nil
	}
	logger := logging.WithContext(c).WithField("flow", "system.status.storage")
	userID, err := strconv.ParseInt(principal.UserID, 10, 64)
	if err != nil {
		logger.WithError(err).Warn("skip storage in status: invalid user id")
		return nil
	}
	space, err := h.spaceService.GetOrCreatePersonalSpace(c, userID)
	if err != nil {
		logger.WithError(err).Warn("skip storage in status: space lookup failed")
		return nil
	}
	quota := h.quotaProvider.ResolveQuota(principal)
	return map[string]any{
		"storage_used_bytes":    space.StorageUsedBytes,
		"storage_used_display":  formatBytes(space.StorageUsedBytes),
		"storage_quota_bytes":   quota.StorageQuotaBytes,
		"storage_quota_display": formatBytes(quota.StorageQuotaBytes),
		"drive_node_count":      space.DriveNodeCount,
		"drive_node_limit":      quota.MaxDriveNodes,
		"page_site_count":       space.PageSiteCount,
		"page_site_limit":       quota.MaxPageSites,
	}
}

// formatBytes formats bytes as a human-readable string (e.g. "10 GB", "512 MB").
func formatBytes(b int64) string {
	const (
		kb = 1024
		mb = 1024 * kb
		gb = 1024 * mb
	)
	switch {
	case b >= gb:
		val := float64(b) / float64(gb)
		if val == float64(int64(val)) {
			return fmt.Sprintf("%d GB", int64(val))
		}
		return fmt.Sprintf("%.1f GB", val)
	case b >= mb:
		val := float64(b) / float64(mb)
		if val == float64(int64(val)) {
			return fmt.Sprintf("%d MB", int64(val))
		}
		return fmt.Sprintf("%.1f MB", val)
	case b >= kb:
		return fmt.Sprintf("%d KB", b/kb)
	default:
		return fmt.Sprintf("%d bytes", b)
	}
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
	logger := logging.WithContext(c).WithField("flow", "system.logout")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for logout")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if err := h.service.Logout(c, principal); err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("logout failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]string{"message": "logged out"}))
}

func (h *Handler) Me(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.me")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for current user")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	user, err := h.service.CurrentUser(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("load current user failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	userDTO, resolveErr := presenter.PresentUser(c, h.mapper, user)
	if resolveErr != nil {
		logger.WithError(resolveErr).Error("present current user failed")
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "resolve_user_id_failed", resolveErr.Error())
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), userDTO))
}

func (h *Handler) CreditBalance(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.credit_balance")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for credit balance")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	balance, err := h.service.CreditBalance(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("load credit balance failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), balance))
}

func (h *Handler) CreditPacks(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.CreditPacks(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}

type billingCheckoutRequest struct {
	PackID         string `json:"pack_id"`
	Quantity       int    `json:"quantity,omitempty"`
	SuccessURL     string `json:"success_url,omitempty"`
	CancelURL      string `json:"cancel_url,omitempty"`
	IdempotencyKey string `json:"idempotency_key,omitempty"`
}

func (h *Handler) BillingCheckout(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	var req billingCheckoutRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}

	result, err := h.service.CreateCheckout(c, principal, model.CreateCheckoutInput{
		PackID:         req.PackID,
		Quantity:       req.Quantity,
		SuccessURL:     req.SuccessURL,
		CancelURL:      req.CancelURL,
		IdempotencyKey: req.IdempotencyKey,
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}

func (h *Handler) Logs(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.logs")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for logs")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
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
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("load logs failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}

func (h *Handler) DashboardSummary(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.dashboard_summary")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for dashboard summary")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.DashboardSummary(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("load dashboard summary failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	userDTO, resolveErr := presenter.PresentDashboardUser(c, h.mapper, result.User)
	if resolveErr != nil {
		logger.WithError(resolveErr).Error("present dashboard user failed")
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "resolve_user_id_failed", resolveErr.Error())
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"user":            userDTO,
		"balance":         result.Balance,
		"recent_activity": result.RecentActivity,
		"usage_summary":   result.UsageSummary,
		"error_summary":   result.ErrorSummary,
	}))
}

func (h *Handler) APIKeys(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.api_keys")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for api keys")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.ListAPIKeys(c, principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("list api keys failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}

func (h *Handler) DisableAPIKey(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.disable_api_key")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for disable api key")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	keyID := ctx.Param("id")
	if err := h.service.DisableAPIKey(c, principal, keyID); err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"key_id":      keyID,
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("disable api key failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"id":       keyID,
		"disabled": true,
	}))
}

func (h *Handler) DeleteAPIKey(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.delete_api_key")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for delete api key")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	keyID := ctx.Param("id")
	if err := h.service.DeleteAPIKey(c, principal, keyID); err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"key_id":      keyID,
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("delete api key failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"id":      keyID,
		"deleted": true,
	}))
}

func (h *Handler) UsageSummary(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.usage_summary")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for usage summary")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.UsageSummary(c, principal, usageQueryFromRequest(ctx))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("load usage summary failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}

func (h *Handler) UsageEvents(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("flow", "system.usage_events")
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for usage events")
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	result, err := h.service.UsageEvents(c, principal, usageQueryFromRequest(ctx))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code": status,
			"error_code":  payload.Error.Code,
		}).WithError(err).Error("load usage events failed")
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
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
