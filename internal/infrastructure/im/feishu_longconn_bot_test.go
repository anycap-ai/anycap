package im

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestFeishuLongConnBot_NormalizeEvent(t *testing.T) {
	bot := &FeishuLongConnBot{appID: "cli_appid"}

	openID := "ou_sender"
	senderType := "user"
	msgType := "text"
	chatID := "oc_chat"
	chatType := "p2p"
	messageID := "om_message"
	threadID := "omt_thread"
	parentID := "om_parent"
	rootID := "om_root"
	mentionKey := "@_user_1"
	mentionName := "赵晨"
	mentionOpenID := "ou_target"
	content := `{"text":"帮 @_user_1 看这个 bug"}`

	event := &larkim.P2MessageReceiveV1{
		Event: &larkim.P2MessageReceiveV1Data{
			Sender: &larkim.EventSender{
				SenderId:   &larkim.UserId{OpenId: &openID},
				SenderType: &senderType,
			},
			Message: &larkim.EventMessage{
				MessageId:   &messageID,
				ChatId:      &chatID,
				ChatType:    &chatType,
				ThreadId:    &threadID,
				ParentId:    &parentID,
				RootId:      &rootID,
				MessageType: &msgType,
				Content:     &content,
				Mentions: []*larkim.MentionEvent{
					{
						Key:  &mentionKey,
						Name: &mentionName,
						Id:   &larkim.UserId{OpenId: &mentionOpenID},
					},
				},
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
	if normalized.MessageID != "om_message" {
		t.Fatalf("expected message id om_message, got %q", normalized.MessageID)
	}
	if normalized.SenderID != "ou_sender" {
		t.Fatalf("expected sender ou_sender, got %q", normalized.SenderID)
	}
	if normalized.ChatType != "p2p" {
		t.Fatalf("expected chat type p2p, got %q", normalized.ChatType)
	}
	if normalized.ThreadID != "omt_thread" || normalized.ParentID != "om_parent" || normalized.RootID != "om_root" {
		t.Fatalf("expected thread/parent/root ids, got %+v", normalized)
	}
	if normalized.Message != "帮 @赵晨 看这个 bug" {
		t.Fatalf("expected message content, got %q", normalized.Message)
	}
	if len(normalized.Mentions) != 1 {
		t.Fatalf("expected one mention, got %+v", normalized.Mentions)
	}
	if normalized.Mentions[0].OpenID != "ou_target" || normalized.Mentions[0].Name != "赵晨" {
		t.Fatalf("unexpected mention %+v", normalized.Mentions[0])
	}
	rendered := normalized.AgentInputText()
	if !strings.Contains(rendered, `<feishu-message message_id="om_message" chat_id="oc_chat" chat_type="p2p" message_type="text" sender_open_id="ou_sender" thread_id="omt_thread" parent_id="om_parent" root_id="om_root">`) {
		t.Fatalf("expected structured message header, got %s", rendered)
	}
	if !strings.Contains(rendered, `<mention key="@_user_1" open_id="ou_target" name="赵晨" />`) {
		t.Fatalf("expected mention xml, got %s", rendered)
	}
	if !strings.Contains(rendered, "帮 @赵晨 看这个 bug") {
		t.Fatalf("expected structured message body, got %s", rendered)
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

func TestFeishuLongConnBot_HandleNormalizedEventUsesReactionAck(t *testing.T) {
	var (
		replyCalls int
		gotEmoji   string
		gotMsgID   string
	)
	replyAPI := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		replyCalls++
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
			return "会话已接收，正在处理中", nil
		},
		SelectReaction: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			return "OnIt", nil
		},
		SendReaction: func(ctx context.Context, binding model.IMBinding, messageID string, emojiType string) error {
			gotMsgID = messageID
			gotEmoji = emojiType
			return nil
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
		MessageID: "om_message",
		Message:   "帮我看这个 bug",
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if gotMsgID != "om_message" || gotEmoji != "OnIt" {
		t.Fatalf("expected reaction OnIt on om_message, got message_id=%q emoji=%q", gotMsgID, gotEmoji)
	}
	if replyCalls != 0 {
		t.Fatalf("expected no text reply when reaction ack succeeds, got %d", replyCalls)
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventFallsBackToTextWhenReactionFails(t *testing.T) {
	var (
		gotReplyBody map[string]string
		reactionRuns int
	)
	replyAPI := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
			return "会话已接收，正在处理中", nil
		},
		SelectReaction: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			return "OnIt", nil
		},
		SendReaction: func(ctx context.Context, binding model.IMBinding, messageID string, emojiType string) error {
			reactionRuns++
			return context.DeadlineExceeded
		},
	})

	err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:  model.IMPlatformFeishu,
		BotID:     "cli_appid",
		ChannelID: "oc_chat",
		SenderID:  "ou_sender",
		MessageID: "om_message",
		Message:   "帮我看这个 bug",
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if reactionRuns != 1 {
		t.Fatalf("expected reaction path once, got %d", reactionRuns)
	}
	if strings.TrimSpace(gotReplyBody["message"]) != "会话已接收，正在处理中" {
		t.Fatalf("expected fallback text reply, got %+v", gotReplyBody)
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventKeepsTextReplyForCommands(t *testing.T) {
	var (
		gotReplyBody map[string]string
		reactionRuns int
	)
	replyAPI := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
			return "会话已接收，正在处理中", nil
		},
		SelectReaction: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			reactionRuns++
			return "OnIt", nil
		},
		SendReaction: func(ctx context.Context, binding model.IMBinding, messageID string, emojiType string) error {
			reactionRuns++
			return nil
		},
	})

	err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:  model.IMPlatformFeishu,
		BotID:     "cli_appid",
		ChannelID: "oc_chat",
		SenderID:  "ou_sender",
		MessageID: "om_message",
		Message:   "/reset",
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if reactionRuns != 0 {
		t.Fatalf("expected commands to skip reaction path, got %d calls", reactionRuns)
	}
	if strings.TrimSpace(gotReplyBody["message"]) != "会话已接收，正在处理中" {
		t.Fatalf("expected command text reply, got %+v", gotReplyBody)
	}
}
