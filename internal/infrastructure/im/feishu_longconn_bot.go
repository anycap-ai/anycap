package im

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"

	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
	larkws "github.com/larksuite/oapi-sdk-go/v3/ws"
)

const (
	feishuQuotedMessageLimit = 1
	feishuThreadHistoryLimit = 6
	feishuChatHistoryLimit   = 6
)

type FeishuLongConnBotConfig struct {
	AppID               string
	AppSecret           string
	BindingService      *agentcontrolapp.BindingService
	ConversationService *agentcontrolapp.ConversationService
	HandleInbound       func(context.Context, NormalizedInboundEvent) (string, error)
	SelectReaction      func(context.Context, NormalizedInboundEvent) (string, error)
	SendReaction        func(context.Context, model.IMBinding, string, string) error
	Adapter             *FeishuAdapter
}

type FeishuLongConnBot struct {
	appID               string
	appSecret           string
	bindingService      *agentcontrolapp.BindingService
	conversationService *agentcontrolapp.ConversationService
	inboundHandler      func(context.Context, NormalizedInboundEvent) (string, error)
	selectReaction      func(context.Context, NormalizedInboundEvent) (string, error)
	sendReaction        func(context.Context, model.IMBinding, string, string) error
	adapter             *FeishuAdapter
	client              *larkws.Client
}

func NewFeishuLongConnBot(cfg FeishuLongConnBotConfig) *FeishuLongConnBot {
	appID := strings.TrimSpace(cfg.AppID)
	appSecret := strings.TrimSpace(cfg.AppSecret)
	if appID == "" || appSecret == "" || cfg.Adapter == nil {
		return nil
	}
	if cfg.ConversationService == nil && cfg.HandleInbound == nil {
		return nil
	}

	bot := &FeishuLongConnBot{
		appID:               appID,
		appSecret:           appSecret,
		bindingService:      cfg.BindingService,
		conversationService: cfg.ConversationService,
		inboundHandler:      cfg.HandleInbound,
		selectReaction:      cfg.SelectReaction,
		sendReaction:        cfg.SendReaction,
		adapter:             cfg.Adapter,
	}

	eventDispatcher := dispatcher.NewEventDispatcher("", "").
		OnP2MessageReceiveV1(bot.onMessageReceive)
	bot.client = larkws.NewClient(appID, appSecret, larkws.WithEventHandler(eventDispatcher))
	return bot
}

func (b *FeishuLongConnBot) Run(ctx context.Context) error {
	if b == nil || b.client == nil {
		return nil
	}

	errCh := make(chan error, 1)
	go func() {
		errCh <- b.client.Start(ctx)
	}()

	select {
	case <-ctx.Done():
		return nil
	case err := <-errCh:
		if ctx.Err() != nil {
			return nil
		}
		return err
	}
}

func (b *FeishuLongConnBot) onMessageReceive(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
	normalized, ok, err := b.normalizeEvent(event)
	if err != nil || !ok {
		return err
	}
	return b.handleNormalizedEvent(ctx, normalized)
}

func (b *FeishuLongConnBot) normalizeEvent(event *larkim.P2MessageReceiveV1) (NormalizedInboundEvent, bool, error) {
	if b == nil || event == nil || event.Event == nil || event.Event.Message == nil || event.Event.Sender == nil || event.Event.Sender.SenderId == nil {
		return NormalizedInboundEvent{}, false, nil
	}
	if senderType := stringValue(event.Event.Sender.SenderType); senderType != "" && senderType != "user" {
		return NormalizedInboundEvent{}, false, nil
	}

	chatID := strings.TrimSpace(stringValue(event.Event.Message.ChatId))
	if chatID == "" {
		return NormalizedInboundEvent{}, false, nil
	}
	senderID := strings.TrimSpace(stringValue(event.Event.Sender.SenderId.OpenId))
	if senderID == "" {
		return NormalizedInboundEvent{}, false, nil
	}
	messageType := strings.TrimSpace(stringValue(event.Event.Message.MessageType))
	contentJSON := strings.TrimSpace(stringValue(event.Event.Message.Content))
	mentions := normalizeFeishuMentions(event.Event.Message.Mentions)
	messageText, err := normalizeFeishuMessageText(messageType, contentJSON, mentions)
	if err != nil {
		return NormalizedInboundEvent{}, false, err
	}

	return NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       b.appID,
		ChannelID:   chatID,
		MessageID:   strings.TrimSpace(stringValue(event.Event.Message.MessageId)),
		SenderID:    senderID,
		ChatType:    strings.TrimSpace(stringValue(event.Event.Message.ChatType)),
		ThreadID:    strings.TrimSpace(stringValue(event.Event.Message.ThreadId)),
		ParentID:    strings.TrimSpace(stringValue(event.Event.Message.ParentId)),
		RootID:      strings.TrimSpace(stringValue(event.Event.Message.RootId)),
		MessageType: messageType,
		Message:     messageText,
		ContentJSON: contentJSON,
		Mentions:    mentions,
	}, true, nil
}

func (b *FeishuLongConnBot) handleNormalizedEvent(ctx context.Context, event NormalizedInboundEvent) error {
	if b == nil {
		return model.ErrNotConfigured("feishu long connection bot is not configured")
	}
	enrichedEvent := b.enrichContext(ctx, event)
	if b.inboundHandler != nil {
		replyMessage, err := b.inboundHandler(ctx, enrichedEvent)
		if err != nil {
			return err
		}
		replyMessage = strings.TrimSpace(replyMessage)
		if replyMessage == "" {
			return nil
		}
		binding := model.IMBinding{
			Platform:  event.Platform,
			BotID:     event.BotID,
			ChannelID: event.ChannelID,
			SenderID:  event.SenderID,
		}
		if b.shouldUseReactionAck(enrichedEvent) && b.tryReactionAck(ctx, binding, enrichedEvent) {
			return nil
		}
		if sendErr := b.adapter.SendMessage(ctx, binding, replyMessage); sendErr != nil {
			logging.WithError(sendErr).Warn("send feishu long connection reply failed")
		}
		return nil
	}
	if b.conversationService == nil {
		return model.ErrNotConfigured("feishu long connection bot is not configured")
	}

	if strings.HasPrefix(strings.TrimSpace(event.Message), "/bind ") {
		if b.bindingService == nil {
			return model.ErrNotConfigured("binding service is not configured")
		}
		_, err := b.bindingService.ConsumeBindCommand(ctx, agentcontrolapp.ConsumeBindCommandInput{
			Platform:  event.Platform,
			BotID:     event.BotID,
			ChannelID: event.ChannelID,
			SenderID:  event.SenderID,
			Message:   event.Message,
		})
		return err
	}

	result, err := b.conversationService.HandleInboundMessage(ctx, agentcontrolapp.InboundChatInput{
		Platform: enrichedEvent.Platform,
		BotID:    enrichedEvent.BotID,
		ChatID:   enrichedEvent.ChannelID,
		SenderID: enrichedEvent.SenderID,
		Message:  enrichedEvent.Message,
	})
	if err != nil {
		return err
	}
	if result != nil && result.Binding != nil {
		if message := agentcontrolapp.BuildInboundChatReply(*result); strings.TrimSpace(message) != "" {
			if sendErr := b.adapter.SendMessage(ctx, *result.Binding, message); sendErr != nil {
				logging.WithError(sendErr).Warn("send feishu long connection reply failed")
			}
		}
	}
	return nil
}

func (b *FeishuLongConnBot) enrichContext(ctx context.Context, event NormalizedInboundEvent) NormalizedInboundEvent {
	if b == nil || b.adapter == nil {
		return event
	}
	command, err := agentcontrolapp.ParseChatCommand(event.Message)
	if err != nil || command.Action != model.AgentChatActionContinue {
		return event
	}

	enriched := event
	if quoted, err := b.loadQuotedMessage(ctx, event); err == nil && quoted != nil {
		enriched.QuotedMessage = quoted
	} else if err != nil {
		logging.WithError(err).Warn("load feishu quoted message failed")
	}
	if threadHistory, err := b.loadThreadHistory(ctx, event); err == nil && len(threadHistory) > 0 {
		enriched.ThreadHistory = threadHistory
	} else if err != nil {
		logging.WithError(err).Warn("load feishu thread history failed")
	}
	if chatHistory, err := b.loadChatHistory(ctx, event); err == nil && len(chatHistory) > 0 {
		enriched.ChatHistory = chatHistory
	} else if err != nil {
		logging.WithError(err).Warn("load feishu chat history failed")
	}
	return enriched
}

func (b *FeishuLongConnBot) loadQuotedMessage(ctx context.Context, event NormalizedInboundEvent) (*NormalizedInboundContextMessage, error) {
	parentID := strings.TrimSpace(event.ParentID)
	if parentID == "" {
		return nil, nil
	}
	message, err := b.adapter.GetMessage(ctx, parentID)
	if err != nil {
		return nil, err
	}
	if message == nil {
		return nil, nil
	}
	normalized, ok, err := normalizeFeishuContextMessage(message, strings.TrimSpace(event.ChatType))
	if err != nil || !ok {
		return nil, err
	}
	return &normalized, nil
}

func (b *FeishuLongConnBot) loadThreadHistory(ctx context.Context, event NormalizedInboundEvent) ([]NormalizedInboundContextMessage, error) {
	threadID := strings.TrimSpace(event.ThreadID)
	if threadID == "" {
		threadID = strings.TrimSpace(event.RootID)
	}
	if threadID == "" {
		return nil, nil
	}
	items, err := b.adapter.ListMessages(ctx, "thread", threadID, feishuThreadHistoryLimit+feishuQuotedMessageLimit)
	if err != nil {
		return nil, err
	}
	return normalizeFeishuContextHistory(items, strings.TrimSpace(event.ChatType), strings.TrimSpace(event.MessageID), feishuThreadHistoryLimit)
}

func (b *FeishuLongConnBot) loadChatHistory(ctx context.Context, event NormalizedInboundEvent) ([]NormalizedInboundContextMessage, error) {
	chatID := strings.TrimSpace(event.ChannelID)
	if chatID == "" {
		return nil, nil
	}
	items, err := b.adapter.ListMessages(ctx, "chat", chatID, feishuChatHistoryLimit+1)
	if err != nil {
		return nil, err
	}
	return normalizeFeishuContextHistory(items, strings.TrimSpace(event.ChatType), strings.TrimSpace(event.MessageID), feishuChatHistoryLimit)
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}

func (b *FeishuLongConnBot) shouldUseReactionAck(event NormalizedInboundEvent) bool {
	if b == nil || b.selectReaction == nil || b.sendReaction == nil {
		return false
	}
	if strings.TrimSpace(event.MessageID) == "" {
		return false
	}
	command, err := agentcontrolapp.ParseChatCommand(event.Message)
	if err != nil {
		return false
	}
	return command.Action == model.AgentChatActionContinue
}

func (b *FeishuLongConnBot) tryReactionAck(ctx context.Context, binding model.IMBinding, event NormalizedInboundEvent) bool {
	reactionType, err := b.selectReaction(ctx, event)
	if err != nil {
		logging.WithError(err).Warn("select feishu reaction ack failed")
		return false
	}
	reactionType = NormalizeReactionEmojiType(reactionType)
	if !IsAllowedReactionEmojiType(reactionType) {
		logging.WithField("reaction_type", reactionType).Warn("skip feishu reaction ack because the emoji type is not allowed")
		return false
	}
	if err := b.sendReaction(ctx, binding, event.MessageID, reactionType); err != nil {
		logging.WithError(err).Warn("send feishu reaction ack failed")
		return false
	}
	return true
}

func normalizeFeishuMentions(raw []*larkim.MentionEvent) []NormalizedInboundMention {
	if len(raw) == 0 {
		return nil
	}
	mentions := make([]NormalizedInboundMention, 0, len(raw))
	for _, item := range raw {
		if item == nil {
			continue
		}
		mention := NormalizedInboundMention{
			Key:       stringValue(item.Key),
			Name:      stringValue(item.Name),
			TenantKey: stringValue(item.TenantKey),
		}
		if item.Id != nil {
			mention.OpenID = stringValue(item.Id.OpenId)
		}
		if mention.Key == "" && mention.OpenID == "" && mention.Name == "" && mention.TenantKey == "" {
			continue
		}
		mentions = append(mentions, mention)
	}
	if len(mentions) == 0 {
		return nil
	}
	return mentions
}

func resolveMentionPlaceholders(text string, mentions []NormalizedInboundMention) string {
	resolved := strings.TrimSpace(text)
	if resolved == "" || len(mentions) == 0 {
		return resolved
	}
	for _, mention := range mentions {
		if strings.TrimSpace(mention.Key) == "" || strings.TrimSpace(mention.Name) == "" {
			continue
		}
		resolved = strings.ReplaceAll(resolved, mention.Key, "@"+strings.TrimSpace(mention.Name))
	}
	return resolved
}

func normalizeFeishuMessageText(messageType string, contentJSON string, mentions []NormalizedInboundMention) (string, error) {
	normalizedType := strings.TrimSpace(messageType)
	if normalizedType == "" || strings.EqualFold(normalizedType, "text") {
		var content struct {
			Text string `json:"text"`
		}
		if err := json.Unmarshal([]byte(contentJSON), &content); err != nil {
			return "", fmt.Errorf("decode feishu long connection message: %w", err)
		}
		return resolveMentionPlaceholders(strings.TrimSpace(content.Text), mentions), nil
	}
	return fmt.Sprintf("User sent a Feishu %s message. Inspect content_json for resource identifiers.", normalizedType), nil
}

func normalizeFeishuContextHistory(messages []*larkim.Message, chatType string, currentMessageID string, limit int) ([]NormalizedInboundContextMessage, error) {
	if len(messages) == 0 || limit <= 0 {
		return nil, nil
	}
	normalized := make([]NormalizedInboundContextMessage, 0, minInt(len(messages), limit))
	for _, item := range messages {
		if item == nil {
			continue
		}
		if strings.TrimSpace(stringValue(item.MessageId)) == strings.TrimSpace(currentMessageID) {
			continue
		}
		contextMessage, ok, err := normalizeFeishuContextMessage(item, chatType)
		if err != nil {
			return nil, err
		}
		if !ok {
			continue
		}
		normalized = append(normalized, contextMessage)
		if len(normalized) >= limit {
			break
		}
	}
	if len(normalized) == 0 {
		return nil, nil
	}
	return normalized, nil
}

func normalizeFeishuContextMessage(message *larkim.Message, defaultChatType string) (NormalizedInboundContextMessage, bool, error) {
	if message == nil {
		return NormalizedInboundContextMessage{}, false, nil
	}
	messageType := strings.TrimSpace(stringValue(message.MsgType))
	contentJSON := strings.TrimSpace(messageBodyContent(message.Body))
	mentions := normalizeFeishuMessageMentions(message.Mentions)
	messageText, err := normalizeFeishuMessageText(messageType, contentJSON, mentions)
	if err != nil {
		return NormalizedInboundContextMessage{}, false, err
	}

	senderID, senderType := normalizeFeishuSender(message.Sender)
	return NormalizedInboundContextMessage{
		MessageID:   strings.TrimSpace(stringValue(message.MessageId)),
		ChannelID:   strings.TrimSpace(stringValue(message.ChatId)),
		SenderID:    senderID,
		SenderType:  senderType,
		ChatType:    strings.TrimSpace(defaultChatType),
		ThreadID:    strings.TrimSpace(stringValue(message.ThreadId)),
		ParentID:    strings.TrimSpace(stringValue(message.ParentId)),
		RootID:      strings.TrimSpace(stringValue(message.RootId)),
		MessageType: messageType,
		Message:     messageText,
		ContentJSON: contentJSON,
		Mentions:    mentions,
	}, true, nil
}

func messageBodyContent(body *larkim.MessageBody) string {
	if body == nil || body.Content == nil {
		return ""
	}
	return strings.TrimSpace(*body.Content)
}

func normalizeFeishuSender(sender *larkim.Sender) (string, string) {
	if sender == nil {
		return "", ""
	}
	return strings.TrimSpace(stringValue(sender.Id)), strings.TrimSpace(stringValue(sender.SenderType))
}

func normalizeFeishuMessageMentions(raw []*larkim.Mention) []NormalizedInboundMention {
	if len(raw) == 0 {
		return nil
	}
	mentions := make([]NormalizedInboundMention, 0, len(raw))
	for _, item := range raw {
		if item == nil {
			continue
		}
		mention := NormalizedInboundMention{
			Key:       stringValue(item.Key),
			OpenID:    stringValue(item.Id),
			Name:      stringValue(item.Name),
			TenantKey: stringValue(item.TenantKey),
		}
		if mention.Key == "" && mention.OpenID == "" && mention.Name == "" && mention.TenantKey == "" {
			continue
		}
		mentions = append(mentions, mention)
	}
	if len(mentions) == 0 {
		return nil
	}
	return mentions
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
