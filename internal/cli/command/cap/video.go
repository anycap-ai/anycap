package cap

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func NewVideoCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	videoCmd := &cobra.Command{
		Use:   "video",
		Short: "Analyze and process videos",
	}

	videoCmd.AddCommand(
		newVideoReadCmd(clientFactory, stdout),
	)

	return videoCmd
}

func newVideoReadCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var urlFlag string
	var fileFlag string
	var instruction string
	var modelFlag string

	cmd := &cobra.Command{
		Use:   "read",
		Short: "Analyze a video (describe content, extract information)",
		Long: `Analyze a video using vision models. Provide either a URL or a local file.

Examples:
  anycap video read --url https://example.com/clip.mp4
  anycap video read --url https://example.com/clip.mp4 --instruction "Summarize the key events"
  anycap video read --file ./recording.mp4`,
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

			payload, err := client.PostJSON(cmd.Context(), "/v1/capabilities/video/read", body)
			if err != nil {
				return err
			}

			return output.WriteContent(stdout, payload)
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
