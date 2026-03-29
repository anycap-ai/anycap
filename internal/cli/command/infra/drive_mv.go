package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newDriveMvCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		dstParentID   string
		dstParentPath string
		newName       string
		srcPath       string
	)

	cmd := &cobra.Command{
		Use:   "mv [node-id]",
		Short: "Move or rename a drive node",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			nodeID, err := resolveDriveNodeID(client, cmd.Context(), args, srcPath)
			if err != nil {
				return err
			}
			dstParentIDSet := cmd.Flags().Changed("dst-parent")
			if dstParentIDSet && dstParentPath != "" {
				return fmt.Errorf("--dst-parent and --dst-parent-path cannot be used together")
			}
			if !dstParentIDSet && dstParentPath == "" && newName == "" {
				return fmt.Errorf("at least one of --dst-parent/--dst-parent-path/--name is required")
			}

			payload := map[string]any{}

			if newName != "" {
				payload["name"] = newName
			}
			if dstParentIDSet {
				parsedParentID, parseErr := parseResourceID(dstParentID, "dst-parent")
				if parseErr != nil {
					return parseErr
				}
				payload["parent_id"] = parsedParentID
			} else if dstParentPath != "" {
				resolvedParentID, resolveErr := resolveDriveFolderPath(cmd.Context(), client, dstParentPath)
				if resolveErr != nil {
					return resolveErr
				}
				payload["parent_id"] = resolvedParentID
			}

			resp, err := client.PatchJSON(cmd.Context(), "/v1/drive/nodes/"+nodeID, payload)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&dstParentID, "dst-parent", "", "Destination parent folder ID")
	cmd.Flags().StringVar(&dstParentPath, "dst-parent-path", "", "Destination parent folder path")
	cmd.Flags().StringVar(&srcPath, "src-path", "", "Source node path (for example: /docs/readme.md)")
	cmd.Flags().StringVar(&newName, "name", "", "New node name")

	return cmd
}
