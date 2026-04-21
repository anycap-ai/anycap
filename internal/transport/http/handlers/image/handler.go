package image

import (
	"context"
	"encoding/json"
	"strings"

	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
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

// RegisterAnonymousRoutes registers the image generate endpoint for anonymous
// Chrome extension users. It is mounted under a middleware chain that applies
// anonymous rate limiting instead of auth.
func (h *Handler) RegisterAnonymousRoutes(group *route.RouterGroup) {
	group.POST("/image/generate", h.Execute)
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
		ctx.JSON(400, dto.ErrorEnvelope(trace.GetTraceID(c), "INVALID_PARAM", "invalid json request body"))
		return
	}

	// Merge schema field names with legacy field names.
	images := payload.EffectiveImages()
	aspectRatio := payload.EffectiveAspectRatio()

	principal, ok := middleware.GetPrincipal(ctx)
	var userID, apiKeyID string
	isPro := false
	if ok {
		userID = principal.UserID
		apiKeyID = principal.APIKeyID
		isPro = principal.IsPro
	} else {
		// Anonymous request: use install_id as user identifier.
		installID := string(ctx.Request.Header.Peek("X-Anycap-Install-Id"))
		if strings.TrimSpace(installID) == "" {
			logger.Warn("missing principal and install_id for image request")
			ctx.JSON(401, dto.ErrorEnvelope(trace.GetTraceID(c), "AUTH_INVALID", "invalid api key"))
			return
		}
		userID = "anon:" + installID
	}

	wm := image.ResolveWatermark(isPro, payload.Watermark)

	result, err := h.service.Execute(c, model.GenerateImageRequest{
		RequestID:          trace.GetTraceID(c),
		UserID:             userID,
		APIKeyID:           apiKeyID,
		Prompt:             payload.Prompt,
		Model:              payload.Model,
		Mode:               model.Mode(payload.Mode),
		NegativePrompt:     payload.NegativePrompt,
		Ratio:              aspectRatio,
		Resolution:         payload.Resolution,
		ReferenceImageURLs: images,
		Watermark:          wm.Enabled,
	}, model.Operation(operation))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		logger.WithError(err).WithFields(logging.Fields{
			"status_code": status,
			"error_code":  response.Error.Code,
		}).Error("image request failed")
		response.ID = trace.GetTraceID(c)
		ctx.JSON(status, response)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}
