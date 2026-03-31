package infra

import (
	"encoding/json"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/projectconfig"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newPageListCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var local bool

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List page sites",
		Long: `List page sites from the server, or show local targets from anycap.toml.

  anycap page list            List all sites from server
  anycap page list --local    Show targets configured in anycap.toml`,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if local {
				return listLocalPageTargets(stdout)
			}
			resp, err := clientFactory().Get(cmd.Context(), api.PagesPath)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().BoolVar(&local, "local", false, "List targets from anycap.toml instead of server")

	return cmd
}

func listLocalPageTargets(w io.Writer) error {
	cfg, err := projectconfig.Load()
	if err != nil {
		return err
	}

	targets := make(map[string]any)
	if cfg.Page != nil && cfg.Page.SiteID != "" {
		targets["default"] = map[string]any{
			"site_id": cfg.Page.SiteID,
			"name":    cfg.Page.Name,
		}
	}
	if cfg.Page != nil {
		for name, t := range cfg.Page.Targets {
			targets[name] = map[string]any{
				"site_id": t.SiteID,
				"name":    t.Name,
			}
		}
	}

	payload := map[string]any{"targets": targets}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return output.WriteJSON(w, body)
}
