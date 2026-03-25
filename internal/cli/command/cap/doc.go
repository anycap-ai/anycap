// Package cap contains capability-oriented CLI commands such as image and video.
package cap

import (
	"fmt"

	"github.com/spf13/cobra"
)

// requireSubcommand is a RunE for parent commands that have no action of their own.
// It returns a helpful error when invoked without a valid subcommand.
func requireSubcommand(cmd *cobra.Command, args []string) error {
	if len(args) > 0 {
		return fmt.Errorf("unknown command %q for %q", args[0], cmd.CommandPath())
	}
	return fmt.Errorf("subcommand required, see '%s --help' for usage", cmd.CommandPath())
}
