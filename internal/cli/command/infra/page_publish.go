package infra

import (
	"io"
	"strconv"

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
			pageID, err := parsePositiveInt64(args[0], "page-id")
			if err != nil {
				return err
			}

			client := clientFactory()
			versions, err := listPageVersions(cmd.Context(), client, pageID)
			if err != nil {
				return err
			}

			var versionID int64
			if versionNo > 0 {
				versionID, err = pickPageVersionIDByNumber(versions, versionNo)
				if err != nil {
					return err
				}
			} else {
				versionID, err = pickLatestVerifiedVersionID(versions)
				if err != nil {
					return err
				}
			}

			resp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(pageID, 10)+"/versions/"+strconv.FormatInt(versionID, 10)+"/publish", map[string]any{})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().Int64Var(&versionNo, "version", 0, "Version number to publish (default: latest verified)")

	return cmd
}
