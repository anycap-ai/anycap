package cap

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

	"github.com/spf13/cobra"
)

const maxActionImages = 10

// NewActionsCmd creates the "actions" command group that contains AI analysis
// actions such as image-read and video-read.
func NewActionsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	actionsCmd := &cobra.Command{
		Use:   "actions",
		Short: "Run AI actions (understand images, read videos, ...)",
		RunE:  requireSubcommand,
	}

	if feature.Enabled(feature.ImageRead) {
		actionsCmd.AddCommand(newImageReadAction(clientFactory, stdout))
	}
	if feature.Enabled(feature.VideoRead) {
		actionsCmd.AddCommand(newVideoReadAction(clientFactory, stdout))
	}
	if feature.Enabled(feature.AudioRead) {
		actionsCmd.AddCommand(newAudioReadAction(clientFactory, stdout))
	}

	return actionsCmd
}

func newImageReadAction(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var urls []string
	var files []string
	var instruction string
	var modelFlag string

	cmd := &cobra.Command{
		Use:   "image-read",
		Short: "Analyze one or more images (describe, extract text, answer questions)",
		Long: `Analyze images using vision models. Provide URLs, local files, or a mix of both.
Up to 10 images can be analyzed in a single request.

Examples:
  anycap actions image-read --url https://example.com/photo.jpg
  anycap actions image-read --url https://example.com/photo.jpg --instruction "What text is in this image?"
  anycap actions image-read --file ./screenshot.png
  anycap actions image-read --url https://example.com/p1.jpg --url https://example.com/p2.jpg --instruction "Compare these images"
  anycap actions image-read --url https://example.com/photo.jpg --file ./local.png --instruction "Describe each image"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(urls) == 0 && len(files) == 0 {
				return fmt.Errorf("at least one --url or --file is required")
			}

			totalImages := len(urls) + len(files)
			if totalImages > maxActionImages {
				return fmt.Errorf("too many images: %d provided, maximum is %d", totalImages, maxActionImages)
			}

			client := clientFactory()

			// Upload local files and collect all image URLs.
			imageURLs := make([]string, 0, totalImages)
			imageURLs = append(imageURLs, urls...)
			for _, f := range files {
				result, err := uploadFile(cmd.Context(), client, f, verboseWriter(cmd))
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

			resp, err := client.PostJSON(cmd.Context(), "/v1/capabilities/image/read", body)
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

func newVideoReadAction(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var urlFlag string
	var fileFlag string
	var instruction string
	var modelFlag string

	cmd := &cobra.Command{
		Use:   "video-read",
		Short: "Analyze a video (describe content, extract information)",
		Long: `Analyze a video using vision models. Provide either a URL or a local file.

Examples:
  anycap actions video-read --url https://example.com/clip.mp4
  anycap actions video-read --url https://example.com/clip.mp4 --instruction "Summarize the key events"
  anycap actions video-read --file ./recording.mp4`,
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			targetURL := urlFlag

			if fileFlag != "" {
				result, err := uploadFile(cmd.Context(), client, fileFlag, verboseWriter(cmd))
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

			resp, err := client.PostJSON(cmd.Context(), "/v1/capabilities/video/read", body)
			if err != nil {
				return err
			}

			return output.WriteServerContent(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&urlFlag, "url", "", "Video URL to analyze")
	cmd.Flags().StringVar(&fileFlag, "file", "", "Local video file to upload and analyze")
	cmd.Flags().StringVar(&instruction, "instruction", "", "What to look for or describe")
	cmd.Flags().StringVar(&modelFlag, "model", "", "Model ID to use")
	cmd.MarkFlagsOneRequired("url", "file")
	cmd.MarkFlagsMutuallyExclusive("url", "file")

	return cmd
}

func newAudioReadAction(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var urlFlag string
	var fileFlag string
	var instruction string
	var modelFlag string

	cmd := &cobra.Command{
		Use:   "audio-read",
		Short: "Analyze audio (transcribe, describe, answer questions)",
		Long: `Analyze audio using multimodal models. Provide either a URL or a local file.

Examples:
  anycap actions audio-read --url https://example.com/recording.wav
  anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Summarize the main topics"
  anycap actions audio-read --file ./meeting.mp3`,
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			targetURL := urlFlag

			if fileFlag != "" {
				result, err := uploadFile(cmd.Context(), client, fileFlag, verboseWriter(cmd))
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

			resp, err := client.PostJSON(cmd.Context(), "/v1/capabilities/audio/read", body)
			if err != nil {
				return err
			}

			return output.WriteServerContent(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&urlFlag, "url", "", "Audio URL to analyze")
	cmd.Flags().StringVar(&fileFlag, "file", "", "Local audio file to upload and analyze")
	cmd.Flags().StringVar(&instruction, "instruction", "", "What to listen for or describe")
	cmd.Flags().StringVar(&modelFlag, "model", "", "Model ID to use")
	cmd.MarkFlagsOneRequired("url", "file")
	cmd.MarkFlagsMutuallyExclusive("url", "file")

	return cmd
}
