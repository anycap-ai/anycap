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
