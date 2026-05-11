package music

import (
	"context"
	"encoding/json"

	musicapp "gitlab.knoffice.tech/engineering/anycap/internal/application/music"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
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

// RegisterAnonymousRoutes registers music generation for anonymous Chrome
// extension trials. It must be mounted behind the anonymous rate limiter.
func (h *Handler) RegisterAnonymousRoutes(group *route.RouterGroup) {
	group.POST("/music/generate", h.Generate)
}

func (h *Handler) Generate(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithFields(logging.Fields{
		"capability": "music.generate",
	})

	var payload dto.GenerateMusicRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		logger.WithError(err).Warn("invalid music request body")
		ctx.JSON(400, dto.ErrorEnvelope(trace.GetTraceID(c), "INVALID_PARAM", "invalid json request body"))
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	var userID, apiKeyID string
	if ok {
		userID = principal.UserID
		apiKeyID = principal.APIKeyID
	} else {
		anonymousUserID, ok := middleware.ChromeExtensionAnonymousUserID(ctx)
		if !ok {
			logger.Warn("missing principal and install_id for music request")
			ctx.JSON(401, dto.ErrorEnvelope(trace.GetTraceID(c), "AUTH_INVALID", "invalid api key"))
			return
		}
		userID = anonymousUserID
	}

	result, err := h.service.Generate(c, model.GenerateMusicRequest{
		RequestID:        trace.GetTraceID(c),
		UserID:           userID,
		APIKeyID:         apiKeyID,
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
		logger.WithError(err).WithFields(logging.Fields{
			"status_code": status,
			"error_code":  response.Error.Code,
		}).Error("music request failed")
		response.ID = trace.GetTraceID(c)
		ctx.JSON(status, response)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), result))
}
