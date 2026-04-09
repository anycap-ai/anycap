package im

import (
	"testing"

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
