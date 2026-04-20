package meta

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

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
	resumeTarget := ""
	localResumeRef := ""
	if shouldResumeLatestLocalCodexSession(prompt) {
		localSessionID, err := latestLocalCodexSessionID(e.workspace)
		if err != nil {
			return nil, err
		}
		resumeID = localSessionID
		resumeTarget = localSessionID
		localResumeRef = localSessionID
		session.ExecutorRef = nil
	} else if strings.TrimSpace(resumeID) == "" && shouldProvideLocalCodexResumeCommand(prompt) {
		if localSessionID, err := latestLocalCodexSessionID(e.workspace); err == nil {
			localResumeRef = localSessionID
		}
	}
	prompt = buildAnyCapLocalSessionPrompt("codex", e.workspace, session, prompt, resumeTarget, localResumeRef)
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
	prompt = buildAnyCapLocalSessionPrompt("claude_code", e.workspace, session, prompt, "", "")
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
	prompt = buildAnyCapLocalSessionPrompt("cursor", e.workspace, session, prompt, "", "")
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

func buildAnyCapLocalSessionPrompt(agent string, workspace string, session agentcontrolapp.RunnerSession, userPrompt string, resumeTarget string, localResumeRef string) string {
	trimmedPrompt := strings.TrimSpace(userPrompt)
	attrs := []string{
		fmt.Sprintf(`agent="%s"`, xmlAttr(strings.TrimSpace(agent))),
	}
	if value := strings.TrimSpace(workspace); value != "" {
		attrs = append(attrs, fmt.Sprintf(`workspace="%s"`, xmlAttr(value)))
	}
	if value := strings.TrimSpace(session.ConversationID); value != "" {
		attrs = append(attrs, fmt.Sprintf(`conversation_id="%s"`, xmlAttr(value)))
	}
	if value := strings.TrimSpace(session.ID); value != "" {
		attrs = append(attrs, fmt.Sprintf(`session_id="%s"`, xmlAttr(value)))
	}
	if value := strings.TrimSpace(session.RunnerID); value != "" {
		attrs = append(attrs, fmt.Sprintf(`runner_id="%s"`, xmlAttr(value)))
	}
	if session.ExecutorRef != nil {
		if value := strings.TrimSpace(*session.ExecutorRef); value != "" {
			attrs = append(attrs, fmt.Sprintf(`executor_ref="%s"`, xmlAttr(value)))
		}
	}
	if value := strings.TrimSpace(resumeTarget); value != "" {
		attrs = append(attrs, fmt.Sprintf(`resume_target="%s"`, xmlAttr(value)))
	}
	if value := strings.TrimSpace(localResumeRef); value != "" {
		attrs = append(attrs, fmt.Sprintf(`local_resume_ref="%s"`, xmlAttr(value)))
	}
	commandRef := executorRefFromSession(session)
	if commandRef == "" {
		commandRef = strings.TrimSpace(localResumeRef)
	}

	return strings.TrimSpace(fmt.Sprintf(`<anycap-local-session %s />

<anycap-local-session-instructions>
If the user asks to continue this conversation from Feishu, continue in the current resumed executor context, and do not reply with a local terminal command unless they explicitly ask to open or view the conversation on their Mac. If their message only asks to continue and contains no concrete task, ask what they want to do next.
If resume_target is present, this turn is attaching Feishu to that recorded local Codex session in the current workspace.
Feishu chat_history is transport context, not the resumed local Codex conversation history. If the user asks about prior questions or messages in the local conversation, answer from the resumed executor history instead of the Feishu chat_history wrapper.
If the user asks how to view or open this conversation on their Mac, reply with a local terminal command instead of performing more work.
- Use the executor_ref from anycap-local-session when it is available. This session is already resumed when executor_ref is present.
- If executor_ref is unavailable and local_resume_ref is present, use local_resume_ref for the local terminal command.
- For Codex, prefer: %s
- For Claude Code, prefer: %s
- For Cursor Agent, prefer: %s
- Do not suggest --last unless both executor_ref and local_resume_ref are unavailable.
- If both executor_ref and local_resume_ref are unavailable, explain that the exact local session id is not available and suggest checking `+"`anycap agent conversations list`"+`.
- Do not run the command yourself. The user should copy and run it in their local terminal.
</anycap-local-session-instructions>

<user-message>
%s
</user-message>
`, strings.Join(attrs, " "), localResumeCommand("codex", workspace, commandRef), localResumeCommand("claude_code", workspace, commandRef), localResumeCommand("cursor", workspace, commandRef), trimmedPrompt))
}

func executorRefFromSession(session agentcontrolapp.RunnerSession) string {
	if session.ExecutorRef == nil {
		return ""
	}
	return strings.TrimSpace(*session.ExecutorRef)
}

func shouldResumeLatestLocalCodexSession(prompt string) bool {
	value := strings.ToLower(strings.TrimSpace(prompt))
	if value == "" {
		return false
	}
	return strings.Contains(value, "继续本地会话") ||
		strings.Contains(value, "接着本地会话") ||
		strings.Contains(value, "恢复本地会话") ||
		strings.Contains(value, "继续本地 codex") ||
		strings.Contains(value, "接着本地 codex") ||
		strings.Contains(value, "resume local session") ||
		strings.Contains(value, "continue local session") ||
		strings.Contains(value, "continue my local session")
}

func shouldProvideLocalCodexResumeCommand(prompt string) bool {
	value := strings.ToLower(strings.TrimSpace(prompt))
	if value == "" {
		return false
	}
	return strings.Contains(value, "本地查看") ||
		strings.Contains(value, "本地打开") ||
		strings.Contains(value, "本地恢复") ||
		strings.Contains(value, "查看这次对话") ||
		strings.Contains(value, "打开这次对话") ||
		strings.Contains(value, "恢复这次对话") ||
		strings.Contains(value, "查看本地会话") ||
		strings.Contains(value, "打开本地会话") ||
		strings.Contains(value, "恢复命令") ||
		strings.Contains(value, "view this conversation locally") ||
		strings.Contains(value, "open this conversation locally") ||
		strings.Contains(value, "local resume command")
}

type codexSessionMetaLine struct {
	Type    string `json:"type"`
	Payload struct {
		ID         string `json:"id"`
		CWD        string `json:"cwd"`
		Originator string `json:"originator"`
		Source     string `json:"source"`
	} `json:"payload"`
}

func latestLocalCodexSessionID(workspace string) (string, error) {
	trimmedWorkspace := strings.TrimSpace(workspace)
	if trimmedWorkspace == "" {
		return "", fmt.Errorf("workspace is required to find the latest local Codex session")
	}
	root, err := codexSessionsRoot()
	if err != nil {
		return "", err
	}
	target := filepath.Clean(trimmedWorkspace)
	var bestID string
	var bestModTime time.Time
	err = filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil || entry == nil || entry.IsDir() || !strings.HasSuffix(entry.Name(), ".jsonl") {
			return nil
		}
		info, err := entry.Info()
		if err != nil {
			return nil
		}
		if !bestModTime.IsZero() && !info.ModTime().After(bestModTime) {
			return nil
		}
		meta, err := readCodexSessionMeta(path)
		if err != nil {
			return nil
		}
		if meta.Type != "session_meta" || strings.TrimSpace(meta.Payload.ID) == "" {
			return nil
		}
		if filepath.Clean(strings.TrimSpace(meta.Payload.CWD)) != target {
			return nil
		}
		if strings.TrimSpace(meta.Payload.Source) == "exec" ||
			strings.Contains(strings.ToLower(strings.TrimSpace(meta.Payload.Originator)), "codex_exec") {
			return nil
		}
		bestID = strings.TrimSpace(meta.Payload.ID)
		bestModTime = info.ModTime()
		return nil
	})
	if err != nil {
		return "", fmt.Errorf("scan Codex sessions: %w", err)
	}
	if bestID == "" {
		return "", fmt.Errorf("no recorded local Codex session found for workspace %s", trimmedWorkspace)
	}
	return bestID, nil
}

func codexSessionsRoot() (string, error) {
	if home := strings.TrimSpace(os.Getenv("CODEX_HOME")); home != "" {
		return filepath.Join(home, "sessions"), nil
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("resolve home directory: %w", err)
	}
	return filepath.Join(home, ".codex", "sessions"), nil
}

func readCodexSessionMeta(path string) (codexSessionMetaLine, error) {
	var meta codexSessionMetaLine
	file, err := os.Open(path)
	if err != nil {
		return meta, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 0, 64*1024), 2*1024*1024)
	if !scanner.Scan() {
		if err := scanner.Err(); err != nil {
			return meta, err
		}
		return meta, io.EOF
	}
	if err := json.Unmarshal(scanner.Bytes(), &meta); err != nil {
		return meta, err
	}
	return meta, nil
}

func localResumeCommand(agent string, workspace string, executorRef string) string {
	trimmedRef := strings.TrimSpace(executorRef)
	if trimmedRef == "" {
		return "unavailable until executor_ref or local_resume_ref is available"
	}
	command := "codex resume " + trimmedRef
	switch strings.TrimSpace(agent) {
	case "claude_code":
		command = "claude --resume " + trimmedRef
	case "cursor":
		command = "cursor-agent --resume " + trimmedRef
	}
	if trimmedWorkspace := strings.TrimSpace(workspace); trimmedWorkspace != "" {
		return "cd " + shellQuote(trimmedWorkspace) + " && " + command
	}
	return command
}

func shellQuote(value string) string {
	return `"` + strings.ReplaceAll(value, `"`, `\"`) + `"`
}

func xmlAttr(value string) string {
	return html.EscapeString(value)
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
