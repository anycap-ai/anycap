package feedback

import (
	"context"
	"encoding/json"

	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

// Handler handles POST /v1/feedback.
type Handler struct {
	service *feedbackapp.Service
}

func NewHandler(service *feedbackapp.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	middleware.CapabilityPOST(group, "/feedback", "feedback.submit", h.Submit)
}

func (h *Handler) Submit(c context.Context, ctx *app.RequestContext) {
	reqID := trace.GetTraceID(c)
	logger := logging.WithContext(c).WithField("capability", "feedback.submit")

	var payload dto.SubmitFeedbackRequest
	if err := json.Unmarshal(ctx.Request.Body(), &payload); err != nil {
		logger.WithError(err).Warn("invalid feedback request body")
		ctx.JSON(400, dto.ErrorEnvelope(reqID, "INVALID_PARAM", "invalid json request body"))
		return
	}

	principal, _ := middleware.GetPrincipal(ctx)
	userID := ""
	if principal != nil {
		userID = principal.UserID
	}

	var fbContext map[string]any
	if len(payload.Context) > 0 {
		if err := json.Unmarshal(payload.Context, &fbContext); err != nil {
			logger.WithError(err).Warn("invalid feedback context payload")
			ctx.JSON(400, dto.ErrorEnvelope(reqID, "INVALID_PARAM", "context must be a valid JSON object"))
			return
		}
	}

	fb := model.Feedback{
		UserID:    userID,
		Type:      payload.Type,
		Message:   payload.Message,
		Context:   fbContext,
		RequestID: payload.RequestID,
		Metadata:  payload.Metadata,
	}

	id, err := h.service.Submit(c, fb)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, response := dto.MapDomainError(err)
		logger.WithFields(logging.Fields{
			"status_code":   status,
			"error_code":    response.Error.Code,
			"feedback_type": payload.Type,
		}).WithError(err).Error("feedback submit failed")
		response.ID = reqID
		ctx.JSON(status, response)
		return
	}

	ctx.JSON(200, dto.SuccessEnvelope(reqID, map[string]string{"id": id}))
}
