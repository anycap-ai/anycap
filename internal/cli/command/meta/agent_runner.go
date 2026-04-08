package meta

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newAgentRunnersCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "runners",
		Short: "Manage agent runners",
		RunE:  requireSubcommand,
	}

	listCmd := &cobra.Command{
		Use:   "list",
		Short: "List registered runners",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), api.AgentRunnersPath)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.AddCommand(listCmd)
	cmd.AddCommand(newAgentRunnerServeCmd(clientFactory, stdout))
	return cmd
}
