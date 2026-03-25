package handlers

import (
	"context"
	"encoding/json"

	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type LoginHandler struct {
	service *loginapp.Service
}

func NewLoginHandler(service *loginapp.Service) *LoginHandler {
	return &LoginHandler{service: service}
}

func (h *LoginHandler) RegisterRoutes(group *route.RouterGroup) {
	loginGroup := group.Group("/login")
	loginGroup.POST("/init", h.Init)
	loginGroup.POST("/callback", h.Callback)
	loginGroup.POST("/poll", h.Poll)

	authGroup := group.Group("/auth")
	authGroup.POST("/login", h.Init)
	authGroup.POST("/callback", h.Callback)
	authGroup.POST("/device-code", h.DeviceCode)
	authGroup.POST("/device-poll", h.Poll)
}

func (h *LoginHandler) Init(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginInitRequest
	if len(ctx.Request.Body()) != 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
			return
		}
	}
	result, err := h.service.Init(c, req.Method, req.RedirectPort)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) Callback(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginCallbackRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.Callback(c, req.LoginSessionID, req.Code, req.State, req.RedirectURI)
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
	result, err := h.service.Init(c, "device", 0)
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

	result, err := h.service.Poll(c, req.LoginSessionID)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}
