package cap

import (
	"encoding/json"
	"fmt"
	"io"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/fileutil"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

	"github.com/spf13/cobra"
)

func NewMusicCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	musicCmd := &cobra.Command{
		Use:   "music",
		Short: "Generate music and songs",
		RunE:  requireSubcommand,
	}

	if feature.Enabled(feature.MusicModels) {
		musicCmd.AddCommand(newMusicModelsCmd(clientFactory, stdout))
	}
	if feature.Enabled(feature.MusicGenerate) {
		musicCmd.AddCommand(newMusicGenerateCmd(clientFactory, stdout))
	}

	return musicCmd
}

// newMusicModelsCmd handles three forms:
//
//	music models                       -> list all models
//	music models <model>               -> show one model (client-side filter)
//	music models <model> schema        -> fetch model schema from server
func newMusicModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		operation string
		mode      string
	)

	cmd := &cobra.Command{
		Use:   "models [model] [schema]",
		Short: "List available music models or show model details",
		Long: `List all available music models, show details for a specific model,
or fetch the request schema for a model.

Examples:
  anycap music models
  anycap music models suno-v5
  anycap music models suno-v5 schema
  anycap music models suno-v5 schema --mode text-to-music
  anycap music models suno-v5 schema --operation generate`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()

			// music models <model> schema
			if len(args) == 2 {
				if args[1] != "schema" {
					return fmt.Errorf("unknown argument %q; did you mean 'schema'?", args[1])
				}
				return fetchCapModelSchema(cmd, client, stdout, "music", args[0], operation, mode)
			}

			// music models / music models <model>
			return listCapModels(cmd, client, stdout, "music", args)
		},
	}

	cmd.Flags().StringVar(&operation, "operation", "", "Operation to get schema for (used with 'schema')")
	cmd.Flags().StringVar(&mode, "mode", "", "Mode to filter schema for (e.g. text-to-music)")

	return cmd
}

func newMusicGenerateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		prompt       string
		model        string
		mode         string
		instrumental bool
		tags         string
		title        string
		lyrics       string
		params       []string
		outputPath   string
	)

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate music from a prompt",
		Long: `Generate music using a text prompt or tags. Use --param to pass additional
parameters discovered from 'music models <model> schema'.

The generated audio is automatically downloaded to the current directory.
Use -o to specify a custom output path.

Examples:
  anycap music generate --prompt "lofi night drive" --model suno-v5
  anycap music generate --prompt "epic orchestral" --model suno-v5 --instrumental
  anycap music generate --tags "pop,upbeat,summer" --model suno-v5
  anycap music generate --prompt "love song" --model suno-v5 --title "My Song" --lyrics "verse text..."
  anycap music generate --prompt "chill beats" --model suno-v5 -o chill.mp3`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if prompt == "" && tags == "" {
				return fmt.Errorf("either --prompt or --tags is required")
			}

			body := map[string]any{
				"model": model,
			}
			if mode != "" {
				body["mode"] = mode
			}
			if prompt != "" {
				body["prompt"] = prompt
			}
			if instrumental {
				body["make_instrumental"] = true
			}
			if tags != "" {
				body["tags"] = tags
			}
			if title != "" {
				body["title"] = title
			}
			if lyrics != "" {
				body["lyrics"] = lyrics
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
			if err := resolveFileParams(cmd.Context(), client, "music", model, mode, body, verboseWriter(cmd)); err != nil {
				return err
			}

			resp, err := client.PostJSON(cmd.Context(), api.GeneratePath("music"), body)
			if err != nil {
				return err
			}

			// Parse the full music response (supports multiple outputs).
			musicResult, parseErr := parseMusicResponse(resp.Body)
			if parseErr != nil {
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			if musicResult.Status != "success" {
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			// Download all generated audio clips.
			timestamp := time.Now().Format("20060102_150405")
			for i := range musicResult.Outputs {
				out := &musicResult.Outputs[i]
				if out.URL == "" {
					continue
				}
				savePath := musicOutputPath(outputPath, out.URL, timestamp, i, len(musicResult.Outputs))
				absPath, dlErr := fileutil.DownloadFile(out.URL, savePath)
				if dlErr != nil {
					out.Error = fmt.Sprintf("download failed: %v", dlErr)
					continue
				}
				out.LocalPath = absPath
			}

			return writeMusicResult(stdout, musicResult, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt describing the music to generate")
	cmd.Flags().StringVar(&model, "model", "", "Model ID to use")
	cmd.Flags().StringVar(&mode, "mode", "", "Generation mode (e.g. text-to-music)")
	cmd.Flags().BoolVar(&instrumental, "instrumental", false, "Generate instrumental only (no vocals)")
	cmd.Flags().StringVar(&tags, "tags", "", "Comma-separated style tags (e.g. \"pop,upbeat,summer\")")
	cmd.Flags().StringVar(&title, "title", "", "Song title")
	cmd.Flags().StringVar(&lyrics, "lyrics", "", "Song lyrics")
	cmd.Flags().StringArrayVar(&params, "param", nil, "Parameter as key=value (repeatable); discover params via 'music models <model> schema'")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Save generated audio to this path (default: current directory)")
	_ = cmd.MarkFlagRequired("model")

	return cmd
}

// defaultMusicFilename generates a clean default filename for generated music.
func defaultMusicFilename(musicURL string) string {
	ext := path.Ext(fileutil.FilenameFromURL(musicURL))
	if ext == "" {
		ext = ".mp3"
	}
	return "music_" + time.Now().Format("20060102_150405") + ext
}

// musicOutput represents a single music clip from the generation response.
type musicOutput struct {
	URL       string `json:"url,omitempty"`
	Type      string `json:"type,omitempty"`
	MIMEType  string `json:"mime_type,omitempty"`
	LocalPath string `json:"local_path,omitempty"`
	Error     string `json:"error,omitempty"`
}

// musicResult holds the parsed music generation response.
type musicResult struct {
	Status      string        `json:"-"`
	Model       string        `json:"-"`
	CreditsUsed int           `json:"-"`
	Outputs     []musicOutput `json:"-"`
}

// parseMusicResponse extracts all outputs from a music generate response.
func parseMusicResponse(body []byte) (*musicResult, error) {
	var env struct {
		Status string `json:"status"`
		Data   struct {
			Model   string `json:"model"`
			Outputs []struct {
				Type     string `json:"type"`
				URL      string `json:"url"`
				MIMEType string `json:"mime_type"`
			} `json:"outputs"`
			CreditCost int `json:"credit_cost"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &env); err != nil {
		return nil, err
	}

	result := &musicResult{
		Status:      env.Status,
		Model:       env.Data.Model,
		CreditsUsed: env.Data.CreditCost,
	}
	for _, o := range env.Data.Outputs {
		result.Outputs = append(result.Outputs, musicOutput{
			URL:      o.URL,
			Type:     o.Type,
			MIMEType: o.MIMEType,
		})
	}
	return result, nil
}

// musicOutputPath computes the save path for a music output clip.
// If -o is given and there's a single output, use it directly.
// Otherwise, generate numbered filenames: music_20260330_150000_1.mp3, music_20260330_150000_2.mp3
func musicOutputPath(userPath, outputURL, timestamp string, index, total int) string {
	ext := path.Ext(fileutil.FilenameFromURL(outputURL))
	if ext == "" {
		ext = ".mp3"
	}

	// Single output with -o specified: use as-is.
	if total == 1 && userPath != "" {
		return userPath
	}

	// Multiple outputs with -o: inject index before extension.
	if userPath != "" {
		userExt := path.Ext(userPath)
		base := strings.TrimSuffix(userPath, userExt)
		if userExt == "" {
			userExt = ext
		}
		return fmt.Sprintf("%s_%d%s", base, index+1, userExt)
	}

	// No -o: auto-generate.
	if total == 1 {
		return "music_" + timestamp + ext
	}
	return fmt.Sprintf("music_%s_%d%s", timestamp, index+1, ext)
}

// writeMusicResult writes a structured JSON result for music generation.
func writeMusicResult(w io.Writer, r *musicResult, requestID string) error {
	outputs := make([]map[string]any, 0, len(r.Outputs))
	for _, o := range r.Outputs {
		entry := map[string]any{}
		if o.LocalPath != "" {
			entry["local_path"] = o.LocalPath
		}
		if o.URL != "" {
			entry["url"] = o.URL
		}
		if o.Error != "" {
			entry["error"] = o.Error
		}
		outputs = append(outputs, entry)
	}

	result := map[string]any{
		"status":       r.Status,
		"model":        r.Model,
		"credits_used": r.CreditsUsed,
		"outputs":      outputs,
	}
	if requestID != "" {
		result["request_id"] = requestID
	}
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}
	return output.WriteJSON(w, data)
}
