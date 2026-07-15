package image

import (
	"context"
	"encoding/json"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	sharedhandlers "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

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
	logger := logging.WithContext(c).WithFields(logging.Fields{
		"capability": capability,
		"operation":  operation,
	})

	var payload dto.GenerateImageRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		logger.WithError(err).Warn("invalid image request body")
		sharedhandlers.WriteInvocationErrorPayload(c, ctx, 400, "INVALID_PARAM", "invalid json request body", model.InvocationMeta{Stage: model.InvocationStagePrepare})
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for image request")
		sharedhandlers.WriteInvocationErrorPayload(c, ctx, 401, "AUTH_INVALID", "invalid api key", model.InvocationMeta{Stage: model.InvocationStagePrepare})
		return
	}

	// Merge schema field names with legacy field names.
	images := payload.EffectiveImages()
	aspectRatio := payload.EffectiveAspectRatio()

	result, err := h.service.Execute(c, model.GenerateImageRequest{
		RequestID:          trace.GetTraceID(c),
		UserID:             principal.UserID,
		APIKeyID:           principal.APIKeyID,
		Prompt:             payload.Prompt,
		Model:              payload.Model,
		Mode:               model.Mode(payload.Mode),
		NegativePrompt:     payload.NegativePrompt,
		Ratio:              aspectRatio,
		Resolution:         payload.Resolution,
		Format:             payload.Format,
		MoveForward:        payload.MoveForward,
		RotateDegrees:      payload.RotateDegrees,
		UseWideAngle:       payload.UseWideAngle,
		VerticalTilt:       payload.VerticalTilt,
		ReferenceImageURLs: images,
	}, model.Operation(operation))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		logger.WithError(err).WithFields(logging.Fields{
			"status_code": status,
			"error_code":  response.Error.Code,
		}).Error("image request failed")
		sharedhandlers.WriteInvocationError(c, ctx, err)
		return
	}

	sharedhandlers.WriteInvocationSuccess(c, ctx, result.Value, result.Meta)
}
