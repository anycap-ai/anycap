package handlers

import (
	"context"

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
	result, err := h.service.Init(c)
	if err != nil {
		ctx.JSON(consts.StatusInternalServerError, map[string]any{
			"status": "error",
			"error": map[string]any{
				"code":    "LOGIN_INIT_FAILED",
				"message": err.Error(),
			},
		})
		return
	}

	ctx.JSON(consts.StatusOK, map[string]any{
		"status": "success",
		"data":   result,
	})
}
