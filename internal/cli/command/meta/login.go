package meta

import (
	"bufio"
	"fmt"
	"io"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func NewLoginCmd(clientFactory func() *httpclient.Client, stdin io.Reader, stdout io.Writer, stderr io.Writer) *cobra.Command {
	var headless bool
	var withToken bool

	cmd := &cobra.Command{
		Use:   "login",
		Short: "Authenticate with AnyCap",
		Long:  "Start an authentication flow. By default, auto-detects the best method (browser or device code).",
		RunE: func(cmd *cobra.Command, args []string) error {
			// --with-token: read from stdin, save as API Key credential
			if withToken {
				scanner := bufio.NewScanner(stdin)
				if !scanner.Scan() {
					return fmt.Errorf("failed to read token from stdin")
				}
				token := strings.TrimSpace(scanner.Text())
				if token == "" {
					return fmt.Errorf("empty token")
				}
				cred := cliconfig.NewAPIKeyCredential(token)
				if err := cliconfig.SaveCredential(cred); err != nil {
					return fmt.Errorf("failed to save credential: %w", err)
				}
				fmt.Fprintln(stderr, "API Key saved.")
				return nil
			}

			client := clientFactory()

			// Check if already logged in (OAuth flows only, --with-token always overwrites)
			if existing := cliconfig.LoadCredential(); existing != nil {
				fmt.Fprintln(stderr, "Already logged in. Use 'anycap logout' first to switch accounts.")
				return nil
			}

			var cred *cliconfig.Credential
			var email string
			var err error

			if headless {
				cred, email, err = auth.DeviceFlow(cmd.Context(), client, stderr)
			} else {
				cred, email, err = auth.AutoFlow(cmd.Context(), client, stderr)
			}
			if err != nil {
				return err
			}

			if err := cliconfig.SaveCredential(cred); err != nil {
				fmt.Fprintf(stderr, "Failed to save credential: %v\nYour access token: %s\n", err, cred.Token())
				return err
			}

			if email != "" {
				fmt.Fprintf(stderr, "Logged in as %s\n", email)
			}
			fmt.Fprintln(stderr, "Credential saved.")
			return nil
		},
	}

	cmd.Flags().BoolVar(&headless, "headless", false, "Use device code flow (for headless/SSH environments)")
	cmd.Flags().BoolVar(&withToken, "with-token", false, "Read API key from stdin (for CI/CD)")
	cmd.MarkFlagsMutuallyExclusive("headless", "with-token")

	return cmd
}
