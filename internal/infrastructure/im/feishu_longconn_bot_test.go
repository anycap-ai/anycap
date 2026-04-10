package im

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

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
	if !strings.Contains(rendered, `<feishu-message message_id="om_message" chat_id="oc_chat" chat_type="p2p" message_type="text" sender_open_id="ou_sender" sender_type="user" thread_id="omt_thread" parent_id="om_parent" root_id="om_root">`) {
		t.Fatalf("expected structured message header, got %s", rendered)
	}
	if !strings.Contains(rendered, `<mention key="@_user_1" open_id="ou_target" name="赵晨" />`) {
		t.Fatalf("expected mention xml, got %s", rendered)
	}
	if !strings.Contains(rendered, "帮 @赵晨 看这个 bug") {
		t.Fatalf("expected structured message body, got %s", rendered)
	}
}

func TestFeishuLongConnBot_NormalizeEventAcceptsNonText(t *testing.T) {
	bot := &FeishuLongConnBot{appID: "cli_appid"}

	openID := "ou_sender"
	senderType := "user"
	msgType := "image"
	chatID := "oc_chat"
	chatType := "p2p"
	messageID := "om_image"
	content := `{"image_key":"img_123"}`

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
		t.Fatal("expected normalizeEvent() to accept non-text message")
	}
	if normalized.MessageType != "image" {
		t.Fatalf("expected image message type, got %q", normalized.MessageType)
	}
	if normalized.ContentJSON != `{"image_key":"img_123"}` {
		t.Fatalf("expected content json, got %q", normalized.ContentJSON)
	}
	if normalized.Message != "User sent a Feishu image message. Inspect content_json for resource identifiers." {
		t.Fatalf("unexpected synthetic non-text message %q", normalized.Message)
	}
	rendered := normalized.AgentInputText()
	if !strings.Contains(rendered, `<resource_notice>User sent a Feishu image message. Inspect content_json for resource identifiers.</resource_notice>`) {
		t.Fatalf("expected resource notice, got %s", rendered)
	}
	if !strings.Contains(rendered, `<content_json>{&#34;image_key&#34;:&#34;img_123&#34;}</content_json>`) {
		t.Fatalf("expected content json block, got %s", rendered)
	}
}

func TestNormalizedInboundEventAgentInputTextIncludesQuotedAndHistory(t *testing.T) {
	event := NormalizedInboundEvent{
		ChannelID:   "oc_chat",
		MessageID:   "om_text",
		SenderID:    "ou_sender",
		ChatType:    "p2p",
		ThreadID:    "omt_thread",
		ParentID:    "om_parent",
		RootID:      "om_root",
		MessageType: "text",
		Message:     "看看这个图",
		QuotedMessage: &NormalizedInboundContextMessage{
			MessageID:   "om_parent",
			ChannelID:   "oc_chat",
			SenderID:    "ou_sender",
			SenderType:  "user",
			ChatType:    "p2p",
			MessageType: "image",
			Message:     "User sent a Feishu image message. Inspect content_json for resource identifiers.",
			ContentJSON: `{"image_key":"img_123"}`,
		},
		ThreadHistory: []NormalizedInboundContextMessage{
			{
				MessageID:   "om_thread_1",
				ChannelID:   "oc_chat",
				SenderID:    "cli_appid",
				SenderType:  "app",
				ChatType:    "p2p",
				MessageType: "text",
				Message:     "先把图发我。",
			},
		},
		ChatHistory: []NormalizedInboundContextMessage{
			{
				MessageID:   "om_chat_1",
				ChannelID:   "oc_chat",
				SenderID:    "ou_sender",
				SenderType:  "user",
				ChatType:    "p2p",
				MessageType: "image",
				Message:     "User sent a Feishu image message. Inspect content_json for resource identifiers.",
				ContentJSON: `{"image_key":"img_123"}`,
			},
		},
	}

	rendered := event.AgentInputText()
	if !strings.Contains(rendered, "<feishu-context>") {
		t.Fatalf("expected feishu-context wrapper, got %s", rendered)
	}
	if !strings.Contains(rendered, "<quoted_message>") {
		t.Fatalf("expected quoted_message block, got %s", rendered)
	}
	if !strings.Contains(rendered, `<file_info type="image" image_key="img_123" />`) {
		t.Fatalf("expected file info block, got %s", rendered)
	}
	if !strings.Contains(rendered, `<message role="assistant" message_id="om_thread_1"`) {
		t.Fatalf("expected assistant thread history entry, got %s", rendered)
	}
	if !strings.Contains(rendered, `<chat_history>`) {
		t.Fatalf("expected chat_history block, got %s", rendered)
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

func TestFeishuLongConnBot_HandleNormalizedEventEnrichesQuotedAndHistoryContext(t *testing.T) {
	var gotEvent NormalizedInboundEvent
	adapter := NewFeishuAdapter(FeishuAdapterConfig{})
	adapter.getMessage = func(ctx context.Context, messageID string) (*larkim.Message, error) {
		if messageID != "om_parent" {
			t.Fatalf("unexpected quoted message id %q", messageID)
		}
		return buildHistoryMessage("om_parent", "oc_chat", "ou_sender", "user", "image", `{"image_key":"img_123"}`), nil
	}
	adapter.listMessages = func(ctx context.Context, containerType string, containerID string, limit int) ([]*larkim.Message, error) {
		switch {
		case containerType == "thread" && containerID == "omt_thread":
			return []*larkim.Message{
				buildHistoryMessage("om_text", "oc_chat", "ou_sender", "user", "text", `{"text":"看看这个图"}`),
				buildHistoryMessage("om_thread_1", "oc_chat", "cli_appid", "app", "text", `{"text":"先把图发我。"}`),
			}, nil
		case containerType == "chat" && containerID == "oc_chat":
			return []*larkim.Message{
				buildHistoryMessage("om_chat_1", "oc_chat", "ou_sender", "user", "image", `{"image_key":"img_123"}`),
				buildHistoryMessage("om_text", "oc_chat", "ou_sender", "user", "text", `{"text":"看看这个图"}`),
			}, nil
		default:
			t.Fatalf("unexpected list request type=%q id=%q limit=%d", containerType, containerID, limit)
			return nil, nil
		}
	}

	bot := NewFeishuLongConnBot(FeishuLongConnBotConfig{
		AppID:     "cli_appid",
		AppSecret: "app_secret",
		Adapter:   adapter,
		HandleInbound: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			gotEvent = event
			return "", nil
		},
	})
	if bot == nil {
		t.Fatal("expected bot to be constructed")
	}

	err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		SenderID:    "ou_sender",
		MessageID:   "om_text",
		ChatType:    "p2p",
		ThreadID:    "omt_thread",
		ParentID:    "om_parent",
		MessageType: "text",
		Message:     "看看这个图",
	})
	if err != nil {
		t.Fatalf("handleNormalizedEvent() error = %v", err)
	}
	if gotEvent.QuotedMessage == nil || gotEvent.QuotedMessage.MessageID != "om_parent" {
		t.Fatalf("expected quoted message enrichment, got %+v", gotEvent.QuotedMessage)
	}
	if len(gotEvent.ThreadHistory) != 1 || gotEvent.ThreadHistory[0].MessageID != "om_thread_1" {
		t.Fatalf("expected thread history enrichment, got %+v", gotEvent.ThreadHistory)
	}
	if len(gotEvent.ChatHistory) != 1 || gotEvent.ChatHistory[0].MessageID != "om_chat_1" {
		t.Fatalf("expected chat history enrichment, got %+v", gotEvent.ChatHistory)
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventSendsTextReply(t *testing.T) {
	var replyCalls int
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
	if replyCalls != 1 {
		t.Fatalf("expected one text reply, got %d", replyCalls)
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventBurstMergesConsecutiveTextMessages(t *testing.T) {
	var (
		mu       sync.Mutex
		received []NormalizedInboundEvent
		done     = make(chan struct{}, 2)
	)
	adapter := NewFeishuAdapter(FeishuAdapterConfig{})
	adapter.listMessages = func(ctx context.Context, containerType string, containerID string, limit int) ([]*larkim.Message, error) {
		if containerType != "chat" || containerID != "oc_chat" {
			return nil, nil
		}
		return []*larkim.Message{
			buildHistoryMessage("om_1", "oc_chat", "ou_sender", "user", "text", `{"text":"你这样吧"}`),
			buildHistoryMessage("om_2", "oc_chat", "ou_sender", "user", "text", `{"text":"你说下原因"}`),
		}, nil
	}
	bot := NewFeishuLongConnBot(FeishuLongConnBotConfig{
		AppID:           "cli_appid",
		AppSecret:       "app_secret",
		Adapter:         adapter,
		TurnMergeWindow: 20 * time.Millisecond,
		HandleInbound: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			mu.Lock()
			received = append(received, event)
			mu.Unlock()
			done <- struct{}{}
			return "", nil
		},
	})
	if bot == nil {
		t.Fatal("expected bot to be constructed")
	}

	if err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		SenderID:    "ou_sender",
		MessageID:   "om_1",
		ChatType:    "p2p",
		MessageType: "text",
		Message:     "你这样吧",
	}); err != nil {
		t.Fatalf("first handleNormalizedEvent() error = %v", err)
	}
	if err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		SenderID:    "ou_sender",
		MessageID:   "om_2",
		ChatType:    "p2p",
		MessageType: "text",
		Message:     "你说下原因",
	}); err != nil {
		t.Fatalf("second handleNormalizedEvent() error = %v", err)
	}

	select {
	case <-done:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected merged inbound event to be dispatched")
	}
	time.Sleep(60 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected one merged inbound event, got %d", len(received))
	}
	if received[0].MessageID != "om_2" || received[0].Message != "你说下原因" {
		t.Fatalf("expected latest text event to be dispatched, got %+v", received[0])
	}
	if len(received[0].ChatHistory) != 1 || received[0].ChatHistory[0].MessageID != "om_1" {
		t.Fatalf("expected first text to appear in chat history, got %+v", received[0].ChatHistory)
	}
}

func TestFeishuLongConnBot_HandleNormalizedEventBurstMergesImageThenText(t *testing.T) {
	var (
		mu       sync.Mutex
		received []NormalizedInboundEvent
		done     = make(chan struct{}, 2)
	)
	adapter := NewFeishuAdapter(FeishuAdapterConfig{})
	adapter.listMessages = func(ctx context.Context, containerType string, containerID string, limit int) ([]*larkim.Message, error) {
		if containerType != "chat" || containerID != "oc_chat" {
			return nil, nil
		}
		return []*larkim.Message{
			buildHistoryMessage("om_image", "oc_chat", "ou_sender", "user", "image", `{"image_key":"img_123"}`),
			buildHistoryMessage("om_text", "oc_chat", "ou_sender", "user", "text", `{"text":"看看这个图"}`),
		}, nil
	}
	bot := NewFeishuLongConnBot(FeishuLongConnBotConfig{
		AppID:           "cli_appid",
		AppSecret:       "app_secret",
		Adapter:         adapter,
		TurnMergeWindow: 20 * time.Millisecond,
		HandleInbound: func(ctx context.Context, event NormalizedInboundEvent) (string, error) {
			mu.Lock()
			received = append(received, event)
			mu.Unlock()
			done <- struct{}{}
			return "", nil
		},
	})
	if bot == nil {
		t.Fatal("expected bot to be constructed")
	}

	if err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		SenderID:    "ou_sender",
		MessageID:   "om_image",
		ChatType:    "p2p",
		MessageType: "image",
		Message:     "User sent a Feishu image message. Inspect content_json for resource identifiers.",
		ContentJSON: `{"image_key":"img_123"}`,
	}); err != nil {
		t.Fatalf("image handleNormalizedEvent() error = %v", err)
	}
	if err := bot.handleNormalizedEvent(context.Background(), NormalizedInboundEvent{
		Platform:    model.IMPlatformFeishu,
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		SenderID:    "ou_sender",
		MessageID:   "om_text",
		ChatType:    "p2p",
		MessageType: "text",
		Message:     "看看这个图",
	}); err != nil {
		t.Fatalf("text handleNormalizedEvent() error = %v", err)
	}

	select {
	case <-done:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected merged media burst to be dispatched")
	}
	time.Sleep(60 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected one merged inbound event, got %d", len(received))
	}
	if received[0].MessageID != "om_text" || received[0].Message != "看看这个图" {
		t.Fatalf("expected text event to be dispatched, got %+v", received[0])
	}
	if len(received[0].ChatHistory) != 1 || received[0].ChatHistory[0].MessageType != "image" {
		t.Fatalf("expected image to remain in chat history, got %+v", received[0].ChatHistory)
	}
}

func buildHistoryMessage(messageID, chatID, senderID, senderType, messageType, content string) *larkim.Message {
	return &larkim.Message{
		MessageId: ptrString(messageID),
		ChatId:    ptrString(chatID),
		MsgType:   ptrString(messageType),
		Sender: &larkim.Sender{
			Id: ptrString(senderID),
			IdType: ptrString(func() string {
				if senderType == "app" {
					return "app_id"
				}
				return "open_id"
			}()),
			SenderType: ptrString(senderType),
		},
		Body: &larkim.MessageBody{
			Content: ptrString(content),
		},
	}
}
