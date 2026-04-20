package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func newDriveUploadCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		parentID   string
		parentPath string
	)

	cmd := &cobra.Command{
		Use:   "upload <file>",
		Short: "Upload a file to drive",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			parentIDSet := cmd.Flags().Changed("parent")
			if parentIDSet && parentPath != "" {
				return fmt.Errorf("--parent and --parent-path cannot be used together")
			}

			filePath := args[0]
			client := clientFactory()
			var resolvedParentID *string
			if parentIDSet {
				parsedParentID, parseErr := parseResourceID(parentID, "parent")
				if parseErr != nil {
					return parseErr
				}
				resolvedParentID = &parsedParentID
			} else if parentPath != "" {
				id, resolveErr := resolveDriveFolderPath(cmd.Context(), client, parentPath)
				if resolveErr != nil {
					return resolveErr
				}
				resolvedParentID = id
			}

			result, err := uploadLocalFileToDrive(cmd.Context(), client, filePath, resolvedParentID)
			if err != nil {
				return err
			}
			return writeFlatSuccess(stdout, "", map[string]any{
				"status":  "success",
				"file_id": result.FileID,
				"name":    result.Name,
				"size":    result.Size,
			})
		},
	}

	cmd.Flags().StringVar(&parentID, "parent", "", "Parent folder ID")
	cmd.Flags().StringVar(&parentPath, "parent-path", "", "Parent folder path (for example: /docs)")

	return cmd
}
