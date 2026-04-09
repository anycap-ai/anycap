package im

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
)

func TestFeishuLongConnBot_NormalizeEvent(t *testing.T) {
	bot := &FeishuLongConnBot{appID: "cli_appid"}

	openID := "ou_sender"
	senderType := "user"
	msgType := "text"
	chatID := "oc_chat"
	content := `{"text":"帮我看这个 bug"}`

	event := &larkim.P2MessageReceiveV1{
		Event: &larkim.P2MessageReceiveV1Data{
			Sender: &larkim.EventSender{
				SenderId:   &larkim.UserId{OpenId: &openID},
				SenderType: &senderType,
			},
			Message: &larkim.EventMessage{
				ChatId:      &chatID,
				MessageType: &msgType,
				Content:     &content,
			},
		},
	}

	normalized, ok, err := bot.normalizeEvent(event)
	if err != nil {
		t.Fatalf("normalizeEvent() error = %v", err)
	}
	if !ok {
		t.Fatal("expected normalizeEvent() ok")
	}
	if normalized.BotID != "cli_appid" {
		t.Fatalf("expected bot id cli_appid, got %q", normalized.BotID)
	}
	if normalized.ChannelID != "oc_chat" {
		t.Fatalf("expected chat id oc_chat, got %q", normalized.ChannelID)
	}
	if normalized.SenderID != "ou_sender" {
		t.Fatalf("expected sender ou_sender, got %q", normalized.SenderID)
	}
	if normalized.Message != "帮我看这个 bug" {
		t.Fatalf("expected message content, got %q", normalized.Message)
	}
}

func TestFeishuLongConnBot_NormalizeEventSkipsNonText(t *testing.T) {
	bot := &FeishuLongConnBot{appID: "cli_appid"}

	openID := "ou_sender"
	senderType := "user"
	msgType := "image"
	chatID := "oc_chat"
	content := `{"image_key":"img_123"}`

	event := &larkim.P2MessageReceiveV1{
		Event: &larkim.P2MessageReceiveV1Data{
			Sender: &larkim.EventSender{
				SenderId:   &larkim.UserId{OpenId: &openID},
				SenderType: &senderType,
			},
			Message: &larkim.EventMessage{
				ChatId:      &chatID,
				MessageType: &msgType,
				Content:     &content,
			},
		},
	}

	_, ok, err := bot.normalizeEvent(event)
	if err != nil {
		t.Fatalf("normalizeEvent() error = %v", err)
	}
	if ok {
		t.Fatal("expected normalizeEvent() to skip non-text message")
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventUsesInboundHandler(t *testing.T) {
	var (
		gotReplyBody map[string]string
		gotEvent     NormalizedInboundEvent
	)
	replyAPI := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("unexpected method %s", r.Method)
		}
		if err := json.NewDecoder(r.Body).Decode(&gotReplyBody); err != nil {
			t.Fatalf("json.Decode() error = %v", err)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer replyAPI.Close()

	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		ReplyAPI:   replyAPI.URL,
		HTTPClient: replyAPI.Client(),
	})
	bot := NewFeishuLongConnBot(FeishuLongConnBotConfig{
		AppID:     "cli_appid",
		AppSecret: "app_secret",
		Adapter:   adapter,
		HandleInbound: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			gotEvent = event
			return "会话已接收，正在处理中", nil
		},
	})
	if bot == nil {
		t.Fatal("expected bot to be constructed")
	}

	err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:  model.IMPlatformFeishu,
		BotID:     "cli_appid",
		ChannelID: "oc_chat",
		SenderID:  "ou_sender",
		Message:   "帮我看这个 bug",
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if gotEvent.SenderID != "ou_sender" {
		t.Fatalf("expected sender ou_sender, got %+v", gotEvent)
	}
	if strings.TrimSpace(gotReplyBody["channel_id"]) != "oc_chat" {
		t.Fatalf("expected reply channel oc_chat, got %+v", gotReplyBody)
	}
	if strings.TrimSpace(gotReplyBody["message"]) != "会话已接收，正在处理中" {
		t.Fatalf("expected reply message, got %+v", gotReplyBody)
	}
}
