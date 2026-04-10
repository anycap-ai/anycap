package meta

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
)

type stubDaemonIMBot struct{}

func (stubDaemonIMBot) Run(ctx context.Context) error {
	<-ctx.Done()
	return nil
}

func TestAgentDaemonStartBuildsLocalFeishuBotWhenCredentialsProvided(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	originalBuild := buildDaemonIMBot
	defer func() { buildDaemonIMBot = originalBuild }()

	var (
		buildCalls int
		gotCfg     im.FeishuLongConnBotConfig
	)
	buildDaemonIMBot = func(cfg im.FeishuLongConnBotConfig) daemonIMBot {
		buildCalls++
		gotCfg = cfg
		return stubDaemonIMBot{}
	}

	var inboundBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/register" && r.Method == http.MethodPost:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"local-mac","platform":"feishu","state":"idle","created_at":"2026-04-09T12:00:00Z","updated_at":"2026-04-09T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/claim-primary" && r.Method == http.MethodPost:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"local-mac","platform":"feishu","state":"idle","created_at":"2026-04-09T12:00:00Z","updated_at":"2026-04-09T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/heartbeat" && r.Method == http.MethodPost:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/next" && r.Method == http.MethodGet:
			w.WriteHeader(http.StatusNoContent)
		case r.URL.Path == "/v1/agent/runners/run_123/tasks/next" && r.Method == http.MethodGet:
			w.WriteHeader(http.StatusNoContent)
		case r.URL.Path == "/v1/agent/im/inbound" && r.Method == http.MethodPost:
			if err := json.NewDecoder(r.Body).Decode(&inboundBody); err != nil {
				t.Fatalf("json.Decode() error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"reply_message":"会话已接收，正在处理中"}}`))
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()

	clientFactory := func() *httpclient.Client {
		return httpclient.New(server.URL, httpclient.WithCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")))
	}
	stdout := &bytes.Buffer{}
	cmd := newAgentDaemonCmd(clientFactory, stdout)
	cmd.SetArgs([]string{
		"start",
		"--name", "local-mac",
		"--platform", "feishu",
		"--feishu-app-id", "cli_appid",
		"--feishu-app-secret", "app_secret",
		"--once",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("daemon start: %v", err)
	}
	if buildCalls != 1 {
		t.Fatalf("expected local feishu bot to be built once, got %d", buildCalls)
	}
	if gotCfg.AppID != "cli_appid" {
		t.Fatalf("expected app id cli_appid, got %q", gotCfg.AppID)
	}
	if gotCfg.AppSecret != "app_secret" {
		t.Fatalf("expected app secret app_secret, got %q", gotCfg.AppSecret)
	}
	if gotCfg.Adapter == nil {
		t.Fatal("expected feishu adapter in bot config")
	}
	if gotCfg.SelectReaction == nil {
		t.Fatal("expected daemon personal bot config to include reaction selector")
	}
	if gotCfg.SendReaction == nil {
		t.Fatal("expected daemon personal bot config to include reaction sender")
	}
	replyMessage, err := gotCfg.HandleInbound(context.Background(), im.NormalizedInboundEvent{
		Platform:    "feishu",
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		SenderID:    "ou_sender",
		MessageID:   "om_message",
		ChatType:    "p2p",
		ThreadID:    "omt_thread",
		ParentID:    "om_parent",
		RootID:      "om_root",
		MessageType: "text",
		Message:     "帮 @赵晨 看这个 bug",
		Mentions: []im.NormalizedInboundMention{
			{Key: "@_user_1", OpenID: "ou_target", Name: "赵晨"},
		},
	})
	if err != nil {
		t.Fatalf("HandleInbound() error = %v", err)
	}
	if replyMessage != "会话已接收，正在处理中" {
		t.Fatalf("unexpected inbound reply %q", replyMessage)
	}
	message, _ := inboundBody["message"].(string)
	if !strings.Contains(message, `<feishu-message message_id="om_message" chat_id="oc_chat" chat_type="p2p" message_type="text" sender_open_id="ou_sender" sender_type="user" thread_id="omt_thread" parent_id="om_parent" root_id="om_root">`) {
		t.Fatalf("expected structured message payload, got %v", inboundBody["message"])
	}
	if !strings.Contains(message, "帮 @赵晨 看这个 bug") {
		t.Fatalf("expected structured message body, got %v", inboundBody["message"])
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	if !strings.Contains(stdout.String(), `"connected":true`) {
		t.Fatalf("expected connected output, got %s", stdout.String())
	}
}

func TestMessageForInboundChatKeepsRawCommandText(t *testing.T) {
	event := im.NormalizedInboundEvent{
		Message:   "/reset",
		ChatType:  "p2p",
		ThreadID:  "omt_thread",
		MessageID: "om_message",
	}
	if got := messageForInboundChat(event); got != "/reset" {
		t.Fatalf("expected raw command text, got %q", got)
	}
}

func TestMessageForInboundChatBuildsStructuredPayloadForNonTextMessage(t *testing.T) {
	event := im.NormalizedInboundEvent{
		Platform:    "feishu",
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		MessageID:   "om_image",
		SenderID:    "ou_sender",
		ChatType:    "p2p",
		MessageType: "image",
		Message:     "User sent a Feishu image message. Inspect content_json for resource identifiers.",
		ContentJSON: `{"image_key":"img_123"}`,
	}
	got := messageForInboundChat(event)
	if !strings.Contains(got, `<feishu-message message_id="om_image" chat_id="oc_chat" chat_type="p2p" message_type="image" sender_open_id="ou_sender" sender_type="user">`) {
		t.Fatalf("expected structured non-text payload, got %q", got)
	}
	if !strings.Contains(got, `<file_info type="image" image_key="img_123" />`) {
		t.Fatalf("expected file_info block, got %q", got)
	}
	if !strings.Contains(got, `<content_json>{&#34;image_key&#34;:&#34;img_123&#34;}</content_json>`) {
		t.Fatalf("expected content_json block, got %q", got)
	}
}

func TestMessageForInboundChatBuildsFeishuContextWhenQuotedMessageExists(t *testing.T) {
	event := im.NormalizedInboundEvent{
		Platform:    "feishu",
		BotID:       "cli_appid",
		ChannelID:   "oc_chat",
		MessageID:   "om_text",
		SenderID:    "ou_sender",
		ChatType:    "p2p",
		MessageType: "text",
		Message:     "看看这个图",
		QuotedMessage: &im.NormalizedInboundContextMessage{
			MessageID:   "om_image",
			ChannelID:   "oc_chat",
			SenderID:    "ou_sender",
			SenderType:  "user",
			ChatType:    "p2p",
			MessageType: "image",
			Message:     "User sent a Feishu image message. Inspect content_json for resource identifiers.",
			ContentJSON: `{"image_key":"img_123"}`,
		},
	}
	got := messageForInboundChat(event)
	if !strings.Contains(got, "<feishu-context>") {
		t.Fatalf("expected feishu-context wrapper, got %q", got)
	}
	if !strings.Contains(got, "<quoted_message>") {
		t.Fatalf("expected quoted message block, got %q", got)
	}
}

func TestAgentDaemonStartBackgroundSpawnsProcessAndReportsLocalState(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	originalExecutable := daemonExecutable
	originalSpawn := spawnDaemonProcess
	originalExists := daemonProcessRunning
	defer func() {
		daemonExecutable = originalExecutable
		spawnDaemonProcess = originalSpawn
		daemonProcessRunning = originalExists
	}()

	daemonExecutable = func() (string, error) {
		return "/tmp/anycap", nil
	}
	daemonProcessRunning = func(pid int) bool {
		return pid == 4321
	}
	spawnDaemonProcess = func(executable string, args []string, logPath string) (int, error) {
		if executable != "/tmp/anycap" {
			t.Fatalf("unexpected executable %q", executable)
		}
		if !strings.Contains(strings.Join(args, " "), "agent daemon start --foreground") {
			t.Fatalf("expected foreground daemon args, got %v", args)
		}
		if !strings.Contains(strings.Join(args, " "), "--codex-exec-mode danger-full-access") {
			t.Fatalf("expected codex exec mode in args, got %v", args)
		}
		if err := saveDaemonProcessState(daemonProcessState{
			PID:         4321,
			Platform:    "feishu",
			RunnerID:    "run_local",
			MachineName: "local-agent",
			Executor:    "codex",
			Workspace:   "/repo",
			LogPath:     logPath,
		}); err != nil {
			t.Fatalf("saveDaemonProcessState() error = %v", err)
		}
		return 4321, nil
	}

	stdout := &bytes.Buffer{}
	cmd := newAgentDaemonCmd(func() *httpclient.Client { return nil }, stdout)
	cmd.SetArgs([]string{"start", "--platform", "feishu", "--workspace", "/repo", "--codex-exec-mode", "danger-full-access"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("daemon start background: %v", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	data := payload["data"].(map[string]any)
	daemon := data["daemon"].(map[string]any)
	if daemon["pid"].(float64) != 4321 {
		t.Fatalf("expected pid 4321, got %v", daemon["pid"])
	}
	if strings.TrimSpace(daemon["log_path"].(string)) == "" {
		t.Fatalf("expected log_path in output, got %v", daemon)
	}
}

func TestAgentDaemonStatusFallsBackToLocalDaemonState(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	originalExists := daemonProcessRunning
	defer func() { daemonProcessRunning = originalExists }()
	daemonProcessRunning = func(pid int) bool {
		return pid == os.Getpid()
	}

	logPath := filepath.Join(tmpHome, "daemon.feishu.log")
	if err := os.WriteFile(logPath, []byte("[Info] 2026/04/10 12:00:01.000000 connected to wss://msg-frontier.feishu.cn/ws/v2?\n"), 0o600); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}
	if err := saveDaemonProcessState(daemonProcessState{
		PID:                os.Getpid(),
		Platform:           "feishu",
		RunnerID:           "run_local",
		MachineName:        "local-agent",
		Executor:           "codex",
		Workspace:          "/repo",
		LogPath:            logPath,
		StartedAt:          "2026-04-10T12:00:00Z",
		PersonalBotEnabled: true,
	}); err != nil {
		t.Fatalf("saveDaemonProcessState() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/runners/primary" || r.Method != http.MethodGet {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	clientFactory := func() *httpclient.Client {
		return httpclient.New(server.URL, httpclient.WithCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")))
	}
	stdout := &bytes.Buffer{}
	cmd := newAgentDaemonCmd(clientFactory, stdout)
	cmd.SetArgs([]string{"status", "--platform", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("daemon status: %v", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	data := payload["data"].(map[string]any)
	if connected, ok := data["connected"].(bool); !ok || !connected {
		t.Fatalf("expected connected local status, got %v", data["connected"])
	}
	machine := data["machine"].(map[string]any)
	if machine["id"] != "run_local" {
		t.Fatalf("expected runner id run_local, got %v", machine["id"])
	}
	if ready, ok := data["ready"].(bool); !ok || !ready {
		t.Fatalf("expected ready=true, got %v", data["ready"])
	}
	personalBot := data["personal_bot"].(map[string]any)
	if connected, ok := personalBot["connected"].(bool); !ok || !connected {
		t.Fatalf("expected personal bot connected, got %v", personalBot["connected"])
	}
}

func TestAgentDaemonStatusShowsPersonalBotFailureFromLocalLog(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	originalExists := daemonProcessRunning
	defer func() { daemonProcessRunning = originalExists }()
	daemonProcessRunning = func(pid int) bool {
		return pid == os.Getpid()
	}

	logPath := filepath.Join(tmpHome, "daemon.feishu.log")
	logBody := `[Error] 2026/04/10 12:00:03.000000 connect failed, err: Post "https://open.feishu.cn/callback/ws/endpoint": tls: failed to verify certificate: SecPolicyCreateSSL error: 0
`
	if err := os.WriteFile(logPath, []byte(logBody), 0o600); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}
	if err := saveDaemonProcessState(daemonProcessState{
		PID:                os.Getpid(),
		Platform:           "feishu",
		RunnerID:           "run_local",
		MachineName:        "local-agent",
		Executor:           "codex",
		Workspace:          "/repo",
		LogPath:            logPath,
		StartedAt:          "2026-04-10T12:00:00Z",
		PersonalBotEnabled: true,
	}); err != nil {
		t.Fatalf("saveDaemonProcessState() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/runners/primary" || r.Method != http.MethodGet {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	clientFactory := func() *httpclient.Client {
		return httpclient.New(server.URL, httpclient.WithCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")))
	}
	stdout := &bytes.Buffer{}
	cmd := newAgentDaemonCmd(clientFactory, stdout)
	cmd.SetArgs([]string{"status", "--platform", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("daemon status: %v", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	data := payload["data"].(map[string]any)
	if ready, ok := data["ready"].(bool); !ok || ready {
		t.Fatalf("expected ready=false, got %v", data["ready"])
	}
	if !strings.Contains(strings.TrimSpace(data["message"].(string)), "personal Feishu bot is not connected") {
		t.Fatalf("unexpected message %q", data["message"])
	}
	personalBot := data["personal_bot"].(map[string]any)
	if connected, ok := personalBot["connected"].(bool); !ok || connected {
		t.Fatalf("expected personal bot disconnected, got %v", personalBot["connected"])
	}
	if !strings.Contains(strings.TrimSpace(personalBot["last_error"].(string)), "tls: failed to verify certificate") {
		t.Fatalf("unexpected last_error %q", personalBot["last_error"])
	}
}

func TestAgentDaemonStopStopsLocalProcessAndClearsState(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	running := true
	originalExists := daemonProcessRunning
	originalStop := stopDaemon
	defer func() {
		daemonProcessRunning = originalExists
		stopDaemon = originalStop
	}()
	daemonProcessRunning = func(pid int) bool {
		return running && pid == 4321
	}
	stopDaemon = func(pid int) error {
		if pid != 4321 {
			t.Fatalf("unexpected pid %d", pid)
		}
		running = false
		return nil
	}

	if err := saveDaemonProcessState(daemonProcessState{
		PID:         4321,
		Platform:    "feishu",
		RunnerID:    "run_local",
		MachineName: "local-agent",
	}); err != nil {
		t.Fatalf("saveDaemonProcessState() error = %v", err)
	}

	stdout := &bytes.Buffer{}
	cmd := newAgentDaemonCmd(func() *httpclient.Client { return nil }, stdout)
	cmd.SetArgs([]string{"stop", "--platform", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("daemon stop: %v", err)
	}
	if state, err := loadDaemonProcessState("feishu"); err != nil {
		t.Fatalf("loadDaemonProcessState() error = %v", err)
	} else if state != nil {
		t.Fatalf("expected local daemon state to be removed, got %+v", state)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	data := payload["data"].(map[string]any)
	if stopped, ok := data["stopped"].(bool); !ok || !stopped {
		t.Fatalf("expected stopped=true, got %v", data["stopped"])
	}
}
