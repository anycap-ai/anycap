package web

import (
	"context"
	"encoding/json"
	"errors"

	webapp "gitlab.knoffice.tech/engineering/anycap/internal/application/web"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/open/common-go/logging"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

// Handler serves web search and crawl endpoints.
type Handler struct {
	service *webapp.Service
}

// NewHandler creates a new web handler.
func NewHandler(service *webapp.Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes registers the web endpoints under /web.
func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group("/web")
	middleware.CapabilityPOST(g, "/search", "web.search", h.Search)
	middleware.CapabilityPOST(g, "/crawl", "web.crawl", h.Crawl)
}

// ---- Response DTOs (strip internal details) ----

// groundingSearchResponse is the client-facing response for grounding search.
// It excludes model, usage, and duration_ms which are internal details.
type groundingSearchResponse struct {
	Mode           string                `json:"mode"`
	Query          string                `json:"query"`
	Content        string                `json:"content"`
	SearchMetadata *model.SearchMetadata `json:"search_metadata,omitempty"`
	CreditCost     int64                 `json:"credit_cost"`
}

func (h *Handler) Search(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("capability", "web.search")
	if h.service == nil {
		logger.Error("web search service unavailable")
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "web_service_unavailable", "web service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	reqCtx := middleware.ContextWithUserID(c, principal.UserID)

	var req model.WebSearchRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		logger.WithError(err).Warn("invalid web search request body")
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	mode := req.ResolvedMode()
	switch mode {
	case "grounding":
		h.searchGrounding(c, ctx, reqCtx, req)
	case "general":
		h.searchGeneral(c, ctx, reqCtx, req)
	default:
		handlers.WriteError(c, ctx, consts.StatusUnprocessableEntity, "invalid_param", "mode must be 'general' or 'grounding'")
	}
}

func (h *Handler) searchGrounding(c context.Context, ctx *app.RequestContext, reqCtx context.Context, req model.WebSearchRequest) {
	logger := logging.WithContext(c).WithField("capability", "web.search")

	result, err := h.service.SearchGrounding(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyWebError(err)
		logger.WithFields(logging.Fields{
			"status_code": code,
			"error_code":  errCode,
		}).WithError(err).Error("web search grounding failed")
		handlers.WriteError(c, ctx, code, errCode, msg)
		return
	}

	// Strip internal details (model, usage, duration_ms) before returning.
	handlers.WriteSuccess(c, ctx, groundingSearchResponse{
		Mode:           result.Mode,
		Query:          result.Query,
		Content:        result.Content,
		SearchMetadata: result.SearchMetadata,
		CreditCost:     result.CreditCost,
	})
}

func (h *Handler) searchGeneral(c context.Context, ctx *app.RequestContext, reqCtx context.Context, req model.WebSearchRequest) {
	logger := logging.WithContext(c).WithField("capability", "web.search")

	result, err := h.service.SearchGeneral(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyWebError(err)
		logger.WithFields(logging.Fields{
			"status_code": code,
			"error_code":  errCode,
		}).WithError(err).Error("web search general failed")
		handlers.WriteError(c, ctx, code, errCode, msg)
		return
	}

	handlers.WriteSuccess(c, ctx, result)
}

func (h *Handler) Crawl(c context.Context, ctx *app.RequestContext) {
	logger := logging.WithContext(c).WithField("capability", "web.crawl")
	if h.service == nil {
		logger.Error("web crawl service unavailable")
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "web_service_unavailable", "web service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	reqCtx := middleware.ContextWithUserID(c, principal.UserID)

	var req model.WebCrawlRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		logger.WithError(err).Warn("invalid web crawl request body")
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_param", "invalid json request body")
		return
	}

	result, err := h.service.Crawl(reqCtx, req)
	if err != nil {
		middleware.ReportError(ctx, err)
		code, errCode, msg := classifyWebError(err)
		logger.WithFields(logging.Fields{
			"status_code": code,
			"error_code":  errCode,
		}).WithError(err).Error("web crawl failed")
		handlers.WriteError(c, ctx, code, errCode, msg)
		return
	}

	handlers.WriteSuccess(c, ctx, result)
}

func classifyWebError(err error) (httpStatus int, code string, message string) {
	if errors.Is(err, model.ErrCrawlURLRequired) {
		return consts.StatusUnprocessableEntity, "missing_input", err.Error()
	}
	if errors.Is(err, model.ErrWebCrawlerNotConfigured) {
		return consts.StatusServiceUnavailable, "web_service_unavailable", err.Error()
	}
	if errors.Is(err, model.ErrWebSearchProviderNotConfigured) {
		return consts.StatusServiceUnavailable, "web_service_unavailable", err.Error()
	}
	if errors.Is(err, model.ErrWebGeneralSearchProviderNotConfigured) {
		return consts.StatusServiceUnavailable, "web_service_unavailable", err.Error()
	}
	if errors.Is(err, model.ErrSearchQueryRequired) {
		return consts.StatusUnprocessableEntity, "missing_input", err.Error()
	}
	if errors.Is(err, model.ErrSearchModeInvalid) {
		return consts.StatusUnprocessableEntity, "invalid_param", err.Error()
	}
	if errors.Is(err, model.ErrAuthInvalid) {
		return consts.StatusUnauthorized, model.ErrAuthInvalid.Code, model.ErrAuthInvalid.Message
	}
	if errors.Is(err, model.ErrInsufficientCredit) {
		return consts.StatusPaymentRequired, model.ErrInsufficientCredit.Code, model.ErrInsufficientCredit.Message
	}
	if errors.Is(err, model.ErrBillingUncertain) {
		return consts.StatusBadGateway, model.ErrBillingUncertain.Code, model.ErrBillingUncertain.Message
	}
	return consts.StatusInternalServerError, "internal_error", err.Error()
}
