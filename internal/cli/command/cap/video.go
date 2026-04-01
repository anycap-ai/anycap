package cap

import (
	"fmt"
	"io"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/fileutil"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func NewVideoCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	videoCmd := &cobra.Command{
		Use:   "video",
		Short: "Generate and process videos",
		RunE:  requireSubcommand,
	}

	videoCmd.AddCommand(newVideoModelsCmd(clientFactory, stdout))
	videoCmd.AddCommand(newVideoGenerateCmd(clientFactory, stdout))

	return videoCmd
}

// newVideoModelsCmd handles three forms:
//
//	video models                       -> list all models
//	video models <model>               -> show one model (client-side filter)
//	video models <model> schema        -> fetch model schema from server
func newVideoModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		operation string
		mode      string
	)

	cmd := &cobra.Command{
		Use:   "models [model] [schema]",
		Short: "List available video models or show model details",
		Long: `List all available video models, show details for a specific model,
or fetch the request schema for a model.

Examples:
  anycap video models
  anycap video models seedance-1.5-pro
  anycap video models seedance-1.5-pro schema
  anycap video models seedance-1.5-pro schema --mode image-to-video
  anycap video models seedance-1.5-pro schema --operation generate`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()

			// video models <model> schema
			if len(args) == 2 {
				if args[1] != "schema" {
					return fmt.Errorf("unknown argument %q; did you mean 'schema'?", args[1])
				}
				return fetchCapModelSchema(cmd, client, stdout, "video", args[0], operation, mode)
			}

			// video models / video models <model>
			return listCapModels(cmd, client, stdout, "video", args)
		},
	}

	cmd.Flags().StringVar(&operation, "operation", "", "Operation to get schema for (used with 'schema')")
	cmd.Flags().StringVar(&mode, "mode", "", "Mode to filter schema for (e.g. text-to-video, image-to-video)")

	return cmd
}

func newVideoGenerateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		prompt     string
		model      string
		mode       string
		params     []string
		outputPath string
	)

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate a video from a prompt",
		Long: `Generate a video using a text prompt. Use --param to pass parameters
discovered from 'video models <model> schema'.

The generated video is automatically downloaded to the current directory.
Use -o to specify a custom output path.

Examples:
  anycap video generate --prompt "a cat walking on the beach" --model veo-3.1
  anycap video generate --prompt "ocean waves" --model veo-3.1 --param ratio=16:9 --param duration=5
  anycap video generate --prompt "a landscape" --model veo-3.1 -o landscape.mp4
  anycap video generate --prompt "animate this" --model seedance-1.5-pro --mode image-to-video --param reference_image_urls='["https://example.com/photo.jpg"]'`,
		RunE: func(cmd *cobra.Command, args []string) error {
			body := map[string]any{
				"prompt": prompt,
				"model":  model,
			}
			if mode != "" {
				body["mode"] = mode
			}

			// Parse --param key=value pairs into the request body.
			for _, p := range params {
				k, v, ok := strings.Cut(p, "=")
				if !ok {
					return fmt.Errorf("invalid --param format %q: expected key=value", p)
				}
				body[k] = parseParamValue(v)
			}

			client := clientFactory()

			// Resolve local file paths in params to uploaded URLs (schema-driven).
			if err := resolveFileParams(cmd.Context(), client, "video", model, mode, body, verboseWriter(cmd)); err != nil {
				return err
			}

			resp, err := client.PostJSON(cmd.Context(), api.GeneratePath("video"), body)
			if err != nil {
				return err
			}

			// Parse server response (same envelope as image).
			genResult, parseErr := parseGenerateResponse(resp.Body)
			if parseErr != nil {
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			if genResult.Status != "success" {
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			// Download the generated video.
			if genResult.OutputURL != "" {
				savePath := outputPath
				if savePath == "" {
					savePath = defaultVideoFilename(genResult.OutputURL)
				}
				absPath, dlErr := fileutil.DownloadFile(genResult.OutputURL, savePath)
				if dlErr != nil {
					return fmt.Errorf("generation succeeded but download failed: %w", dlErr)
				}
				genResult.LocalPath = absPath
			}

			return writeGenerateResult(stdout, genResult, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt for video generation")
	cmd.Flags().StringVar(&model, "model", "", "Model ID to use")
	cmd.Flags().StringVar(&mode, "mode", "", "Generation mode (e.g. text-to-video, image-to-video)")
	cmd.Flags().StringArrayVar(&params, "param", nil, "Parameter as key=value (repeatable); discover params via 'video models <model> schema'")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Save generated video to this path (default: current directory)")
	_ = cmd.MarkFlagRequired("prompt")
	_ = cmd.MarkFlagRequired("model")

	return cmd
}

// defaultVideoFilename generates a clean default filename for a generated video.
func defaultVideoFilename(videoURL string) string {
	ext := path.Ext(fileutil.FilenameFromURL(videoURL))
	if ext == "" {
		ext = ".mp4"
	}
	return "video_" + time.Now().Format("20060102_150405") + ext
}
