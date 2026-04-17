package meta

import (
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func NewConnectCmd(clientFactory func() *httpclient.Client, stdin io.Reader, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "connect",
		Short: "Connect chat apps like Feishu to a local agent",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newConnectFeishuCmd(clientFactory, stdout),
		newConnectStatusCmd(clientFactory, stdout),
		newConnectStopCmd(stdout),
		newConnectCredentialsCmd(stdin, stdout),
	)
	return cmd
}

func newConnectFeishuCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		name                 string
		agentKind            string
		workspace            string
		once                 bool
		foreground           bool
		pollEvery            time.Duration
		codexBin             string
		codexExecMode        string
		claudeBin            string
		claudePermissionMode string
		claudeAllowedTools   string
		cursorBin            string
		cursorModel          string
		cursorForce          bool
	)

	cmd := &cobra.Command{
		Use:   "feishu",
		Short: "Connect Feishu to a local agent",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			executorKind, err := normalizeConnectAgent(agentKind)
			if err != nil {
				return err
			}
			effectiveCursorForce := cursorForce || executorKind == "cursor"
			if !once && !foreground {
				return startDaemonInBackground(cmd, stdout, "feishu", strings.TrimSpace(name), executorKind, strings.TrimSpace(codexBin), strings.TrimSpace(codexExecMode), strings.TrimSpace(claudeBin), strings.TrimSpace(claudePermissionMode), strings.TrimSpace(claudeAllowedTools), strings.TrimSpace(cursorBin), strings.TrimSpace(cursorModel), effectiveCursorForce, strings.TrimSpace(workspace), "", "")
			}
			return runDaemonForeground(cmd, clientFactory, stdout, strings.TrimSpace(name), "feishu", once, pollEvery, executorKind, strings.TrimSpace(codexBin), strings.TrimSpace(codexExecMode), strings.TrimSpace(claudeBin), strings.TrimSpace(claudePermissionMode), strings.TrimSpace(claudeAllowedTools), strings.TrimSpace(cursorBin), strings.TrimSpace(cursorModel), effectiveCursorForce, strings.TrimSpace(workspace), "", "")
		},
	}
	cmd.Flags().StringVar(&name, "name", "local-agent", "Local connection name")
	cmd.Flags().StringVar(&agentKind, "agent", "codex", "Local agent: codex, claude_code, cursor, or stub")
	cmd.Flags().StringVar(&workspace, "workspace", "", "Workspace directory passed to the local agent")
	cmd.Flags().BoolVar(&once, "once", false, "Run exactly one poll iteration")
	cmd.Flags().BoolVar(&foreground, "foreground", false, "Run the connection in the current foreground process")
	_ = cmd.Flags().MarkHidden("foreground")
	cmd.Flags().DurationVar(&pollEvery, "poll-interval", 3*time.Second, "Polling interval between task fetch attempts")
	cmd.Flags().StringVar(&codexBin, "codex-bin", "codex", "Path to the codex CLI binary when --agent=codex")
	cmd.Flags().StringVar(&codexExecMode, "codex-exec-mode", "safe", "Codex execution mode: safe or danger-full-access")
	cmd.Flags().StringVar(&claudeBin, "claude-bin", "claude", "Path to the Claude Code CLI binary when --agent=claude_code")
	cmd.Flags().StringVar(&claudePermissionMode, "claude-permission-mode", "acceptEdits", "Claude Code permission mode passed to --permission-mode")
	cmd.Flags().StringVar(&claudeAllowedTools, "claude-allowed-tools", "", "Optional Claude Code --allowedTools value, for example Read,Edit,Bash")
	cmd.Flags().StringVar(&cursorBin, "cursor-bin", "cursor-agent", "Path to the Cursor Agent CLI binary when --agent=cursor")
	cmd.Flags().StringVar(&cursorModel, "cursor-model", "", "Optional Cursor Agent model passed to --model")
	cmd.Flags().BoolVar(&cursorForce, "cursor-force", false, "Pass --force to Cursor Agent to allow commands unless explicitly denied; enabled automatically for --agent=cursor")
	return cmd
}

func newConnectStatusCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "status <platform>",
		Short: "Show which local machine is connected for a chat app",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return writeDaemonStatus(cmd, clientFactory, stdout, args[0])
		},
	}
}

func newConnectStopCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "stop <platform>",
		Short: "Stop the local chat app connection",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return stopDaemonForPlatform(stdout, args[0])
		},
	}
}

func newConnectCredentialsCmd(stdin io.Reader, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "credentials",
		Short: "Manage local chat app credentials",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newConnectCredentialsSetCmd(stdin, stdout),
		newConnectCredentialsShowCmd(stdout),
		newConnectCredentialsDeleteCmd(stdout),
	)
	return cmd
}

func newConnectCredentialsSetCmd(stdin io.Reader, stdout io.Writer) *cobra.Command {
	var (
		appID          string
		appSecret      string
		appSecretStdin bool
	)
	cmd := &cobra.Command{
		Use:   "set <platform>",
		Short: "Store local chat app credentials",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := requireFeishuConnectPlatform(args[0]); err != nil {
				return err
			}
			trimmedAppID := strings.TrimSpace(appID)
			if trimmedAppID == "" {
				trimmedAppID = strings.TrimSpace(os.Getenv("FEISHU_APP_ID"))
			}
			secret := strings.TrimSpace(appSecret)
			if appSecretStdin {
				body, err := io.ReadAll(stdin)
				if err != nil {
					return err
				}
				secret = strings.TrimSpace(string(body))
			}
			return writeFeishuDaemonCredentials(stdout, trimmedAppID, secret)
		},
	}
	cmd.Flags().StringVar(&appID, "app-id", "", "Feishu app ID")
	cmd.Flags().StringVar(&appSecret, "app-secret", "", "Feishu app secret")
	cmd.Flags().BoolVar(&appSecretStdin, "app-secret-stdin", false, "Read Feishu app secret from stdin")
	return cmd
}

func newConnectCredentialsShowCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "show <platform>",
		Short: "Show local chat app credential status",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := requireFeishuConnectPlatform(args[0]); err != nil {
				return err
			}
			return writeFeishuDaemonCredentialStatus(stdout)
		},
	}
}

func newConnectCredentialsDeleteCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "delete <platform>",
		Short: "Delete local chat app credentials",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := requireFeishuConnectPlatform(args[0]); err != nil {
				return err
			}
			return deleteFeishuDaemonCredentials(stdout)
		},
	}
}

func normalizeConnectAgent(agent string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(agent)) {
	case "", "codex":
		return "codex", nil
	case "claude", "claude_code", "claude-code":
		return "claude_code", nil
	case "cursor", "cursor_agent", "cursor-agent":
		return "cursor", nil
	case "stub":
		return "stub", nil
	default:
		return "", fmt.Errorf("unsupported agent %q", agent)
	}
}

func requireFeishuConnectPlatform(platform string) error {
	if strings.EqualFold(strings.TrimSpace(platform), "feishu") {
		return nil
	}
	return fmt.Errorf("unsupported credentials platform %q", platform)
}
