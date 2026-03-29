package infra

import (
	"fmt"

	"github.com/spf13/cobra"
)

func requireSubcommand(_ *cobra.Command, _ []string) error {
	return fmt.Errorf("please specify a subcommand")
}
