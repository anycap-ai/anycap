package command

import (
	"context"
	"fmt"
	"io"
	"os"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/cap"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/meta"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/selfupdate"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

	"github.com/spf13/cobra"
)

type Options struct {
	BuildInfo buildinfo.Info
	Endpoint  string
	Stdout    io.Writer
	Stderr    io.Writer
	Stdin     io.Reader
}

func NewRootCmd(opts Options) *cobra.Command {
	if opts.Stdout == nil {
		opts.Stdout = os.Stdout
	}
	if opts.Stderr == nil {
		opts.Stderr = os.Stderr
	}
	if opts.Stdin == nil {
		opts.Stdin = os.Stdin
	}

	endpointFlag := opts.Endpoint

	rootCmd := &cobra.Command{
		Use:           "anycap",
		Short:         "AnyCap CLI for AI agents",
		Long:          "AnyCap is the capability runtime for AI agents. Use the CLI to call AnyCap Server via JSON-first commands.",
		SilenceUsage:  true,
		SilenceErrors: true,
		Version:       opts.BuildInfo.Version,
	}
	rootCmd.SetOut(opts.Stdout)
	rootCmd.SetErr(opts.Stderr)
	rootCmd.PersistentFlags().StringVar(&endpointFlag, "endpoint", opts.Endpoint, "AnyCap server endpoint")

	clientFactory := func() *httpclient.Client {
		cred := cliconfig.LoadCredential()
		clientOpts := []httpclient.Option{
			httpclient.WithVersion(opts.BuildInfo.Version),
		}
		if cred != nil {
			clientOpts = append(clientOpts,
				httpclient.WithCredential(cred),
				httpclient.WithCredentialSaver(cliconfig.SaveCredential),
			)
		}
		return httpclient.New(
			cliconfig.ResolveEndpoint(endpointFlag),
			clientOpts...,
		)
	}

	// Meta commands (always available).
	rootCmd.AddCommand(
		meta.NewLogoutCmd(clientFactory, opts.Stderr),
		meta.NewStatusCmd(clientFactory, opts.Stdout),
		meta.NewCredentialCmd(opts.Stdout, opts.Stderr),
		meta.NewConfigCmd(opts.Stdout, opts.Stderr),
		meta.NewFeedbackCmd(clientFactory, opts.Stdout),
		meta.NewUpdateCmd(opts.Stdout, opts.Stderr),
		meta.NewSkillCmd(opts.Stdout, opts.Stderr),
		meta.NewDownloadCmd(opts.Stdout),
	)

	// Feature-gated meta commands.
	if feature.Enabled(feature.Login) {
		rootCmd.AddCommand(meta.NewLoginCmd(clientFactory, opts.Stdin, opts.Stdout, opts.Stderr))
	}

	// Action commands (AI analysis: image-understand, video-read, etc.).
	if actionsCmd := cap.NewActionsCmd(clientFactory, opts.Stdout); actionsCmd.HasSubCommands() {
		rootCmd.AddCommand(actionsCmd)
	}

	// Capability commands (gated by feature flags; skip parent if no subcommands).
	if imageCmd := cap.NewImageCmd(clientFactory, opts.Stdout); imageCmd.HasSubCommands() {
		rootCmd.AddCommand(imageCmd)
	}
	if videoCmd := cap.NewVideoCmd(clientFactory, opts.Stdout); videoCmd.HasSubCommands() {
		rootCmd.AddCommand(videoCmd)
	}

	rootCmd.PersistentPreRunE = autoUpdatePreRun(opts.BuildInfo.Version, opts.Stderr)

	return rootCmd
}

// skipAutoUpdateCmds lists commands that should not trigger auto-update.
var skipAutoUpdateCmds = map[string]bool{
	"update":  true,
	"config":  true,
	"help":    true,
	"version": true,
}

// autoUpdatePreRun returns a PersistentPreRunE that performs a throttled
// auto-update check. It fails silently on any error to avoid blocking
// normal command execution.
func autoUpdatePreRun(currentVersion string, stderr io.Writer) func(*cobra.Command, []string) error {
	return func(cmd *cobra.Command, args []string) error {
		// Skip for dev builds.
		if currentVersion == "dev" || currentVersion == "" {
			return nil
		}

		// Skip for commands that should not trigger auto-update.
		if skipAutoUpdateCmds[cmd.Name()] {
			return nil
		}

		// Skip if disabled via config or environment.
		if os.Getenv("ANYCAP_NO_UPDATE") != "" {
			return nil
		}
		cfg, _ := cliconfig.Load()
		if !cfg.IsAutoUpdateEnabled() {
			return nil
		}

		updater := selfupdate.NewUpdater()

		// Throttle: only check once per 24h.
		if !updater.ShouldCheck() {
			return nil
		}

		// Check for update (short timeout, fail silently).
		rel, err := updater.CheckLatest(context.Background())
		if err != nil {
			return nil // network error, skip silently
		}
		updater.RecordCheck()

		if rel.Version == currentVersion {
			return nil
		}

		// New version available -- download and replace.
		fmt.Fprintf(stderr, "Updating anycap %s -> %s ...\n", currentVersion, rel.Version)
		if err := updater.Update(context.Background(), rel); err != nil {
			fmt.Fprintf(stderr, "Auto-update failed: %v\n", err)
			return nil // don't block the command
		}

		fmt.Fprintf(stderr, "Updated to %s. Re-executing...\n", rel.Version)
		// Re-exec replaces the process on Unix; on Windows it starts
		// a new process and exits.
		if err := selfupdate.ReExec(); err != nil {
			fmt.Fprintf(stderr, "Re-exec failed: %v. Please re-run your command.\n", err)
		}
		return nil
	}
}
