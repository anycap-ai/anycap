package audio

import (
	"context"
	"encoding/json"

	audioapp "gitlab.knoffice.tech/engineering/anycap/internal/application/audio"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	sharedhandlers "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service *audioapp.Service
}

func NewHandler(service *audioapp.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/audio")
	middleware.CapabilityPOST(g, "/generate", feature.AudioGenerate, h.Generate)
}

func (h *Handler) Generate(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("capability", feature.AudioGenerate)
	var payload dto.GenerateAudioRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		logger.WithError(err).Warn("invalid audio request body")
		sharedhandlers.WriteInvocationErrorPayload(c, ctx, 400, "INVALID_PARAM", "invalid json request body", model.InvocationMeta{Stage: model.InvocationStagePrepare})
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		logger.Warn("missing principal for audio request")
		sharedhandlers.WriteInvocationErrorPayload(c, ctx, 401, "AUTH_INVALID", "invalid api key", model.InvocationMeta{Stage: model.InvocationStagePrepare})
		return
	}

	result, err := h.service.Generate(c, model.GenerateAudioRequest{
		RequestID: trace.GetTraceID(c), UserID: principal.UserID, APIKeyID: principal.APIKeyID,
		Prompt: payload.Prompt, Model: payload.Model, Mode: model.Mode(payload.Mode),
		Format: payload.Format, SampleRate: payload.SampleRate,
		SpeechRate: payload.SpeechRate, LoudnessRate: payload.LoudnessRate, PitchRate: payload.PitchRate,
		EnableSubtitle: payload.EnableSubtitle, SpeakerIDs: payload.SpeakerIDs,
		ReferenceAudioURLs: payload.Audios, ReferenceImageURLs: payload.Images,
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		logger.WithError(err).WithFields(logging.Fields{"status_code": status, "error_code": response.Error.Code}).Error("audio request failed")
		sharedhandlers.WriteInvocationError(c, ctx, err)
		return
	}

	sharedhandlers.WriteInvocationSuccess(c, ctx, result.Value, result.Meta)
}
