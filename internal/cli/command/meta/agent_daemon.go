package meta

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

type daemonIMBot interface {
	Run(ctx context.Context) error
}

var buildDaemonIMBot = func(cfg im.FeishuLongConnBotConfig) daemonIMBot {
	return im.NewFeishuLongConnBot(cfg)
}

var (
	daemonExecutable     = os.Executable
	daemonProcessRunning = daemonProcessExists
	stopDaemon           = stopDaemonProcess
	spawnDaemonProcess   = func(executable string, args []string, logPath string) (int, error) {
		logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
		if err != nil {
			return 0, err
		}
		defer logFile.Close()

		cmd := exec.Command(executable, args...)
		cmd.Stdin = nil
		cmd.Stdout = logFile
		cmd.Stderr = logFile
		configureCommandForDaemon(cmd)
		if err := cmd.Start(); err != nil {
			return 0, err
		}
		return cmd.Process.Pid, nil
	}
)

const daemonFeishuTurnMergeWindow = 1200 * time.Millisecond

func newAgentDaemonCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		name                 string
		platform             string
		once                 bool
		foreground           bool
		pollEvery            time.Duration
		executorKind         string
		codexBin             string
		codexExecMode        string
		claudeBin            string
		claudePermissionMode string
		claudeAllowedTools   string
		workspace            string
		feishuAppID          string
		feishuSecret         string
	)

	cmd := &cobra.Command{
		Use:   "daemon",
		Short: "Run the local AnyCap agent for Feishu chat execution",
		RunE:  requireSubcommand,
	}

	startCmd := &cobra.Command{
		Use:   "start",
		Short: "Start the local agent and connect this machine to your Feishu chat",
		RunE: func(cmd *cobra.Command, args []string) error {
			if !once && !foreground {
				return startDaemonInBackground(cmd, stdout, strings.TrimSpace(platform), strings.TrimSpace(name), strings.TrimSpace(executorKind), strings.TrimSpace(codexBin), strings.TrimSpace(codexExecMode), strings.TrimSpace(claudeBin), strings.TrimSpace(claudePermissionMode), strings.TrimSpace(claudeAllowedTools), strings.TrimSpace(workspace), strings.TrimSpace(feishuAppID), strings.TrimSpace(feishuSecret))
			}
			return runDaemonForeground(cmd, clientFactory, stdout, strings.TrimSpace(name), strings.TrimSpace(platform), once, pollEvery, strings.TrimSpace(executorKind), strings.TrimSpace(codexBin), strings.TrimSpace(codexExecMode), strings.TrimSpace(claudeBin), strings.TrimSpace(claudePermissionMode), strings.TrimSpace(claudeAllowedTools), strings.TrimSpace(workspace), strings.TrimSpace(feishuAppID), strings.TrimSpace(feishuSecret))
		},
	}
	startCmd.Flags().StringVar(&name, "name", "local-agent", "Local runner name")
	startCmd.Flags().StringVar(&platform, "platform", "feishu", "IM platform to claim")
	startCmd.Flags().BoolVar(&once, "once", false, "Run exactly one poll iteration")
	startCmd.Flags().BoolVar(&foreground, "foreground", false, "Run the daemon in the current foreground process")
	_ = startCmd.Flags().MarkHidden("foreground")
	startCmd.Flags().DurationVar(&pollEvery, "poll-interval", 3*time.Second, "Polling interval between task fetch attempts")
	startCmd.Flags().StringVar(&executorKind, "executor", "codex", "Runner executor: codex, claude_code, or stub")
	startCmd.Flags().StringVar(&codexBin, "codex-bin", "codex", "Path to the codex CLI binary when --executor=codex")
	startCmd.Flags().StringVar(&codexExecMode, "codex-exec-mode", "safe", "Codex execution mode: safe or danger-full-access")
	startCmd.Flags().StringVar(&claudeBin, "claude-bin", "claude", "Path to the Claude Code CLI binary when --executor=claude_code")
	startCmd.Flags().StringVar(&claudePermissionMode, "claude-permission-mode", "acceptEdits", "Claude Code permission mode passed to --permission-mode")
	startCmd.Flags().StringVar(&claudeAllowedTools, "claude-allowed-tools", "", "Optional Claude Code --allowedTools value, for example Read,Edit,Bash")
	startCmd.Flags().StringVar(&workspace, "workspace", "", "Workspace directory passed to the local executor")
	startCmd.Flags().StringVar(&feishuAppID, "feishu-app-id", "", "Feishu app ID for local daemon ingress")
	startCmd.Flags().StringVar(&feishuSecret, "feishu-app-secret", "", "Feishu app secret for local daemon ingress")

	statusCmd := &cobra.Command{
		Use:   "status",
		Short: "Show which local machine is currently connected for this platform",
		RunE: func(cmd *cobra.Command, args []string) error {
			trimmedPlatform := strings.TrimSpace(platform)
			state, err := loadDaemonProcessState(trimmedPlatform)
			if err != nil {
				return err
			}
			if state != nil && !daemonProcessRunning(state.PID) {
				_ = removeDaemonProcessState(trimmedPlatform)
				state = nil
			}

			resp, err := clientFactory().Get(cmd.Context(), api.AgentRunnerPrimaryPath(strings.TrimSpace(platform)))
			if err != nil {
				if apiErr, ok := err.(*httpclient.APIError); ok && apiErr.StatusCode == 204 {
					if state != nil {
						return writeLocalDaemonStatus(stdout, trimmedPlatform, state)
					}
					return writeDisconnectedDaemonStatus(stdout, trimmedPlatform)
				}
				return err
			}
			if len(resp.Body) == 0 {
				if state != nil {
					return writeLocalDaemonStatus(stdout, trimmedPlatform, state)
				}
				return writeDisconnectedDaemonStatus(stdout, trimmedPlatform)
			}
			payload, marshalErr := buildDaemonStatusPayload(resp.Body, resp.RequestID, trimmedPlatform, state)
			if marshalErr != nil {
				return marshalErr
			}
			return output.WriteJSON(stdout, payload)
		},
	}
	statusCmd.Flags().StringVar(&platform, "platform", "feishu", "IM platform to inspect")

	stopCmd := &cobra.Command{
		Use:   "stop",
		Short: "Stop the current local daemon process",
		RunE: func(cmd *cobra.Command, args []string) error {
			trimmedPlatform := strings.TrimSpace(platform)
			state, err := loadDaemonProcessState(trimmedPlatform)
			if err != nil {
				return err
			}
			if state == nil {
				payload, err := json.Marshal(map[string]any{
					"status": "success",
					"data": map[string]any{
						"stopped":  false,
						"platform": trimmedPlatform,
						"message":  "No local daemon record was found for this platform.",
					},
				})
				if err != nil {
					return err
				}
				return output.WriteJSON(stdout, payload)
			}
			if !daemonProcessRunning(state.PID) {
				_ = removeDaemonProcessState(trimmedPlatform)
				payload, err := json.Marshal(map[string]any{
					"status": "success",
					"data": map[string]any{
						"stopped":  false,
						"platform": trimmedPlatform,
						"message":  "The recorded daemon process is no longer running. Removed the stale local state file.",
					},
				})
				if err != nil {
					return err
				}
				return output.WriteJSON(stdout, payload)
			}
			if err := stopDaemon(state.PID); err != nil {
				return err
			}
			deadline := time.Now().Add(5 * time.Second)
			for time.Now().Before(deadline) {
				if !daemonProcessRunning(state.PID) {
					_ = removeDaemonProcessState(trimmedPlatform)
					payload, err := json.Marshal(map[string]any{
						"status": "success",
						"data": map[string]any{
							"stopped":  true,
							"platform": trimmedPlatform,
							"pid":      state.PID,
							"message":  "The local daemon has been stopped.",
						},
					})
					if err != nil {
						return err
					}
					return output.WriteJSON(stdout, payload)
				}
				time.Sleep(100 * time.Millisecond)
			}
			return fmt.Errorf("local daemon process %d did not stop in time", state.PID)
		},
	}
	stopCmd.Flags().StringVar(&platform, "platform", "feishu", "IM platform to stop")

	cmd.AddCommand(startCmd, statusCmd, stopCmd)
	return cmd
}

func buildDaemonStatusPayload(body []byte, requestID, platform string, state *daemonProcessState) ([]byte, error) {
	var envelope struct {
		Status string `json:"status"`
		Data   struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			Platform  string `json:"platform"`
			State     string `json:"state"`
			UserID    string `json:"user_id"`
			CreatedAt string `json:"created_at"`
			UpdatedAt string `json:"updated_at"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, err
	}
	if strings.TrimSpace(envelope.Data.Platform) != "" {
		platform = strings.TrimSpace(envelope.Data.Platform)
	}
	payload := map[string]any{
		"status": "success",
		"data": map[string]any{
			"connected": true,
			"ready":     true,
			"platform":  platform,
			"machine": map[string]any{
				"id":         strings.TrimSpace(envelope.Data.ID),
				"name":       strings.TrimSpace(envelope.Data.Name),
				"state":      strings.TrimSpace(envelope.Data.State),
				"created_at": strings.TrimSpace(envelope.Data.CreatedAt),
				"updated_at": strings.TrimSpace(envelope.Data.UpdatedAt),
			},
			"message": "A local machine is connected and ready to receive chat tasks for this platform.",
			"next_steps": []string{
				"Open Feishu and send a message to the bot to start a task.",
				fmt.Sprintf("Run 'anycap agent daemon start --platform %s --executor codex --workspace /path/to/repo --feishu-app-id <app_id> --feishu-app-secret <app_secret>' on the local machine if the personal bot is not connected yet.", platform),
				fmt.Sprintf("Use '--executor claude_code' instead of codex if this %s bot should run Claude Code locally.", platform),
				fmt.Sprintf("Add '--codex-exec-mode danger-full-access' only when the human explicitly wants Codex to bypass sandbox restrictions on the local machine for %s.", platform),
			},
		},
	}
	if state != nil {
		payload["data"].(map[string]any)["daemon"] = map[string]any{
			"running":    true,
			"pid":        state.PID,
			"log_path":   strings.TrimSpace(state.LogPath),
			"runner_id":  strings.TrimSpace(state.RunnerID),
			"workspace":  strings.TrimSpace(state.Workspace),
			"executor":   strings.TrimSpace(state.Executor),
			"started_at": strings.TrimSpace(state.StartedAt),
		}
		if personalBot := inspectDaemonPersonalBotStatus(state); personalBot != nil {
			payload["data"].(map[string]any)["personal_bot"] = map[string]any{
				"configured":        personalBot.Configured,
				"connected":         personalBot.Connected,
				"last_connected_at": strings.TrimSpace(personalBot.LastConnectedAt),
				"last_error":        strings.TrimSpace(personalBot.LastError),
				"last_error_at":     strings.TrimSpace(personalBot.LastErrorAt),
			}
			if !personalBot.Connected {
				payload["data"].(map[string]any)["ready"] = false
				payload["data"].(map[string]any)["message"] = "The local machine is connected to AnyCap server, but the personal Feishu bot is not connected yet."
			}
		}
	}
	if requestID != "" {
		payload["request_id"] = requestID
	}
	return json.Marshal(payload)
}

func writeLocalDaemonStatus(stdout io.Writer, platform string, state *daemonProcessState) error {
	data := map[string]any{
		"connected": true,
		"ready":     true,
		"platform":  platform,
		"machine": map[string]any{
			"id":    strings.TrimSpace(state.RunnerID),
			"name":  strings.TrimSpace(state.MachineName),
			"state": "running",
		},
		"daemon": map[string]any{
			"running":    true,
			"pid":        state.PID,
			"log_path":   strings.TrimSpace(state.LogPath),
			"workspace":  strings.TrimSpace(state.Workspace),
			"executor":   strings.TrimSpace(state.Executor),
			"started_at": strings.TrimSpace(state.StartedAt),
		},
		"message": "The local daemon process is running for this platform.",
		"next_steps": []string{
			"Open Feishu and send a message to the personal bot.",
			fmt.Sprintf("Run 'anycap agent daemon stop --platform %s' to stop the local daemon.", platform),
		},
	}
	if personalBot := inspectDaemonPersonalBotStatus(state); personalBot != nil {
		data["personal_bot"] = map[string]any{
			"configured":        personalBot.Configured,
			"connected":         personalBot.Connected,
			"last_connected_at": strings.TrimSpace(personalBot.LastConnectedAt),
			"last_error":        strings.TrimSpace(personalBot.LastError),
			"last_error_at":     strings.TrimSpace(personalBot.LastErrorAt),
		}
		if !personalBot.Connected {
			data["ready"] = false
			data["message"] = "The local daemon is running, but the personal Feishu bot is not connected yet."
			data["next_steps"] = []string{
				fmt.Sprintf("Inspect the daemon log at %s for the most recent Feishu connection error.", strings.TrimSpace(state.LogPath)),
				fmt.Sprintf("Run 'anycap agent daemon stop --platform %s' and then start it again after fixing the Feishu connection issue.", platform),
			}
		}
	}
	payload, err := json.Marshal(map[string]any{
		"status": "success",
		"data":   data,
	})
	if err != nil {
		return err
	}
	return output.WriteJSON(stdout, payload)
}

func writeDisconnectedDaemonStatus(stdout io.Writer, platform string) error {
	payload, err := json.Marshal(map[string]any{
		"status": "success",
		"data": map[string]any{
			"connected": false,
			"platform":  platform,
			"message":   "No local machine is currently connected for this platform.",
			"next_steps": []string{
				fmt.Sprintf("Run 'anycap agent daemon start --platform %s --executor codex --workspace /path/to/repo --feishu-app-id <app_id> --feishu-app-secret <app_secret>' on the local machine you want to receive chat tasks.", platform),
				"Use '--executor claude_code' instead of codex if this bot should run Claude Code locally.",
				"Add '--codex-exec-mode danger-full-access' only if the human explicitly wants unrestricted local Codex execution.",
				fmt.Sprintf("Run 'anycap agent daemon status --platform %s' again after startup to confirm the connection.", platform),
			},
		},
	})
	if err != nil {
		return err
	}
	return output.WriteJSON(stdout, payload)
}

func startDaemonInBackground(cmd *cobra.Command, stdout io.Writer, platform, name, executorKind, codexBin, codexExecMode, claudeBin, claudePermissionMode, claudeAllowedTools, workspace, feishuAppID, feishuSecret string) error {
	executable, err := daemonExecutable()
	if err != nil {
		return err
	}
	state, err := loadDaemonProcessState(platform)
	if err != nil {
		return err
	}
	if state != nil && daemonProcessRunning(state.PID) {
		return writeLocalDaemonStatus(stdout, platform, state)
	}
	_ = removeDaemonProcessState(platform)

	args := buildDaemonForegroundArgs(cmd, platform, name, executorKind, codexBin, codexExecMode, claudeBin, claudePermissionMode, claudeAllowedTools, workspace, feishuAppID, feishuSecret)
	logPath := daemonLogPath(platform)
	pid, err := spawnDaemonProcess(executable, args, logPath)
	if err != nil {
		return err
	}

	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		loaded, err := loadDaemonProcessState(platform)
		if err == nil && loaded != nil && loaded.PID == pid {
			return writeLocalDaemonStatus(stdout, platform, loaded)
		}
		if !daemonProcessRunning(pid) {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	payload, err := json.Marshal(map[string]any{
		"status": "success",
		"data": map[string]any{
			"connected": true,
			"platform":  platform,
			"daemon": map[string]any{
				"running":  true,
				"pid":      pid,
				"log_path": logPath,
			},
			"message": "The local daemon is starting in the background.",
			"next_steps": []string{
				fmt.Sprintf("Run 'anycap agent daemon status --platform %s' to confirm the daemon is fully connected.", platform),
				fmt.Sprintf("Run 'anycap agent daemon stop --platform %s' when you want to stop the background daemon.", platform),
			},
		},
	})
	if err != nil {
		return err
	}
	return output.WriteJSON(stdout, payload)
}

func buildDaemonForegroundArgs(cmd *cobra.Command, platform, name, executorKind, codexBin, codexExecMode, claudeBin, claudePermissionMode, claudeAllowedTools, workspace, feishuAppID, feishuSecret string) []string {
	args := make([]string, 0, 20)
	if root := cmd.Root(); root != nil {
		if endpointFlag := root.PersistentFlags().Lookup("endpoint"); endpointFlag != nil {
			if endpoint := strings.TrimSpace(endpointFlag.Value.String()); endpoint != "" {
				args = append(args, "--endpoint", endpoint)
			}
		}
		if verboseFlag := root.PersistentFlags().Lookup("verbose"); verboseFlag != nil && verboseFlag.Value.String() == "true" {
			args = append(args, "--verbose")
		}
	}
	args = append(args, "agent", "daemon", "start", "--foreground", "--platform", platform, "--name", name, "--executor", executorKind)
	if codexBin != "" {
		args = append(args, "--codex-bin", codexBin)
	}
	if codexExecMode != "" {
		args = append(args, "--codex-exec-mode", codexExecMode)
	}
	if claudeBin != "" {
		args = append(args, "--claude-bin", claudeBin)
	}
	if claudePermissionMode != "" {
		args = append(args, "--claude-permission-mode", claudePermissionMode)
	}
	if claudeAllowedTools != "" {
		args = append(args, "--claude-allowed-tools", claudeAllowedTools)
	}
	if workspace != "" {
		args = append(args, "--workspace", workspace)
	}
	if feishuAppID != "" {
		args = append(args, "--feishu-app-id", feishuAppID)
	}
	if feishuSecret != "" {
		args = append(args, "--feishu-app-secret", feishuSecret)
	}
	return args
}

func runDaemonForeground(cmd *cobra.Command, clientFactory func() *httpclient.Client, stdout io.Writer, name, platform string, once bool, pollEvery time.Duration, executorKind, codexBin, codexExecMode, claudeBin, claudePermissionMode, claudeAllowedTools, workspace, feishuAppID, feishuSecret string) error {
	httpClient := &runnerServeHTTPClient{client: clientFactory()}
	trimmedPlatform := strings.TrimSpace(platform)
	reg, err := httpClient.Register(cmd.Context(), strings.TrimSpace(name), strings.TrimSpace(platform))
	if err != nil {
		return err
	}
	if reg == nil || strings.TrimSpace(reg.ID) == "" {
		return fmt.Errorf("runner registration response missing runner id")
	}
	if err := httpClient.ClaimPrimary(cmd.Context(), reg.ID); err != nil {
		return err
	}

	executor, executorName, err := newAgentRunnerExecutor(executorKind, codexBin, codexExecMode, claudeBin, claudePermissionMode, claudeAllowedTools, workspace)
	if err != nil {
		return err
	}

	baseCtx := cmd.Context()
	if baseCtx == nil {
		baseCtx = context.Background()
	}
	daemonCtx, cancel := context.WithCancel(baseCtx)
	if !once {
		daemonCtx, cancel = daemonNotifyContext(baseCtx)
	}
	defer cancel()

	state := daemonProcessState{
		PID:         os.Getpid(),
		Platform:    trimmedPlatform,
		RunnerID:    reg.ID,
		MachineName: strings.TrimSpace(reg.Name),
		Executor:    executorName,
		Workspace:   strings.TrimSpace(workspace),
		LogPath:     daemonLogPath(trimmedPlatform),
		PersonalBotEnabled: strings.EqualFold(trimmedPlatform, "feishu") &&
			strings.TrimSpace(feishuAppID) != "" &&
			strings.TrimSpace(feishuSecret) != "",
	}
	if err := saveDaemonProcessState(state); err != nil {
		return err
	}
	defer func() {
		current, err := loadDaemonProcessState(trimmedPlatform)
		if err == nil && current != nil && current.PID == state.PID {
			_ = removeDaemonProcessState(trimmedPlatform)
		}
	}()

	var botErrCh <-chan error
	trimmedFeishuAppID := strings.TrimSpace(feishuAppID)
	trimmedFeishuSecret := strings.TrimSpace(feishuSecret)
	if strings.EqualFold(trimmedPlatform, "feishu") && (trimmedFeishuAppID != "" || trimmedFeishuSecret != "") {
		if trimmedFeishuAppID == "" || trimmedFeishuSecret == "" {
			return fmt.Errorf("both --feishu-app-id and --feishu-app-secret are required for local Feishu bot ingress")
		}
		adapter := im.NewFeishuAdapter(im.FeishuAdapterConfig{
			AppID:      trimmedFeishuAppID,
			AppSecret:  trimmedFeishuSecret,
			HTTPClient: &http.Client{Timeout: 10 * time.Second},
		})
		bot := buildDaemonIMBot(im.FeishuLongConnBotConfig{
			AppID:           trimmedFeishuAppID,
			AppSecret:       trimmedFeishuSecret,
			Adapter:         adapter,
			DownloadDir:     daemonFeishuDownloadDir(strings.TrimSpace(workspace)),
			ActionDir:       daemonFeishuActionDir(strings.TrimSpace(workspace)),
			TurnMergeWindow: daemonFeishuTurnMergeWindow,
			HandleInbound: func(ctx context.Context, event im.NormalizedInboundEvent) (string, error) {
				return httpClient.InboundIMChat(ctx, event.Platform, event.BotID, event.ChannelID, event.MessageID, event.SenderID, messageForInboundChat(event))
			},
		})
		if bot == nil {
			return fmt.Errorf("failed to configure local feishu bot ingress")
		}
		errCh := make(chan error, 1)
		botErrCh = errCh
		go func() {
			errCh <- bot.Run(daemonCtx)
		}()
	}

	loop := agentcontrolapp.NewRunnerLoop(
		httpClient,
		executor,
		agentcontrolapp.WithLoopRunnerID(reg.ID),
		agentcontrolapp.WithLoopRunnerName(strings.TrimSpace(reg.Name)),
		agentcontrolapp.WithLoopRunnerPlatform(strings.TrimSpace(reg.Platform)),
		agentcontrolapp.WithLoopOnce(once),
		agentcontrolapp.WithLoopPollInterval(pollEvery),
	)
	summary, err := loop.Run(daemonCtx)
	cancel()
	if botErrCh != nil {
		if botErr := <-botErrCh; err == nil && botErr != nil {
			return botErr
		}
	}
	if err != nil {
		return err
	}
	payload, err := json.Marshal(map[string]any{
		"status": "success",
		"data": map[string]any{
			"connected": true,
			"platform":  trimmedPlatform,
			"machine": map[string]any{
				"id":    summary.RunnerID,
				"name":  strings.TrimSpace(name),
				"state": "connected",
			},
			"daemon": map[string]any{
				"running":  true,
				"pid":      os.Getpid(),
				"log_path": daemonLogPath(trimmedPlatform),
			},
			"executor":        executorName,
			"workspace":       strings.TrimSpace(workspace),
			"tasks_processed": summary.TasksProcessed,
			"tasks_succeeded": summary.TasksSucceeded,
			"tasks_failed":    summary.TasksFailed,
			"mode":            modeLabel(once),
			"message":         "The local machine is connected and ready to receive chat tasks from Feishu.",
			"next_steps": []string{
				"Open Feishu and send a message to the bot to start a task.",
				fmt.Sprintf("Run 'anycap agent daemon status --platform %s' to confirm which local machine is currently connected.", trimmedPlatform),
			},
		},
	})
	if err != nil {
		return err
	}
	return output.WriteJSON(stdout, payload)
}

func messageForInboundChat(event im.NormalizedInboundEvent) string {
	command, err := agentcontrolapp.ParseChatCommand(event.Message)
	if err != nil {
		return strings.TrimSpace(event.Message)
	}
	if command.Action != model.AgentChatActionContinue {
		return strings.TrimSpace(event.Message)
	}
	return event.AgentInputText()
}

func daemonFeishuDownloadDir(workspace string) string {
	trimmedWorkspace := strings.TrimSpace(workspace)
	if trimmedWorkspace == "" {
		return ""
	}
	return filepath.Join(trimmedWorkspace, ".anycap", "feishu-downloads")
}

func daemonFeishuActionDir(workspace string) string {
	trimmedWorkspace := strings.TrimSpace(workspace)
	if trimmedWorkspace == "" {
		return ""
	}
	return filepath.Join(trimmedWorkspace, ".anycap", "feishu-actions")
}
