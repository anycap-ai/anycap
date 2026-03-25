package meta

import (
	"encoding/json"
	"fmt"
	"io"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

// NewConfigCmd creates the "config" command group for managing CLI configuration.
func NewConfigCmd(stdout, stderr io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "config",
		Short: "Manage CLI configuration (~/.anycap/config.toml)",
		Long: `Manage CLI configuration.

Use "anycap config keys" to list all available configuration keys as JSON.`,
	}

	cmd.AddCommand(
		newConfigKeysCmd(stdout),
		newConfigSetCmd(stdout),
		newConfigGetCmd(stdout),
		newConfigUnsetCmd(stdout),
		newConfigShowCmd(stdout),
	)

	return cmd
}

// newConfigKeysCmd creates the "config keys" subcommand that outputs all
// available configuration key definitions as JSON.
func newConfigKeysCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "keys",
		Short: "List all available config keys",
		RunE: func(cmd *cobra.Command, args []string) error {
			data, _ := json.Marshal(cliconfig.KeysDef())
			return output.WriteJSON(stdout, data)
		},
	}
}

// newConfigSetCmd creates the "config set <key> <value>" subcommand.
func newConfigSetCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "set <key> <value>",
		Short: "Set a config value",
		Args:  cobra.ExactArgs(2),
		ValidArgsFunction: func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
			if len(args) == 0 {
				return cliconfig.KeyNames(), cobra.ShellCompDirectiveNoFileComp
			}
			return nil, cobra.ShellCompDirectiveNoFileComp
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			key, value := args[0], args[1]

			cfg, err := cliconfig.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			if err := cfg.SetValue(key, value); err != nil {
				return err
			}

			if err := cliconfig.Save(cfg); err != nil {
				return fmt.Errorf("failed to save config: %w", err)
			}

			effective, _ := cfg.GetEffective(key)
			data, _ := json.Marshal(map[string]any{"key": key, "value": effective})
			return output.WriteJSON(stdout, data)
		},
	}
}

// newConfigGetCmd creates the "config get <key>" subcommand.
func newConfigGetCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "get <key>",
		Short: "Get a config value",
		Args:  cobra.ExactArgs(1),
		ValidArgsFunction: func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
			if len(args) == 0 {
				return cliconfig.KeyNames(), cobra.ShellCompDirectiveNoFileComp
			}
			return nil, cobra.ShellCompDirectiveNoFileComp
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			key := args[0]

			cfg, err := cliconfig.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			val, err := cfg.GetEffective(key)
			if err != nil {
				return err
			}

			data, _ := json.Marshal(map[string]any{"key": key, "value": val})
			return output.WriteJSON(stdout, data)
		},
	}
}

// newConfigUnsetCmd creates the "config unset <key>" subcommand.
func newConfigUnsetCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "unset <key>",
		Short: "Remove a config value (reset to default)",
		Args:  cobra.ExactArgs(1),
		ValidArgsFunction: func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
			if len(args) == 0 {
				return cliconfig.KeyNames(), cobra.ShellCompDirectiveNoFileComp
			}
			return nil, cobra.ShellCompDirectiveNoFileComp
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			key := args[0]

			cfg, err := cliconfig.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			if err := cfg.UnsetValue(key); err != nil {
				return err
			}

			if err := cliconfig.Save(cfg); err != nil {
				return fmt.Errorf("failed to save config: %w", err)
			}

			def := cliconfig.LookupKey(key)
			data, _ := json.Marshal(map[string]any{"key": key, "default": def.ResolveDefault()})
			return output.WriteJSON(stdout, data)
		},
	}
}

// newConfigShowCmd creates the "config show" subcommand that outputs all
// effective config values and the config file path as JSON.
func newConfigShowCmd(stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "show",
		Short: "Show all config values and config file path",
		RunE: func(cmd *cobra.Command, args []string) error {
			cfg, err := cliconfig.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			type entry struct {
				Value  any    `json:"value"`
				Source string `json:"source"`
			}

			values := make(map[string]entry)
			for _, k := range cliconfig.Keys {
				val, _ := cfg.GetEffective(k.Name)
				source := "default"
				if cfg.IsSet(k.Name) {
					source = "config"
				}
				values[k.Name] = entry{Value: val, Source: source}
			}

			result := map[string]any{
				"config_path": cliconfig.ConfigPath(),
				"values":      values,
			}

			data, _ := json.Marshal(result)
			return output.WriteJSON(stdout, data)
		},
	}
}
