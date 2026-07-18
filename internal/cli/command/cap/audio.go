package cap

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/fileutil"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func NewAudioCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	audioCmd := &cobra.Command{Use: "audio", Short: "Generate audio and soundscapes", RunE: requireSubcommand}
	audioCmd.AddCommand(newAudioModelsCmd(clientFactory, stdout), newAudioGenerateCmd(clientFactory, stdout))
	return audioCmd
}

func newAudioModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var operation, mode string
	cmd := &cobra.Command{
		Use:   "models [model] [schema]",
		Short: "List available audio models or show model details",
		Long: `List available audio models and discover the exact parameters for each mode.

Examples:
  anycap audio models
  anycap audio models doubao-seed-audio-1-0
  anycap audio models doubao-seed-audio-1-0 schema --mode text-to-audio
  anycap audio models doubao-seed-audio-1-0 schema --mode audio-to-audio
  anycap audio models doubao-seed-audio-1-0 schema --mode image-to-audio`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()
			if len(args) == 2 {
				if args[1] != "schema" {
					return fmt.Errorf("unknown argument %q; did you mean 'schema'?", args[1])
				}
				return fetchCapModelSchema(cmd, client, stdout, "audio", args[0], operation, mode)
			}
			return listCapModels(cmd, client, stdout, "audio", args)
		},
	}
	cmd.Flags().StringVar(&operation, "operation", "", "Operation to get schema for (used with 'schema')")
	cmd.Flags().StringVar(&mode, "mode", "", "Mode to filter schema for (text-to-audio, audio-to-audio, image-to-audio)")
	return cmd
}

func newAudioGenerateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var prompt, modelID, mode, outputPath string
	var params []string
	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate audio from text or reference media",
		Long: `Generate audio using a prompt and optional speaker, audio, or image references.
Use 'audio models <model> schema --mode <mode>' to discover supported parameters.
Local files passed to file-or-url parameters are uploaded automatically.

Examples:
  anycap audio generate --prompt "wind through pine trees" --model doubao-seed-audio-1-0
  anycap audio generate --prompt "make this warmer" --model doubao-seed-audio-1-0 --mode audio-to-audio --param audios=./reference.wav
  anycap audio generate --prompt "create this soundscape" --model doubao-seed-audio-1-0 --mode image-to-audio --param images=./scene.png
  anycap audio generate --prompt "rain on a metal roof" --model doubao-seed-audio-1-0 --param format=mp3 -o rain.mp3`,
		RunE: func(cmd *cobra.Command, _ []string) error {
			body := map[string]any{"prompt": prompt, "model": modelID}
			if mode != "" {
				body["mode"] = mode
			}
			for _, param := range params {
				key, value, ok := strings.Cut(param, "=")
				if !ok {
					return fmt.Errorf("invalid --param format %q: expected key=value", param)
				}
				body[key] = parseParamValue(value)
			}

			client := clientFactory()
			if err := resolveFileParams(cmd.Context(), client, "audio", modelID, mode, body, verboseWriter(cmd)); err != nil {
				return err
			}
			if err := writeInvocationStarted(cmd, "audio.generate", modelID); err != nil {
				return err
			}
			resp, err := client.PostJSON(cmd.Context(), api.GeneratePath("audio"), body)
			if err != nil {
				return err
			}

			result, err := parseAudioResponse(resp.Body)
			if err != nil || result.Status != "success" {
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}
			timestamp := time.Now().Format("20060102_150405")
			for i := range result.Outputs {
				item := &result.Outputs[i]
				if item.URL == "" {
					continue
				}
				fallbackExtension := audioOutputFallbackExtension(item.MIMEType, body["format"])
				savePath := mediaOutputPath("audio", outputPath, item.URL, timestamp, i, len(result.Outputs), fallbackExtension)
				absolutePath, downloadErr := fileutil.DownloadFile(item.URL, savePath)
				if downloadErr != nil {
					item.Error = fmt.Sprintf("download failed: %v", downloadErr)
					continue
				}
				item.LocalPath = absolutePath
			}
			return writeAudioResult(stdout, result, resp.RequestID)
		},
	}
	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt describing the audio to generate")
	cmd.Flags().StringVar(&modelID, "model", "", "Model ID to use")
	cmd.Flags().StringVar(&mode, "mode", "", "Generation mode (text-to-audio, audio-to-audio, image-to-audio)")
	cmd.Flags().StringArrayVar(&params, "param", nil, "Parameter as key=value (repeatable); discover params via 'audio models <model> schema'")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Save generated audio to this path (default: current directory)")
	_ = cmd.MarkFlagRequired("prompt")
	_ = cmd.MarkFlagRequired("model")
	return cmd
}

func audioOutputFallbackExtension(mimeType string, requestedFormat any) string {
	normalizedMIME, _, _ := strings.Cut(strings.ToLower(strings.TrimSpace(mimeType)), ";")
	switch normalizedMIME {
	case "audio/mpeg", "audio/mp3":
		return ".mp3"
	case "audio/wav", "audio/wave", "audio/x-wav":
		return ".wav"
	case "audio/flac", "audio/x-flac":
		return ".flac"
	case "audio/ogg":
		return ".ogg"
	case "audio/aac":
		return ".aac"
	case "audio/mp4", "audio/x-m4a":
		return ".m4a"
	case "audio/l16", "audio/pcm":
		return ".pcm"
	}

	format, _ := requestedFormat.(string)
	switch strings.TrimPrefix(strings.ToLower(strings.TrimSpace(format)), ".") {
	case "mp3":
		return ".mp3"
	case "wav", "wave":
		return ".wav"
	case "flac":
		return ".flac"
	case "ogg":
		return ".ogg"
	case "aac":
		return ".aac"
	case "m4a":
		return ".m4a"
	case "pcm":
		return ".pcm"
	default:
		return ".mp3"
	}
}

type audioOutput struct {
	URL                     string          `json:"url,omitempty"`
	Type                    string          `json:"type,omitempty"`
	MIMEType                string          `json:"mime_type,omitempty"`
	DurationSeconds         float64         `json:"duration_seconds,omitempty"`
	OriginalDurationSeconds float64         `json:"original_duration_seconds,omitempty"`
	SizeBytes               int64           `json:"size_bytes,omitempty"`
	Subtitle                json.RawMessage `json:"subtitle,omitempty"`
	LocalPath               string          `json:"local_path,omitempty"`
	Error                   string          `json:"error,omitempty"`
}

type audioResult struct {
	Status      string
	Model       string
	CreditsUsed int64
	Usage       map[string]any
	Outputs     []audioOutput
	TaskID      string
	Diagnostics cliInvocationDiagnostics
}

func parseAudioResponse(body []byte) (*audioResult, error) {
	var envelope struct {
		Status string `json:"status"`
		Data   struct {
			ID         string         `json:"id"`
			Model      string         `json:"model"`
			Outputs    []audioOutput  `json:"outputs"`
			Usage      map[string]any `json:"usage"`
			CreditCost int64          `json:"credit_cost"`
		} `json:"data"`
		Diagnostics cliInvocationDiagnostics `json:"diagnostics"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, err
	}
	result := &audioResult{
		Status: envelope.Status, Model: envelope.Data.Model, CreditsUsed: envelope.Data.CreditCost,
		Usage: envelope.Data.Usage, Outputs: envelope.Data.Outputs, Diagnostics: envelope.Diagnostics,
	}
	if result.Diagnostics.TaskID == "" {
		result.Diagnostics.TaskID = envelope.Data.ID
	}
	result.TaskID = result.Diagnostics.TaskID
	return result, nil
}

func writeAudioResult(w io.Writer, result *audioResult, requestID string) error {
	payload := map[string]any{
		"status": result.Status, "model": result.Model, "credits_used": result.CreditsUsed,
		"outputs": result.Outputs,
	}
	if len(result.Usage) > 0 {
		payload["usage"] = result.Usage
	}
	applyCLIDiagnostics(payload, result.Diagnostics, requestID)
	encoded, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return output.WriteJSON(w, encoded)
}
