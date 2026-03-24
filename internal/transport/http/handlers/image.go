package handlers

import (
	"context"
	"encoding/json"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

type ImageHandler struct {
	service *imageapp.Service
}

func NewImageHandler(service *imageapp.Service) *ImageHandler {
	return &ImageHandler{service: service}
}

func (h *ImageHandler) ListModels(c context.Context, ctx *app.RequestContext) {
	models, err := h.service.ListModels(c)
	if err != nil {
		ctx.JSON(consts.StatusInternalServerError, map[string]any{
			"status": "error",
			"error": map[string]any{
				"code":    "LIST_MODELS_FAILED",
				"message": err.Error(),
			},
		})
		return
	}

	ctx.JSON(consts.StatusOK, map[string]any{
		"status": "success",
		"data":   models,
	})
}

func (h *ImageHandler) Generate(c context.Context, ctx *app.RequestContext) {
	var req model.GenerateImageRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(consts.StatusBadRequest, map[string]any{
			"status": "error",
			"error": map[string]any{
				"code":    "INVALID_PARAM",
				"message": "invalid json request body",
			},
		})
		return
	}

	result, err := h.service.Generate(c, req)
	if err != nil {
		ctx.JSON(consts.StatusBadRequest, map[string]any{
			"status": "error",
			"error": map[string]any{
				"code":    "INVALID_PARAM",
				"message": err.Error(),
			},
		})
		return
	}

	ctx.JSON(consts.StatusOK, map[string]any{
		"id":     result.ID,
		"status": "success",
		"data":   result,
	})
}
