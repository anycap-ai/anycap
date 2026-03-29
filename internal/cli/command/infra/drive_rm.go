package infra

import (
	"io"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newDriveRmCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var srcPath string

	cmd := &cobra.Command{
		Use:   "rm [node-id]",
		Short: "Delete a drive node (folder delete is recursive)",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			nodeID, err := resolveDriveNodeID(client, cmd.Context(), args, srcPath)
			if err != nil {
				return err
			}

			resp, err := client.Delete(cmd.Context(), "/v1/drive/nodes/"+strconv.FormatInt(nodeID, 10))
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	cmd.Flags().StringVar(&srcPath, "src-path", "", "Source node path (for example: /docs/readme.md)")
	return cmd
}
