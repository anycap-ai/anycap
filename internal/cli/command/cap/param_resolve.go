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

// resolveFileParams inspects the request body and performs schema-driven
// parameter coercion:
//
//  1. File upload: for parameters whose schema declares format "file-or-url",
//     local file paths are uploaded and replaced with object URLs.
//  2. Array wrapping: for parameters whose schema declares type "array", a
//     single value is automatically wrapped into a one-element array.
//
// This allows agents to pass local paths (e.g. --param images=/tmp/photo.png)
// or single values for array fields (e.g. --param images=https://...) without
// knowing about upload flows or JSON array syntax.
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
	schemaFields, err := fetchSchemaFields(ctx, client, capability, model, mode, verboseLog)
	if err != nil {
		// Schema fetch failed -- non-fatal, proceed without resolution.
		if verboseLog != nil {
			fmt.Fprintf(verboseLog, "[param-resolve] schema fetch failed, skipping param resolution: %v\n", err)
		}
		return nil
	}
	if len(schemaFields) == 0 {
		return nil
	}

	for paramName, sf := range schemaFields {
		val, ok := body[paramName]
		if !ok {
			continue
		}

		resolved, err := resolveFieldValue(ctx, client, val, sf, verboseLog)
		if err != nil {
			return fmt.Errorf("failed to resolve param %q: %w", paramName, err)
		}
		body[paramName] = resolved
	}

	return nil
}

// schemaField describes a schema parameter that may need auto-coercion.
type schemaField struct {
	isArray     bool // true when schema type is "array"
	isFileOrURL bool // true when format is "file-or-url" (direct or via items)
}

// fetchSchemaFields fetches the model schema and returns a map of param names
// that need auto-coercion: file-or-url fields (for upload) and/or array fields
// (for single-value-to-array wrapping).
func fetchSchemaFields(
	ctx context.Context,
	client *httpclient.Client,
	capability, model, mode string,
	verboseLog io.Writer,
) (map[string]schemaField, error) {
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

	// Collect fields that need coercion from all matching schemas.
	result := make(map[string]schemaField)
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
			if sf, ok := extractSchemaField(def); ok {
				result[paramName] = sf
				if verboseLog != nil {
					fmt.Fprintf(verboseLog, "[param-resolve] schema field: %s (array=%t, fileOrURL=%t)\n", paramName, sf.isArray, sf.isFileOrURL)
				}
			}
		}
	}

	return result, nil
}

// extractSchemaField checks if a param definition needs auto-coercion.
// Detects file-or-url fields (for upload) and array fields (for auto-wrapping).
func extractSchemaField(def map[string]any) (schemaField, bool) {
	typ, _ := def["type"].(string)

	// Direct: {"type": "string", "format": "file-or-url"}
	if typ == "string" {
		if fmt, ok := def["format"].(string); ok && fmt == "file-or-url" {
			return schemaField{isArray: false, isFileOrURL: true}, true
		}
	}

	// Array types: detect both file-or-url arrays and plain arrays.
	if typ == "array" {
		items, ok := def["items"].(map[string]any)
		if ok {
			if fmt, ok := items["format"].(string); ok && fmt == "file-or-url" {
				return schemaField{isArray: true, isFileOrURL: true}, true
			}
		}
		// Plain array (no file-or-url format) -- still needs single-to-array coercion.
		return schemaField{isArray: true, isFileOrURL: false}, true
	}

	return schemaField{}, false
}

// resolveFieldValue resolves a body value based on its schema field descriptor.
// For file-or-url fields, it uploads local file paths and returns URLs.
// For any array field, if a single value is given, it wraps into an array.
func resolveFieldValue(
	ctx context.Context,
	client *httpclient.Client,
	val any,
	sf schemaField,
	verboseLog io.Writer,
) (any, error) {
	switch v := val.(type) {
	case string:
		if sf.isFileOrURL {
			resolved, err := maybeUploadPath(ctx, client, v, verboseLog)
			if err != nil {
				return nil, err
			}
			if sf.isArray {
				return []any{resolved}, nil
			}
			return resolved, nil
		}
		// Non-file-or-url: just wrap to array if schema expects it.
		if sf.isArray {
			return []any{v}, nil
		}
		return v, nil

	case []any:
		if !sf.isFileOrURL {
			// Plain array -- no file resolution needed, pass through.
			return v, nil
		}
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
