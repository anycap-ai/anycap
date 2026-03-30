package image

import (
	"context"
	"encoding/json"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service *imageapp.Service
}

func NewHandler(service *imageapp.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/image")
	middleware.CapabilityPOST(g, "/generate", "image.generate", h.Generate)
}

func (h *Handler) Generate(c context.Context, ctx *app.RequestContext) {
	var payload dto.GenerateImageRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		ctx.JSON(401, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "AUTH_INVALID", "invalid api key"))
		return
	}

	result, err := h.service.Generate(c, model.GenerateImageRequest{
		RequestID:          middleware.GetRequestID(ctx),
		UserID:             principal.UserID,
		APIKeyID:           principal.APIKeyID,
		Prompt:             payload.Prompt,
		Model:              payload.Model,
		NegativePrompt:     payload.NegativePrompt,
		Ratio:              payload.Ratio,
		Resolution:         payload.Resolution,
		ReferenceImageURLs: append([]string(nil), payload.ReferenceImageURLs...),
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		response.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, response)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}
