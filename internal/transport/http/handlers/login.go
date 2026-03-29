package handlers

import (
	"context"
	"encoding/json"
	"strings"

	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type LoginHandler struct {
	service *loginapp.Service
	mapper  presenter.IDMapper
}

func NewLoginHandler(service *loginapp.Service, mapper presenter.IDMapper) *LoginHandler {
	return &LoginHandler{service: service, mapper: mapper}
}

func (h *LoginHandler) RegisterRootRoutes(group *route.RouterGroup) {
	_ = group
}

func (h *LoginHandler) RegisterRoutes(group *route.RouterGroup) {
	loginGroup := group.Group("/login")
	loginGroup.POST("/init", h.Init)
	loginGroup.POST("/poll", h.Poll)

	authGroup := group.Group("/auth")
	authGroup.POST("/login", h.Init)
	authGroup.POST("/device-code", h.DeviceCode)
	authGroup.POST("/device-code-check", h.DeviceCodeCheck)
	authGroup.POST("/poll", h.Poll)
	authGroup.POST("/device-poll", h.Poll)
}

func (h *LoginHandler) RegisterProtectedRoutes(group *route.RouterGroup) {
	group.POST("/auth/exchange", h.Exchange)
	group.POST("/auth/device-verify", h.DeviceVerify)
	group.POST("/auth/browser-verify", h.BrowserVerify)
}

func (h *LoginHandler) Init(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginInitRequest
	if len(ctx.Request.Body()) != 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
			return
		}
	}
	result, err := h.service.Init(c, req.Method)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DeviceCode(c context.Context, ctx *app.RequestContext) {
	result, err := h.service.Init(c, "device")
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DeviceCodeCheck(c context.Context, ctx *app.RequestContext) {
	var req dto.DeviceCodeCheckRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.CheckDeviceCode(c, strings.TrimSpace(req.UserCode))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) Poll(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginPollRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.Poll(c, req.LoginSessionID, strings.TrimSpace(req.PollToken))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	presentedUser, resolveErr := presenter.PresentLoginUser(c, h.mapper, result.User)
	if resolveErr != nil {
		ctx.JSON(500, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INTERNAL_ERROR", resolveErr.Error()))
		return
	}
	result.User = presentedUser
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) Exchange(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	result, err := h.service.Exchange(c, *principal)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	presentedUser, resolveErr := presenter.PresentLoginUser(c, h.mapper, result.User)
	if resolveErr != nil {
		ctx.JSON(500, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INTERNAL_ERROR", resolveErr.Error()))
		return
	}
	result.User = presentedUser
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DeviceVerify(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	var req dto.DeviceVerifyRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.VerifyDeviceCode(c, strings.TrimSpace(req.UserCode), *principal, model.AuthUser{
		UserID:  principal.UserID,
		Email:   firstNonEmpty(principal.Email, profileField(req.User, func(user *dto.AuthUserProfile) string { return user.Email })),
		Name:    firstNonEmpty(principal.Name, profileField(req.User, func(user *dto.AuthUserProfile) string { return user.Name })),
		Picture: firstNonEmpty(principal.Picture, profileField(req.User, func(user *dto.AuthUserProfile) string { return user.Picture })),
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) BrowserVerify(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	var req dto.BrowserVerifyRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.BrowserVerify(c, strings.TrimSpace(req.BrowserToken), *principal, model.AuthUser{
		UserID:  principal.UserID,
		Email:   firstNonEmpty(principal.Email, profileField(req.User, func(user *dto.AuthUserProfile) string { return user.Email })),
		Name:    firstNonEmpty(principal.Name, profileField(req.User, func(user *dto.AuthUserProfile) string { return user.Name })),
		Picture: firstNonEmpty(principal.Picture, profileField(req.User, func(user *dto.AuthUserProfile) string { return user.Picture })),
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func profileField(user *dto.AuthUserProfile, pick func(*dto.AuthUserProfile) string) string {
	if user == nil {
		return ""
	}
	return pick(user)
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}
