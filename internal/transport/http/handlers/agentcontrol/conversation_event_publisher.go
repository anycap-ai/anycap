package agentcontrol

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type conversationEventPublisher interface {
	Publish(ctx context.Context, session model.AgentSession, event *model.AgentConversationEvent) error
}

type imConversationEventPublisher struct {
	bindings      port.IMBindingRepository
	conversations port.AgentConversationRepository
	adapter       webhookAdapter
}

func newConversationEventPublisher(bindings port.IMBindingRepository, conversations port.AgentConversationRepository, adapter webhookAdapter) conversationEventPublisher {
	if bindings == nil || conversations == nil || adapter == nil {
		return nil
	}
	return &imConversationEventPublisher{
		bindings:      bindings,
		conversations: conversations,
		adapter:       adapter,
	}
}

func (p *imConversationEventPublisher) Publish(ctx context.Context, session model.AgentSession, event *model.AgentConversationEvent) error {
	if p == nil || p.bindings == nil || p.conversations == nil || p.adapter == nil || event == nil {
		return nil
	}
	if session.Status != model.AgentSessionStatusCommitted &&
		session.Status != model.AgentSessionStatusFailed &&
		session.Status != model.AgentSessionStatusInterrupted {
		return nil
	}

	conversation, err := p.conversations.GetConversationByID(ctx, session.ConversationID)
	if err != nil || conversation == nil || conversation.ID <= 0 {
		return err
	}
	binding, err := p.resolveReplyBinding(ctx, *conversation)
	if err != nil || binding == nil || binding.ID <= 0 {
		return err
	}
	message := buildConversationEventMessage(session, event)
	if strings.TrimSpace(message) == "" {
		return nil
	}
	return p.adapter.SendMessage(ctx, *binding, message)
}

func (p *imConversationEventPublisher) resolveReplyBinding(ctx context.Context, conversation model.AgentConversation) (*model.IMBinding, error) {
	items, err := p.bindings.ListBindingsByUser(ctx, conversation.UserID)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		if item.Status != model.IMBindingStatusActive {
			continue
		}
		if item.Platform != conversation.Platform || item.BotID != conversation.BotID {
			continue
		}
		if strings.TrimSpace(item.ChannelID) != "" && strings.TrimSpace(conversation.ChatID) != "" && item.ChannelID != conversation.ChatID {
			continue
		}
		copy := item
		return &copy, nil
	}
	return nil, fmt.Errorf("reply binding not found")
}

func buildConversationEventMessage(session model.AgentSession, event *model.AgentConversationEvent) string {
	message := buildSessionReplyMessage(session)
	if event != nil && event.PendingCount > 0 {
		message = buildAutoContinueReplyMessage(message, event)
	}
	return message
}
