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
			updater := selfupdate.NewUpdater()

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
// "dev" builds are always considered outdated.
func isNewer(remote, current string) bool {
	if current == "dev" || current == "" {
		return true
	}
	// Simple lexicographic comparison works for well-formed semver
	// without pre-release suffixes, which matches our release convention.
	// Both values are expected without "v" prefix at this point.
	return remote != current
}
