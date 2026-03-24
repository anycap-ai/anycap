package handlers

import (
	"context"
	"encoding/json"

	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type LoginHandler struct {
	service *loginapp.Service
}

func NewLoginHandler(service *loginapp.Service) *LoginHandler {
	return &LoginHandler{service: service}
}

func (h *LoginHandler) Init(c context.Context, ctx *app.RequestContext) {
	var req struct {
		Method string `json:"method"`
	}
	if ctx.Request.BodyBytes() != nil && len(ctx.Request.BodyBytes()) > 0 {
		_ = json.Unmarshal(ctx.Request.BodyBytes(), &req)
	}

	result, err := h.service.Init(c)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "login_init_failed", err.Error())
		return
	}

	writeSuccess(ctx, result)
}
