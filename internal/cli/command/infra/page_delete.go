package infra

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/projectconfig"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newPageDeleteCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		siteFlag   string
		targetFlag string
	)

	cmd := &cobra.Command{
		Use:   "delete [page-id]",
		Short: "Delete a page site",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			projCfg, _ := projectconfig.Load()
			pageID, err := resolvePageSiteID(args, siteFlag, targetFlag, projCfg)
			if err != nil {
				return err
			}

			resp, err := clientFactory().Delete(cmd.Context(), api.PagePath(pageID))
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&siteFlag, "page-id", "", "Page site ID")
	cmd.Flags().StringVar(&targetFlag, "target", "", "Named target from anycap.toml")

	return cmd
}
