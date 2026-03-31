package cap

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
)

// resolveFileParams inspects the request body and uploads local file paths for
// any parameter whose schema declares format "file-or-url". This allows agents
// to pass local paths (e.g. --param images=/tmp/photo.png) without knowing
// about the upload flow -- the CLI handles it transparently.
//
// The function fetches the model schema, identifies file-typed parameters, and
// for each matching key in body whose value is a local file path (not an HTTP
// URL), uploads the file via presign and replaces the value with the object URL.
//
// Schema fetch failure is non-fatal: the function logs a warning (if verbose)
// and returns nil so the request proceeds with raw values.
func resolveFileParams(
	ctx context.Context,
	client *httpclient.Client,
	capability, model, mode string,
	body map[string]any,
	verboseLog io.Writer,
) error {
	fileFields, err := fetchFileFields(ctx, client, capability, model, mode, verboseLog)
	if err != nil {
		// Schema fetch failed -- non-fatal, proceed without resolution.
		if verboseLog != nil {
			fmt.Fprintf(verboseLog, "[param-resolve] schema fetch failed, skipping file resolution: %v\n", err)
		}
		return nil
	}
	if len(fileFields) == 0 {
		return nil
	}

	for paramName, ff := range fileFields {
		val, ok := body[paramName]
		if !ok {
			continue
		}

		resolved, err := resolveFieldValue(ctx, client, val, ff, verboseLog)
		if err != nil {
			return fmt.Errorf("failed to resolve file param %q: %w", paramName, err)
		}
		body[paramName] = resolved
	}

	return nil
}

// fileField describes a schema field that accepts file-or-url values.
type fileField struct {
	isArray bool // true when schema type is "array" with file-or-url items
}

// fetchFileFields fetches the model schema and returns a map of param names
// that have format "file-or-url" (directly or via items).
func fetchFileFields(
	ctx context.Context,
	client *httpclient.Client,
	capability, model, mode string,
	verboseLog io.Writer,
) (map[string]fileField, error) {
	qpath := api.ModelSchemaPath(capability, model)
	if mode != "" {
		qpath += "?mode=" + mode
	}

	resp, err := client.Get(ctx, qpath)
	if err != nil {
		return nil, err
	}

	schemas, err := parseSchemaResponse(resp.Body)
	if err != nil {
		return nil, err
	}

	if verboseLog != nil {
		fmt.Fprintf(verboseLog, "[param-resolve] found %d schema(s) for %s/%s\n", len(schemas), capability, model)
	}

	// Collect file-or-url fields from all matching schemas.
	result := make(map[string]fileField)
	for _, s := range schemas {
		modelParams, ok := s.schema["model_params"]
		if !ok {
			continue
		}
		paramsMap, ok := modelParams.(map[string]any)
		if !ok {
			continue
		}

		for paramName, paramDef := range paramsMap {
			def, ok := paramDef.(map[string]any)
			if !ok {
				continue
			}
			if ff, ok := extractFileField(def); ok {
				result[paramName] = ff
				if verboseLog != nil {
					fmt.Fprintf(verboseLog, "[param-resolve] file field: %s (array=%t)\n", paramName, ff.isArray)
				}
			}
		}
	}

	return result, nil
}

// extractFileField checks if a param definition has format "file-or-url".
// Supports both direct string fields and array fields with file-or-url items.
func extractFileField(def map[string]any) (fileField, bool) {
	typ, _ := def["type"].(string)

	// Direct: {"type": "string", "format": "file-or-url"}
	if typ == "string" {
		if fmt, ok := def["format"].(string); ok && fmt == "file-or-url" {
			return fileField{isArray: false}, true
		}
	}

	// Array: {"type": "array", "items": {"type": "string", "format": "file-or-url"}}
	if typ == "array" {
		items, ok := def["items"].(map[string]any)
		if !ok {
			return fileField{}, false
		}
		if fmt, ok := items["format"].(string); ok && fmt == "file-or-url" {
			return fileField{isArray: true}, true
		}
	}

	return fileField{}, false
}

// resolveFieldValue resolves a body value for a file-or-url field.
// It uploads local file paths and returns URLs. Handles both single values
// and arrays. If the schema expects an array but a single path is given,
// the result is wrapped into an array.
func resolveFieldValue(
	ctx context.Context,
	client *httpclient.Client,
	val any,
	ff fileField,
	verboseLog io.Writer,
) (any, error) {
	switch v := val.(type) {
	case string:
		resolved, err := maybeUploadPath(ctx, client, v, verboseLog)
		if err != nil {
			return nil, err
		}
		// Schema expects array but got single value -> wrap.
		if ff.isArray {
			return []any{resolved}, nil
		}
		return resolved, nil

	case []any:
		result := make([]any, len(v))
		for i, elem := range v {
			s, ok := elem.(string)
			if !ok {
				result[i] = elem
				continue
			}
			resolved, err := maybeUploadPath(ctx, client, s, verboseLog)
			if err != nil {
				return nil, err
			}
			result[i] = resolved
		}
		return result, nil

	default:
		// Unrecognized type -- pass through as-is.
		return val, nil
	}
}

// maybeUploadPath checks if a string value is a URL or a local file path.
// URLs (http:// or https://) are passed through as-is.
// Anything else is treated as a local file path: the file must exist, and
// it will be uploaded via presign. Returns an error if the file doesn't exist.
func maybeUploadPath(
	ctx context.Context,
	client *httpclient.Client,
	val string,
	verboseLog io.Writer,
) (string, error) {
	if isURL(val) {
		return val, nil
	}

	// Not a URL -- must be a local file path. Validate existence.
	if _, err := os.Stat(val); err != nil {
		return "", fmt.Errorf("file not found: %s (file-or-url fields require an http/https URL or a valid local file path)", val)
	}

	if verboseLog != nil {
		fmt.Fprintf(verboseLog, "[param-resolve] uploading local file: %s\n", val)
	}

	result, err := uploadFile(ctx, client, val, verboseLog)
	if err != nil {
		return "", fmt.Errorf("upload %s: %w", val, err)
	}

	return result.ObjectURL, nil
}

// isURL returns true if the value starts with http:// or https://.
func isURL(s string) bool {
	return strings.HasPrefix(s, "http://") || strings.HasPrefix(s, "https://")
}

// schemaEntry is a parsed schema from the server response.
type schemaEntry struct {
	operation string
	mode      string
	schema    map[string]any
}

// parseSchemaResponse parses the server's schema endpoint response.
// Expected format: {"status":"success", "schemas": [{"operation":"...", "mode":"...", "schema": {...}}]}
func parseSchemaResponse(body []byte) ([]schemaEntry, error) {
	var env struct {
		Schemas []struct {
			Operation string         `json:"operation"`
			Mode      string         `json:"mode"`
			Schema    map[string]any `json:"schema"`
		} `json:"schemas"`
	}

	if err := json.Unmarshal(body, &env); err != nil {
		return nil, fmt.Errorf("parse schema response: %w", err)
	}

	result := make([]schemaEntry, 0, len(env.Schemas))
	for _, s := range env.Schemas {
		if s.Schema == nil {
			continue
		}
		result = append(result, schemaEntry{
			operation: s.Operation,
			mode:      s.Mode,
			schema:    s.Schema,
		})
	}
	return result, nil
}
