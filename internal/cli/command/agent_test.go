package command

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestAgentIMBindingTokenCreate(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	var (
		gotAuth string
		gotBody map[string]any
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/im-bindings/token" || r.Method != http.MethodPost {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		gotAuth = r.Header.Get("Authorization")
		if err := json.NewDecoder(r.Body).Decode(&gotBody); err != nil {
			t.Fatalf("json.Decode() error = %v", err)
		}
		w.Header().Set("X-Trace-ID", "trace_agent_bind_token")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"token":"bind_abc","platform":"feishu","expires_at":"2026-04-08T12:00:00Z"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "im-bindings", "token", "create", "--platform", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent im-bindings token create: %v", err)
	}
	if gotAuth != "Bearer sk-agent-test" {
		t.Fatalf("expected Authorization bearer, got %q", gotAuth)
	}
	if gotBody["platform"] != "feishu" {
		t.Fatalf("expected platform feishu, got %v", gotBody["platform"])
	}

	var output map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &output); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	if output["request_id"] != "trace_agent_bind_token" {
		t.Fatalf("expected request_id trace_agent_bind_token, got %v", output["request_id"])
	}
}

func TestAgentIMBindingsList(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/im-bindings" || r.Method != http.MethodGet {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"items":[{"id":"imb_1","platform":"feishu"}]}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "im-bindings", "list"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent im-bindings list: %v", err)
	}
	if !strings.Contains(stdout.String(), `"imb_1"`) {
		t.Fatalf("expected output to include imb_1, got %s", stdout.String())
	}
}

func TestAgentRunnersList(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/runners" || r.Method != http.MethodGet {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"items":[{"id":"run_1","name":"mac-mini"}]}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "runners", "list"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent runners list: %v", err)
	}
	if !strings.Contains(stdout.String(), `"run_1"`) {
		t.Fatalf("expected output to include run_1, got %s", stdout.String())
	}
}

func TestAgentTaskGet(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/tasks/agt_123" || r.Method != http.MethodGet {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"agt_123","status":"queued"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "task", "get", "agt_123"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent task get: %v", err)
	}
	if !strings.Contains(stdout.String(), `"agt_123"`) {
		t.Fatalf("expected output to include agt_123, got %s", stdout.String())
	}
}

func TestAgentTaskCancel(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	var gotMethod string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		if r.URL.Path != "/v1/agent/tasks/agt_123/cancel" || r.Method != http.MethodPost {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"agt_123","status":"canceled"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "task", "cancel", "agt_123"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent task cancel: %v", err)
	}
	if gotMethod != http.MethodPost {
		t.Fatalf("expected POST, got %s", gotMethod)
	}
	if !strings.Contains(stdout.String(), `"canceled"`) {
		t.Fatalf("expected output to include canceled, got %s", stdout.String())
	}
}

func TestAgentConversationsList(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/agent/conversations" || r.Method != http.MethodGet {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"items":[{"id":"agc_1","status":"active"}]}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "conversations", "list"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent conversations list: %v", err)
	}
	if !strings.Contains(stdout.String(), `"agc_1"`) {
		t.Fatalf("expected output to include agc_1, got %s", stdout.String())
	}
}

func TestAgentConversationControlCommands(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	type call struct {
		method string
		path   string
		body   map[string]any
	}
	var calls []call
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body map[string]any
		if r.Method == http.MethodPost {
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("json.Decode() error = %v", err)
			}
		}
		calls = append(calls, call{method: r.Method, path: r.URL.Path, body: body})
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"agc_1","last_session":{"status":"running"}}}`))
	}))
	defer server.Close()

	run := func(args ...string) {
		stdout := &bytes.Buffer{}
		cmd := NewRootCmd(Options{
			BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
			Endpoint:  server.URL,
			Stdout:    stdout,
			Stderr:    &bytes.Buffer{},
			Stdin:     strings.NewReader(""),
		})
		cmd.SetArgs(args)
		if err := cmd.Execute(); err != nil {
			t.Fatalf("%s: %v", strings.Join(args, " "), err)
		}
	}

	run("agent", "conversations", "get", "agc_1")
	run("agent", "conversations", "stop", "agc_1")
	run("agent", "conversations", "reset", "agc_1", "--message", "重新开始")
	run("agent", "conversations", "fork", "agc_1", "--message", "换个思路")
	run("agent", "conversations", "fire", "agc_1", "--message", "继续处理")

	if len(calls) != 5 {
		t.Fatalf("expected 5 calls, got %d", len(calls))
	}
	if calls[0].method != http.MethodGet || calls[0].path != "/v1/agent/conversations/agc_1" {
		t.Fatalf("unexpected get call: %+v", calls[0])
	}
	if calls[1].method != http.MethodPost || calls[1].path != "/v1/agent/conversations/agc_1/stop" {
		t.Fatalf("unexpected stop call: %+v", calls[1])
	}
	if calls[2].path != "/v1/agent/conversations/agc_1/reset" || calls[2].body["message"] != "重新开始" {
		t.Fatalf("unexpected reset call: %+v", calls[2])
	}
	if calls[3].path != "/v1/agent/conversations/agc_1/fork" || calls[3].body["message"] != "换个思路" {
		t.Fatalf("unexpected fork call: %+v", calls[3])
	}
	if calls[4].path != "/v1/agent/conversations/agc_1/fire" || calls[4].body["message"] != "继续处理" {
		t.Fatalf("unexpected fire call: %+v", calls[4])
	}
}

func TestAgentRunnerServeOnceRegistersPollsAndUpdatesTask(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	var (
		registerCalls         int
		heartbeatCalls        int
		nextSessionCalls      int
		sessionUpdateStatuses []string
		updateStatuses        []string
		nextTaskCalls         int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/register" && r.Method == http.MethodPost:
			registerCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"mac-mini","platform":"feishu","state":"idle","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/heartbeat" && r.Method == http.MethodPost:
			heartbeatCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/next" && r.Method == http.MethodGet:
			nextSessionCalls++
			w.WriteHeader(http.StatusNoContent)
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/ags_123" && r.Method == http.MethodPost:
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("json.Decode() error = %v", err)
			}
			sessionUpdateStatuses = append(sessionUpdateStatuses, body["status"].(string))
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/tasks/next" && r.Method == http.MethodGet:
			nextTaskCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"agt_123","runner_id":"run_123","user_id":"u_123","platform":"feishu","intent":"execute_task","task_text":"fix parser panic","status":"dispatched","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/tasks/agt_123" && r.Method == http.MethodPost:
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("json.Decode() error = %v", err)
			}
			updateStatuses = append(updateStatuses, body["status"].(string))
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"agt_123"}}`))
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "runners", "serve", "--name", "mac-mini", "--platform", "feishu", "--once"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent runners serve: %v", err)
	}
	if registerCalls != 1 {
		t.Fatalf("expected 1 register call, got %d", registerCalls)
	}
	if heartbeatCalls == 0 {
		t.Fatalf("expected heartbeat calls, got %d", heartbeatCalls)
	}
	if nextSessionCalls != 1 {
		t.Fatalf("expected 1 next session call, got %d", nextSessionCalls)
	}
	if nextTaskCalls != 1 {
		t.Fatalf("expected 1 next task call, got %d", nextTaskCalls)
	}
	if len(sessionUpdateStatuses) != 0 {
		t.Fatalf("unexpected session update statuses %+v", sessionUpdateStatuses)
	}
	if len(updateStatuses) != 2 || updateStatuses[0] != "running" || updateStatuses[1] != "succeeded" {
		t.Fatalf("unexpected update statuses %+v", updateStatuses)
	}
	if !strings.Contains(stdout.String(), `"tasks_processed":1`) {
		t.Fatalf("expected tasks_processed in output, got %s", stdout.String())
	}
}

func TestAgentRunnerServeOnceProcessesSessionWithCodexExecutor(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	workspace := t.TempDir()
	codexBin := filepath.Join(t.TempDir(), "codex-stub.sh")
	argsPath := filepath.Join(t.TempDir(), "codex-args.txt")
	script := `#!/bin/sh
printf '%s\n' "$@" > "` + argsPath + `"
out=""
cwd=""
thread_id="thread_123"
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec)
      shift
      ;;
    resume)
      thread_id="$2"
      shift 2
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    --json)
      shift
      ;;
    --cd)
      cwd="$2"
      shift 2
      ;;
    -C)
      cwd="$2"
      shift 2
      ;;
    --skip-git-repo-check)
      shift
      ;;
    -)
      shift
      break
      ;;
    *)
      shift
      ;;
  esac
done
prompt="$(cat)"
printf '{"type":"thread.started","thread_id":"%s"}\n' "$thread_id"
printf 'cwd=%s prompt=%s' "$cwd" "$prompt" > "$out"
`
	if err := os.WriteFile(codexBin, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	var (
		registerCalls        int
		heartbeatCalls       int
		nextSessionCalls     int
		getSessionCalls      int
		nextTaskCalls        int
		sessionUpdatePayload []map[string]any
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/register" && r.Method == http.MethodPost:
			registerCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"mac-mini","platform":"feishu","state":"idle","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/heartbeat" && r.Method == http.MethodPost:
			heartbeatCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/next" && r.Method == http.MethodGet:
			nextSessionCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123","conversation_id":"agc_123","runner_id":"run_123","user_id":"u_123","agent":"codex","mode":"continue","user_message":"修一下 parser panic","status":"created","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/ags_123" && r.Method == http.MethodGet:
			getSessionCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123","conversation_id":"agc_123","runner_id":"run_123","user_id":"u_123","agent":"codex","mode":"continue","status":"running","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:01Z"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/ags_123" && r.Method == http.MethodPost:
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("json.Decode() error = %v", err)
			}
			sessionUpdatePayload = append(sessionUpdatePayload, body)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/tasks/next" && r.Method == http.MethodGet:
			nextTaskCalls++
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"agent", "runners", "serve",
		"--name", "mac-mini",
		"--platform", "feishu",
		"--once",
		"--executor", "codex",
		"--codex-bin", codexBin,
		"--workspace", workspace,
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent runners serve codex: %v", err)
	}
	if registerCalls != 1 {
		t.Fatalf("expected 1 register call, got %d", registerCalls)
	}
	if heartbeatCalls == 0 {
		t.Fatalf("expected heartbeat calls, got %d", heartbeatCalls)
	}
	if nextSessionCalls != 1 {
		t.Fatalf("expected 1 next session call, got %d", nextSessionCalls)
	}
	if getSessionCalls > 1 {
		t.Fatalf("expected at most 1 get session call, got %d", getSessionCalls)
	}
	if nextTaskCalls != 0 {
		t.Fatalf("expected 0 next task calls, got %d", nextTaskCalls)
	}
	if len(sessionUpdatePayload) != 2 {
		t.Fatalf("expected 2 session updates, got %d", len(sessionUpdatePayload))
	}
	if sessionUpdatePayload[0]["status"] != "running" {
		t.Fatalf("expected first session update running, got %+v", sessionUpdatePayload[0])
	}
	if sessionUpdatePayload[1]["status"] != "committed" {
		t.Fatalf("expected second session update committed, got %+v", sessionUpdatePayload[1])
	}
	finalMessage, _ := sessionUpdatePayload[1]["final_message"].(string)
	if !strings.Contains(finalMessage, "修一下 parser panic") ||
		!strings.Contains(finalMessage, "<anycap-local-session") ||
		!strings.Contains(finalMessage, "cwd="+workspace) {
		t.Fatalf("unexpected final_message %q", finalMessage)
	}
	if sessionUpdatePayload[1]["executor_ref"] != "thread_123" {
		t.Fatalf("unexpected executor_ref %+v", sessionUpdatePayload[1]["executor_ref"])
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if !strings.Contains(argsText, "--dangerously-bypass-approvals-and-sandbox\n") {
		t.Fatalf("expected default codex executor to bypass sandbox, got %q", argsText)
	}
	if strings.Contains(argsText, "--full-auto\n") {
		t.Fatalf("expected full-auto to be absent by default, got %q", argsText)
	}
	if !strings.Contains(stdout.String(), `"executor":"codex"`) {
		t.Fatalf("expected executor codex in output, got %s", stdout.String())
	}
}

func TestAgentRunnerServeOnceResumesSessionWithExecutorRef(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	workspace := t.TempDir()
	codexBin := filepath.Join(t.TempDir(), "codex-stub.sh")
	script := `#!/bin/sh
out=""
cwd=""
thread_id="thread_new"
resume_id=""
expect_resume_id="0"
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec)
      shift
      ;;
    resume)
      expect_resume_id="1"
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    --json|--skip-git-repo-check|--full-auto|--dangerously-bypass-approvals-and-sandbox)
      shift
      ;;
    --cd|-C)
      cwd="$2"
      shift 2
      ;;
    -)
      shift
      break
      ;;
    *)
      if [ "$expect_resume_id" = "1" ]; then
        resume_id="$1"
        thread_id="$1"
        expect_resume_id="0"
      fi
      shift
      ;;
  esac
done
prompt="$(cat)"
printf '{"type":"thread.started","thread_id":"%s"}\n' "$thread_id"
printf 'cwd=%s resume=%s prompt=%s' "$cwd" "$resume_id" "$prompt" > "$out"
`
	if err := os.WriteFile(codexBin, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	var (
		sessionUpdatePayload []map[string]any
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/register" && r.Method == http.MethodPost:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"mac-mini","platform":"feishu","state":"idle","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/heartbeat" && r.Method == http.MethodPost:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/next" && r.Method == http.MethodGet:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_124","conversation_id":"agc_123","runner_id":"run_123","user_id":"u_123","agent":"codex","mode":"continue","user_message":"继续修一下 parser panic","status":"created","executor_ref":"thread_prev","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/ags_124" && r.Method == http.MethodGet:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_124","conversation_id":"agc_123","runner_id":"run_123","user_id":"u_123","agent":"codex","mode":"continue","status":"running","executor_ref":"thread_prev","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:01Z"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/ags_124" && r.Method == http.MethodPost:
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("json.Decode() error = %v", err)
			}
			sessionUpdatePayload = append(sessionUpdatePayload, body)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_124"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/tasks/next" && r.Method == http.MethodGet:
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"agent", "runners", "serve",
		"--name", "mac-mini",
		"--platform", "feishu",
		"--once",
		"--executor", "codex",
		"--codex-bin", codexBin,
		"--workspace", workspace,
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent runners serve codex resume: %v", err)
	}
	if len(sessionUpdatePayload) != 2 {
		t.Fatalf("expected 2 session updates, got %d", len(sessionUpdatePayload))
	}
	finalMessage, _ := sessionUpdatePayload[1]["final_message"].(string)
	if !strings.Contains(finalMessage, "resume=thread_prev") {
		t.Fatalf("expected resume id in final_message, got %q", finalMessage)
	}
	if sessionUpdatePayload[1]["executor_ref"] != "thread_prev" {
		t.Fatalf("expected executor_ref thread_prev, got %+v", sessionUpdatePayload[1]["executor_ref"])
	}
}

func TestAgentDaemonStartClaimsPrimaryBeforeLoop(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	var (
		registerCalls   int
		claimCalls      int
		claimSeenBefore bool
		nextTaskCalls   int
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/register" && r.Method == http.MethodPost:
			registerCalls++
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"local-mac","platform":"feishu","state":"idle","created_at":"2026-04-09T12:00:00Z","updated_at":"2026-04-09T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/claim-primary" && r.Method == http.MethodPost:
			claimCalls++
			claimSeenBefore = nextTaskCalls == 0
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123","name":"local-mac","platform":"feishu","state":"idle","created_at":"2026-04-09T12:00:00Z","updated_at":"2026-04-09T12:00:00Z","user_id":"u_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/heartbeat" && r.Method == http.MethodPost:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"success","data":{"id":"run_123"}}`))
		case r.URL.Path == "/v1/agent/runners/run_123/sessions/next" && r.Method == http.MethodGet:
			w.WriteHeader(http.StatusNoContent)
		case r.URL.Path == "/v1/agent/runners/run_123/tasks/next" && r.Method == http.MethodGet:
			nextTaskCalls++
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "daemon", "start", "--name", "local-mac", "--platform", "feishu", "--once"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent daemon start: %v", err)
	}
	if registerCalls != 1 {
		t.Fatalf("expected 1 register call, got %d", registerCalls)
	}
	if claimCalls != 1 {
		t.Fatalf("expected 1 claim call, got %d", claimCalls)
	}
	if !claimSeenBefore {
		t.Fatalf("expected claim-primary before polling loop, nextTaskCalls=%d", nextTaskCalls)
	}
	if !strings.Contains(stdout.String(), `"connected":true`) {
		t.Fatalf("expected connected=true in output, got %s", stdout.String())
	}
	if !strings.Contains(stdout.String(), `"message":"The local machine is connected and ready to receive chat tasks from Feishu."`) {
		t.Fatalf("expected connected message in output, got %s", stdout.String())
	}
	if !strings.Contains(stdout.String(), `"workspace":""`) {
		t.Fatalf("expected workspace field in output, got %s", stdout.String())
	}
}

func TestAgentDaemonStatusReadsPrimaryRunner(t *testing.T) {
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
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "daemon", "status", "--platform", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent daemon status: %v", err)
	}
	if !strings.Contains(stdout.String(), `"connected":true`) {
		t.Fatalf("expected connected=true in output, got %s", stdout.String())
	}
	if !strings.Contains(stdout.String(), `"id":"run_123"`) {
		t.Fatalf("expected machine id in output, got %s", stdout.String())
	}
	if !strings.Contains(stdout.String(), `"message":"A local machine is connected and ready to receive chat tasks for this platform."`) {
		t.Fatalf("expected connected message in output, got %s", stdout.String())
	}
}

func TestAgentDaemonStatusReportsNextStepsWhenNoPrimaryRunner(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_NO_KEYRING", "1")
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-agent-test")); err != nil {
		t.Fatalf("SaveCredential() error = %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/agent/runners/primary" && r.Method == http.MethodGet && r.URL.Query().Get("platform") == "feishu":
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"agent", "daemon", "status", "--platform", "feishu"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("agent daemon status: %v", err)
	}
	if !strings.Contains(stdout.String(), `"connected":false`) {
		t.Fatalf("expected connected=false in output, got %s", stdout.String())
	}
	if !strings.Contains(stdout.String(), `anycap connect feishu --agent codex --workspace /path/to/repo`) {
		t.Fatalf("expected startup next step in output, got %s", stdout.String())
	}
}
