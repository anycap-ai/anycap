package meta

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/selfupdate"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/spf13/cobra"
)

// NewUpdateCmd creates the "anycap update" command.
func NewUpdateCmd(stdout, stderr io.Writer) *cobra.Command {
	var checkOnly bool

	cmd := &cobra.Command{
		Use:   "update",
		Short: "Update anycap to the latest version",
		RunE: func(cmd *cobra.Command, args []string) error {
			current := buildinfo.Version
			verbose, _ := cmd.Flags().GetBool("verbose")

			// Block updates for npm-installed binaries.
			// Still check for the latest version so the hint includes it.
			if selfupdate.IsNPMInstall() {
				updater := selfupdate.NewUpdater()
				updater.Verbose = verbose
				updater.Logger = stderr

				fmt.Fprintf(stderr, "This binary was installed via npm (current: %s).\n", current)
				fmt.Fprintf(stderr, "Checking for updates...\n")

				rel, err := updater.CheckLatest(cmd.Context())
				if err != nil {
					fmt.Fprintf(stderr, "Failed to check for updates: %v\n", err)
					fmt.Fprintf(stderr, "Run: npm install -g @anycap/cli@latest\n")
					return nil
				}
				updater.RecordCheck()

				if !isNewer(rel.Version, current) {
					fmt.Fprintf(stderr, "Already up to date.\n")
					return nil
				}

				fmt.Fprintf(stderr, "New version available: %s\n", rel.Version)
				fmt.Fprintf(stderr, "Run: npm install -g @anycap/cli@latest\n")
				return nil
			}

			// Block updates for dev/local builds.
			if selfupdate.IsDevVersion(current) {
				fmt.Fprintf(stderr, "This is a local dev build (version=%q). Self-update is not available.\n", current)
				fmt.Fprintf(stderr, "Build a release binary or install via 'npm install -g @anycap/cli'.\n")
				return nil
			}

			updater := selfupdate.NewUpdater()
			updater.Verbose = verbose
			updater.Logger = stderr

			fmt.Fprintf(stderr, "Current version: %s\n", current)
			fmt.Fprintf(stderr, "Checking for updates...\n")

			rel, err := updater.CheckLatest(cmd.Context())
			if err != nil {
				return fmt.Errorf("failed to check for updates: %w", err)
			}
			updater.RecordCheck()

			if !isNewer(rel.Version, current) {
				fmt.Fprintf(stderr, "Already up to date.\n")
				return nil
			}

			fmt.Fprintf(stderr, "New version available: %s\n", rel.Version)

			if checkOnly {
				return nil
			}

			fmt.Fprintf(stderr, "Downloading...\n")
			if err := updater.Update(cmd.Context(), rel); err != nil {
				return fmt.Errorf("update failed: %w", err)
			}

			fmt.Fprintf(stderr, "Successfully updated to %s\n", rel.Version)
			return nil
		},
	}

	cmd.Flags().BoolVar(&checkOnly, "check", false, "Only check for updates without installing")
	return cmd
}

// isNewer returns true if the remote version should replace the current one.
// Non-release builds are never considered "newer" (blocked earlier in RunE).
func isNewer(remote, current string) bool {
	if selfupdate.IsDevVersion(current) {
		return false
	}
	return remote != current
}
