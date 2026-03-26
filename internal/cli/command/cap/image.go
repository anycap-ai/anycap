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
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"

	"github.com/spf13/cobra"
)

func NewImageCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	imageCmd := &cobra.Command{
		Use:   "image",
		Short: "Generate and edit images",
		RunE:  requireSubcommand,
	}

	if feature.Enabled(feature.ImageModels) {
		imageCmd.AddCommand(newImageModelsCmd(clientFactory, stdout))
	}
	if feature.Enabled(feature.ImageGenerate) {
		imageCmd.AddCommand(newImageGenerateCmd(clientFactory, stdout))
	}

	return imageCmd
}

// newImageModelsCmd handles three forms:
//
//	image models                       -> list all models
//	image models <model>               -> show one model (client-side filter)
//	image models <model> schema        -> fetch model schema from server
func newImageModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var operation string

	cmd := &cobra.Command{
		Use:   "models [model] [schema]",
		Short: "List available image models or show model details",
		Long: `List all available image models, show details for a specific model,
or fetch the request schema for a model.

Examples:
  anycap image models
  anycap image models nano-banana-2
  anycap image models nano-banana-2 schema
  anycap image models nano-banana-2 schema --operation edit`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()

			// image models <model> schema
			if len(args) == 2 {
				if args[1] != "schema" {
					return fmt.Errorf("unknown argument %q; did you mean 'schema'?", args[1])
				}
				return fetchModelSchema(cmd, client, stdout, args[0], operation)
			}

			// image models / image models <model>
			return listModels(cmd, client, stdout, args)
		},
	}

	cmd.Flags().StringVar(&operation, "operation", "generate", "Operation to get schema for (used with 'schema')")

	return cmd
}

// listModels fetches all models and optionally filters to a single model.
func listModels(cmd *cobra.Command, client *httpclient.Client, stdout io.Writer, args []string) error {
	resp, err := client.Get(cmd.Context(), "/v1/image/models")
	if err != nil {
		return err
	}

	// No filter: passthrough the full response.
	if len(args) == 0 {
		return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
	}

	// Filter to a single model client-side.
	modelName := args[0]
	var envelope struct {
		Status     string            `json:"status"`
		Capability string            `json:"capability"`
		Models     []json.RawMessage `json:"models"`
	}
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		// Can't parse, just passthrough.
		return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
	}

	for _, raw := range envelope.Models {
		var m struct {
			Model string `json:"model"`
		}
		if json.Unmarshal(raw, &m) == nil && m.Model == modelName {
			result := map[string]any{
				"status": "success",
				"model":  json.RawMessage(raw),
			}
			data, _ := json.Marshal(result)
			return output.WriteServerJSON(stdout, data, resp.RequestID)
		}
	}

	return fmt.Errorf("model %q not found", modelName)
}

// fetchModelSchema fetches the request schema for a specific model and operation.
func fetchModelSchema(cmd *cobra.Command, client *httpclient.Client, stdout io.Writer, model, operation string) error {
	path := fmt.Sprintf("/v1/image/models/%s/schema?operation=%s", model, operation)
	resp, err := client.Get(cmd.Context(), path)
	if err != nil {
		return err
	}
	return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
}

func newImageGenerateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var prompt string
	var model string
	var params []string
	var outputPath string

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate an image from a prompt",
		Long: `Generate an image using a text prompt. Use --param to pass model-specific
parameters discovered from 'image models <model> schema'.

The generated image is automatically downloaded to the current directory.
Use -o to specify a custom output path.

Examples:
  anycap image generate --prompt "a paper crane on a wooden table" --model nano-banana-2
  anycap image generate --prompt "a landscape" --model nano-banana-2 -o landscape.png
  anycap image generate --prompt "a landscape" --model nano-banana-2 --param aspect_ratio=16:9`,
		RunE: func(cmd *cobra.Command, args []string) error {
			body := map[string]any{
				"prompt": prompt,
				"model":  model,
			}

			// Parse --param key=value pairs into the request body.
			for _, p := range params {
				k, v, ok := strings.Cut(p, "=")
				if !ok {
					return fmt.Errorf("invalid --param format %q: expected key=value", p)
				}
				body[k] = parseParamValue(v)
			}

			resp, err := clientFactory().PostJSON(cmd.Context(), "/v1/image/generate", body)
			if err != nil {
				return err
			}

			// Parse server response.
			genResult, parseErr := parseGenerateResponse(resp.Body)
			if parseErr != nil {
				// Can't parse; pass through raw response.
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			// Error from server: pass through.
			if genResult.Status != "success" {
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			// Download the generated image.
			if genResult.ImageURL != "" {
				savePath := outputPath
				if savePath == "" {
					savePath = defaultImageFilename(genResult.ImageURL)
				}
				absPath, dlErr := fileutil.DownloadFile(genResult.ImageURL, savePath)
				if dlErr != nil {
					return fmt.Errorf("generation succeeded but download failed: %w", dlErr)
				}
				genResult.LocalPath = absPath
			}

			// Write flat, agent-friendly output.
			return writeImageResult(stdout, genResult, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt for image generation")
	cmd.Flags().StringVar(&model, "model", "", "Model ID to use")
	cmd.Flags().StringArrayVar(&params, "param", nil, "Extra parameter as key=value (repeatable)")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Save generated image to this path (default: current directory)")
	_ = cmd.MarkFlagRequired("prompt")
	_ = cmd.MarkFlagRequired("model")

	return cmd
}

// parseParamValue tries to parse a value as JSON (number, boolean, null),
// falling back to string if JSON parsing fails.
func parseParamValue(v string) any {
	// Try JSON parse for numbers, booleans, null.
	var parsed any
	if err := json.Unmarshal([]byte(v), &parsed); err == nil {
		// Only accept scalar JSON types; reject arrays/objects to avoid confusion.
		switch parsed.(type) {
		case float64, bool, nil:
			return parsed
		}
	}
	return v
}

// generateResult holds the parsed fields from an image generate response.
type generateResult struct {
	Status      string
	ImageURL    string
	LocalPath   string
	Model       string
	CreditsUsed int
}

// defaultImageFilename generates a clean default filename for a generated image.
// Uses a timestamp-based name with the extension from the URL (e.g., image_20260326_175540.png).
func defaultImageFilename(imageURL string) string {
	ext := path.Ext(fileutil.FilenameFromURL(imageURL))
	if ext == "" {
		ext = ".png"
	}
	return "image_" + time.Now().Format("20060102_150405") + ext
}

// parseGenerateResponse extracts key fields from the server's generate response.
func parseGenerateResponse(body []byte) (*generateResult, error) {
	var env struct {
		Status string `json:"status"`
		Data   struct {
			Model   string `json:"model"`
			Outputs []struct {
				URL string `json:"url"`
			} `json:"outputs"`
			CreditCost int `json:"credit_cost"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &env); err != nil {
		return nil, err
	}

	result := &generateResult{
		Status:      env.Status,
		Model:       env.Data.Model,
		CreditsUsed: env.Data.CreditCost,
	}
	if len(env.Data.Outputs) > 0 {
		result.ImageURL = env.Data.Outputs[0].URL
	}
	return result, nil
}

// writeImageResult writes a flat, agent-friendly JSON result for image generation.
func writeImageResult(w io.Writer, r *generateResult, requestID string) error {
	result := map[string]any{
		"status":       r.Status,
		"local_path":   r.LocalPath,
		"model":        r.Model,
		"credits_used": r.CreditsUsed,
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
