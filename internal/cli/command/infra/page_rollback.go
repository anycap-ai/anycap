package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/projectconfig"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newPageRollbackCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		versionNo  int64
		siteFlag   string
		targetFlag string
	)

	cmd := &cobra.Command{
		Use:   "rollback [page-id]",
		Short: "Clone a historical version into a new version (auto publish if site is currently published)",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			projCfg, _ := projectconfig.Load()
			pageID, err := resolvePageSiteID(args, siteFlag, targetFlag, projCfg)
			if err != nil {
				return err
			}
			if versionNo <= 0 {
				return fmt.Errorf("--version must be a positive integer")
			}

			client := clientFactory()
			siteResp, err := client.Get(cmd.Context(), api.PagePath(pageID))
			if err != nil {
				return err
			}
			site, err := decodeSuccessData[pageSiteSummary](siteResp)
			if err != nil {
				return err
			}

			// Use server-side by-number lookup
			sourceVersion, err := getPageVersionByNumber(cmd.Context(), client, pageID, versionNo)
			if err != nil {
				return err
			}

			rollbackResp, err := client.PostJSON(cmd.Context(), api.PageVersionActionPath(pageID, sourceVersion.ID, "rollback-clone"), map[string]any{})
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
				publishResp, publishErr := client.PostJSON(cmd.Context(), api.PageVersionActionPath(pageID, newVersion.ID, "publish"), map[string]any{})
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
	cmd.Flags().StringVar(&siteFlag, "page-id", "", "Page site ID")
	cmd.Flags().StringVar(&targetFlag, "target", "", "Named target from anycap.toml")

	return cmd
}
