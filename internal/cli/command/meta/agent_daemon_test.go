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

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	if !strings.Contains(stdout.String(), `"connected":true`) {
		t.Fatalf("expected connected output, got %s", stdout.String())
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
	cmd.SetArgs([]string{"start", "--platform", "feishu", "--workspace", "/repo"})

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
	if err := saveDaemonProcessState(daemonProcessState{
		PID:         os.Getpid(),
		Platform:    "feishu",
		RunnerID:    "run_local",
		MachineName: "local-agent",
		Executor:    "codex",
		Workspace:   "/repo",
		LogPath:     logPath,
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
