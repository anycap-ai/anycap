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
		Short: "Manage IM bindings, runners, and agent tasks",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newAgentIMBindingsCmd(clientFactory, stdout),
		newAgentRunnersCmd(clientFactory, stdout),
		newAgentConversationsCmd(clientFactory, stdout),
		newAgentTaskCmd(clientFactory, stdout),
	)

	return cmd
}

func requireSubcommand(cmd *cobra.Command, _ []string) error {
	return fmt.Errorf("%s requires a subcommand", cmd.CommandPath())
}
