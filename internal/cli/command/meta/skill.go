package meta

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/skill"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/spf13/cobra"
)

// NewSkillCmd creates the "skill" command group for managing skill files.
func NewSkillCmd(stdout, stderr io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "skill",
		Short: "Manage AnyCap skill files",
	}

	cmd.AddCommand(
		newSkillCheckCmd(stdout),
		newSkillInstallCmd(stdout, stderr),
		newSkillUpdateCmd(stdout, stderr),
	)

	return cmd
}

func newSkillCheckCmd(stdout io.Writer) *cobra.Command {
	var target string

	cmd := &cobra.Command{
		Use:   "check",
		Short: "Check if installed skill matches CLI version",
		RunE: func(cmd *cobra.Command, args []string) error {
			cliVersion := buildinfo.Version
			path := skill.ResolveSkillPath(target)
			// Install target is the skills root (parent of the individual skill directory).
			installTarget := filepath.Dir(filepath.Dir(path))

			if _, err := os.Stat(path); os.IsNotExist(err) {
				return writeCheckResult(stdout, map[string]any{
					"status":      "not_installed",
					"cli_version": cliVersion,
					"action":      "install_skill",
					"commands": []string{
						fmt.Sprintf("anycap skill install --target %s", installTarget),
					},
				})
			}

			skillVersion, err := skill.ParseVersion(path)
			if err != nil {
				return fmt.Errorf("parse skill version: %w", err)
			}

			cmp := skill.CompareVersions(skillVersion, cliVersion)

			switch {
			case cmp == 0:
				return writeCheckResult(stdout, map[string]any{
					"status":        "up_to_date",
					"cli_version":   cliVersion,
					"skill_version": skillVersion,
				})
			case cmp < 0:
				return writeCheckResult(stdout, map[string]any{
					"status":        "skill_outdated",
					"cli_version":   cliVersion,
					"skill_version": skillVersion,
					"action":        "update_skill",
					"commands": []string{
						fmt.Sprintf("anycap skill install --target %s", installTarget),
					},
				})
			default:
				return writeCheckResult(stdout, map[string]any{
					"status":        "cli_outdated",
					"cli_version":   cliVersion,
					"skill_version": skillVersion,
					"action":        "update_cli",
					"commands": []string{
						"anycap update",
					},
				})
			}
		},
	}

	cmd.Flags().StringVar(&target, "target", "", "Path to skill file or directory")
	_ = cmd.MarkFlagRequired("target")

	return cmd
}

func newSkillInstallCmd(stdout, stderr io.Writer) *cobra.Command {
	var target string

	cmd := &cobra.Command{
		Use:   "install",
		Short: "Install skill files from GitHub",
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Fprintf(stderr, "Installing skills to %s ...\n", target)

			source, err := skill.Install(target)
			if err != nil {
				return fmt.Errorf("install failed: %w", err)
			}

			// Read installed version from primary skill.
			ver := buildinfo.Version
			if v, err := skill.ParseVersion(filepath.Join(target, "anycap-cli", "SKILL.md")); err == nil {
				ver = v
			}

			result := map[string]any{
				"status":  "installed",
				"version": ver,
				"target":  target,
				"source":  source,
			}
			data, _ := json.Marshal(result)
			return output.WriteJSON(stdout, data)
		},
	}

	cmd.Flags().StringVar(&target, "target", "", "Install target directory")
	_ = cmd.MarkFlagRequired("target")

	return cmd
}

func newSkillUpdateCmd(stdout, stderr io.Writer) *cobra.Command {
	var target string

	cmd := &cobra.Command{
		Use:   "update",
		Short: "Update skill files (alias for install)",
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Fprintf(stderr, "Updating skills in %s ...\n", target)

			source, err := skill.Install(target)
			if err != nil {
				return fmt.Errorf("update failed: %w", err)
			}

			// Read installed version from primary skill.
			ver := buildinfo.Version
			if v, err := skill.ParseVersion(filepath.Join(target, "anycap-cli", "SKILL.md")); err == nil {
				ver = v
			}

			result := map[string]any{
				"status":  "updated",
				"version": ver,
				"target":  target,
				"source":  source,
			}
			data, _ := json.Marshal(result)
			return output.WriteJSON(stdout, data)
		},
	}

	cmd.Flags().StringVar(&target, "target", "", "Target directory")
	_ = cmd.MarkFlagRequired("target")

	return cmd
}

func writeCheckResult(w io.Writer, result map[string]any) error {
	data, _ := json.Marshal(result)
	return output.WriteJSON(w, data)
}
