package video

import (
	"context"
	"encoding/json"

	videoapp "gitlab.knoffice.tech/engineering/anycap/internal/application/video"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service *videoapp.Service
}

func NewHandler(service *videoapp.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/video")
	middleware.CapabilityPOST(g, "/generate", "video.generate", h.Generate)
}

func (h *Handler) Generate(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithFields(logging.Fields{
		"capability": "video.generate",
	})

	var payload dto.GenerateVideoRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		logger.WithError(err).Warn("invalid video request body")
		ctx.JSON(400, dto.ErrorEnvelope(trace.GetTraceID(c), "INVALID_PARAM", "invalid json request body"))
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for video request")
		ctx.JSON(401, dto.ErrorEnvelope(trace.GetTraceID(c), "AUTH_INVALID", "invalid api key"))
		return
	}

	result, err := h.service.Generate(c, model.GenerateVideoRequest{
		RequestID:          trace.GetTraceID(c),
		UserID:             principal.UserID,
		APIKeyID:           principal.APIKeyID,
		Prompt:             payload.Prompt,
		Model:              payload.Model,
		Mode:               model.Mode(payload.Mode),
		NegativePrompt:     payload.NegativePrompt,
		Ratio:              payload.AspectRatio,
		Resolution:         payload.Resolution,
		Duration:           payload.Duration,
		Format:             payload.Format,
		FPS:                payload.FPS,
		GenerateAudio:      payload.GenerateAudio,
		ReferenceImageURLs: append([]string(nil), payload.Images...),
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		logger.WithError(err).WithFields(logging.Fields{
			"status_code": status,
			"error_code":  response.Error.Code,
		}).Error("video request failed")
		response.ID = trace.GetTraceID(c)
		ctx.JSON(status, response)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}
