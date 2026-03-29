package infra

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newPageListCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "list",
		Short: "List page sites",
		RunE: func(cmd *cobra.Command, _ []string) error {
			resp, err := clientFactory().Get(cmd.Context(), "/v1/pages")
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
}
