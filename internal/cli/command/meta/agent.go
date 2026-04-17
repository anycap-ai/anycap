package meta

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func NewAgentCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "agent",
		Short: "Run the daemon-first local agent flow, plus legacy/debug agent controls",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newAgentIMBindingsCmd(clientFactory, stdout),
		newAgentDaemonCmd(clientFactory, stdout),
		newAgentRunnersCmd(clientFactory, stdout),
		newAgentConversationsCmd(clientFactory, stdout),
		newAgentTaskCmd(clientFactory, stdout),
	)

	return cmd
}

func requireSubcommand(cmd *cobra.Command, _ []string) error {
	return fmt.Errorf("%s requires a subcommand", cmd.CommandPath())
}
