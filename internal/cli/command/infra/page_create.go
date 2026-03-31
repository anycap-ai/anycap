package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/projectconfig"

	"github.com/spf13/cobra"
)

func newPageCreateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		siteName   string
		targetName string
	)

	cmd := &cobra.Command{
		Use:   "create",
		Short: "Create a new page site without deploying content",
		Long: `Create a new page site without deploying content.

  anycap page create --name "My Report"                    Save as default [page]
  anycap page create --name "Preview" --target preview     Save as [page.targets.preview]`,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if siteName == "" {
				return fmt.Errorf("--name is required")
			}

			client := clientFactory()
			site, err := createDeploySite(cmd.Context(), client, siteName)
			if err != nil {
				return err
			}

			payload := map[string]any{
				"status":    "success",
				"page_id":   site.ID,
				"page_name": site.PageName,
				"page_url":  site.PageURL,
				"name":      site.Name,
			}

			// Save to config
			if targetName != "" {
				_ = projectconfig.SavePageTarget(targetName, projectconfig.PageTarget{
					SiteID: site.ID,
					Name:   site.Name,
				})
				payload["target"] = targetName
			} else {
				// Save as default [page], preserving existing targets
				projCfg, _ := projectconfig.Load()
				var existingTargets map[string]projectconfig.PageTarget
				if projCfg.Page != nil {
					existingTargets = projCfg.Page.Targets
				}
				_ = projectconfig.SavePage(projectconfig.PageConfig{
					SiteID:  site.ID,
					Name:    site.Name,
					Targets: existingTargets,
				})
			}

			return writeFlatSuccess(stdout, "", payload)
		},
	}

	cmd.Flags().StringVar(&siteName, "name", "", "Site display name (required)")
	cmd.Flags().StringVar(&targetName, "target", "", "Save as a named target in anycap.toml")

	return cmd
}
