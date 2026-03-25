package meta

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func NewStatusCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "status",
		Short: "Show AnyCap server status",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), "/v1/status")
			if err != nil {
				return err
			}

			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
}
