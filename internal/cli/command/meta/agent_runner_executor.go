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
	execMode  string
}

type claudeCodeExecExecutor struct {
	binary         string
	workspace      string
	permissionMode string
	allowedTools   string
}

type cursorAgentExecExecutor struct {
	binary    string
	workspace string
	model     string
	force     bool
}

func newCodexExecExecutor(binary string, workspace string, execMode string) *codexExecExecutor {
	return &codexExecExecutor{
		binary:    strings.TrimSpace(binary),
		workspace: strings.TrimSpace(workspace),
		execMode:  strings.TrimSpace(execMode),
	}
}

func newClaudeCodeExecExecutor(binary string, workspace string, permissionMode string, allowedTools string) *claudeCodeExecExecutor {
	return &claudeCodeExecExecutor{
		binary:         strings.TrimSpace(binary),
		workspace:      strings.TrimSpace(workspace),
		permissionMode: strings.TrimSpace(permissionMode),
		allowedTools:   strings.TrimSpace(allowedTools),
	}
}

func newCursorAgentExecExecutor(binary string, workspace string, model string, force bool) *cursorAgentExecExecutor {
	return &cursorAgentExecExecutor{
		binary:    strings.TrimSpace(binary),
		workspace: strings.TrimSpace(workspace),
		model:     strings.TrimSpace(model),
		force:     force,
	}
}

func newAgentRunnerExecutor(executorKind, codexBin, codexExecMode, claudeBin, claudePermissionMode, claudeAllowedTools, cursorBin, cursorModel string, cursorForce bool, workspace string) (agentcontrolapp.RunnerTaskExecutor, string, error) {
	switch strings.ToLower(strings.TrimSpace(executorKind)) {
	case "", "codex":
		return newCodexExecExecutor(codexBin, workspace, codexExecMode), "codex", nil
	case "claude", "claude_code", "claude-code":
		return newClaudeCodeExecExecutor(claudeBin, workspace, claudePermissionMode, claudeAllowedTools), "claude_code", nil
	case "cursor", "cursor_agent", "cursor-agent":
		return newCursorAgentExecExecutor(cursorBin, workspace, cursorModel, cursorForce), "cursor", nil
	case "stub":
		return agentcontrolapp.StubExecutor{}, "stub", nil
	default:
		return nil, "", fmt.Errorf("unsupported executor %q", executorKind)
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

func (e *claudeCodeExecExecutor) ExecuteTask(ctx context.Context, task agentcontrolapp.RunnerTask) (*agentcontrolapp.RunnerTaskExecutionResult, error) {
	_, err := e.runPrompt(ctx, strings.TrimSpace(task.TaskText), "")
	if err != nil {
		return &agentcontrolapp.RunnerTaskExecutionResult{}, err
	}
	return &agentcontrolapp.RunnerTaskExecutionResult{}, nil
}

func (e *claudeCodeExecExecutor) ExecuteSession(ctx context.Context, session agentcontrolapp.RunnerSession) (*agentcontrolapp.RunnerSessionExecutionResult, error) {
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
		ExecutorRef:  ptrNonEmptyExecutorString(runResult.ExecutorRef),
	}, nil
}

func (e *cursorAgentExecExecutor) ExecuteTask(ctx context.Context, task agentcontrolapp.RunnerTask) (*agentcontrolapp.RunnerTaskExecutionResult, error) {
	_, err := e.runPrompt(ctx, strings.TrimSpace(task.TaskText), "")
	if err != nil {
		return &agentcontrolapp.RunnerTaskExecutionResult{}, err
	}
	return &agentcontrolapp.RunnerTaskExecutionResult{}, nil
}

func (e *cursorAgentExecExecutor) ExecuteSession(ctx context.Context, session agentcontrolapp.RunnerSession) (*agentcontrolapp.RunnerSessionExecutionResult, error) {
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
		ExecutorRef:  ptrNonEmptyExecutorString(runResult.ExecutorRef),
	}, nil
}

type codexRunResult struct {
	FinalMessage string
	ExecutorRef  string
}

type claudeCodeRunResult struct {
	FinalMessage string
	ExecutorRef  string
}

type cursorAgentRunResult struct {
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
	safetyArgs := e.codexSafetyArgs()
	if strings.TrimSpace(resumeID) != "" {
		args = append(args, "exec", "resume")
		args = append(args, safetyArgs...)
		args = append(args, "--skip-git-repo-check", "--json", "--output-last-message", outputPath, strings.TrimSpace(resumeID), "-")
	} else {
		args = append(args, "exec")
		args = append(args, safetyArgs...)
		args = append(args, "--skip-git-repo-check", "--json", "--output-last-message", outputPath, "-")
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

func (e *claudeCodeExecExecutor) runPrompt(ctx context.Context, prompt string, resumeID string) (*claudeCodeRunResult, error) {
	bin := strings.TrimSpace(e.binary)
	if bin == "" {
		bin = "claude"
	}
	resolved, err := exec.LookPath(bin)
	if err != nil {
		return nil, fmt.Errorf("resolve claude binary: %w", err)
	}

	args := []string{"-p", prompt, "--output-format", "json", "--trust"}
	if strings.TrimSpace(resumeID) != "" {
		args = append(args, "--resume", strings.TrimSpace(resumeID))
	}
	if strings.TrimSpace(e.permissionMode) != "" {
		args = append(args, "--permission-mode", strings.TrimSpace(e.permissionMode))
	}
	if strings.TrimSpace(e.allowedTools) != "" {
		args = append(args, "--allowedTools", strings.TrimSpace(e.allowedTools))
	}

	cmd := exec.CommandContext(ctx, resolved, args...)
	configureCommandForCancellation(cmd)
	if strings.TrimSpace(e.workspace) != "" {
		cmd.Dir = strings.TrimSpace(e.workspace)
	}

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
		return nil, fmt.Errorf("run claude code: %s", message)
	}

	result, err := parseClaudeCodeJSONResult(stdout.Bytes())
	if err != nil {
		return nil, err
	}
	if result.ExecutorRef == "" {
		result.ExecutorRef = strings.TrimSpace(resumeID)
	}
	return result, nil
}

func (e *cursorAgentExecExecutor) runPrompt(ctx context.Context, prompt string, resumeID string) (*cursorAgentRunResult, error) {
	bin := strings.TrimSpace(e.binary)
	if bin == "" {
		bin = "cursor-agent"
	}
	resolved, err := exec.LookPath(bin)
	if err != nil {
		return nil, fmt.Errorf("resolve cursor-agent binary: %w", err)
	}

	args := []string{"-p", prompt, "--output-format", "json", "--trust"}
	if strings.TrimSpace(resumeID) != "" {
		args = append(args, "--resume", strings.TrimSpace(resumeID))
	}
	if strings.TrimSpace(e.model) != "" {
		args = append(args, "--model", strings.TrimSpace(e.model))
	}
	if e.force {
		args = append(args, "--force")
	}

	cmd := exec.CommandContext(ctx, resolved, args...)
	configureCommandForCancellation(cmd)
	if strings.TrimSpace(e.workspace) != "" {
		cmd.Dir = strings.TrimSpace(e.workspace)
	}

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
		return nil, fmt.Errorf("run cursor-agent: %s", message)
	}

	result, err := parseCursorAgentJSONResult(stdout.Bytes())
	if err != nil {
		return nil, err
	}
	if result.ExecutorRef == "" {
		result.ExecutorRef = strings.TrimSpace(resumeID)
	}
	return result, nil
}

func (e *codexExecExecutor) codexSafetyArgs() []string {
	switch strings.ToLower(strings.TrimSpace(e.execMode)) {
	case "danger-full-access":
		return []string{"--dangerously-bypass-approvals-and-sandbox"}
	default:
		return []string{"--full-auto"}
	}
}

func ptrExecutorString(v string) *string {
	return &v
}

func ptrNonEmptyExecutorString(v string) *string {
	if strings.TrimSpace(v) == "" {
		return nil
	}
	return ptrExecutorString(strings.TrimSpace(v))
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

func parseClaudeCodeJSONResult(body []byte) (*claudeCodeRunResult, error) {
	var payload struct {
		Result    string `json:"result"`
		SessionID string `json:"session_id"`
		IsError   bool   `json:"is_error"`
		Error     string `json:"error"`
	}
	if err := json.Unmarshal(bytes.TrimSpace(body), &payload); err != nil {
		return nil, fmt.Errorf("parse claude code output: %w", err)
	}
	if payload.IsError {
		msg := strings.TrimSpace(payload.Error)
		if msg == "" {
			msg = strings.TrimSpace(payload.Result)
		}
		if msg == "" {
			msg = "claude code returned an error result"
		}
		return nil, fmt.Errorf("run claude code: %s", msg)
	}
	result := strings.TrimSpace(payload.Result)
	if result == "" {
		result = "claude code execution completed"
	}
	return &claudeCodeRunResult{
		FinalMessage: result,
		ExecutorRef:  strings.TrimSpace(payload.SessionID),
	}, nil
}

func parseCursorAgentJSONResult(body []byte) (*cursorAgentRunResult, error) {
	var payload struct {
		Result    string `json:"result"`
		SessionID string `json:"session_id"`
		IsError   bool   `json:"is_error"`
		Error     string `json:"error"`
	}
	if err := json.Unmarshal(bytes.TrimSpace(body), &payload); err != nil {
		return nil, fmt.Errorf("parse cursor-agent output: %w", err)
	}
	if payload.IsError {
		msg := strings.TrimSpace(payload.Error)
		if msg == "" {
			msg = strings.TrimSpace(payload.Result)
		}
		if msg == "" {
			msg = "cursor-agent returned an error result"
		}
		return nil, fmt.Errorf("run cursor-agent: %s", msg)
	}
	result := strings.TrimSpace(payload.Result)
	if result == "" {
		result = "cursor-agent execution completed"
	}
	return &cursorAgentRunResult{
		FinalMessage: result,
		ExecutorRef:  strings.TrimSpace(payload.SessionID),
	}, nil
}

func stringValue(v any) string {
	if value, ok := v.(string); ok {
		return value
	}
	return ""
}
