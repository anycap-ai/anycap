package command

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/cap"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/infra"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/meta"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/selfupdate"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/spf13/cobra"
)

type Options struct {
	BuildInfo buildinfo.Info
	Endpoint  string
	TraceID   string
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
	var verbose bool

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
	rootCmd.PersistentFlags().BoolVar(&verbose, "verbose", false, "Enable verbose output")

	clientFactory := func() *httpclient.Client {
		cred := cliconfig.LoadCredential()
		clientOpts := []httpclient.Option{
			httpclient.WithVersion(opts.BuildInfo.Version),
			httpclient.WithTraceID(opts.TraceID),
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
		meta.NewLoginCmd(clientFactory, opts.Stdin, opts.Stdout, opts.Stderr),
		meta.NewLogoutCmd(clientFactory, opts.Stderr),
		meta.NewStatusCmd(clientFactory, opts.Stdout),
		meta.NewCredentialCmd(opts.Stdout, opts.Stderr),
		meta.NewConfigCmd(opts.Stdout, opts.Stderr),
		meta.NewFeedbackCmd(clientFactory, opts.Stdout),
		meta.NewUpdateCmd(opts.Stdout, opts.Stderr),
		meta.NewSkillCmd(opts.Stdout, opts.Stderr),
		meta.NewDownloadCmd(opts.Stdout),
	)

	// Infrastructure commands.
	rootCmd.AddCommand(infra.NewDriveCmd(clientFactory, opts.Stdout))
	rootCmd.AddCommand(infra.NewPageCmd(clientFactory, opts.Stdout))
	rootCmd.AddCommand(infra.NewAnnotateCmd(opts.Stdout))
	rootCmd.AddCommand(infra.NewDrawCmd(opts.Stdout))

	// Action commands (AI analysis: image-read, video-read, etc.).
	rootCmd.AddCommand(cap.NewActionsCmd(clientFactory, opts.Stdout))

	// Web commands.
	rootCmd.AddCommand(cap.NewSearchCmd(clientFactory, opts.Stdout))
	rootCmd.AddCommand(cap.NewCrawlCmd(clientFactory, opts.Stdout))

	// Capability commands.
	rootCmd.AddCommand(cap.NewImageCmd(clientFactory, opts.Stdout))
	rootCmd.AddCommand(cap.NewVideoCmd(clientFactory, opts.Stdout))
	rootCmd.AddCommand(cap.NewMusicCmd(clientFactory, opts.Stdout))

	rootCmd.PersistentPreRunE = autoUpdatePreRun(opts.BuildInfo.Version, opts.Stderr, &verbose)

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
func autoUpdatePreRun(currentVersion string, stderr io.Writer, verbose *bool) func(*cobra.Command, []string) error {
	return func(cmd *cobra.Command, args []string) error {
		// Always check for skill reminder marker (written by previous
		// process before re-exec after a self-update).
		consumeSkillReminder()

		v := verbose != nil && *verbose
		logf := func(format string, a ...any) {
			if v {
				fmt.Fprintf(stderr, "[update] "+format+"\n", a...)
			}
		}

		// Skip for dev/local builds.
		if selfupdate.IsDevVersion(currentVersion) {
			logf("skip: non-release build (version=%q)", currentVersion)
			return nil
		}

		// Skip for commands that should not trigger auto-update.
		if skipAutoUpdateCmds[cmd.Name()] {
			logf("skip: command %q excluded from auto-update", cmd.Name())
			return nil
		}

		// Skip if disabled via config or environment.
		if os.Getenv("ANYCAP_NO_UPDATE") != "" {
			logf("skip: ANYCAP_NO_UPDATE is set")
			return nil
		}
		cfg, _ := cliconfig.Load()
		if !cfg.IsAutoUpdateEnabled() {
			logf("skip: auto_update disabled in config")
			return nil
		}

		updater := selfupdate.NewUpdater()
		updater.Verbose = v
		updater.Logger = stderr

		// Throttle: only check once per 24h.
		if !updater.ShouldCheck() {
			return nil
		}

		// Check for update (short timeout, fail silently).
		rel, err := updater.CheckLatest(context.Background())
		if err != nil {
			logf("check failed: %v", err)
			return nil // network error, skip silently
		}
		updater.RecordCheck()

		logf("current=%s latest=%s", currentVersion, rel.Version)
		if rel.Version == currentVersion {
			logf("already up to date")
			return nil
		}

		// New version available.
		if selfupdate.IsNPMInstall() {
			// npm-installed: hint only, do not replace binary.
			fmt.Fprintf(stderr, "New version available: %s -> %s. Run: npm install -g @anycap/cli@latest\n",
				currentVersion, rel.Version)
			return nil
		}

		// curl/direct install: download and replace.
		fmt.Fprintf(stderr, "Updating anycap %s -> %s ...\n", currentVersion, rel.Version)
		if err := updater.Update(context.Background(), rel); err != nil {
			fmt.Fprintf(stderr, "Auto-update failed: %v\n", err)
			return nil // don't block the command
		}

		fmt.Fprintf(stderr, "Updated to %s. Re-executing...\n", rel.Version)
		// Write marker so the re-exec'd process knows an update just happened.
		writeSkillReminderMarker()
		// Re-exec replaces the process on Unix; on Windows it starts
		// a new process and exits.
		if err := selfupdate.ReExec(); err != nil {
			fmt.Fprintf(stderr, "Re-exec failed: %v. Please re-run your command.\n", err)
		}
		return nil
	}
}

const skillReminderFile = ".skill_reminder"

// writeSkillReminderMarker creates a marker file in the config directory so the
// re-exec'd process knows to show a skill update reminder.
func writeSkillReminderMarker() {
	dir := cliconfig.ConfigDir()
	if dir == "" {
		return
	}
	path := filepath.Join(dir, skillReminderFile)
	_ = os.WriteFile(path, []byte("1"), 0644)
}

// consumeSkillReminder checks for the skill reminder marker. If present,
// it sets the global system reminder and removes the marker.
func consumeSkillReminder() {
	dir := cliconfig.ConfigDir()
	if dir == "" {
		return
	}
	path := filepath.Join(dir, skillReminderFile)
	if _, err := os.Stat(path); err != nil {
		return
	}
	_ = os.Remove(path)

	output.SetSystemReminder(&output.SystemReminder{
		Description: "AnyCap CLI was updated. Please install or update skill files to match the new version.",
		Commands: []string{
			"npx skills add anycap-ai/anycap",
		},
	})
}
