package meta

import (
	"fmt"
	"io"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func NewLogoutCmd(clientFactory func() *httpclient.Client, stderr io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "logout",
		Short: "Remove stored credentials",
		RunE: func(cmd *cobra.Command, args []string) error {
			if clientFactory != nil {
				if cred := cliconfig.LoadCredential(); cred != nil && cred.Token() != "" {
					_, _ = clientFactory().PostJSON(cmd.Context(), api.AuthLogoutPath, map[string]any{})
				}
			}
			if err := cliconfig.DeleteCredential(); err != nil {
				return fmt.Errorf("failed to remove credentials: %w", err)
			}
			fmt.Fprintln(stderr, "Logged out. Credentials removed.")
			return nil
		},
	}
}
