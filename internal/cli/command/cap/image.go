package cap

import (
	"context"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func NewImageCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
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

			return output.WriteJSON(stdout, payload)
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

			return output.WriteJSON(stdout, payload)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt for image generation")
	cmd.Flags().StringVar(&model, "model", "flux-dev", "Model ID to use")
	_ = cmd.MarkFlagRequired("prompt")

	return cmd
}
