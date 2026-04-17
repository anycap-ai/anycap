package agentcontrol

import (
	"bytes"
	"context"
	"net/http"
	"strings"

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
			if domainErr, ok := err.(*model.DomainError); ok && domainErr.Code == "not_configured" {
				_ = h.adapter.SendMessage(c, model.IMBinding{
					Platform:  event.Platform,
					BotID:     event.BotID,
					ChannelID: event.ChannelID,
					SenderID:  event.SenderID,
				}, domainErr.Message)
			}
			status, payload := dto.MapDomainError(err)
			payload.ID = trace.GetTraceID(c)
			ctx.JSON(status, payload)
			return
		}
		if result != nil && result.Binding != nil {
			if message := agentcontrolapp.BuildInboundChatReply(*result); strings.TrimSpace(message) != "" {
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
