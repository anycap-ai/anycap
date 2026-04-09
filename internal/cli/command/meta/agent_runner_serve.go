package meta

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

type runnerServeHTTPClient struct {
	client *httpclient.Client
}

func (c *runnerServeHTTPClient) Register(ctx context.Context, name string, platform string) (*agentcontrolapp.RunnerRegistration, error) {
	resp, err := c.client.PostJSON(ctx, api.AgentRunnersPath+"/register", map[string]any{
		"name":     strings.TrimSpace(name),
		"platform": strings.TrimSpace(platform),
	})
	if err != nil {
		return nil, err
	}
	var envelope struct {
		Data struct {
			ID       string `json:"id"`
			Name     string `json:"name"`
			Platform string `json:"platform"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return nil, fmt.Errorf("decode runner register response: %w", err)
	}
	return &agentcontrolapp.RunnerRegistration{
		ID:       strings.TrimSpace(envelope.Data.ID),
		Name:     strings.TrimSpace(envelope.Data.Name),
		Platform: strings.TrimSpace(envelope.Data.Platform),
	}, nil
}

func (c *runnerServeHTTPClient) Heartbeat(ctx context.Context, runnerID string, state string) error {
	_, err := c.client.PostJSON(ctx, api.AgentRunnersPath+"/"+runnerID+"/heartbeat", map[string]any{
		"state": strings.TrimSpace(state),
	})
	return err
}

func (c *runnerServeHTTPClient) ClaimPrimary(ctx context.Context, runnerID string) error {
	_, err := c.client.PostJSON(ctx, api.AgentRunnerClaimPrimaryPath(runnerID), map[string]any{})
	return err
}

func (c *runnerServeHTTPClient) InboundIMChat(ctx context.Context, platform, botID, chatID, senderID, message string) (string, error) {
	resp, err := c.client.PostJSON(ctx, api.AgentIMInboundPath(), map[string]any{
		"platform":  strings.TrimSpace(platform),
		"bot_id":    strings.TrimSpace(botID),
		"chat_id":   strings.TrimSpace(chatID),
		"sender_id": strings.TrimSpace(senderID),
		"message":   strings.TrimSpace(message),
	})
	if err != nil {
		return "", err
	}
	var envelope struct {
		Data struct {
			ReplyMessage string `json:"reply_message"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return "", fmt.Errorf("decode inbound im chat response: %w", err)
	}
	return strings.TrimSpace(envelope.Data.ReplyMessage), nil
}

func (c *runnerServeHTTPClient) NextSession(ctx context.Context, runnerID string) (*agentcontrolapp.RunnerSession, error) {
	resp, err := c.client.Get(ctx, api.AgentRunnerNextSessionPath(runnerID))
	if err != nil {
		if apiErr, ok := err.(*httpclient.APIError); ok && apiErr.StatusCode == 204 {
			return nil, nil
		}
		return nil, err
	}
	if len(resp.Body) == 0 {
		return nil, nil
	}
	var envelope struct {
		Data struct {
			ID              string  `json:"id"`
			UserID          string  `json:"user_id"`
			ConversationID  string  `json:"conversation_id"`
			ParentSessionID *string `json:"parent_session_id"`
			RunnerID        string  `json:"runner_id"`
			Agent           string  `json:"agent"`
			Mode            string  `json:"mode"`
			UserMessage     *string `json:"user_message"`
			FinalMessage    *string `json:"final_message"`
			Status          string  `json:"status"`
			ExecutorRef     *string `json:"executor_ref"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return nil, fmt.Errorf("decode next session response: %w", err)
	}
	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, nil
	}
	return &agentcontrolapp.RunnerSession{
		ID:              strings.TrimSpace(envelope.Data.ID),
		UserID:          strings.TrimSpace(envelope.Data.UserID),
		ConversationID:  strings.TrimSpace(envelope.Data.ConversationID),
		ParentSessionID: envelope.Data.ParentSessionID,
		RunnerID:        strings.TrimSpace(envelope.Data.RunnerID),
		Agent:           strings.TrimSpace(envelope.Data.Agent),
		Mode:            strings.TrimSpace(envelope.Data.Mode),
		UserMessage:     envelope.Data.UserMessage,
		FinalMessage:    envelope.Data.FinalMessage,
		Status:          strings.TrimSpace(envelope.Data.Status),
		ExecutorRef:     envelope.Data.ExecutorRef,
	}, nil
}

func (c *runnerServeHTTPClient) GetSession(ctx context.Context, runnerID string, sessionID string) (*agentcontrolapp.RunnerSession, error) {
	resp, err := c.client.Get(ctx, api.AgentRunnerSessionStatusPath(runnerID, sessionID))
	if err != nil {
		return nil, err
	}
	var envelope struct {
		Data struct {
			ID              string  `json:"id"`
			UserID          string  `json:"user_id"`
			ConversationID  string  `json:"conversation_id"`
			ParentSessionID *string `json:"parent_session_id"`
			RunnerID        string  `json:"runner_id"`
			Agent           string  `json:"agent"`
			Mode            string  `json:"mode"`
			UserMessage     *string `json:"user_message"`
			FinalMessage    *string `json:"final_message"`
			Status          string  `json:"status"`
			ExecutorRef     *string `json:"executor_ref"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return nil, fmt.Errorf("decode session response: %w", err)
	}
	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, nil
	}
	return &agentcontrolapp.RunnerSession{
		ID:              strings.TrimSpace(envelope.Data.ID),
		UserID:          strings.TrimSpace(envelope.Data.UserID),
		ConversationID:  strings.TrimSpace(envelope.Data.ConversationID),
		ParentSessionID: envelope.Data.ParentSessionID,
		RunnerID:        strings.TrimSpace(envelope.Data.RunnerID),
		Agent:           strings.TrimSpace(envelope.Data.Agent),
		Mode:            strings.TrimSpace(envelope.Data.Mode),
		UserMessage:     envelope.Data.UserMessage,
		FinalMessage:    envelope.Data.FinalMessage,
		Status:          strings.TrimSpace(envelope.Data.Status),
		ExecutorRef:     envelope.Data.ExecutorRef,
	}, nil
}

func (c *runnerServeHTTPClient) NextTask(ctx context.Context, runnerID string) (*agentcontrolapp.RunnerTask, error) {
	resp, err := c.client.Get(ctx, api.AgentRunnerNextTaskPath(runnerID))
	if err != nil {
		if apiErr, ok := err.(*httpclient.APIError); ok && apiErr.StatusCode == 204 {
			return nil, nil
		}
		return nil, err
	}
	if len(resp.Body) == 0 {
		return nil, nil
	}
	var envelope struct {
		Data struct {
			ID             string  `json:"id"`
			UserID         string  `json:"user_id"`
			RunnerID       string  `json:"runner_id"`
			Platform       string  `json:"platform"`
			Intent         string  `json:"intent"`
			TaskText       string  `json:"task_text"`
			WorkspaceHint  *string `json:"workspace_hint"`
			RunnerSelector *string `json:"runner_selector"`
			Status         string  `json:"status"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return nil, fmt.Errorf("decode next task response: %w", err)
	}
	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, nil
	}
	return &agentcontrolapp.RunnerTask{
		ID:             strings.TrimSpace(envelope.Data.ID),
		UserID:         strings.TrimSpace(envelope.Data.UserID),
		RunnerID:       strings.TrimSpace(envelope.Data.RunnerID),
		Platform:       strings.TrimSpace(envelope.Data.Platform),
		Intent:         strings.TrimSpace(envelope.Data.Intent),
		TaskText:       strings.TrimSpace(envelope.Data.TaskText),
		WorkspaceHint:  envelope.Data.WorkspaceHint,
		RunnerSelector: envelope.Data.RunnerSelector,
		Status:         strings.TrimSpace(envelope.Data.Status),
	}, nil
}

func (c *runnerServeHTTPClient) UpdateSession(ctx context.Context, runnerID string, sessionID string, status string, finalMessage *string, executorRef *string, _ string) error {
	payload := map[string]any{
		"status": strings.TrimSpace(status),
	}
	if finalMessage != nil && strings.TrimSpace(*finalMessage) != "" {
		payload["final_message"] = strings.TrimSpace(*finalMessage)
	}
	if executorRef != nil && strings.TrimSpace(*executorRef) != "" {
		payload["executor_ref"] = strings.TrimSpace(*executorRef)
	}
	_, err := c.client.PostJSON(ctx, api.AgentRunnerSessionPath(runnerID, sessionID), payload)
	return err
}

func (c *runnerServeHTTPClient) UpdateTask(ctx context.Context, runnerID string, taskID string, status string, errorMessage *string, _ string) error {
	payload := map[string]any{
		"status": strings.TrimSpace(status),
	}
	if errorMessage != nil && strings.TrimSpace(*errorMessage) != "" {
		payload["error_message"] = strings.TrimSpace(*errorMessage)
	}
	_, err := c.client.PostJSON(ctx, api.AgentRunnersPath+"/"+runnerID+"/tasks/"+taskID, payload)
	return err
}

func newAgentRunnerServeCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		name          string
		platform      string
		runnerID      string
		once          bool
		pollEvery     time.Duration
		executorKind  string
		codexBin      string
		codexExecMode string
		workspace     string
		stubResult    string
		stubDelay     time.Duration
		stubMessage   string
	)

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Run a polling agent runner loop",
		RunE: func(cmd *cobra.Command, args []string) error {
			var (
				executor     agentcontrolapp.RunnerTaskExecutor
				executorName string
			)
			result := strings.ToLower(strings.TrimSpace(stubResult))
			switch strings.ToLower(strings.TrimSpace(executorKind)) {
			case "", "stub":
				var execErr error
				switch result {
				case "", "success", "succeeded":
					execErr = nil
				case "fail", "failed":
					msg := strings.TrimSpace(stubMessage)
					if msg == "" {
						msg = "stub executor failed"
					}
					execErr = fmt.Errorf("%s", msg)
				default:
					return fmt.Errorf("unsupported stub result %q", stubResult)
				}
				executor = agentcontrolapp.StubExecutor{
					Delay:        stubDelay,
					FailureError: execErr,
				}
				executorName = "stub"
			case "codex":
				executor = newCodexExecExecutor(codexBin, workspace, codexExecMode)
				executorName = "codex"
			default:
				return fmt.Errorf("unsupported executor %q", executorKind)
			}

			loop := agentcontrolapp.NewRunnerLoop(
				&runnerServeHTTPClient{client: clientFactory()},
				executor,
				agentcontrolapp.WithLoopRunnerID(strings.TrimSpace(runnerID)),
				agentcontrolapp.WithLoopRunnerName(strings.TrimSpace(name)),
				agentcontrolapp.WithLoopRunnerPlatform(strings.TrimSpace(platform)),
				agentcontrolapp.WithLoopOnce(once),
				agentcontrolapp.WithLoopPollInterval(pollEvery),
			)

			summary, err := loop.Run(cmd.Context())
			if err != nil {
				return err
			}
			payload, err := json.Marshal(map[string]any{
				"status": "success",
				"data": map[string]any{
					"runner_id":        summary.RunnerID,
					"tasks_processed":  summary.TasksProcessed,
					"tasks_succeeded":  summary.TasksSucceeded,
					"tasks_failed":     summary.TasksFailed,
					"mode":             modeLabel(once),
					"executor":         executorName,
					"stub_result":      resultOrDefault(result),
					"poll_interval_ms": pollEvery.Milliseconds(),
				},
			})
			if err != nil {
				return err
			}
			return output.WriteJSON(stdout, payload)
		},
	}

	cmd.Flags().StringVar(&name, "name", "", "Runner name used when registering a new runner")
	cmd.Flags().StringVar(&platform, "platform", "feishu", "IM platform for runner registration")
	cmd.Flags().StringVar(&runnerID, "runner-id", "", "Existing runner ID to reuse instead of registering")
	cmd.Flags().BoolVar(&once, "once", false, "Run exactly one poll iteration")
	cmd.Flags().DurationVar(&pollEvery, "poll-interval", 3*time.Second, "Polling interval between task fetch attempts")
	cmd.Flags().StringVar(&executorKind, "executor", "stub", "Runner executor: stub or codex")
	cmd.Flags().StringVar(&codexBin, "codex-bin", "codex", "Path to the codex CLI binary when --executor=codex")
	cmd.Flags().StringVar(&codexExecMode, "codex-exec-mode", "safe", "Codex execution mode: safe or danger-full-access")
	cmd.Flags().StringVar(&workspace, "workspace", "", "Workspace directory passed to codex exec")
	cmd.Flags().StringVar(&stubResult, "stub-result", "success", "Stub executor result: success or failed")
	cmd.Flags().DurationVar(&stubDelay, "stub-delay", 0, "Optional stub executor delay")
	cmd.Flags().StringVar(&stubMessage, "stub-message", "", "Failure message when --stub-result=failed")

	return cmd
}

func modeLabel(once bool) string {
	if once {
		return "once"
	}
	return "loop"
}

func resultOrDefault(v string) string {
	if strings.TrimSpace(v) == "" {
		return "success"
	}
	return v
}
