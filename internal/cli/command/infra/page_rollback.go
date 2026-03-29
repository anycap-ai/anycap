package infra

import (
	"fmt"
	"io"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func newPageRollbackCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var versionNo int64

	cmd := &cobra.Command{
		Use:   "rollback <page-id>",
		Short: "Clone a historical version into a new version (auto publish if site is currently published)",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			pageID, err := parsePositiveInt64(args[0], "page-id")
			if err != nil {
				return err
			}
			if versionNo <= 0 {
				return fmt.Errorf("--version must be a positive integer")
			}

			client := clientFactory()
			siteResp, err := client.Get(cmd.Context(), "/v1/pages/"+strconv.FormatInt(pageID, 10))
			if err != nil {
				return err
			}
			site, err := decodeSuccessData[pageSiteSummary](siteResp)
			if err != nil {
				return err
			}

			versions, err := listPageVersions(cmd.Context(), client, pageID)
			if err != nil {
				return err
			}
			sourceVersionID, err := pickPageVersionIDByNumber(versions, versionNo)
			if err != nil {
				return err
			}

			rollbackResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(pageID, 10)+"/versions/"+strconv.FormatInt(sourceVersionID, 10)+"/rollback-clone", map[string]any{})
			if err != nil {
				return err
			}
			newVersion, err := decodeSuccessData[pageVersionSummary](rollbackResp)
			if err != nil {
				return err
			}

			requestID := rollbackResp.RequestID
			published := false
			if site.CurrentVersionID != nil {
				publishResp, publishErr := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(pageID, 10)+"/versions/"+strconv.FormatInt(newVersion.ID, 10)+"/publish", map[string]any{})
				if publishErr != nil {
					return publishErr
				}
				requestID = publishResp.RequestID
				published = true
			}

			payload := map[string]any{
				"status":         "success",
				"page_id":        pageID,
				"source_version": versionNo,
				"new_version":    newVersion.VersionNo,
				"published":      published,
			}
			if site.PageURL != "" {
				payload["page_url"] = site.PageURL
			}
			return writeFlatSuccess(stdout, requestID, payload)
		},
	}

	cmd.Flags().Int64Var(&versionNo, "version", 0, "Historical version number to clone")
	_ = cmd.MarkFlagRequired("version")

	return cmd
}
