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
		writeError(ctx, consts.StatusInternalServerError, "list_models_failed", err.Error())
		return
	}

	writeSuccess(ctx, models)
}

func (h *ImageHandler) Generate(c context.Context, ctx *app.RequestContext) {
	var req model.GenerateImageRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.Generate(c, req)
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_param", err.Error())
		return
	}

	writeSuccessWithID(ctx, result.ID, result)
}
