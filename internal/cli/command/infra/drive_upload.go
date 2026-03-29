package infra

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func newDriveUploadCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		parentID   int64
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
			stat, err := os.Stat(filePath)
			if err != nil {
				return err
			}
			if stat.IsDir() {
				return fmt.Errorf("upload expects a file, got directory: %s", filePath)
			}

			contentType, err := detectContentType(filePath)
			if err != nil {
				return err
			}

			client := clientFactory()
			var resolvedParentID *int64
			if parentIDSet {
				resolvedParentID = &parentID
			} else if parentPath != "" {
				id, resolveErr := resolveDriveFolderPath(cmd.Context(), client, parentPath)
				if resolveErr != nil {
					return resolveErr
				}
				resolvedParentID = id
			}

			presignResp, err := client.PostJSON(cmd.Context(), "/v1/drive/files/presign", map[string]any{
				"parent_id":      resolvedParentID,
				"name":           filepath.Base(filePath),
				"content_type":   contentType,
				"content_length": stat.Size(),
			})
			if err != nil {
				return err
			}

			presignData, err := decodeSuccessData[struct {
				UploadSessionID int64  `json:"upload_session_id"`
				FileID          int64  `json:"file_id"`
				UploadURL       string `json:"upload_url"`
			}](presignResp)
			if err != nil {
				return err
			}

			if err := uploadFileToPresignedURL(cmd.Context(), presignData.UploadURL, filePath, contentType, stat.Size()); err != nil {
				return err
			}

			completeResp, err := client.PostJSON(cmd.Context(), "/v1/drive/files/complete", map[string]any{
				"upload_session_id": presignData.UploadSessionID,
				"file_id":           presignData.FileID,
			})
			if err != nil {
				return err
			}

			completeData, err := decodeSuccessData[struct {
				ID   int64  `json:"id"`
				Name string `json:"name"`
				Size *int64 `json:"size,omitempty"`
			}](completeResp)
			if err != nil {
				return err
			}

			size := stat.Size()
			if completeData.Size != nil {
				size = *completeData.Size
			}
			return writeFlatSuccess(stdout, completeResp.RequestID, map[string]any{
				"status":  "success",
				"file_id": completeData.ID,
				"name":    completeData.Name,
				"size":    size,
			})
		},
	}

	cmd.Flags().Int64Var(&parentID, "parent", 0, "Parent folder ID")
	cmd.Flags().StringVar(&parentPath, "parent-path", "", "Parent folder path (for example: /docs)")

	return cmd
}
