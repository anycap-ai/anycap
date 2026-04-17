package im

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestFeishuAdapterVerifyAndNormalize(t *testing.T) {
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		VerificationToken: "verify_token",
		EncryptKey:        "encrypt_key",
	})

	body := `{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/run codex fix parser panic\"}"}}}`
	req := httptest.NewRequest(http.MethodPost, "/im/events/feishu", strings.NewReader(body))
	req.Header.Set("X-Lark-Request-Timestamp", "1710000000")
	req.Header.Set("X-Lark-Request-Nonce", "nonce-123")
	req.Header.Set("X-Lark-Signature", feishuSignature("1710000000", "nonce-123", "encrypt_key", body))

	event, err := adapter.VerifyAndNormalize(req)
	if err != nil {
		t.Fatalf("VerifyAndNormalize() error = %v", err)
	}
	if event.Platform != model.IMPlatformFeishu {
		t.Fatalf("expected feishu platform, got %q", event.Platform)
	}
	if event.BotID != "cli_bot" || event.ChannelID != "oc_chat" || event.SenderID != "ou_sender" {
		t.Fatalf("unexpected normalized ids: %+v", event)
	}
	if event.Message != "/run codex fix parser panic" {
		t.Fatalf("unexpected message %q", event.Message)
	}
}

func TestFeishuAdapterVerifyAndNormalizeRejectsInvalidSignature(t *testing.T) {
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		VerificationToken: "verify_token",
		EncryptKey:        "encrypt_key",
	})

	body := `{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/run codex fix parser panic\"}"}}}`
	req := httptest.NewRequest(http.MethodPost, "/im/events/feishu", strings.NewReader(body))
	req.Header.Set("X-Lark-Request-Timestamp", "1710000000")
	req.Header.Set("X-Lark-Request-Nonce", "nonce-123")
	req.Header.Set("X-Lark-Signature", "bad-signature")

	if _, err := adapter.VerifyAndNormalize(req); err == nil {
		t.Fatal("expected invalid signature error")
	}
}

func TestFeishuAdapterVerifyAndNormalizeHandlesURLVerification(t *testing.T) {
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		VerificationToken: "verify_token",
		EncryptKey:        "encrypt_key",
	})

	req := httptest.NewRequest(http.MethodPost, "/im/events/feishu", strings.NewReader(`{"type":"url_verification","token":"verify_token","challenge":"challenge-123"}`))
	event, err := adapter.VerifyAndNormalize(req)
	if err != nil {
		t.Fatalf("VerifyAndNormalize() error = %v", err)
	}
	if !event.IsURLVerification || event.Challenge != "challenge-123" {
		t.Fatalf("unexpected url verification event: %+v", event)
	}
}

func TestFeishuAdapterSendReplyFormatsLifecycleMessages(t *testing.T) {
	var received map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		defer r.Body.Close()
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("ReadAll() error = %v", err)
		}
		if err := json.Unmarshal(body, &received); err != nil {
			t.Fatalf("json.Unmarshal() error = %v", err)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		ReplyAPI: server.URL,
	})

	binding := model.IMBinding{
		Platform:  model.IMPlatformFeishu,
		BotID:     "cli_bot",
		ChannelID: "oc_chat",
		SenderID:  "ou_sender",
	}
	task := model.AgentTask{
		ID:           1,
		TaskText:     "fix parser panic",
		ErrorMessage: ptrString("codex exited 1"),
	}

	if err := adapter.SendAccepted(context.Background(), binding, task); err != nil {
		t.Fatalf("SendAccepted() error = %v", err)
	}
	if got := received["message"].(string); !strings.Contains(got, "已接收") || !strings.Contains(got, "fix parser panic") {
		t.Fatalf("unexpected accepted message %q", got)
	}

	if err := adapter.SendCompleted(context.Background(), binding, task); err != nil {
		t.Fatalf("SendCompleted() error = %v", err)
	}
	if got := received["message"].(string); !strings.Contains(got, "已完成") {
		t.Fatalf("unexpected completed message %q", got)
	}

	if err := adapter.SendFailure(context.Background(), binding, task); err != nil {
		t.Fatalf("SendFailure() error = %v", err)
	}
	if got := received["message"].(string); !strings.Contains(got, "失败") || !strings.Contains(got, "codex exited 1") {
		t.Fatalf("unexpected failure message %q", got)
	}
}

func TestBuildFeishuOutboundMessageUsesTextForPlainMessage(t *testing.T) {
	msgType, content, err := buildFeishuOutboundMessage("你好")
	if err != nil {
		t.Fatalf("buildFeishuOutboundMessage() error = %v", err)
	}
	if msgType != "text" {
		t.Fatalf("expected text msg type, got %q", msgType)
	}
	var payload map[string]string
	if err := json.Unmarshal([]byte(content), &payload); err != nil {
		t.Fatalf("Unmarshal(text content) error = %v", err)
	}
	if payload["text"] != "你好" {
		t.Fatalf("unexpected text payload %+v", payload)
	}
}

func TestBuildFeishuOutboundMessageUsesPostForMarkdownMessage(t *testing.T) {
	msgType, content, err := buildFeishuOutboundMessage("记得，**昨天**做了这些：\n\n- 阅读飞书文档\n- 创建 `sheet`")
	if err != nil {
		t.Fatalf("buildFeishuOutboundMessage() error = %v", err)
	}
	if msgType != "post" {
		t.Fatalf("expected post msg type, got %q content=%s", msgType, content)
	}
	var payload map[string]any
	if err := json.Unmarshal([]byte(content), &payload); err != nil {
		t.Fatalf("Unmarshal(post content) error = %v", err)
	}
	zhCN := payload["zh_cn"].(map[string]any)
	lines := zhCN["content"].([]any)
	if len(lines) != 3 {
		t.Fatalf("expected 3 rich text lines, got %#v", lines)
	}
	firstLine := lines[0].([]any)
	if firstLine[1].(map[string]any)["text"] != "昨天" {
		t.Fatalf("expected bold segment for 昨天, got %#v", firstLine)
	}
	style := firstLine[1].(map[string]any)["style"].([]any)
	if len(style) != 1 || style[0] != "bold" {
		t.Fatalf("expected bold style, got %#v", firstLine[1])
	}
	secondLine := lines[1].([]any)
	if !strings.HasPrefix(secondLine[0].(map[string]any)["text"].(string), "• ") {
		t.Fatalf("expected bullet line, got %#v", secondLine)
	}
	thirdLine := lines[2].([]any)
	if strings.Contains(thirdLine[0].(map[string]any)["text"].(string), "`") {
		t.Fatalf("expected inline code backticks to be stripped, got %#v", thirdLine)
	}
}

func feishuSignature(timestamp, nonce, encryptKey, body string) string {
	sum := sha256.Sum256([]byte(timestamp + nonce + encryptKey + body))
	return hex.EncodeToString(sum[:])
}

func ptrString(v string) *string {
	return &v
}
