package command

import (
	"context"
	"fmt"
	"io"
	"os"

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
}

func NewRootCmd(opts Options) *cobra.Command {
	if opts.Stdout == nil {
		opts.Stdout = os.Stdout
	}
	if opts.Stderr == nil {
		opts.Stderr = os.Stderr
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
		return httpclient.New(cliconfig.ResolveEndpoint(endpointFlag))
	}

	rootCmd.AddCommand(
		newLoginCmd(clientFactory, opts.Stdout),
		newStatusCmd(clientFactory, opts.Stdout),
		newImageCmd(clientFactory, opts.Stdout),
	)

	return rootCmd
}

func newLoginCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "login",
		Short: "Start login flow",
		RunE: func(cmd *cobra.Command, args []string) error {
			payload, err := clientFactory().PostJSON(cmd.Context(), "/v1/login/init", map[string]any{})
			if err != nil {
				return err
			}

			return writeJSON(stdout, payload)
		},
	}
}

func newStatusCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "status",
		Short: "Show AnyCap server status",
		RunE: func(cmd *cobra.Command, args []string) error {
			payload, err := clientFactory().Get(cmd.Context(), "/v1/status")
			if err != nil {
				return err
			}

			return writeJSON(stdout, payload)
		},
	}
}

func newImageCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	imageCmd := &cobra.Command{
		Use:   "image",
		Short: "Work with image capabilities",
	}

	imageCmd.AddCommand(
		newImageModelsCmd(clientFactory, stdout),
		newImageGenerateCmd(clientFactory, stdout),
	)

	return imageCmd
}

func newImageModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "models",
		Short: "List available image models",
		RunE: func(cmd *cobra.Command, args []string) error {
			payload, err := clientFactory().Get(cmd.Context(), "/v1/image/models")
			if err != nil {
				return err
			}

			return writeJSON(stdout, payload)
		},
	}
}

func newImageGenerateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var prompt string
	var model string

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate an image from a prompt",
		RunE: func(cmd *cobra.Command, args []string) error {
			payload, err := clientFactory().PostJSON(context.Background(), "/v1/image/generate", map[string]any{
				"prompt": prompt,
				"model":  model,
			})
			if err != nil {
				return err
			}

			return writeJSON(stdout, payload)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt for image generation")
	cmd.Flags().StringVar(&model, "model", "flux-dev", "Model ID to use")
	_ = cmd.MarkFlagRequired("prompt")

	return cmd
}

func writeJSON(w io.Writer, payload []byte) error {
	if _, err := fmt.Fprintln(w, string(payload)); err != nil {
		return err
	}

	return nil
}
