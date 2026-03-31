package infra

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newPageSetCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		name          string
		accessMode    string
		password      string
		noPassword    bool
		spaFallback   bool
		noSPAFallback bool
		badge         bool
		noBadge       bool
	)

	cmd := &cobra.Command{
		Use:   "set <page-id>",
		Short: "Update page site settings",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			pageID, err := parseResourceID(args[0], "page-id")
			if err != nil {
				return err
			}

			if cmd.Flags().Changed("password") && noPassword {
				return fmt.Errorf("--password and --no-password cannot be used together")
			}
			if spaFallback && noSPAFallback {
				return fmt.Errorf("--spa-fallback and --no-spa-fallback cannot be used together")
			}
			if badge && noBadge {
				return fmt.Errorf("--badge and --no-badge cannot be used together")
			}
			if accessMode != "" && accessMode != "public" && accessMode != "password" {
				return fmt.Errorf("--access must be one of: public, password")
			}

			payload := map[string]any{}
			if cmd.Flags().Changed("name") {
				payload["name"] = name
			}
			if cmd.Flags().Changed("access") {
				payload["access_mode"] = accessMode
			}
			if cmd.Flags().Changed("password") {
				payload["password"] = password
			}
			if noPassword {
				payload["no_password"] = true
			}
			if spaFallback {
				payload["spa_fallback"] = true
			}
			if noSPAFallback {
				payload["spa_fallback"] = false
			}
			if badge {
				payload["show_badge"] = true
			}
			if noBadge {
				payload["show_badge"] = false
			}
			if len(payload) == 0 {
				return fmt.Errorf("no update fields provided")
			}

			resp, err := clientFactory().PatchJSON(cmd.Context(), "/v1/pages/"+pageID, payload)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&name, "name", "", "New site display name")
	cmd.Flags().StringVar(&accessMode, "access", "", "Access mode: public|password")
	cmd.Flags().StringVar(&password, "password", "", "Site password when access mode is password")
	cmd.Flags().BoolVar(&noPassword, "no-password", false, "Remove site password")
	cmd.Flags().BoolVar(&spaFallback, "spa-fallback", false, "Enable SPA fallback")
	cmd.Flags().BoolVar(&noSPAFallback, "no-spa-fallback", false, "Disable SPA fallback")
	cmd.Flags().BoolVar(&badge, "badge", false, "Enable AnyCap badge on pages")
	cmd.Flags().BoolVar(&noBadge, "no-badge", false, "Disable AnyCap badge on pages")

	return cmd
}
