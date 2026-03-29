package infra

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func NewPageCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "page",
		Short: "Manage static page sites and versions",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newPageCreateCmd(clientFactory, stdout),
		newPageListCmd(clientFactory, stdout),
		newPageInfoCmd(clientFactory, stdout),
		newPageSetCmd(clientFactory, stdout),
		newPageDeployCmd(clientFactory, stdout),
		newPagePublishCmd(clientFactory, stdout),
		newPageUnpublishCmd(clientFactory, stdout),
		newPageVersionsCmd(clientFactory, stdout),
		newPageRollbackCmd(clientFactory, stdout),
	)

	return cmd
}
