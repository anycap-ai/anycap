package meta

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func NewLoginCmd(clientFactory func() *httpclient.Client, stdin io.Reader, stdout io.Writer, stderr io.Writer) *cobra.Command {
	var headless bool
	var noWait bool
	var jsonOutput bool
	var withToken bool

	cmd := &cobra.Command{
		Use:   "login",
		Short: "Authenticate with AnyCap",
		Long:  "Start an authentication flow. By default, auto-detects the best method (browser or device code).",
		RunE: func(cmd *cobra.Command, args []string) error {
			if noWait && !headless {
				return fmt.Errorf("--no-wait requires --headless")
			}
			if noWait && !jsonOutput {
				return fmt.Errorf("--no-wait currently requires --json")
			}

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
				if noWait {
					result, err := auth.DeviceInit(cmd.Context(), client)
					if err != nil {
						return err
					}
					payload := map[string]any{
						"login_session_id": result.LoginSessionID,
						"verification_uri": result.VerificationURI,
						"user_code":        result.UserCode,
						"expires_in":       result.ExpiresIn,
						"interval":         result.Interval,
						"poll_command":     fmt.Sprintf("anycap login poll --session %s --json", result.LoginSessionID),
						"next_action_hint": "Show the verification URL and code to the user, ask them to complete login in a browser, and tell them to reply to the agent once they have finished. After the user confirms completion, run `poll_command`.",
					}
					data, err := json.Marshal(payload)
					if err != nil {
						return err
					}
					return output.WriteJSON(stdout, data)
				}
				cred, email, err = auth.DeviceFlow(cmd.Context(), client, stderr)
			} else {
				cred, email, err = auth.AutoFlow(cmd.Context(), client, stderr)
			}
			if err != nil {
				return err
			}

			if err := cliconfig.SaveCredential(cred); err != nil {
				fmt.Fprintf(stderr, "Failed to save credential: %v\nYour credential token: %s\n", err, cred.Token())
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
	cmd.Flags().BoolVar(&noWait, "no-wait", false, "Initialize headless login and return immediately without polling")
	cmd.Flags().BoolVar(&jsonOutput, "json", false, "Output structured JSON for agent/toolcall usage")
	cmd.Flags().BoolVar(&withToken, "with-token", false, "Read API key from stdin (for CI/CD)")
	cmd.MarkFlagsMutuallyExclusive("headless", "with-token")

	var pollSession string
	var pollJSON bool
	pollCmd := &cobra.Command{
		Use:   "poll",
		Short: "Poll a previously initialized headless login session",
		RunE: func(cmd *cobra.Command, args []string) error {
			if strings.TrimSpace(pollSession) == "" {
				return fmt.Errorf("--session is required")
			}
			if !pollJSON {
				return fmt.Errorf("login poll currently requires --json")
			}

			client := clientFactory()
			result, err := auth.DevicePoll(cmd.Context(), client, strings.TrimSpace(pollSession))
			if err != nil {
				return err
			}

			payload := map[string]any{
				"status": result.Status,
			}
			if result.User != nil {
				payload["user"] = result.User
			}
			if result.APIKey != "" {
				payload["api_key"] = result.APIKey
			}
			if result.APIKeyID != "" {
				payload["api_key_id"] = result.APIKeyID
			}

			if result.Status == "complete" || result.Status == "completed" {
				body, err := json.Marshal(map[string]any{"data": result})
				if err != nil {
					return err
				}
				cred, _, err := auth.ParseTokenResponseForCLI(body)
				if err != nil {
					return err
				}
				if err := cliconfig.SaveCredential(cred); err != nil {
					return fmt.Errorf("failed to save credential: %w", err)
				}
			}

			data, err := json.Marshal(payload)
			if err != nil {
				return err
			}
			return output.WriteJSON(stdout, data)
		},
	}
	pollCmd.Flags().StringVar(&pollSession, "session", "", "Login session ID returned by headless init")
	pollCmd.Flags().BoolVar(&pollJSON, "json", false, "Output structured JSON for agent/toolcall usage")
	cmd.AddCommand(pollCmd)

	return cmd
}
