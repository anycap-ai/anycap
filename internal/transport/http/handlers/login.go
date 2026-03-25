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

	authGroup := group.Group("/auth")
	authGroup.POST("/login", h.Init)
	authGroup.POST("/callback", h.Callback)
}

func (h *LoginHandler) Init(c context.Context, ctx *app.RequestContext) {
	result, err := h.service.Init(c)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) Callback(c context.Context, ctx *app.RequestContext) {
	var req struct {
		Code  string `json:"code"`
		State string `json:"state,omitempty"`
	}
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.Callback(c, req.Code)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}
