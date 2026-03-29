package infra

import (
	"fmt"
	"io"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func newDriveShareCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		expires    string
		noExpire   bool
		password   string
		noPassword bool
		srcPath    string
	)

	cmd := &cobra.Command{
		Use:   "share [node-id]",
		Short: "Create or update an active share link",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			nodeID, err := resolveDriveNodeID(client, cmd.Context(), args, srcPath)
			if err != nil {
				return err
			}
			if expires != "" && noExpire {
				return fmt.Errorf("--expires and --no-expire cannot be used together")
			}
			if cmd.Flags().Changed("password") && noPassword {
				return fmt.Errorf("--password and --no-password cannot be used together")
			}

			payload := map[string]any{}
			if expires != "" {
				seconds, parseErr := parseExpiryToSeconds(expires)
				if parseErr != nil {
					return parseErr
				}
				payload["expires_in_seconds"] = seconds
			}
			if noExpire {
				payload["no_expire"] = true
			}
			if cmd.Flags().Changed("password") {
				payload["password"] = password
			}
			if noPassword {
				payload["no_password"] = true
			}

			resp, err := client.PutJSON(cmd.Context(), "/v1/drive/nodes/"+strconv.FormatInt(nodeID, 10)+"/share", payload)
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&expires, "expires", "", "Share expiration duration (for example: 7d, 24h)")
	cmd.Flags().BoolVar(&noExpire, "no-expire", false, "Set share as permanent")
	cmd.Flags().StringVar(&password, "password", "", "Share password")
	cmd.Flags().BoolVar(&noPassword, "no-password", false, "Remove share password")
	cmd.Flags().StringVar(&srcPath, "src-path", "", "Source node path (for example: /docs/readme.md)")
	cmd.AddCommand(newDriveShareRotateCmd(clientFactory, stdout))

	return cmd
}

func newDriveShareRotateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var srcPath string

	cmd := &cobra.Command{
		Use:   "rotate [node-id]",
		Short: "Rotate share token for a drive node",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			nodeID, err := resolveDriveNodeID(client, cmd.Context(), args, srcPath)
			if err != nil {
				return err
			}

			resp, err := client.PostJSON(cmd.Context(), "/v1/drive/nodes/"+strconv.FormatInt(nodeID, 10)+"/share/rotate", map[string]any{})
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	cmd.Flags().StringVar(&srcPath, "src-path", "", "Source node path (for example: /docs/readme.md)")
	return cmd
}

func newDriveUnshareCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var srcPath string

	cmd := &cobra.Command{
		Use:   "unshare [node-id]",
		Short: "Revoke an active share link",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			nodeID, err := resolveDriveNodeID(client, cmd.Context(), args, srcPath)
			if err != nil {
				return err
			}

			resp, err := client.Delete(cmd.Context(), "/v1/drive/nodes/"+strconv.FormatInt(nodeID, 10)+"/share")
			if err != nil {
				return err
			}
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}
	cmd.Flags().StringVar(&srcPath, "src-path", "", "Source node path (for example: /docs/readme.md)")
	return cmd
}
