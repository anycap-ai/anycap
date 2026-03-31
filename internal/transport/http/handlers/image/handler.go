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
	// Dynamic operation route: /image/:operation (generate, edit, upscale, …)
	// The operation is validated by the model catalog — unsupported operations
	// return ErrModelRouteNotConfigured.
	g.POST("/:operation", h.Execute)
}

// Execute handles any image operation (generate, edit, upscale, etc.).
// The operation is extracted from the URL path and passed to the service,
// which selects the appropriate route from the model catalog.
func (h *Handler) Execute(c context.Context, ctx *app.RequestContext) {
	operation := ctx.Param("operation")
	capability := "image." + operation
	middleware.SetCapability(ctx, capability)

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

	// Merge schema field names with legacy field names.
	images := payload.EffectiveImages()
	aspectRatio := payload.EffectiveAspectRatio()

	result, err := h.service.Execute(c, model.GenerateImageRequest{
		RequestID:          middleware.GetRequestID(ctx),
		UserID:             principal.UserID,
		APIKeyID:           principal.APIKeyID,
		Prompt:             payload.Prompt,
		Model:              payload.Model,
		Mode:               model.Mode(payload.Mode),
		NegativePrompt:     payload.NegativePrompt,
		Ratio:              aspectRatio,
		Resolution:         payload.Resolution,
		ReferenceImageURLs: images,
	}, model.Operation(operation))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		response.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, response)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}
