package meta

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func NewLoginCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "login",
		Short: "Start login flow",
		RunE: func(cmd *cobra.Command, args []string) error {
			payload, err := clientFactory().PostJSON(cmd.Context(), "/v1/login/init", map[string]any{})
			if err != nil {
				return err
			}

			return output.WriteJSON(stdout, payload)
		},
	}
}
