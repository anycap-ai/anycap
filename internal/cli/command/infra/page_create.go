package infra

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newPageCreateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var name string

	cmd := &cobra.Command{
		Use:   "create",
		Short: "Create a page site",
		RunE: func(cmd *cobra.Command, _ []string) error {
			resp, err := clientFactory().PostJSON(cmd.Context(), "/v1/pages", map[string]any{
				"name": name,
			})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&name, "name", "", "Site display name")

	return cmd
}
