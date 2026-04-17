package meta

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestConnectFeishuStartsBackgroundDaemonWithAgentFlag(t *testing.T) {
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
	spawnDaemonProcess = func(executable string, args []string, env []string, logPath string) (int, error) {
		argsText := strings.Join(args, " ")
		if !strings.Contains(argsText, "agent daemon start --foreground --platform feishu") {
			t.Fatalf("expected connect to delegate to foreground daemon, got %v", args)
		}
		if !strings.Contains(argsText, "--executor claude_code") {
			t.Fatalf("expected --agent claude-code to map to daemon executor, got %v", args)
		}
		if !strings.Contains(argsText, "--workspace /repo") {
			t.Fatalf("expected workspace in daemon args, got %v", args)
		}
		if err := saveDaemonProcessState(daemonProcessState{
			PID:         4321,
			Platform:    "feishu",
			RunnerID:    "run_local",
			MachineName: "local-agent",
			Executor:    "claude_code",
			Workspace:   "/repo",
			LogPath:     logPath,
		}); err != nil {
			t.Fatalf("saveDaemonProcessState() error = %v", err)
		}
		return 4321, nil
	}

	stdout := &bytes.Buffer{}
	cmd := NewConnectCmd(func() *httpclient.Client { return nil }, strings.NewReader(""), stdout)
	cmd.SetArgs([]string{"feishu", "--agent", "claude-code", "--workspace", "/repo"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("connect feishu: %v", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	data := payload["data"].(map[string]any)
	daemon := data["daemon"].(map[string]any)
	if daemon["executor"].(string) != "claude_code" {
		t.Fatalf("expected claude_code daemon executor, got %v", daemon["executor"])
	}
}

func TestConnectFeishuStartsCursorAgentWithDefaultCursorForce(t *testing.T) {
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
	spawnDaemonProcess = func(executable string, args []string, env []string, logPath string) (int, error) {
		argsText := strings.Join(args, " ")
		if !strings.Contains(argsText, "agent daemon start --foreground --platform feishu") {
			t.Fatalf("expected connect to delegate to foreground daemon, got %v", args)
		}
		if !strings.Contains(argsText, "--executor cursor") {
			t.Fatalf("expected --agent cursor to map to daemon executor, got %v", args)
		}
		if !strings.Contains(argsText, "--cursor-bin /opt/bin/cursor-agent") {
			t.Fatalf("expected cursor bin in daemon args, got %v", args)
		}
		if !strings.Contains(argsText, "--cursor-model gpt-5") {
			t.Fatalf("expected cursor model in daemon args, got %v", args)
		}
		if !strings.Contains(argsText, "--cursor-force") {
			t.Fatalf("expected cursor force in daemon args, got %v", args)
		}
		if !strings.Contains(argsText, "--workspace /repo") {
			t.Fatalf("expected workspace in daemon args, got %v", args)
		}
		if err := saveDaemonProcessState(daemonProcessState{
			PID:         4321,
			Platform:    "feishu",
			RunnerID:    "run_local",
			MachineName: "local-agent",
			Executor:    "cursor",
			CursorForce: true,
			Workspace:   "/repo",
			LogPath:     logPath,
		}); err != nil {
			t.Fatalf("saveDaemonProcessState() error = %v", err)
		}
		return 4321, nil
	}

	stdout := &bytes.Buffer{}
	cmd := NewConnectCmd(func() *httpclient.Client { return nil }, strings.NewReader(""), stdout)
	cmd.SetArgs([]string{
		"feishu",
		"--agent", "cursor",
		"--workspace", "/repo",
		"--cursor-bin", "/opt/bin/cursor-agent",
		"--cursor-model", "gpt-5",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("connect feishu: %v", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	data := payload["data"].(map[string]any)
	daemon := data["daemon"].(map[string]any)
	if daemon["executor"].(string) != "cursor" {
		t.Fatalf("expected cursor daemon executor, got %v", daemon["executor"])
	}
	if !strings.Contains(data["warning"].(string), "Cursor Agent is running with --force") {
		t.Fatalf("expected cursor force warning, got %v", data["warning"])
	}
}

func TestConnectStatusFeishuReadsPrimaryRunner(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/primary" && r.Method == http.MethodGet && r.URL.Query().Get("platform") == "feishu":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"local-mac","platform":"feishu","state":"idle","created_at":"2026-04-09T12:00:00Z","updated_at":"2026-04-09T12:00:00Z","user_id":"u_123"}}`))
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewConnectCmd(
		func() *httpclient.Client {
			return httpclient.New(server.URL, httpclient.WithCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")))
		},
		strings.NewReader(""),
		stdout,
	)
	cmd.SetArgs([]string{"status", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("connect status feishu: %v", err)
	}
	if !strings.Contains(stdout.String(), `"connected":true`) {
		t.Fatalf("expected connected=true in output, got %s", stdout.String())
	}
	if !strings.Contains(stdout.String(), `"id":"run_123"`) {
		t.Fatalf("expected machine id in output, got %s", stdout.String())
	}
}

func TestConnectCredentialsSetFeishuStoresCredentialsFromFlags(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	stdout := &bytes.Buffer{}
	cmd := NewConnectCmd(func() *httpclient.Client { return nil }, strings.NewReader(""), stdout)
	cmd.SetArgs([]string{
		"credentials",
		"set",
		"feishu",
		"--app-id", "cli_appid",
		"--app-secret", "app_secret",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("connect credentials set feishu: %v", err)
	}
	if strings.Contains(stdout.String(), "app_secret") {
		t.Fatalf("expected output to avoid secret, got %s", stdout.String())
	}
	got, err := cliconfig.LoadAgentDaemonFeishuCredentials()
	if err != nil {
		t.Fatalf("LoadAgentDaemonFeishuCredentials() error = %v", err)
	}
	if got == nil {
		t.Fatal("expected stored credentials")
	}
	if got.AppID != "cli_appid" {
		t.Fatalf("expected app id cli_appid, got %q", got.AppID)
	}
	if got.AppSecret != "app_secret" {
		t.Fatalf("expected app secret app_secret, got %q", got.AppSecret)
	}
}
