package meta

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
)

type codexExecExecutor struct {
	binary    string
	workspace string
}

func newCodexExecExecutor(binary string, workspace string) *codexExecExecutor {
	return &codexExecExecutor{
		binary:    strings.TrimSpace(binary),
		workspace: strings.TrimSpace(workspace),
	}
}

func (e *codexExecExecutor) ExecuteTask(ctx context.Context, task agentcontrolapp.RunnerTask) (*agentcontrolapp.RunnerTaskExecutionResult, error) {
	_, err := e.runPrompt(ctx, strings.TrimSpace(task.TaskText), "")
	if err != nil {
		return &agentcontrolapp.RunnerTaskExecutionResult{}, err
	}
	return &agentcontrolapp.RunnerTaskExecutionResult{}, nil
}

func (e *codexExecExecutor) ExecuteSession(ctx context.Context, session agentcontrolapp.RunnerSession) (*agentcontrolapp.RunnerSessionExecutionResult, error) {
	prompt := ""
	if session.UserMessage != nil {
		prompt = strings.TrimSpace(*session.UserMessage)
	}
	if prompt == "" {
		return nil, fmt.Errorf("session user message is required")
	}
	var resumeID string
	if session.ExecutorRef != nil {
		resumeID = strings.TrimSpace(*session.ExecutorRef)
	}
	runResult, err := e.runPrompt(ctx, prompt, resumeID)
	if err != nil {
		return nil, err
	}
	return &agentcontrolapp.RunnerSessionExecutionResult{
		FinalMessage: &runResult.FinalMessage,
		ExecutorRef:  ptrExecutorString(runResult.ExecutorRef),
	}, nil
}

type codexRunResult struct {
	FinalMessage string
	ExecutorRef  string
}

func (e *codexExecExecutor) runPrompt(ctx context.Context, prompt string, resumeID string) (*codexRunResult, error) {
	bin := strings.TrimSpace(e.binary)
	if bin == "" {
		bin = "codex"
	}
	resolved, err := exec.LookPath(bin)
	if err != nil {
		return nil, fmt.Errorf("resolve codex binary: %w", err)
	}

	outputFile, err := os.CreateTemp("", "anycap-codex-output-*.txt")
	if err != nil {
		return nil, fmt.Errorf("create codex output file: %w", err)
	}
	outputPath := outputFile.Name()
	if closeErr := outputFile.Close(); closeErr != nil {
		_ = os.Remove(outputPath)
		return nil, fmt.Errorf("close codex output file: %w", closeErr)
	}
	defer os.Remove(outputPath)

	args := make([]string, 0, 12)
	if strings.TrimSpace(e.workspace) != "" {
		args = append(args, "-C", strings.TrimSpace(e.workspace))
	}
	if strings.TrimSpace(resumeID) != "" {
		args = append(args, "exec", "resume", "--skip-git-repo-check", "--json", "--output-last-message", outputPath, strings.TrimSpace(resumeID), "-")
	} else {
		args = append(args, "exec", "--skip-git-repo-check", "--json", "--output-last-message", outputPath, "-")
	}

	cmd := exec.CommandContext(ctx, resolved, args...)
	configureCommandForCancellation(cmd)
	cmd.Stdin = strings.NewReader(prompt)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	done := make(chan struct{})
	defer close(done)
	go func() {
		select {
		case <-ctx.Done():
			_ = terminateCommand(cmd)
		case <-done:
		}
	}()

	if err := cmd.Run(); err != nil {
		if ctx.Err() != nil {
			return nil, ctx.Err()
		}
		message := strings.TrimSpace(stderr.String())
		if message == "" {
			message = strings.TrimSpace(stdout.String())
		}
		if message == "" {
			message = err.Error()
		}
		return nil, fmt.Errorf("run codex exec: %s", message)
	}

	body, err := os.ReadFile(outputPath)
	if err != nil {
		return nil, fmt.Errorf("read codex output: %w", err)
	}
	result := strings.TrimSpace(string(body))
	if result == "" {
		result = "codex execution completed"
	}
	threadID := extractThreadID(stdout.Bytes())
	if threadID == "" {
		threadID = strings.TrimSpace(resumeID)
	}
	if threadID == "" {
		threadID = "codex-exec"
	}
	return &codexRunResult{
		FinalMessage: result,
		ExecutorRef:  threadID,
	}, nil
}

func ptrExecutorString(v string) *string {
	return &v
}

func extractThreadID(body []byte) string {
	decoder := json.NewDecoder(bytes.NewReader(body))
	for {
		var event map[string]any
		if err := decoder.Decode(&event); err != nil {
			if err == io.EOF {
				return ""
			}
			return ""
		}
		if strings.TrimSpace(stringValue(event["type"])) != "thread.started" {
			continue
		}
		threadID := strings.TrimSpace(stringValue(event["thread_id"]))
		if threadID != "" {
			return threadID
		}
	}
}

func stringValue(v any) string {
	if value, ok := v.(string); ok {
		return value
	}
	return ""
}
