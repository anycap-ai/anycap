package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newDriveMkdirCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		parentID   string
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
			var resolvedParentID *string
			if parentIDSet {
				parsedParentID, parseErr := parseResourceID(parentID, "parent")
				if parseErr != nil {
					return parseErr
				}
				resolvedParentID = &parsedParentID
			} else if parentPath != "" {
				id, err := resolveDriveFolderPath(cmd.Context(), client, parentPath)
				if err != nil {
					return err
				}
				resolvedParentID = id
			}

			resp, err := client.PostJSON(cmd.Context(), api.DriveFoldersPath, map[string]any{
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
	cmd.Flags().StringVar(&parentID, "parent", "", "Parent folder ID")
	cmd.Flags().StringVar(&parentPath, "parent-path", "", "Parent folder path (for example: /docs)")
	_ = cmd.MarkFlagRequired("name")

	return cmd
}
