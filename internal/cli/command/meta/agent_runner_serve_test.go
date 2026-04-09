package meta

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
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

	reply, err := client.InboundIMChat(context.Background(), "feishu", "cli_appid", "oc_chat", "ou_sender", "帮我看这个 bug")
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
	if gotBody["sender_id"] != "ou_sender" {
		t.Fatalf("expected sender_id ou_sender, got %v", gotBody["sender_id"])
	}
	if gotBody["message"] != "帮我看这个 bug" {
		t.Fatalf("expected message text, got %v", gotBody["message"])
	}
}
