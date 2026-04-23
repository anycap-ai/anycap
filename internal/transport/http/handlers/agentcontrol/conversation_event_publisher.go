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

type conversationEventReply struct {
	Binding model.IMBinding
	Message string
}

type conversationReplyBuilder struct {
	bindings      port.IMBindingRepository
	conversations port.AgentConversationRepository
}

type imConversationEventPublisher struct {
	builder *conversationReplyBuilder
	adapter webhookAdapter
}

func newConversationEventPublisher(bindings port.IMBindingRepository, conversations port.AgentConversationRepository, adapter webhookAdapter) conversationEventPublisher {
	builder := newConversationReplyBuilder(bindings, conversations)
	if builder == nil || adapter == nil {
		return nil
	}
	return &imConversationEventPublisher{
		builder: builder,
		adapter: adapter,
	}
}

func (p *imConversationEventPublisher) Publish(ctx context.Context, session model.AgentSession, event *model.AgentConversationEvent) error {
	if p == nil || p.builder == nil || p.adapter == nil {
		return nil
	}
	reply, err := p.builder.Build(ctx, session, event)
	if err != nil || reply == nil {
		return err
	}
	return p.adapter.SendMessage(ctx, reply.Binding, reply.Message)
}

func newConversationReplyBuilder(bindings port.IMBindingRepository, conversations port.AgentConversationRepository) *conversationReplyBuilder {
	if bindings == nil || conversations == nil {
		return nil
	}
	return &conversationReplyBuilder{
		bindings:      bindings,
		conversations: conversations,
	}
}

func (b *conversationReplyBuilder) Build(ctx context.Context, session model.AgentSession, event *model.AgentConversationEvent) (*conversationEventReply, error) {
	if b == nil || b.bindings == nil || b.conversations == nil || event == nil {
		return nil, nil
	}
	if session.Status != model.AgentSessionStatusCommitted &&
		session.Status != model.AgentSessionStatusFailed &&
		session.Status != model.AgentSessionStatusInterrupted {
		return nil, nil
	}

	conversation, err := b.conversations.GetConversationByID(ctx, session.ConversationID)
	if err != nil || conversation == nil || conversation.ID <= 0 {
		return nil, err
	}
	binding, err := b.resolveReplyBinding(ctx, *conversation)
	if err != nil || binding == nil {
		return nil, err
	}
	message := buildConversationEventMessage(session, event)
	if strings.TrimSpace(message) == "" {
		return nil, nil
	}
	return &conversationEventReply{
		Binding: *binding,
		Message: strings.TrimSpace(message),
	}, nil
}

func (b *conversationReplyBuilder) resolveReplyBinding(ctx context.Context, conversation model.AgentConversation) (*model.IMBinding, error) {
	items, err := b.bindings.ListBindingsByUser(ctx, conversation.UserID)
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
	if strings.TrimSpace(conversation.Platform) != "" &&
		strings.TrimSpace(conversation.BotID) != "" &&
		strings.TrimSpace(conversation.ChatID) != "" {
		return &model.IMBinding{
			UserID:    conversation.UserID,
			Platform:  conversation.Platform,
			BotID:     conversation.BotID,
			ChannelID: conversation.ChatID,
			Status:    model.IMBindingStatusActive,
		}, nil
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
