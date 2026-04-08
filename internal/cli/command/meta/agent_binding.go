package meta

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func newAgentIMBindingsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "im-bindings",
		Short: "Manage IM identity bindings",
		RunE:  requireSubcommand,
	}

	tokenCmd := &cobra.Command{
		Use:   "token",
		Short: "Manage IM bind tokens",
		RunE:  requireSubcommand,
	}

	var platform string
	createCmd := &cobra.Command{
		Use:   "create",
		Short: "Create a short-lived IM bind token",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().PostJSON(cmd.Context(), api.AgentBindTokenPath, map[string]any{
				"platform": platform,
			})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	createCmd.Flags().StringVar(&platform, "platform", "feishu", "IM platform")

	listCmd := &cobra.Command{
		Use:   "list",
		Short: "List IM bindings",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), api.AgentBindingsPath)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	tokenCmd.AddCommand(createCmd)
	cmd.AddCommand(tokenCmd, listCmd)
	return cmd
}
