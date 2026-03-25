package cap

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"

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

Use -o to download the generated image to a local file. Without -o, the output
includes a hint showing how to download it with 'anycap download'.

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

			// If -o is specified, download the first output image.
			if outputPath != "" {
				imageURL := extractFirstOutputURL(resp.Body)
				if imageURL != "" {
					absPath, dlErr := fileutil.DownloadFile(imageURL, outputPath)
					if dlErr != nil {
						return fmt.Errorf("generation succeeded but download failed: %w", dlErr)
					}
					// Inject local_path into the response.
					resp.Body = injectLocalPath(resp.Body, absPath)
				}
				return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
			}

			// No -o: inject download hint for agents.
			resp.Body = injectDownloadHint(resp.Body)
			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&prompt, "prompt", "", "Text prompt for image generation")
	cmd.Flags().StringVar(&model, "model", "", "Model ID to use")
	cmd.Flags().StringArrayVar(&params, "param", nil, "Extra parameter as key=value (repeatable)")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Download generated image to this path")
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

// extractFirstOutputURL extracts the URL of the first output from a generate response.
func extractFirstOutputURL(body []byte) string {
	var env struct {
		Data struct {
			Outputs []struct {
				URL string `json:"url"`
			} `json:"outputs"`
		} `json:"data"`
	}
	if json.Unmarshal(body, &env) == nil && len(env.Data.Outputs) > 0 {
		return env.Data.Outputs[0].URL
	}
	return ""
}

// injectLocalPath adds a local_path field to the first output in the generate response.
func injectLocalPath(body []byte, localPath string) []byte {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(body, &obj); err != nil {
		return body
	}

	var data map[string]json.RawMessage
	if err := json.Unmarshal(obj["data"], &data); err != nil {
		return body
	}

	var outputs []map[string]any
	if err := json.Unmarshal(data["outputs"], &outputs); err != nil || len(outputs) == 0 {
		return body
	}

	outputs[0]["local_path"] = localPath
	outputsJSON, _ := json.Marshal(outputs)
	data["outputs"] = outputsJSON
	dataJSON, _ := json.Marshal(data)
	obj["data"] = dataJSON
	result, _ := json.Marshal(obj)
	return result
}

// injectDownloadHint adds a hint field to the generate response, guiding agents
// to use 'anycap download' to save the file locally.
func injectDownloadHint(body []byte) []byte {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(body, &obj); err != nil {
		return body
	}
	hint, _ := json.Marshal("use 'anycap download <url> -o <path>' or rerun with '-o <path>' to save the image locally")
	obj["hint"] = hint
	result, _ := json.Marshal(obj)
	return result
}
