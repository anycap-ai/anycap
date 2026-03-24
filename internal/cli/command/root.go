package command

import (
	"io"
	"os"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/cap"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command/meta"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

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
		apiKey := cliconfig.LoadCredential()
		return httpclient.New(
			cliconfig.ResolveEndpoint(endpointFlag),
			httpclient.WithAPIKey(apiKey),
			httpclient.WithVersion(opts.BuildInfo.Version),
		)
	}

	rootCmd.AddCommand(
		meta.NewLoginCmd(clientFactory, opts.Stdin, opts.Stdout, opts.Stderr),
		meta.NewLogoutCmd(opts.Stderr),
		meta.NewStatusCmd(clientFactory, opts.Stdout),
		cap.NewImageCmd(clientFactory, opts.Stdout, opts.Stderr),
		cap.NewVideoCmd(clientFactory, opts.Stdout, opts.Stderr),
	)

	return rootCmd
}
