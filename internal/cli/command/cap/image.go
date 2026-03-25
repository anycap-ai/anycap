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
		Short: "Generate, edit, and understand images",
	}

	imageCmd.AddCommand(
		newImageModelsCmd(clientFactory, stdout),
		newImageGenerateCmd(clientFactory, stdout),
		newImageUnderstandCmd(clientFactory, stdout),
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

func newImageUnderstandCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var urlFlag string
	var fileFlag string
	var instruction string
	var modelFlag string

	cmd := &cobra.Command{
		Use:   "understand",
		Short: "Analyze an image (describe, extract text, answer questions)",
		Long: `Analyze an image using vision models. Provide either a URL or a local file.

Examples:
  anycap image understand --url https://example.com/photo.jpg
  anycap image understand --url https://example.com/photo.jpg --instruction "What text is in this image?"
  anycap image understand --file ./screenshot.png`,
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			targetURL := urlFlag

			if fileFlag != "" {
				result, err := uploadFile(cmd.Context(), client, fileFlag)
				if err != nil {
					return err
				}
				targetURL = result.ObjectURL
			}

			body := map[string]any{"url": targetURL}
			if instruction != "" {
				body["instruction"] = instruction
			}
			if modelFlag != "" {
				body["model"] = modelFlag
			}

			payload, err := client.PostJSON(cmd.Context(), "/v1/capabilities/image/understand", body)
			if err != nil {
				return err
			}

			return output.WriteContent(stdout, payload)
		},
	}

	cmd.Flags().StringVar(&urlFlag, "url", "", "Image URL to analyze")
	cmd.Flags().StringVar(&fileFlag, "file", "", "Local image file to upload and analyze")
	cmd.Flags().StringVar(&instruction, "instruction", "", "What to look for or describe")
	cmd.Flags().StringVar(&modelFlag, "model", "", "Model ID to use")
	cmd.MarkFlagsOneRequired("url", "file")
	cmd.MarkFlagsMutuallyExclusive("url", "file")

	return cmd
}
