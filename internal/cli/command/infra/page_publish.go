package infra

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newPagePublishCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var versionNo int64

	cmd := &cobra.Command{
		Use:   "publish <page-id>",
		Short: "Publish a page version (default: latest verified)",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			pageID, err := parseResourceID(args[0], "page-id")
			if err != nil {
				return err
			}

			client := clientFactory()

			var versionID string
			if versionNo > 0 {
				// Use server-side by-number lookup
				version, err := getPageVersionByNumber(cmd.Context(), client, pageID, versionNo)
				if err != nil {
					return err
				}
				versionID = version.ID
			} else {
				// Fallback: list and pick latest verified
				versions, err := listPageVersions(cmd.Context(), client, pageID)
				if err != nil {
					return err
				}
				versionID, err = pickLatestVerifiedVersionID(versions)
				if err != nil {
					return err
				}
			}

			resp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+pageID+"/versions/"+versionID+"/publish", map[string]any{})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().Int64Var(&versionNo, "version", 0, "Version number to publish (default: latest verified)")

	return cmd
}
