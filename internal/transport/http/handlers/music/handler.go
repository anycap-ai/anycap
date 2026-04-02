package music

import (
	"context"
	"encoding/json"

	musicapp "gitlab.knoffice.tech/engineering/anycap/internal/application/music"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

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
	var payload dto.GenerateMusicRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		ctx.JSON(401, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "AUTH_INVALID", "invalid api key"))
		return
	}

	result, err := h.service.Generate(c, model.GenerateMusicRequest{
		RequestID:        middleware.GetRequestID(ctx),
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
