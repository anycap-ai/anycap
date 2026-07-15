package music

import (
	"context"
	"encoding/json"

	musicapp "gitlab.knoffice.tech/engineering/anycap/internal/application/music"
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
	service *musicapp.Service
}

func NewHandler(service *musicapp.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/music")
	middleware.CapabilityPOST(g, "/generate", "music.generate", h.Generate)
}

func (h *Handler) Generate(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithFields(logging.Fields{
		"capability": "music.generate",
	})

	var payload dto.GenerateMusicRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		logger.WithError(err).Warn("invalid music request body")
		sharedhandlers.WriteInvocationErrorPayload(c, ctx, 400, "INVALID_PARAM", "invalid json request body", model.InvocationMeta{Stage: model.InvocationStagePrepare})
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for music request")
		sharedhandlers.WriteInvocationErrorPayload(c, ctx, 401, "AUTH_INVALID", "invalid api key", model.InvocationMeta{Stage: model.InvocationStagePrepare})
		return
	}

	result, err := h.service.Generate(c, model.GenerateMusicRequest{
		RequestID:        trace.GetTraceID(c),
		UserID:           principal.UserID,
		APIKeyID:         principal.APIKeyID,
		Prompt:           payload.Prompt,
		Model:            payload.Model,
		Mode:             model.Mode(payload.Mode),
		MakeInstrumental: payload.MakeInstrumental,
		CustomMode:       payload.CustomMode,
		Tags:             payload.Tags,
		Title:            payload.Title,
		Lyrics:           payload.Lyrics,
		ContinueAt:       payload.ContinueAt,
		ContinueClipID:   payload.ContinueClipID,
		VocalGender:      payload.VocalGender,
		Duration:         payload.Duration,
		ModelVariant:     payload.ModelVariant,
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		logger.WithError(err).WithFields(logging.Fields{
			"status_code": status,
			"error_code":  response.Error.Code,
		}).Error("music request failed")
		sharedhandlers.WriteInvocationError(c, ctx, err)
		return
	}

	sharedhandlers.WriteInvocationSuccess(c, ctx, result.Value, result.Meta)
}
