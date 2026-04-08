package agentcontrol

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	infraim "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol"
	"github.com/cloudwego/hertz/pkg/route"
)

type webhookAdapter interface {
	VerifyAndNormalize(req *http.Request) (infraim.NormalizedInboundEvent, error)
	SendMessage(ctx context.Context, binding model.IMBinding, message string) error
	SendAccepted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error
	SendCompleted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error
	SendFailure(ctx context.Context, binding model.IMBinding, task model.AgentTask) error
}

type WebhookHandler struct {
	bindingService      *agentcontrolapp.BindingService
	conversationService *agentcontrolapp.ConversationService
	taskService         *agentcontrolapp.TaskService
	adapter             webhookAdapter
}

func NewWebhookHandler(
	bindingService *agentcontrolapp.BindingService,
	conversationService *agentcontrolapp.ConversationService,
	taskService *agentcontrolapp.TaskService,
	adapter webhookAdapter,
) *WebhookHandler {
	return &WebhookHandler{
		bindingService:      bindingService,
		conversationService: conversationService,
		taskService:         taskService,
		adapter:             adapter,
	}
}

func (h *WebhookHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/im/events/feishu", h.FeishuEvent)
}

func (h *WebhookHandler) FeishuEvent(c context.Context, ctx *app.RequestContext) {
	if h.adapter == nil {
		status, payload := dto.MapDomainError(model.ErrNotConfigured("agent control webhook is not configured"))
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	req, err := http.NewRequest(http.MethodPost, string(ctx.URI().FullURI()), bytes.NewReader(ctx.Request.Body()))
	if err != nil {
		status, payload := dto.MapDomainError(model.ErrInternal)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	copyHeaderToStdlib(req.Header, &ctx.Request.Header)
	event, err := h.adapter.VerifyAndNormalize(req)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if event.IsURLVerification {
		ctx.JSON(http.StatusOK, map[string]string{"challenge": event.Challenge})
		return
	}

	if strings.HasPrefix(strings.TrimSpace(event.Message), "/bind ") {
		if h.bindingService == nil {
			status, payload := dto.MapDomainError(model.ErrNotConfigured("binding service is not configured"))
			payload.ID = trace.GetTraceID(c)
			ctx.JSON(status, payload)
			return
		}
		_, err = h.bindingService.ConsumeBindCommand(c, agentcontrolapp.ConsumeBindCommandInput{
			Platform:  event.Platform,
			BotID:     event.BotID,
			ChannelID: event.ChannelID,
			SenderID:  event.SenderID,
			Message:   event.Message,
		})
		if err != nil {
			status, payload := dto.MapDomainError(err)
			payload.ID = trace.GetTraceID(c)
			ctx.JSON(status, payload)
			return
		}
		ctx.JSON(http.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]string{"message": "binding_created"}))
		return
	}

	if h.conversationService != nil {
		result, err := h.conversationService.HandleInboundMessage(c, agentcontrolapp.InboundChatInput{
			Platform: event.Platform,
			BotID:    event.BotID,
			ChatID:   event.ChannelID,
			SenderID: event.SenderID,
			Message:  event.Message,
		})
		if err != nil {
			status, payload := dto.MapDomainError(err)
			payload.ID = trace.GetTraceID(c)
			ctx.JSON(status, payload)
			return
		}
		if result != nil && result.Binding != nil {
			if message := buildInboundChatReply(*result); strings.TrimSpace(message) != "" {
				_ = h.adapter.SendMessage(c, *result.Binding, message)
			}
		}
		ctx.JSON(http.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]string{"message": "accepted"}))
		return
	}

	if h.taskService == nil {
		status, payload := dto.MapDomainError(model.ErrNotConfigured("conversation service is not configured"))
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	task, err := h.taskService.CreateTaskFromInboundCommand(c, agentcontrolapp.InboundCommandInput{
		Platform: event.Platform,
		BotID:    event.BotID,
		SenderID: event.SenderID,
		Message:  event.Message,
	})
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	task, err = h.taskService.DispatchQueuedTask(c, task.ID)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}

	_ = h.adapter.SendAccepted(c, model.IMBinding{
		Platform:  event.Platform,
		BotID:     event.BotID,
		ChannelID: event.ChannelID,
		SenderID:  event.SenderID,
	}, *task)
	ctx.JSON(http.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), map[string]string{"message": "accepted"}))
}

func copyHeaderToStdlib(dst http.Header, src *protocol.RequestHeader) {
	src.VisitAll(func(key []byte, value []byte) {
		dst.Add(string(key), string(value))
	})
}

func buildInboundChatReply(result agentcontrolapp.InboundChatResult) string {
	switch result.Chat.Action {
	case model.AgentChatActionContinue, model.AgentChatActionNew, model.AgentChatActionReset:
		return "会话已接收，正在处理中"
	case model.AgentChatActionFork:
		if result.Conversation == nil || result.Conversation.ID <= 0 || result.Session == nil || result.Session.ID <= 0 {
			return "当前没有可分叉的活跃会话"
		}
		return "已创建新的会话分支，正在处理中"
	case model.AgentChatActionFire:
		if result.Conversation == nil || result.Conversation.ID <= 0 || result.Session == nil || result.Session.ID <= 0 {
			return "当前没有待处理的异步结果"
		}
		return "已触发异步结果回流，正在处理中"
	case model.AgentChatActionStatus:
		if result.Conversation == nil || result.Conversation.ID <= 0 {
			return "当前没有活跃会话"
		}
		if result.Session == nil || result.Session.ID <= 0 {
			return "当前会话已创建，等待执行"
		}
		return buildStatusReply(*result.Conversation, *result.Session)
	case model.AgentChatActionStop:
		if result.Conversation == nil || result.Conversation.ID <= 0 || result.Session == nil || result.Session.ID <= 0 {
			return "当前没有可停止的活跃会话"
		}
		if result.Session.FinalMessage != nil && strings.TrimSpace(*result.Session.FinalMessage) != "" {
			return strings.TrimSpace(*result.Session.FinalMessage)
		}
		return "会话已停止"
	default:
		return ""
	}
}

func buildStatusReply(conversation model.AgentConversation, session model.AgentSession) string {
	lines := []string{
		fmt.Sprintf("当前会话：%s / %s", agentLabel(conversation.Agent), sessionModeLabel(session.Mode)),
		"状态：" + sessionStatusLabel(session.Status),
	}
	if session.ExecutorRef != nil && strings.TrimSpace(*session.ExecutorRef) != "" {
		lines = append(lines, "上下文：已复用")
	}
	if session.StartedAt != nil {
		lines = append(lines, "开始时间："+formatStatusTime(*session.StartedAt))
	}
	if session.CompletedAt != nil {
		lines = append(lines, "完成时间："+formatStatusTime(*session.CompletedAt))
	}
	if session.FinalMessage != nil && strings.TrimSpace(*session.FinalMessage) != "" {
		lines = append(lines, "结果："+truncateStatusMessage(strings.TrimSpace(*session.FinalMessage), 120))
	}
	return strings.Join(lines, "\n")
}

func agentLabel(agent string) string {
	value := strings.TrimSpace(agent)
	if value == "" {
		return "agent"
	}
	return value
}

func sessionModeLabel(mode string) string {
	switch strings.TrimSpace(mode) {
	case model.AgentSessionModeContinue:
		return "继续"
	case model.AgentSessionModeFork:
		return "分支"
	case model.AgentSessionModeFire:
		return "触发"
	case model.AgentSessionModeSystem:
		return "系统"
	default:
		return "未知模式"
	}
}

func sessionStatusLabel(status string) string {
	switch strings.TrimSpace(status) {
	case model.AgentSessionStatusCreated:
		return "等待执行"
	case model.AgentSessionStatusRunning:
		return "执行中"
	case model.AgentSessionStatusCommitted:
		return "已完成"
	case model.AgentSessionStatusFailed:
		return "执行失败"
	case model.AgentSessionStatusInterrupted:
		return "已停止"
	default:
		return "未知状态"
	}
}

func formatStatusTime(ts time.Time) string {
	return ts.UTC().Format("2006-01-02 15:04:05 UTC")
}

func truncateStatusMessage(message string, limit int) string {
	if limit <= 0 {
		return ""
	}
	runes := []rune(strings.TrimSpace(message))
	if len(runes) <= limit {
		return string(runes)
	}
	return string(runes[:limit]) + "..."
}
