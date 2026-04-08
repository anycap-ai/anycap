package agentcontrol

import (
	"context"
	"encoding/json"
	"strings"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
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

type ConversationHandler struct {
	service       *agentcontrolapp.ConversationService
	conversations port.AgentConversationRepository
	sessions      port.AgentSessionRepository
	resolver      idresolver.IDResolver
	mapper        presenter.IDMapper
}

func NewConversationHandler(
	service *agentcontrolapp.ConversationService,
	conversations port.AgentConversationRepository,
	sessions port.AgentSessionRepository,
	resolver idresolver.IDResolver,
	mapper presenter.IDMapper,
) *ConversationHandler {
	return &ConversationHandler{
		service:       service,
		conversations: conversations,
		sessions:      sessions,
		resolver:      resolver,
		mapper:        mapper,
	}
}

func (h *ConversationHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/agent/conversations", h.ListConversations)
	group.GET("/agent/conversations/:id", h.GetConversation)
	group.GET("/agent/conversations/:id/sessions", h.ListSessions)
	group.GET("/agent/conversations/:id/mailbox", h.ListMailbox)
	group.POST("/agent/conversations/:id/mailbox", h.CreateMailbox)
	group.POST("/agent/conversations/:id/stop", h.StopConversation)
	group.POST("/agent/conversations/:id/reset", h.ResetConversation)
	group.POST("/agent/conversations/:id/fork", h.ForkConversation)
	group.POST("/agent/conversations/:id/fire", h.FireConversation)
}

func (h *ConversationHandler) ListConversations(c context.Context, ctx *app.RequestContext) {
	if h.conversations == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	items, err := h.conversations.ListConversationsByUser(c, principal.UserID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	lastSessions, err := h.loadLastSessions(c, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "load_last_sessions_failed", err.Error())
		return
	}
	out, err := presenter.PresentAgentConversationsWithLastSessions(c, h.mapper, items, lastSessions)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_conversations_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{"items": out}))
}

func (h *ConversationHandler) GetConversation(c context.Context, ctx *app.RequestContext) {
	conversation, ok := h.loadAuthorizedConversation(c, ctx)
	if !ok {
		return
	}
	lastSessions, err := h.loadLastSessions(c, []model.AgentConversation{*conversation})
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "load_last_sessions_failed", err.Error())
		return
	}
	var lastSession *model.AgentSession
	if item, ok := lastSessions[conversation.ID]; ok {
		copy := item
		lastSession = &copy
	}
	out, err := presenter.PresentAgentConversationWithLastSession(c, h.mapper, conversation, lastSession)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_conversation_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *ConversationHandler) ListSessions(c context.Context, ctx *app.RequestContext) {
	conversation, ok := h.loadAuthorizedConversation(c, ctx)
	if !ok {
		return
	}
	if h.sessions == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	items, err := h.sessions.ListSessionsByConversation(c, conversation.ID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentConversationSessions(c, h.mapper, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_sessions_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{"items": out}))
}

func (h *ConversationHandler) ListMailbox(c context.Context, ctx *app.RequestContext) {
	if h.service == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveAgentConversationID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_conversation_failed", err)
		return
	}
	items, err := h.service.ListMailboxMessagesByConversationID(c, principal, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentMailboxMessages(c, h.mapper, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_mailbox_messages_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{"items": out}))
}

func (h *ConversationHandler) CreateMailbox(c context.Context, ctx *app.RequestContext) {
	if h.service == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	conversationID, err := h.resolver.ResolveAgentConversationID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_conversation_failed", err)
		return
	}
	var req dto.ConversationMailboxCreateRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	var sourceSessionID *int64
	if strings.TrimSpace(req.SourceSession) != "" {
		value, err := h.resolver.ResolveAgentSessionID(c, req.SourceSession)
		if err != nil {
			idresolver.WriteIDResolveError(c, ctx, "resolve_agent_session_failed", err)
			return
		}
		sourceSessionID = &value
	}
	item, err := h.service.CreateMailboxMessageByConversationID(c, principal, conversationID, req.SourceType, req.Payload, sourceSessionID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentMailboxMessage(c, h.mapper, item)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_mailbox_message_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *ConversationHandler) loadAuthorizedConversation(c context.Context, ctx *app.RequestContext) (*model.AgentConversation, bool) {
	if h.conversations == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return nil, false
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return nil, false
	}
	id, err := h.resolver.ResolveAgentConversationID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_conversation_failed", err)
		return nil, false
	}
	item, err := h.conversations.GetConversationByID(c, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return nil, false
	}
	if item == nil {
		status, payload := dto.MapDomainError(model.ErrNotFound("agent conversation not found"))
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return nil, false
	}
	if strings.TrimSpace(item.UserID) != strings.TrimSpace(principal.UserID) {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return nil, false
	}
	return item, true
}

func (h *ConversationHandler) loadLastSessions(c context.Context, conversations []model.AgentConversation) (map[int64]model.AgentSession, error) {
	result := make(map[int64]model.AgentSession, len(conversations))
	if h.sessions == nil {
		return result, nil
	}

	for _, conversation := range conversations {
		if conversation.LastSessionID == nil || *conversation.LastSessionID <= 0 {
			continue
		}
		session, err := h.sessions.GetSessionByID(c, *conversation.LastSessionID)
		if err != nil {
			return nil, err
		}
		if session == nil || session.ID <= 0 {
			continue
		}
		result[conversation.ID] = *session
	}
	return result, nil
}

func (h *ConversationHandler) StopConversation(c context.Context, ctx *app.RequestContext) {
	if h.service == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveAgentConversationID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_conversation_failed", err)
		return
	}
	conversation, _, err := h.service.StopConversationByID(c, principal, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	h.writeConversationResponse(c, ctx, conversation)
}

func (h *ConversationHandler) ResetConversation(c context.Context, ctx *app.RequestContext) {
	h.controlConversation(c, ctx, func(principal *model.Principal, id int64, message *string) (*model.AgentConversation, *model.AgentSession, error) {
		return h.service.ResetConversationByID(c, principal, id, message)
	})
}

func (h *ConversationHandler) ForkConversation(c context.Context, ctx *app.RequestContext) {
	h.controlConversation(c, ctx, func(principal *model.Principal, id int64, message *string) (*model.AgentConversation, *model.AgentSession, error) {
		return h.service.ForkConversationByID(c, principal, id, message)
	})
}

func (h *ConversationHandler) FireConversation(c context.Context, ctx *app.RequestContext) {
	h.controlConversation(c, ctx, func(principal *model.Principal, id int64, message *string) (*model.AgentConversation, *model.AgentSession, error) {
		return h.service.FireConversationByID(c, principal, id, message)
	})
}

func (h *ConversationHandler) controlConversation(
	c context.Context,
	ctx *app.RequestContext,
	action func(principal *model.Principal, id int64, message *string) (*model.AgentConversation, *model.AgentSession, error),
) {
	if h.service == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveAgentConversationID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_conversation_failed", err)
		return
	}
	var req dto.ConversationControlRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}
	conversation, _, err := action(principal, id, stringPtr(req.Message))
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	h.writeConversationResponse(c, ctx, conversation)
}

func (h *ConversationHandler) writeConversationResponse(c context.Context, ctx *app.RequestContext, conversation *model.AgentConversation) {
	lastSessions, err := h.loadLastSessions(c, []model.AgentConversation{*conversation})
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "load_last_sessions_failed", err.Error())
		return
	}
	var lastSession *model.AgentSession
	if item, ok := lastSessions[conversation.ID]; ok {
		copy := item
		lastSession = &copy
	}
	out, err := presenter.PresentAgentConversationWithLastSession(c, h.mapper, conversation, lastSession)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_conversation_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func stringPtr(raw string) *string {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	value := raw
	return &value
}
