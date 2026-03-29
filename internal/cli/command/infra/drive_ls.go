package infra

import (
	"fmt"
	"io"
	"net/url"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newDriveLsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		parentID   int64
		parentPath string
	)

	cmd := &cobra.Command{
		Use:   "ls",
		Short: "List drive nodes under a folder",
		RunE: func(cmd *cobra.Command, _ []string) error {
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

			path := "/v1/drive/nodes"
			if resolvedParentID != nil {
				path += "?parent_id=" + url.QueryEscape(strconv.FormatInt(*resolvedParentID, 10))
			}

			resp, err := client.Get(cmd.Context(), path)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().Int64Var(&parentID, "parent", 0, "Parent folder ID")
	cmd.Flags().StringVar(&parentPath, "parent-path", "", "Parent folder path (for example: /docs)")

	return cmd
}
