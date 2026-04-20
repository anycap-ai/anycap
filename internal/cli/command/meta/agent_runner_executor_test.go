package meta

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
)

func TestCodexExecExecutorExecuteSessionHonorsContextCancellation(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	script := `#!/bin/sh
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec|--json|--skip-git-repo-check)
      shift
      ;;
    --output-last-message)
      shift 2
      ;;
    -C)
      shift 2
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
cat >/dev/null
sleep 10
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCodexExecExecutor(scriptPath, tmpDir, "")
	message := "继续修复 parser panic"
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	done := make(chan error, 1)
	go func() {
		_, err := executor.ExecuteSession(ctx, agentcontrolapp.RunnerSession{
			ID:          "ags_123",
			RunnerID:    "run_123",
			UserMessage: &message,
		})
		done <- err
	}()

	time.Sleep(100 * time.Millisecond)
	cancel()

	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("expected context canceled, got %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("executor did not stop after context cancellation")
	}
}

func TestCodexExecExecutorExecuteSessionCapturesThreadID(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	argsPath := filepath.Join(tmpDir, "codex-args.txt")
	script := `#!/bin/sh
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
out=""
resume_id=""
mode="exec"
expect_resume_id="0"
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec)
      shift
      ;;
    resume)
      mode="resume"
      expect_resume_id="1"
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    --json|--skip-git-repo-check|--full-auto)
      shift
      ;;
    -C)
      shift 2
      ;;
    -)
      shift
      break
      ;;
    *)
      if [ "$mode" = "resume" ] && [ "$expect_resume_id" = "1" ]; then
        resume_id="$1"
        expect_resume_id="0"
      fi
      shift
      ;;
  esac
done
cat >/dev/null
if [ "$mode" = "resume" ]; then
  printf '{"type":"thread.started","thread_id":"%s"}\n' "$resume_id"
  printf 'resumed' > "$out"
else
  printf '{"type":"thread.started","thread_id":"thread_123"}\n'
  printf 'fresh' > "$out"
fi
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCodexExecExecutor(scriptPath, tmpDir, "")
	message := "继续修复 parser panic"

	fresh, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_123",
		RunnerID:    "run_123",
		UserMessage: &message,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(fresh) error = %v", err)
	}
	if fresh.ExecutorRef == nil || *fresh.ExecutorRef != "thread_123" {
		t.Fatalf("unexpected fresh executor ref %+v", fresh.ExecutorRef)
	}
	if fresh.FinalMessage == nil || *fresh.FinalMessage != "fresh" {
		t.Fatalf("unexpected fresh final message %+v", fresh.FinalMessage)
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if !strings.Contains(argsText, "--full-auto\n") {
		t.Fatalf("expected full-auto in args, got %q", argsText)
	}

	resumeID := "thread_123"
	resumed, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_124",
		RunnerID:    "run_123",
		UserMessage: &message,
		ExecutorRef: &resumeID,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(resume) error = %v", err)
	}
	if resumed.ExecutorRef == nil || *resumed.ExecutorRef != "thread_123" {
		t.Fatalf("unexpected resumed executor ref %+v", resumed.ExecutorRef)
	}
	if resumed.FinalMessage == nil || !strings.Contains(*resumed.FinalMessage, "resumed") {
		t.Fatalf("unexpected resumed final message %+v", resumed.FinalMessage)
	}
}

func TestCodexExecExecutorExecuteSessionResumesLatestLocalSessionOnExplicitLocalContinue(t *testing.T) {
	tmpDir := t.TempDir()
	codexHome := filepath.Join(tmpDir, "codex-home")
	sessionsDir := filepath.Join(codexHome, "sessions", "2026", "04", "21")
	if err := os.MkdirAll(sessionsDir, 0o755); err != nil {
		t.Fatalf("MkdirAll() error = %v", err)
	}
	t.Setenv("CODEX_HOME", codexHome)
	localSessionPath := filepath.Join(sessionsDir, "rollout-local.jsonl")
	localMeta := `{"type":"session_meta","payload":{"id":"local_tui_thread","cwd":"` + tmpDir + `","originator":"codex-tui","source":"cli"}}` + "\n"
	if err := os.WriteFile(localSessionPath, []byte(localMeta), 0o644); err != nil {
		t.Fatalf("WriteFile(local session) error = %v", err)
	}
	execSessionPath := filepath.Join(sessionsDir, "rollout-exec.jsonl")
	execMeta := `{"type":"session_meta","payload":{"id":"anycap_exec_thread","cwd":"` + tmpDir + `","originator":"codex_exec","source":"exec"}}` + "\n"
	if err := os.WriteFile(execSessionPath, []byte(execMeta), 0o644); err != nil {
		t.Fatalf("WriteFile(exec session) error = %v", err)
	}

	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	argsPath := filepath.Join(tmpDir, "codex-args.txt")
	script := `#!/bin/sh
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --output-last-message)
      out="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
cat >/dev/null
printf '{"type":"thread.started","thread_id":"local_tui_thread"}\n'
printf 'joined local latest' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCodexExecExecutor(scriptPath, tmpDir, "")
	message := "继续本地会话"
	oldFeishuRef := "feishu_thread"
	result, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_125",
		RunnerID:    "run_123",
		UserMessage: &message,
		ExecutorRef: &oldFeishuRef,
	})
	if err != nil {
		t.Fatalf("ExecuteSession() error = %v", err)
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if !strings.Contains(argsText, "resume\n") || !strings.Contains(argsText, "local_tui_thread\n") {
		t.Fatalf("expected codex exec resume local_tui_thread, got %q", argsText)
	}
	if strings.Contains(argsText, "feishu_thread\n") {
		t.Fatalf("expected local latest resume to ignore prior Feishu executor_ref, got %q", argsText)
	}
	if strings.Contains(argsText, "--last\n") {
		t.Fatalf("expected explicit local session id instead of --last, got %q", argsText)
	}
	stdinPath := filepath.Join(tmpDir, "codex-stdin.txt")
	// Re-run with a stdin capture to verify the prompt context does not advertise
	// the previous Feishu executor_ref as the active local session.
	script = `#!/bin/sh
stdin_log="` + stdinPath + `"
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --output-last-message)
      out="$2"
      shift 2
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
cat > "$stdin_log"
printf '{"type":"thread.started","thread_id":"local_tui_thread"}\n'
printf 'joined local latest' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile(capture script) error = %v", err)
	}
	result, err = executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_126",
		RunnerID:    "run_123",
		UserMessage: &message,
		ExecutorRef: &oldFeishuRef,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(capture) error = %v", err)
	}
	stdinBody, err := os.ReadFile(stdinPath)
	if err != nil {
		t.Fatalf("ReadFile(stdinPath) error = %v", err)
	}
	prompt := string(stdinBody)
	if !strings.Contains(prompt, `resume_target="local_tui_thread"`) {
		t.Fatalf("expected prompt to mark explicit local resume target, got:\n%s", prompt)
	}
	if strings.Contains(prompt, `executor_ref="feishu_thread"`) {
		t.Fatalf("expected prompt to hide previous Feishu executor_ref during local latest attach, got:\n%s", prompt)
	}
	if !strings.Contains(prompt, "Feishu chat_history is transport context") {
		t.Fatalf("expected prompt to explain Feishu history vs resumed local history, got:\n%s", prompt)
	}
	if result.ExecutorRef == nil || *result.ExecutorRef != "local_tui_thread" {
		t.Fatalf("expected latest local thread to be persisted, got %+v", result.ExecutorRef)
	}
}

func TestCodexExecExecutorExecuteSessionInjectsLocalResumeContext(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	stdinPath := filepath.Join(tmpDir, "codex-stdin.txt")
	script := `#!/bin/sh
stdin_log="` + stdinPath + `"
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec|resume|--json|--skip-git-repo-check|--full-auto)
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    -C)
      shift 2
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
cat > "$stdin_log"
printf '{"type":"thread.started","thread_id":"thread_123"}\n'
printf 'done' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCodexExecExecutor(scriptPath, tmpDir, "")
	message := "我想在本地查看这一次的对话"
	resumeID := "019d72e8-c67a-7630-99bf-415b1c01bde4"

	_, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:             "ags_QtJfkB26VZ3rCH7i",
		ConversationID: "agc_TCxtaJXHE5czl4Kp",
		RunnerID:       "run_rQaGIYrkeMnIFpc2",
		Agent:          "codex",
		UserMessage:    &message,
		ExecutorRef:    &resumeID,
	})
	if err != nil {
		t.Fatalf("ExecuteSession() error = %v", err)
	}
	body, err := os.ReadFile(stdinPath)
	if err != nil {
		t.Fatalf("ReadFile(stdinPath) error = %v", err)
	}
	prompt := string(body)
	for _, want := range []string{
		`<anycap-local-session`,
		`agent="codex"`,
		`workspace="` + tmpDir + `"`,
		`conversation_id="agc_TCxtaJXHE5czl4Kp"`,
		`session_id="ags_QtJfkB26VZ3rCH7i"`,
		`executor_ref="019d72e8-c67a-7630-99bf-415b1c01bde4"`,
		`If the user asks to continue this conversation from Feishu`,
		`do not reply with a local terminal command`,
		`If the user asks how to view or open this conversation on their Mac`,
		`codex resume 019d72e8-c67a-7630-99bf-415b1c01bde4`,
		`Do not suggest --last`,
		message,
	} {
		if !strings.Contains(prompt, want) {
			t.Fatalf("expected prompt to contain %q, got:\n%s", want, prompt)
		}
	}
}

func TestCodexExecExecutorExecuteSessionProvidesLocalResumeCommandWithoutExecutorRef(t *testing.T) {
	tmpDir := t.TempDir()
	codexHome := filepath.Join(tmpDir, "codex-home")
	sessionsDir := filepath.Join(codexHome, "sessions", "2026", "04", "21")
	if err := os.MkdirAll(sessionsDir, 0o755); err != nil {
		t.Fatalf("MkdirAll() error = %v", err)
	}
	t.Setenv("CODEX_HOME", codexHome)
	localSessionPath := filepath.Join(sessionsDir, "rollout-local.jsonl")
	localMeta := `{"type":"session_meta","payload":{"id":"local_tui_thread","cwd":"` + tmpDir + `","originator":"codex-tui","source":"cli"}}` + "\n"
	if err := os.WriteFile(localSessionPath, []byte(localMeta), 0o644); err != nil {
		t.Fatalf("WriteFile(local session) error = %v", err)
	}
	execSessionPath := filepath.Join(sessionsDir, "rollout-exec.jsonl")
	execMeta := `{"type":"session_meta","payload":{"id":"anycap_exec_thread","cwd":"` + tmpDir + `","originator":"codex_exec","source":"exec"}}` + "\n"
	if err := os.WriteFile(execSessionPath, []byte(execMeta), 0o644); err != nil {
		t.Fatalf("WriteFile(exec session) error = %v", err)
	}

	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	stdinPath := filepath.Join(tmpDir, "codex-stdin.txt")
	argsPath := filepath.Join(tmpDir, "codex-args.txt")
	script := `#!/bin/sh
stdin_log="` + stdinPath + `"
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec|--json|--skip-git-repo-check|--full-auto)
      shift
      ;;
    resume)
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    -C)
      shift 2
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
cat > "$stdin_log"
printf '{"type":"thread.started","thread_id":"thread_123"}\n'
printf 'done' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCodexExecExecutor(scriptPath, tmpDir, "")
	message := "我想在本地查看/恢复这次对话"
	_, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_127",
		RunnerID:    "run_123",
		UserMessage: &message,
	})
	if err != nil {
		t.Fatalf("ExecuteSession() error = %v", err)
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if strings.Contains(argsText, "resume\n") || strings.Contains(argsText, "local_tui_thread\n") {
		t.Fatalf("expected command generator request not to resume automatically, got %q", argsText)
	}
	stdinBody, err := os.ReadFile(stdinPath)
	if err != nil {
		t.Fatalf("ReadFile(stdinPath) error = %v", err)
	}
	prompt := string(stdinBody)
	for _, want := range []string{
		`local_resume_ref="local_tui_thread"`,
		`cd "` + tmpDir + `" && codex resume local_tui_thread`,
		`If executor_ref is unavailable and local_resume_ref is present`,
		message,
	} {
		if !strings.Contains(prompt, want) {
			t.Fatalf("expected prompt to contain %q, got:\n%s", want, prompt)
		}
	}
	if strings.Contains(prompt, `executor_ref="`) {
		t.Fatalf("expected prompt not to invent executor_ref, got:\n%s", prompt)
	}
}

func TestCodexExecExecutorExecuteSessionUsesDangerFullAccessModeWhenRequested(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "codex-stub.sh")
	argsPath := filepath.Join(tmpDir, "codex-args.txt")
	script := `#!/bin/sh
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
out=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    exec|resume)
      shift
      ;;
    --output-last-message)
      out="$2"
      shift 2
      ;;
    --json|--skip-git-repo-check|--dangerously-bypass-approvals-and-sandbox)
      shift
      ;;
    -C)
      shift 2
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
cat >/dev/null
printf '{"type":"thread.started","thread_id":"thread_123"}\n'
printf 'fresh' > "$out"
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCodexExecExecutor(scriptPath, tmpDir, "danger-full-access")
	message := "继续修复 parser panic"

	_, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_123",
		RunnerID:    "run_123",
		UserMessage: &message,
	})
	if err != nil {
		t.Fatalf("ExecuteSession() error = %v", err)
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if !strings.Contains(argsText, "--dangerously-bypass-approvals-and-sandbox\n") {
		t.Fatalf("expected danger mode in args, got %q", argsText)
	}
	if strings.Contains(argsText, "--full-auto\n") {
		t.Fatalf("expected full-auto to be absent in danger mode, got %q", argsText)
	}
}

func TestClaudeCodeExecExecutorExecuteSessionCapturesSessionIDAndResumes(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "claude-stub.sh")
	argsPath := filepath.Join(tmpDir, "claude-args.txt")
	script := `#!/bin/sh
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
resume_id=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --resume|-r)
      resume_id="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
if [ -n "$resume_id" ]; then
  printf '{"type":"result","subtype":"success","result":"resumed","session_id":"%s"}\n' "$resume_id"
else
  printf '{"type":"result","subtype":"success","result":"fresh","session_id":"session_123"}\n'
fi
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newClaudeCodeExecExecutor(scriptPath, tmpDir, "acceptEdits", "Read,Edit")
	message := "继续修复 parser panic"

	fresh, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_123",
		RunnerID:    "run_123",
		UserMessage: &message,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(fresh) error = %v", err)
	}
	if fresh.ExecutorRef == nil || *fresh.ExecutorRef != "session_123" {
		t.Fatalf("unexpected fresh executor ref %+v", fresh.ExecutorRef)
	}
	if fresh.FinalMessage == nil || *fresh.FinalMessage != "fresh" {
		t.Fatalf("unexpected fresh final message %+v", fresh.FinalMessage)
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if !strings.Contains(argsText, "--permission-mode\nacceptEdits\n") {
		t.Fatalf("expected permission mode in args, got %q", argsText)
	}
	if !strings.Contains(argsText, "--allowedTools\nRead,Edit\n") {
		t.Fatalf("expected allowed tools in args, got %q", argsText)
	}

	resumeID := "session_123"
	resumed, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_124",
		RunnerID:    "run_123",
		UserMessage: &message,
		ExecutorRef: &resumeID,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(resume) error = %v", err)
	}
	if resumed.ExecutorRef == nil || *resumed.ExecutorRef != "session_123" {
		t.Fatalf("unexpected resumed executor ref %+v", resumed.ExecutorRef)
	}
	if resumed.FinalMessage == nil || *resumed.FinalMessage != "resumed" {
		t.Fatalf("unexpected resumed final message %+v", resumed.FinalMessage)
	}
	argsBody, err = os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText = string(argsBody)
	if !strings.Contains(argsText, "--resume\nsession_123\n") {
		t.Fatalf("expected resume id in args, got %q", argsText)
	}
}

func TestClaudeCodeExecExecutorExecuteSessionHonorsContextCancellation(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "claude-stub.sh")
	script := `#!/bin/sh
sleep 10
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newClaudeCodeExecExecutor(scriptPath, tmpDir, "", "")
	message := "继续修复 parser panic"
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	done := make(chan error, 1)
	go func() {
		_, err := executor.ExecuteSession(ctx, agentcontrolapp.RunnerSession{
			ID:          "ags_123",
			RunnerID:    "run_123",
			UserMessage: &message,
		})
		done <- err
	}()

	time.Sleep(100 * time.Millisecond)
	cancel()

	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("expected context canceled, got %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("executor did not stop after context cancellation")
	}
}

func TestCursorAgentExecExecutorExecuteSessionCapturesSessionIDAndResumes(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "cursor-agent-stub.sh")
	argsPath := filepath.Join(tmpDir, "cursor-agent-args.txt")
	script := `#!/bin/sh
args_log="` + argsPath + `"
printf '%s\n' "$@" > "$args_log"
resume_id=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --resume)
      resume_id="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
if [ -n "$resume_id" ]; then
  printf '{"type":"result","subtype":"success","is_error":false,"result":"resumed","session_id":"%s"}\n' "$resume_id"
else
  printf '{"type":"result","subtype":"success","is_error":false,"result":"fresh","session_id":"cursor_session_123"}\n'
fi
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCursorAgentExecExecutor(scriptPath, tmpDir, "gpt-5", true)
	message := "继续修复 parser panic"

	fresh, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_123",
		RunnerID:    "run_123",
		UserMessage: &message,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(fresh) error = %v", err)
	}
	if fresh.ExecutorRef == nil || *fresh.ExecutorRef != "cursor_session_123" {
		t.Fatalf("unexpected fresh executor ref %+v", fresh.ExecutorRef)
	}
	if fresh.FinalMessage == nil || *fresh.FinalMessage != "fresh" {
		t.Fatalf("unexpected fresh final message %+v", fresh.FinalMessage)
	}
	argsBody, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText := string(argsBody)
	if !strings.Contains(argsText, "<anycap-local-session") || !strings.Contains(argsText, message) {
		t.Fatalf("expected print prompt with local session context in args, got %q", argsText)
	}
	if !strings.Contains(argsText, "--output-format\njson\n") {
		t.Fatalf("expected json output format in args, got %q", argsText)
	}
	if !strings.Contains(argsText, "--trust\n") {
		t.Fatalf("expected workspace trust flag in args, got %q", argsText)
	}
	if !strings.Contains(argsText, "--model\ngpt-5\n") {
		t.Fatalf("expected model in args, got %q", argsText)
	}
	if !strings.Contains(argsText, "--force\n") {
		t.Fatalf("expected force flag in args, got %q", argsText)
	}

	resumeID := "cursor_session_123"
	resumed, err := executor.ExecuteSession(context.Background(), agentcontrolapp.RunnerSession{
		ID:          "ags_124",
		RunnerID:    "run_123",
		UserMessage: &message,
		ExecutorRef: &resumeID,
	})
	if err != nil {
		t.Fatalf("ExecuteSession(resume) error = %v", err)
	}
	if resumed.ExecutorRef == nil || *resumed.ExecutorRef != "cursor_session_123" {
		t.Fatalf("unexpected resumed executor ref %+v", resumed.ExecutorRef)
	}
	if resumed.FinalMessage == nil || *resumed.FinalMessage != "resumed" {
		t.Fatalf("unexpected resumed final message %+v", resumed.FinalMessage)
	}
	argsBody, err = os.ReadFile(argsPath)
	if err != nil {
		t.Fatalf("ReadFile(argsPath) error = %v", err)
	}
	argsText = string(argsBody)
	if !strings.Contains(argsText, "--resume\ncursor_session_123\n") {
		t.Fatalf("expected resume id in args, got %q", argsText)
	}
}

func TestCursorAgentExecExecutorExecuteSessionHonorsContextCancellation(t *testing.T) {
	tmpDir := t.TempDir()
	scriptPath := filepath.Join(tmpDir, "cursor-agent-stub.sh")
	script := `#!/bin/sh
sleep 10
`
	if err := os.WriteFile(scriptPath, []byte(script), 0o755); err != nil {
		t.Fatalf("WriteFile() error = %v", err)
	}

	executor := newCursorAgentExecExecutor(scriptPath, tmpDir, "", false)
	message := "继续修复 parser panic"
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	done := make(chan error, 1)
	go func() {
		_, err := executor.ExecuteSession(ctx, agentcontrolapp.RunnerSession{
			ID:          "ags_123",
			RunnerID:    "run_123",
			UserMessage: &message,
		})
		done <- err
	}()

	time.Sleep(100 * time.Millisecond)
	cancel()

	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("expected context canceled, got %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("executor did not stop after context cancellation")
	}
}
