package infra

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func NewDriveCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "drive",
		Short: "Manage drive folders, files, and share links",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newDriveMkdirCmd(clientFactory, stdout),
		newDriveLsCmd(clientFactory, stdout),
		newDriveUploadCmd(clientFactory, stdout),
		newDriveMvCmd(clientFactory, stdout),
		newDriveRmCmd(clientFactory, stdout),
		newDriveShareCmd(clientFactory, stdout),
		newDriveUnshareCmd(clientFactory, stdout),
	)

	return cmd
}
