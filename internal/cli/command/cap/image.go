package cap

import (
	"context"
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

	"github.com/spf13/cobra"
)

const maxCLIImages = 10

func NewImageCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	imageCmd := &cobra.Command{
		Use:   "image",
		Short: "Generate, edit, and understand images",
		RunE:  requireSubcommand,
	}

	if feature.Enabled(feature.ImageModels) {
		imageCmd.AddCommand(newImageModelsCmd(clientFactory, stdout))
	}
	if feature.Enabled(feature.ImageGenerate) {
		imageCmd.AddCommand(newImageGenerateCmd(clientFactory, stdout))
	}
	if feature.Enabled(feature.ImageUnderstand) {
		imageCmd.AddCommand(newImageUnderstandCmd(clientFactory, stdout))
	}

	return imageCmd
}

func newImageModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "models",
		Short: "List available image models",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), "/v1/image/models")
			if err != nil {
				return err
			}

			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
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
			resp, err := clientFactory().PostJSON(context.Background(), "/v1/image/generate", map[string]any{
				"prompt": prompt,
				"model":  model,
			})
			if err != nil {
				return err
			}

			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt for image generation")
	cmd.Flags().StringVar(&model, "model", "", "Model ID to use")
	_ = cmd.MarkFlagRequired("prompt")
	_ = cmd.MarkFlagRequired("model")

	return cmd
}

func newImageUnderstandCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var urls []string
	var files []string
	var instruction string
	var modelFlag string

	cmd := &cobra.Command{
		Use:   "understand",
		Short: "Analyze one or more images (describe, extract text, answer questions)",
		Long: `Analyze images using vision models. Provide URLs, local files, or a mix of both.
Up to 10 images can be analyzed in a single request.

Examples:
  anycap image understand --url https://example.com/photo.jpg
  anycap image understand --url https://example.com/photo.jpg --instruction "What text is in this image?"
  anycap image understand --file ./screenshot.png
  anycap image understand --url https://example.com/p1.jpg --url https://example.com/p2.jpg --instruction "Compare these images"
  anycap image understand --url https://example.com/photo.jpg --file ./local.png --instruction "Describe each image"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(urls) == 0 && len(files) == 0 {
				return fmt.Errorf("at least one --url or --file is required")
			}

			totalImages := len(urls) + len(files)
			if totalImages > maxCLIImages {
				return fmt.Errorf("too many images: %d provided, maximum is %d", totalImages, maxCLIImages)
			}

			client := clientFactory()

			// Upload local files and collect all image URLs.
			imageURLs := make([]string, 0, totalImages)
			imageURLs = append(imageURLs, urls...)
			for _, f := range files {
				result, err := uploadFile(cmd.Context(), client, f)
				if err != nil {
					return err
				}
				imageURLs = append(imageURLs, result.ObjectURL)
			}

			body := map[string]any{}

			if len(imageURLs) == 1 {
				// Single-image shorthand.
				body["url"] = imageURLs[0]
			} else {
				// Multi-image list.
				images := make([]map[string]string, len(imageURLs))
				for i, u := range imageURLs {
					images[i] = map[string]string{"url": u}
				}
				body["images"] = images
			}

			if instruction != "" {
				body["instruction"] = instruction
			}
			if modelFlag != "" {
				body["model"] = modelFlag
			}

			resp, err := client.PostJSON(cmd.Context(), "/v1/capabilities/image/understand", body)
			if err != nil {
				return err
			}

			return output.WriteServerContent(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringArrayVar(&urls, "url", nil, "Image URL to analyze (can be repeated)")
	cmd.Flags().StringArrayVar(&files, "file", nil, "Local image file to upload and analyze (can be repeated)")
	cmd.Flags().StringVar(&instruction, "instruction", "", "Custom instruction for image analysis")
	cmd.Flags().StringVar(&modelFlag, "model", "", "Model ID to use")

	return cmd
}
