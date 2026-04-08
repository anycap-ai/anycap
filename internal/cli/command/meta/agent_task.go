package meta

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newAgentTaskCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "task",
		Short: "Inspect or cancel agent tasks",
		RunE:  requireSubcommand,
	}

	getCmd := &cobra.Command{
		Use:   "get <task-id>",
		Short: "Get one agent task",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), api.AgentTaskPath(args[0]))
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cancelCmd := &cobra.Command{
		Use:   "cancel <task-id>",
		Short: "Cancel one agent task",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().PostJSON(cmd.Context(), api.AgentTaskCancelPath(args[0]), map[string]any{})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.AddCommand(getCmd, cancelCmd)
	return cmd
}
