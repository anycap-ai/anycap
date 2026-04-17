package agentcontrol

import (
	"context"
	"encoding/json"
	"strings"
	"time"

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

type RunnerHandler struct {
	bindings            port.IMBindingRepository
	runners             port.AgentRunnerRepository
	conversations       port.AgentConversationRepository
	taskService         *agentcontrolapp.TaskService
	conversationService *agentcontrolapp.ConversationService
	adapter             webhookAdapter
	eventPublisher      conversationEventPublisher
	resolver            idresolver.IDResolver
	mapper              presenter.IDMapper
	now                 func() time.Time
}

func NewRunnerHandler(bindings port.IMBindingRepository, runners port.AgentRunnerRepository, conversations port.AgentConversationRepository, taskService *agentcontrolapp.TaskService, conversationService *agentcontrolapp.ConversationService, adapter webhookAdapter, resolver idresolver.IDResolver, mapper presenter.IDMapper) *RunnerHandler {
	return &RunnerHandler{
		bindings:            bindings,
		runners:             runners,
		conversations:       conversations,
		taskService:         taskService,
		conversationService: conversationService,
		adapter:             adapter,
		eventPublisher:      newConversationEventPublisher(bindings, conversations, adapter),
		resolver:            resolver,
		mapper:              mapper,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func (h *RunnerHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/agent/im/inbound", h.InboundChat)
	group.GET("/agent/runners", h.ListRunners)
	group.GET("/agent/runners/primary", h.GetPrimary)
	group.POST("/agent/runners/register", h.RegisterRunner)
	group.POST("/agent/runners/:id/claim-primary", h.ClaimPrimary)
	group.POST("/agent/runners/:id/heartbeat", h.Heartbeat)
	group.GET("/agent/runners/:id/sessions/next", h.NextSession)
	group.GET("/agent/runners/:id/sessions/:session_id", h.GetSession)
	group.POST("/agent/runners/:id/sessions/:session_id", h.UpdateSession)
	group.GET("/agent/runners/:id/tasks/next", h.NextTask)
	group.POST("/agent/runners/:id/tasks/:task_id", h.UpdateTask)
}

func (h *RunnerHandler) InboundChat(c context.Context, ctx *app.RequestContext) {
	if h.conversationService == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "conversation service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	var req dto.InboundIMChatRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	result, err := h.conversationService.HandleOwnedInboundMessage(c, agentcontrolapp.OwnedInboundChatInput{
		UserID:    principal.UserID,
		Platform:  req.Platform,
		BotID:     req.BotID,
		ChatID:    req.ChatID,
		MessageID: req.MessageID,
		SenderID:  req.SenderID,
		Message:   req.Message,
	})
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	replyMessage := ""
	if result != nil {
		replyMessage = strings.TrimSpace(agentcontrolapp.BuildInboundChatReply(*result))
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{
		"reply_message": replyMessage,
	}))
}

func (h *RunnerHandler) GetPrimary(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	platform, err := normalizeRunnerPlatform(string(ctx.Query("platform")))
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	primary, err := h.runners.GetPrimaryRunner(c, principal.UserID, platform)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if primary == nil || primary.RunnerID <= 0 {
		ctx.SetStatusCode(consts.StatusNoContent)
		return
	}
	runner, err := h.runners.GetRunnerByID(c, primary.RunnerID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if runner == nil || runner.ID <= 0 {
		ctx.SetStatusCode(consts.StatusNoContent)
		return
	}
	out, err := presenter.PresentAgentRunner(c, h.mapper, runner)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_runner_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) ClaimPrimary(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	runner, err := h.runners.GetRunnerByID(c, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if runner == nil || runner.ID <= 0 {
		handlers.WriteError(c, ctx, consts.StatusNotFound, "not_found", "agent runner not found")
		return
	}
	if runner.UserID != principal.UserID {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "runner not accessible")
		return
	}
	if _, err := h.runners.ClaimPrimaryRunner(c, principal.UserID, runner.Platform, runner.ID, h.now()); err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentRunner(c, h.mapper, runner)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_runner_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) ListRunners(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	items, err := h.runners.ListRunnersByUser(c, principal.UserID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentRunners(c, h.mapper, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_runners_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]any{"items": out}))
}

func (h *RunnerHandler) RegisterRunner(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	var req dto.RegisterRunnerRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	platform, err := normalizeRunnerPlatform(req.Platform)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	agent, err := normalizeRunnerAgent(req.Agent)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	now := h.now()
	runner, err := h.runners.CreateRunner(c, model.AgentRunner{
		UserID:    principal.UserID,
		Name:      strings.TrimSpace(req.Name),
		Platform:  platform,
		Agent:     agent,
		State:     model.AgentRunnerStateIdle,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentRunner(c, h.mapper, runner)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_runner_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func normalizeRunnerPlatform(raw string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case model.IMPlatformFeishu:
		return model.IMPlatformFeishu, nil
	case model.IMPlatformWeChat:
		return model.IMPlatformWeChat, nil
	case model.IMPlatformTelegram:
		return model.IMPlatformTelegram, nil
	default:
		return "", model.ErrValidation("unsupported im platform")
	}
}

func normalizeRunnerAgent(raw string) (string, error) {
	value := strings.ToLower(strings.TrimSpace(raw))
	switch value {
	case "":
		return model.AgentRunnerAgentCodex, nil
	case "codex":
		return model.AgentRunnerAgentCodex, nil
	case "claude", "claude_code", "claude-code":
		return model.AgentRunnerAgentClaudeCode, nil
	case "cursor", "cursor_agent", "cursor-agent":
		return model.AgentRunnerAgentCursor, nil
	case "stub":
		return model.AgentRunnerAgentStub, nil
	default:
		return "", model.ErrValidation("unsupported runner agent")
	}
}

func (h *RunnerHandler) Heartbeat(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	runner, err := h.runners.GetRunnerByID(c, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if runner == nil || runner.UserID != principal.UserID {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "runner not accessible")
		return
	}
	var req dto.RunnerHeartbeatRequest
	if len(ctx.Request.Body()) > 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
			return
		}
	}
	state := runner.State
	if strings.TrimSpace(req.State) != "" {
		state = strings.TrimSpace(req.State)
	}
	updated, err := h.runners.UpdateRunnerState(c, id, state)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentRunner(c, h.mapper, updated)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_runner_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) UpdateTask(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.taskService == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	runnerID, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	runner, err := h.runners.GetRunnerByID(c, runnerID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if runner == nil || runner.UserID != principal.UserID {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "runner not accessible")
		return
	}
	taskID, err := h.resolver.ResolveAgentTaskID(c, string(ctx.Param("task_id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_task_failed", err)
		return
	}
	var req dto.RunnerTaskUpdateRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	var errorMessage *string
	if strings.TrimSpace(req.ErrorMessage) != "" {
		value := strings.TrimSpace(req.ErrorMessage)
		errorMessage = &value
	}
	task, err := h.taskService.ApplyRunnerUpdate(c, agentcontrolapp.RunnerTaskUpdateInput{
		TaskID:       taskID,
		Status:       strings.TrimSpace(req.Status),
		ErrorMessage: errorMessage,
	})
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentTask(c, h.mapper, task)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_task_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) NextTask(c context.Context, ctx *app.RequestContext) {
	if h.taskService == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	runnerID, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	task, err := h.taskService.GetNextTaskForRunner(c, principal, runnerID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if task == nil {
		ctx.Status(consts.StatusNoContent)
		return
	}
	out, err := presenter.PresentAgentTask(c, h.mapper, task)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_task_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) UpdateSession(c context.Context, ctx *app.RequestContext) {
	if h.runners == nil || h.conversationService == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	runnerID, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	runner, err := h.runners.GetRunnerByID(c, runnerID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if runner == nil || runner.UserID != principal.UserID {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "runner not accessible")
		return
	}
	sessionID, err := h.resolver.ResolveAgentSessionID(c, string(ctx.Param("session_id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_session_failed", err)
		return
	}
	var req dto.RunnerSessionUpdateRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}
	var finalMessage *string
	if strings.TrimSpace(req.FinalMessage) != "" {
		value := strings.TrimSpace(req.FinalMessage)
		finalMessage = &value
	}
	var executorRef *string
	if strings.TrimSpace(req.ExecutorRef) != "" {
		value := strings.TrimSpace(req.ExecutorRef)
		executorRef = &value
	}
	result, err := h.conversationService.ApplyRunnerSessionUpdateDetailed(c, agentcontrolapp.RunnerSessionUpdateInput{
		SessionID:    sessionID,
		Status:       strings.TrimSpace(req.Status),
		FinalMessage: finalMessage,
		ExecutorRef:  executorRef,
	})
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	session := result.Session
	out, err := presenter.PresentAgentConversationSession(c, h.mapper, session)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_session_failed", err.Error())
		return
	}
	_ = h.publishSessionEvent(c, *session, result.Event)
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) NextSession(c context.Context, ctx *app.RequestContext) {
	if h.conversationService == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	runnerID, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	session, err := h.conversationService.GetNextSessionForRunner(c, principal, runnerID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if session == nil {
		ctx.Status(consts.StatusNoContent)
		return
	}
	out, err := presenter.PresentAgentConversationSession(c, h.mapper, session)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_session_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) GetSession(c context.Context, ctx *app.RequestContext) {
	if h.conversationService == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "runner service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	runnerID, err := h.resolver.ResolveRunnerID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_runner_failed", err)
		return
	}
	sessionID, err := h.resolver.ResolveAgentSessionID(c, string(ctx.Param("session_id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_session_failed", err)
		return
	}
	session, err := h.conversationService.GetSessionForRunner(c, principal, runnerID, sessionID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentConversationSession(c, h.mapper, session)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_session_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *RunnerHandler) publishSessionEvent(ctx context.Context, session model.AgentSession, event *model.AgentConversationEvent) error {
	if h == nil || h.eventPublisher == nil {
		return nil
	}
	return h.eventPublisher.Publish(ctx, session, event)
}

func buildSessionReplyMessage(session model.AgentSession) string {
	finalMessage := ""
	if session.FinalMessage != nil {
		finalMessage = strings.TrimSpace(*session.FinalMessage)
	}
	switch session.Status {
	case model.AgentSessionStatusCommitted:
		if finalMessage != "" {
			return finalMessage
		}
		return "会话已完成"
	case model.AgentSessionStatusFailed:
		if finalMessage != "" {
			return "会话执行失败：" + finalMessage
		}
		return "会话执行失败"
	case model.AgentSessionStatusInterrupted:
		if finalMessage != "" {
			return finalMessage
		}
		return "会话已停止"
	default:
		return ""
	}
}

func buildAutoContinueReplyMessage(message string, event *model.AgentConversationEvent) string {
	message = strings.TrimSpace(message)
	summary := ""
	if event != nil && event.MailboxSummary != nil {
		summary = strings.TrimSpace(*event.MailboxSummary)
	}
	if summary == "" {
		if message == "" {
			return "已收到新的后台结果，继续处理中"
		}
		return message + "\n已收到新的后台结果，继续处理中"
	}
	if message == "" {
		return "后台结果已返回：" + summary + "，继续处理中"
	}
	return message + "\n后台结果已返回：" + summary + "，继续处理中"
}
