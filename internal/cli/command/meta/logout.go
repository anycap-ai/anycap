package meta

import (
	"fmt"
	"io"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"

	"github.com/spf13/cobra"
)

func NewLogoutCmd(stderr io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "logout",
		Short: "Remove stored credentials",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := cliconfig.DeleteCredential(); err != nil {
				return fmt.Errorf("failed to remove credentials: %w", err)
			}
			fmt.Fprintln(stderr, "Logged out. Credentials removed.")
			return nil
		},
	}
}
