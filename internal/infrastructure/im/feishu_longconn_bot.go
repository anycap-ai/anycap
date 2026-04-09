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

type FeishuLongConnBotConfig struct {
	AppID               string
	AppSecret           string
	BindingService      *agentcontrolapp.BindingService
	ConversationService *agentcontrolapp.ConversationService
	Adapter             *FeishuAdapter
}

type FeishuLongConnBot struct {
	appID               string
	appSecret           string
	bindingService      *agentcontrolapp.BindingService
	conversationService *agentcontrolapp.ConversationService
	adapter             *FeishuAdapter
	client              *larkws.Client
}

func NewFeishuLongConnBot(cfg FeishuLongConnBotConfig) *FeishuLongConnBot {
	appID := strings.TrimSpace(cfg.AppID)
	appSecret := strings.TrimSpace(cfg.AppSecret)
	if appID == "" || appSecret == "" || cfg.ConversationService == nil || cfg.Adapter == nil {
		return nil
	}

	bot := &FeishuLongConnBot{
		appID:               appID,
		appSecret:           appSecret,
		bindingService:      cfg.BindingService,
		conversationService: cfg.ConversationService,
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
	if msgType := stringValue(event.Event.Message.MessageType); msgType != "" && msgType != "text" {
		return NormalizedInboundEvent{}, false, nil
	}

	var content struct {
		Text string `json:"text"`
	}
	if err := json.Unmarshal([]byte(stringValue(event.Event.Message.Content)), &content); err != nil {
		return NormalizedInboundEvent{}, false, fmt.Errorf("decode feishu long connection message: %w", err)
	}

	chatID := strings.TrimSpace(stringValue(event.Event.Message.ChatId))
	if chatID == "" {
		return NormalizedInboundEvent{}, false, nil
	}
	senderID := strings.TrimSpace(stringValue(event.Event.Sender.SenderId.OpenId))
	if senderID == "" {
		return NormalizedInboundEvent{}, false, nil
	}

	return NormalizedInboundEvent{
		Platform:  model.IMPlatformFeishu,
		BotID:     b.appID,
		ChannelID: chatID,
		SenderID:  senderID,
		Message:   strings.TrimSpace(content.Text),
	}, true, nil
}

func (b *FeishuLongConnBot) handleNormalizedEvent(ctx context.Context, event NormalizedInboundEvent) error {
	if b == nil || b.conversationService == nil {
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
		Platform: event.Platform,
		BotID:    event.BotID,
		ChatID:   event.ChannelID,
		SenderID: event.SenderID,
		Message:  event.Message,
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

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}
