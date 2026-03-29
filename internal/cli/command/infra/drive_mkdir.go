package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newDriveMkdirCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		parentID   int64
		parentPath string
		folderName string
	)

	cmd := &cobra.Command{
		Use:   "mkdir",
		Short: "Create a drive folder",
		RunE: func(cmd *cobra.Command, _ []string) error {
			if folderName == "" {
				return fmt.Errorf("--name is required")
			}
			parentIDSet := cmd.Flags().Changed("parent")
			if parentIDSet && parentPath != "" {
				return fmt.Errorf("--parent and --parent-path cannot be used together")
			}

			client := clientFactory()
			var resolvedParentID *int64
			if parentIDSet {
				resolvedParentID = &parentID
			} else if parentPath != "" {
				id, err := resolveDriveFolderPath(cmd.Context(), client, parentPath)
				if err != nil {
					return err
				}
				resolvedParentID = id
			}

			resp, err := client.PostJSON(cmd.Context(), "/v1/drive/folders", map[string]any{
				"parent_id": resolvedParentID,
				"name":      folderName,
			})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&folderName, "name", "", "Folder name")
	cmd.Flags().Int64Var(&parentID, "parent", 0, "Parent folder ID")
	cmd.Flags().StringVar(&parentPath, "parent-path", "", "Parent folder path (for example: /docs)")
	_ = cmd.MarkFlagRequired("name")

	return cmd
}
