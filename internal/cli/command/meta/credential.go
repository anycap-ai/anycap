package meta

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

// NewCredentialCmd creates the "credentials" command group with subcommands for
// managing API keys and authentication credentials.
func NewCredentialCmd(stdout io.Writer, stderr io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "credentials",
		Short: "Manage API credentials",
	}

	cmd.AddCommand(
		newSetKeyCmd(stderr),
		newShowCmd(stdout),
	)

	return cmd
}

// newSetKeyCmd creates the "credentials set-key" command for direct API key input.
func newSetKeyCmd(stderr io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "set-key <api-key>",
		Short: "Set API key directly",
		Long:  "Save an API key without running interactive login. Useful for CI/CD, scripted provisioning, or when you already have a key.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			key := strings.TrimSpace(args[0])
			if key == "" {
				return fmt.Errorf("API key cannot be empty")
			}

			cred := cliconfig.NewAPIKeyCredential(key)
			if err := cliconfig.SaveCredential(cred); err != nil {
				return fmt.Errorf("failed to save credential: %w", err)
			}

			fmt.Fprintln(stderr, "API Key saved.")
			return nil
		},
	}
}

// newShowCmd creates the "credentials show" command to display current credential status.
func newShowCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "show",
		Short: "Show current credential status",
		RunE: func(cmd *cobra.Command, args []string) error {
			cfg, _ := cliconfig.Load()
			endpoint := cliconfig.ResolveEndpoint("")

			// Determine credential info
			credSource := "none"
			credType := ""
			authenticated := false

			if v := os.Getenv("ANYCAP_API_KEY"); v != "" {
				credSource = "environment (ANYCAP_API_KEY)"
				credType = string(cliconfig.CredentialTypeAPIKey)
				authenticated = true
			} else if cred := cliconfig.LoadCredential(); cred != nil {
				credSource = "keychain"
				credType = string(cred.Type)
				authenticated = true
			}

			// Determine endpoint source
			endpointSource := "default"
			if cfg.Endpoint != "" {
				endpointSource = "config file"
			}
			if os.Getenv("ANYCAP_API_ENDPOINT") != "" {
				endpointSource = "environment (ANYCAP_API_ENDPOINT)"
			}

			info := map[string]any{
				"endpoint":        endpoint,
				"endpoint_source": endpointSource,
				"authenticated":   authenticated,
				"credential":      credSource,
				"credential_type": credType,
				"config_dir":      cliconfig.ConfigDir(),
			}

			data, err := json.MarshalIndent(info, "", "  ")
			if err != nil {
				return err
			}

			return output.WriteJSON(stdout, data)
		},
	}
}
