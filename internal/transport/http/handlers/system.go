package handlers

import (
	"context"
	"strconv"
	"strings"

	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type SystemHandler struct {
	service *systemapp.Service
	mapper  ExternalIDMapper
}

type SystemHandlerOption func(*SystemHandler)

func WithSystemExternalIDMapper(mapper ExternalIDMapper) SystemHandlerOption {
	return func(h *SystemHandler) {
		h.mapper = mapper
	}
}

func NewSystemHandler(service *systemapp.Service, options ...SystemHandlerOption) *SystemHandler {
	handler := &SystemHandler{service: service}
	for _, option := range options {
		if option != nil {
			option(handler)
		}
	}
	return handler
}

func (h *SystemHandler) RegisterRootRoutes(group *route.RouterGroup) {
	group.GET("/ping", h.Ping)
	group.GET("/healthz", h.Healthz)
}

func (h *SystemHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/healthz", h.Healthz)
}

func (h *SystemHandler) RegisterProtectedRoutes(group *route.RouterGroup) {
	group.GET("/status", h.Status)
	group.GET("/dashboard/summary", h.DashboardSummary)
	group.GET("/me", h.Me)
	group.GET("/credits/balance", h.CreditBalance)
	group.GET("/logs", h.Logs)
	group.POST("/auth/logout", h.Logout)
}

func (h *SystemHandler) Ping(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]string{"message": "pong"}))
}

func (h *SystemHandler) Healthz(_ context.Context, ctx *app.RequestContext) {
	status := h.service.Status(nil)
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), status.Service))
}

func (h *SystemHandler) Status(c context.Context, ctx *app.RequestContext) {
	principal, _ := middleware.GetPrincipal(ctx)
	result := h.service.Status(principal)
	if h.mapper != nil && result.User != nil {
		externalUserID, err := h.mapper.ResolveUserExternalID(c, strings.TrimSpace(result.User.UserID))
		if err != nil {
			writeError(ctx, consts.StatusInternalServerError, "resolve_user_id_failed", err.Error())
			return
		}
		result.User.UserID = externalUserID
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *SystemHandler) Logout(c context.Context, ctx *app.RequestContext) {
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

func (h *SystemHandler) Me(c context.Context, ctx *app.RequestContext) {
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
	if h.mapper != nil {
		externalUserID, resolveErr := h.mapper.ResolveUserExternalID(c, strings.TrimSpace(user.ID))
		if resolveErr != nil {
			writeError(ctx, consts.StatusInternalServerError, "resolve_user_id_failed", resolveErr.Error())
			return
		}
		user.ID = externalUserID
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), user))
}

func (h *SystemHandler) CreditBalance(c context.Context, ctx *app.RequestContext) {
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

func (h *SystemHandler) Logs(c context.Context, ctx *app.RequestContext) {
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

func (h *SystemHandler) DashboardSummary(c context.Context, ctx *app.RequestContext) {
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
	if h.mapper != nil {
		externalUserID, resolveErr := h.mapper.ResolveUserExternalID(c, strings.TrimSpace(result.User.ID))
		if resolveErr != nil {
			writeError(ctx, consts.StatusInternalServerError, "resolve_user_id_failed", resolveErr.Error())
			return
		}
		result.User.ID = externalUserID
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}
