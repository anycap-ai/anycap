package meta

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newAgentConversationsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "conversations",
		Short: "Inspect or control agent conversations",
		RunE:  requireSubcommand,
	}

	listCmd := &cobra.Command{
		Use:   "list",
		Short: "List agent conversations",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), api.AgentConversationsPath)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	getCmd := &cobra.Command{
		Use:   "get <conversation-id>",
		Short: "Get one agent conversation",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), api.AgentConversationPath(args[0]))
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	stopCmd := &cobra.Command{
		Use:   "stop <conversation-id>",
		Short: "Stop one active conversation",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().PostJSON(cmd.Context(), api.AgentConversationStopPath(args[0]), map[string]any{})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	var resetMessage string
	resetCmd := &cobra.Command{
		Use:   "reset <conversation-id>",
		Short: "Archive the current conversation and start a new one",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			payload := map[string]any{}
			if resetMessage != "" {
				payload["message"] = resetMessage
			}
			resp, err := clientFactory().PostJSON(cmd.Context(), api.AgentConversationResetPath(args[0]), payload)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	resetCmd.Flags().StringVar(&resetMessage, "message", "", "Optional system message for the new conversation")

	var forkMessage string
	forkCmd := &cobra.Command{
		Use:   "fork <conversation-id>",
		Short: "Fork the current conversation into a new branch",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			payload := map[string]any{}
			if forkMessage != "" {
				payload["message"] = forkMessage
			}
			resp, err := clientFactory().PostJSON(cmd.Context(), api.AgentConversationForkPath(args[0]), payload)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	forkCmd.Flags().StringVar(&forkMessage, "message", "", "Optional prompt for the forked conversation")

	var fireMessage string
	fireCmd := &cobra.Command{
		Use:   "fire <conversation-id>",
		Short: "Consume pending mailbox results and continue the conversation",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			payload := map[string]any{}
			if fireMessage != "" {
				payload["message"] = fireMessage
			}
			resp, err := clientFactory().PostJSON(cmd.Context(), api.AgentConversationFirePath(args[0]), payload)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	fireCmd.Flags().StringVar(&fireMessage, "message", "", "Optional instruction appended when firing mailbox results")

	cmd.AddCommand(listCmd, getCmd, stopCmd, resetCmd, forkCmd, fireCmd)
	return cmd
}
