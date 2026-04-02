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

	"github.com/spf13/cobra"
)

func NewImageCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	imageCmd := &cobra.Command{
		Use:   "image",
		Short: "Generate and edit images",
		RunE:  requireSubcommand,
	}

	imageCmd.AddCommand(newImageModelsCmd(clientFactory, stdout))
	imageCmd.AddCommand(newImageOperationCmd(clientFactory, stdout, imageOperationConfig{
		Operation: "generate",
		Short:     "Generate an image from a prompt",
		Long: `Generate an image using a text prompt. Use --param to pass parameters
discovered from 'image models <model> schema'.

The generated image is automatically downloaded to the current directory.
Use -o to specify a custom output path.

Examples:
  anycap image generate --prompt "a paper crane on a wooden table" --model nano-banana-2
  anycap image generate --prompt "a landscape" --model nano-banana-2 -o landscape.png
  anycap image generate --prompt "a landscape" --model nano-banana-2 --param ratio=16:9
  anycap image generate --prompt "a photo" --model nano-banana-2 --mode image-to-image --param reference_image_urls='["https://example.com/photo.jpg"]'`,
		PromptDesc: "Text prompt for image generation",
	}))
	imageCmd.AddCommand(newImageOperationCmd(clientFactory, stdout, imageOperationConfig{
		Operation: "edit",
		Short:     "Edit an image using a prompt",
		Long: `Edit an existing image using a text prompt. Requires a reference image
via --param or --mode image-to-image.

The edited image is automatically downloaded to the current directory.
Use -o to specify a custom output path.

Examples:
  anycap image edit --prompt "remove the background" --model seedream-5 --param reference_image_urls='["https://example.com/photo.jpg"]'
  anycap image edit --prompt "make it look like a painting" --model seedream-5 --param reference_image_urls='["./photo.jpg"]'
  anycap image edit --prompt "change hair color to red" --model seedream-5 -o edited.png --param reference_image_urls='["./portrait.jpg"]'`,
		PromptDesc: "Text prompt describing the edit to apply",
	}))

	return imageCmd
}

// newImageModelsCmd handles three forms:
//
//	image models                       -> list all models
//	image models <model>               -> show one model (client-side filter)
//	image models <model> schema        -> fetch model schema from server
func newImageModelsCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		operation string
		mode      string
	)

	cmd := &cobra.Command{
		Use:   "models [model] [schema]",
		Short: "List available image models or show model details",
		Long: `List all available image models, show details for a specific model,
or fetch the request schema for a model.

Examples:
  anycap image models
  anycap image models nano-banana-2
  anycap image models nano-banana-2 schema
  anycap image models nano-banana-2 schema --mode text-to-image
  anycap image models nano-banana-2 schema --operation edit`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			client := clientFactory()

			// image models <model> schema
			if len(args) == 2 {
				if args[1] != "schema" {
					return fmt.Errorf("unknown argument %q; did you mean 'schema'?", args[1])
				}
				return fetchCapModelSchema(cmd, client, stdout, "image", args[0], operation, mode)
			}

			// image models / image models <model>
			return listModels(cmd, client, stdout, args)
		},
	}

	cmd.Flags().StringVar(&operation, "operation", "", "Operation to get schema for (used with 'schema')")
	cmd.Flags().StringVar(&mode, "mode", "", "Mode to filter schema for (e.g. text-to-image, image-to-image)")

	return cmd
}

// listModels fetches all models and optionally filters to a single model.
func listModels(cmd *cobra.Command, client *httpclient.Client, stdout io.Writer, args []string) error {
	return listCapModels(cmd, client, stdout, "image", args)
}

// listCapModels fetches models for a given capability and optionally filters to one.
func listCapModels(cmd *cobra.Command, client *httpclient.Client, stdout io.Writer, capability string, args []string) error {
	resp, err := client.Get(cmd.Context(), api.ModelsPath(capability))
	if err != nil {
		return err
	}

	// No filter: passthrough the full response with a model-picking hint.
	if len(args) == 0 {
		body := injectModelsHint(resp.Body, capability)
		return output.WriteServerJSON(stdout, body, resp.RequestID)
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
	return fetchCapModelSchema(cmd, client, stdout, "image", model, operation, "")
}

// fetchCapModelSchema fetches the request schema for any capability.
func fetchCapModelSchema(cmd *cobra.Command, client *httpclient.Client, stdout io.Writer, capability, modelName, operation, mode string) error {
	qpath := api.ModelSchemaPath(capability, modelName)
	sep := '?'
	if operation != "" {
		qpath += fmt.Sprintf("%coperation=%s", sep, operation)
		sep = '&'
	}
	if mode != "" {
		qpath += fmt.Sprintf("%cmode=%s", sep, mode)
	}
	resp, err := client.Get(cmd.Context(), qpath)
	if err != nil {
		return err
	}
	return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
}

// imageOperationConfig defines how a specific image operation subcommand behaves.
type imageOperationConfig struct {
	Operation  string // CLI subcommand name and API operation (e.g. "generate", "edit")
	Short      string
	Long       string
	PromptDesc string // Description for the --prompt flag
}

// newImageOperationCmd creates a CLI subcommand for any image operation.
// The operation name determines the server endpoint: POST /v1/image/{operation}.
func newImageOperationCmd(clientFactory func() *httpclient.Client, stdout io.Writer, cfg imageOperationConfig) *cobra.Command {
	var (
		prompt     string
		model      string
		mode       string
		params     []string
		outputPath string
	)

	cmd := &cobra.Command{
		Use:   cfg.Operation,
		Short: cfg.Short,
		Long:  cfg.Long,
		RunE: func(cmd *cobra.Command, args []string) error {
			body := map[string]any{
				"model": model,
			}
			if prompt != "" {
				body["prompt"] = prompt
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
			if err := resolveFileParams(cmd.Context(), client, "image", model, mode, body, verboseWriter(cmd)); err != nil {
				return err
			}

			resp, err := client.PostJSON(cmd.Context(), api.OperationPath("image", cfg.Operation), body)
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
			if genResult.OutputURL != "" {
				savePath := outputPath
				if savePath == "" {
					savePath = defaultImageFilename(genResult.OutputURL)
				}
				absPath, dlErr := fileutil.DownloadFile(genResult.OutputURL, savePath)
				if dlErr != nil {
					return fmt.Errorf("operation succeeded but download failed: %w", dlErr)
				}
				genResult.LocalPath = absPath
			}

			// Write flat, agent-friendly output.
			return writeGenerateResult(stdout, genResult, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", cfg.PromptDesc)
	cmd.Flags().StringVar(&model, "model", "", "Model ID to use")
	cmd.Flags().StringVar(&mode, "mode", "", "Generation mode (e.g. text-to-image, image-to-image)")
	cmd.Flags().StringArrayVar(&params, "param", nil, "Parameter as key=value (repeatable); discover params via 'image models <model> schema'")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Save generated image to this path (default: current directory)")
	_ = cmd.MarkFlagRequired("prompt")
	_ = cmd.MarkFlagRequired("model")

	return cmd
}

// parseParamValue tries to parse a value as JSON (any valid type),
// falling back to string if JSON parsing fails.
func parseParamValue(v string) any {
	var parsed any
	if err := json.Unmarshal([]byte(v), &parsed); err == nil {
		return parsed
	}
	return v
}

// generateResult holds the parsed fields from a generate response (image or video).
type generateResult struct {
	Status      string
	OutputURL   string
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

// injectModelsHint adds a hint field to the models list response,
// prompting the agent to present models to the user for selection.
func injectModelsHint(payload []byte, capability string) []byte {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(payload, &obj); err != nil {
		return payload
	}
	hint := fmt.Sprintf(
		"Multiple %s models available. Ask the user which model they prefer before proceeding.",
		capability,
	)
	hintJSON, _ := json.Marshal(hint)
	obj["hint"] = hintJSON
	out, err := json.Marshal(obj)
	if err != nil {
		return payload
	}
	return out
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
		result.OutputURL = env.Data.Outputs[0].URL
	}
	return result, nil
}

// writeGenerateResult writes a flat, agent-friendly JSON result for generation commands.
func writeGenerateResult(w io.Writer, r *generateResult, requestID string) error {
	result := map[string]any{
		"status":       r.Status,
		"local_path":   r.LocalPath,
		"model":        r.Model,
		"credits_used": r.CreditsUsed,
	}
	if r.OutputURL != "" {
		result["url"] = r.OutputURL
	}
	if requestID != "" {
		result["request_id"] = requestID
	}

	// Inject feedback hint so the agent knows to ask the user for feedback.
	hint := "Present the result to the user. If the user is not satisfied, " +
		"it may be due to how the prompt was constructed -- our skill documentation might need improvement. " +
		"Please help us by reporting it: anycap feedback --type bug -m '<what went wrong>'"
	if requestID != "" {
		hint += " --request-id '" + requestID + "'"
	}
	if traceID := output.TraceID(); traceID != "" {
		hint += " --trace-id '" + traceID + "'"
	}
	result["hint"] = hint

	data, err := json.Marshal(result)
	if err != nil {
		return err
	}
	return output.WriteJSON(w, data)
}
