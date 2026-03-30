package infra

import (
	"fmt"

	"github.com/spf13/cobra"
)

func requireSubcommand(cmd *cobra.Command, _ []string) error {
	return fmt.Errorf("subcommand required, see '%s --help' for usage", cmd.CommandPath())
}
