package meta

import (
	"encoding/json"
	"io"
	"os"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/fileutil"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

// NewDownloadCmd creates the "download" command for saving remote files locally.
func NewDownloadCmd(stdout io.Writer) *cobra.Command {
	var outputPath string

	cmd := &cobra.Command{
		Use:   "download <url>",
		Short: "Download a file from a URL to local disk",
		Long: `Download a file from a URL and save it locally. Useful for saving images,
videos, or other outputs returned by AnyCap commands.

Examples:
  anycap download https://files.anycap.ai/abc/output.png
  anycap download https://files.anycap.ai/abc/output.png -o result.png
  anycap download https://files.anycap.ai/abc/output.png -o ./images/result.png`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			fileURL := args[0]

			// Resolve output path.
			savePath := outputPath
			if savePath == "" {
				savePath = fileutil.FilenameFromURL(fileURL)
			}

			absPath, err := fileutil.DownloadFile(fileURL, savePath)
			if err != nil {
				return err
			}

			info, _ := os.Stat(absPath)
			result := map[string]any{
				"status": "success",
				"path":   absPath,
			}
			if info != nil {
				result["size"] = info.Size()
			}
			data, _ := json.Marshal(result)
			return output.WriteJSON(stdout, data)
		},
	}

	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Output file path (default: filename from URL)")

	return cmd
}
