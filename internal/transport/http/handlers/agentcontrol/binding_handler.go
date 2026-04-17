package agentcontrol

import (
	"context"
	"encoding/json"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type BindingHandler struct {
	service  *agentcontrolapp.BindingService
	bindings port.IMBindingRepository
	resolver idresolver.IDResolver
	mapper   presenter.IDMapper
}

func NewBindingHandler(service *agentcontrolapp.BindingService, bindings port.IMBindingRepository, resolver idresolver.IDResolver, mapper presenter.IDMapper) *BindingHandler {
	return &BindingHandler{service: service, bindings: bindings, resolver: resolver, mapper: mapper}
}

func (h *BindingHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/agent/im-bindings/token", h.CreateToken)
	group.GET("/agent/im-bindings", h.ListBindings)
	group.DELETE("/agent/im-bindings/:id", h.RevokeBinding)
}

func (h *BindingHandler) CreateToken(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "binding service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	var req dto.CreateIMBindTokenRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	token, err := h.service.IssueBindToken(c, principal, req.Platform)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), dto.IMBindTokenResponse{
		Token:     token.Token,
		Platform:  token.Platform,
		ExpiresAt: token.ExpiresAt,
	}))
}

func (h *BindingHandler) ListBindings(c context.Context, ctx *app.RequestContext) {
	if h.bindings == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "binding service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	items, err := h.bindings.ListBindingsByUser(c, principal.UserID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentIMBindings(c, h.mapper, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_im_bindings_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{"items": out}))
}

func (h *BindingHandler) RevokeBinding(c context.Context, ctx *app.RequestContext) {
	if h.bindings == nil || h.resolver == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "binding service is not configured")
		return
	}
	if _, ok := middleware.GetPrincipal(ctx); !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveIMBindingID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_im_binding_failed", err)
		return
	}
	if err := h.bindings.RevokeBinding(c, id); err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]string{"id": string(ctx.Param("id"))}))
}
