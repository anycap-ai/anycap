package meta

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestRunnerServeHTTPClientInboundIMChat(t *testing.T) {
	var gotBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/im/inbound" || r.Method != http.MethodPost {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer sk-agent-test" {
			t.Fatalf("expected bearer auth, got %q", r.Header.Get("Authorization"))
		}
		if err := json.NewDecoder(r.Body).Decode(&gotBody); err != nil {
			t.Fatalf("json.Decode() error = %v", err)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"reply_message":"会话已接收，正在处理中"}}`))
	}))
	defer server.Close()

	client := &runnerServeHTTPClient{
		client: httpclient.New(server.URL, httpclient.WithCredential(cliconfig.NewAPIKeyCredential("sk-agent-test"))),
	}

	reply, err := client.InboundIMChat(context.Background(), "feishu", "cli_appid", "oc_chat", "om_message", "ou_sender", "帮我看这个 bug")
	if err != nil {
		t.Fatalf("InboundIMChat() error = %v", err)
	}
	if reply != "会话已接收，正在处理中" {
		t.Fatalf("expected reply message, got %q", reply)
	}
	if gotBody["platform"] != "feishu" {
		t.Fatalf("expected platform feishu, got %v", gotBody["platform"])
	}
	if gotBody["bot_id"] != "cli_appid" {
		t.Fatalf("expected bot_id cli_appid, got %v", gotBody["bot_id"])
	}
	if gotBody["chat_id"] != "oc_chat" {
		t.Fatalf("expected chat_id oc_chat, got %v", gotBody["chat_id"])
	}
	if gotBody["message_id"] != "om_message" {
		t.Fatalf("expected message_id om_message, got %v", gotBody["message_id"])
	}
	if gotBody["sender_id"] != "ou_sender" {
		t.Fatalf("expected sender_id ou_sender, got %v", gotBody["sender_id"])
	}
	if gotBody["message"] != "帮我看这个 bug" {
		t.Fatalf("expected message text, got %v", gotBody["message"])
	}
}

func TestRunnerServeHTTPClientUpdateSessionRequestsClientOwnedReply(t *testing.T) {
	var gotBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/runners/run_123/sessions/ags_123" || r.Method != http.MethodPost {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		if err := json.NewDecoder(r.Body).Decode(&gotBody); err != nil {
			t.Fatalf("json.Decode() error = %v", err)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123","status":"committed","outbound_reply":{"platform":"feishu","bot_id":"cli_personal_bot","channel_id":"oc_chat","sender_id":"ou_owner","message":"hello back","idempotency_key":"ags_123:committed"}}}`))
	}))
	defer server.Close()

	client := &runnerServeHTTPClient{
		client:        httpclient.New(server.URL, httpclient.WithCredential(cliconfig.NewAPIKeyCredential("sk-agent-test"))),
		replyDelivery: "client",
	}
	finalMessage := "hello back"
	executorRef := "codex-exec"
	result, err := client.UpdateSession(context.Background(), "run_123", "ags_123", "committed", &finalMessage, &executorRef, "ags_123:committed")
	if err != nil {
		t.Fatalf("UpdateSession() error = %v", err)
	}
	if gotBody["status"] != "committed" {
		t.Fatalf("expected status committed, got %v", gotBody["status"])
	}
	if gotBody["final_message"] != "hello back" {
		t.Fatalf("expected final message, got %v", gotBody["final_message"])
	}
	if gotBody["executor_ref"] != "codex-exec" {
		t.Fatalf("expected executor ref, got %v", gotBody["executor_ref"])
	}
	if gotBody["reply_delivery"] != "client" {
		t.Fatalf("expected client reply delivery, got %v", gotBody["reply_delivery"])
	}
	if result == nil || result.OutboundReply == nil {
		t.Fatalf("expected outbound reply result, got %+v", result)
	}
	if result.OutboundReply.Message != "hello back" || result.OutboundReply.ChannelID != "oc_chat" {
		t.Fatalf("unexpected outbound reply %+v", result.OutboundReply)
	}
}

func TestAgentRunnerServeDefaultsCodexExecModeToSafe(t *testing.T) {
	cmd := newAgentRunnerServeCmd(func() *httpclient.Client { return nil }, nil)
	got, err := cmd.Flags().GetString("codex-exec-mode")
	if err != nil {
		t.Fatalf("GetString(codex-exec-mode) error = %v", err)
	}
	if strings.TrimSpace(got) != "safe" {
		t.Fatalf("expected default codex exec mode safe, got %q", got)
	}
}
