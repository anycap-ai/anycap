package curatedcatalog

// flattenDiscoverySchema converts the new NexusHub tool_definition schema
// (a JSON Schema with nested image_option/video_option/music_option) into
// the legacy flat shape used by AnyCap CLI:
//
//	old:  {"model_params": {"aspect_ratio": {...}, "resolution": {...}, ...}}
//	new:  {"type":"object", "required":[...], "properties":{
//	          "gen_type": {...}, "prompt": {...},
//	          "image_option": {"properties":{"ratio":{...}, "resolution":{...}, ...}}
//	      }}
//
// The flatten output is shaped like the OLD `operation_schemas[algo]` body so
// existing CLI agents continue to work without change. It also preserves the
// richer "description" text that Discovery now exposes.
//
// Rules:
//   - Top-level "prompt" is preserved as-is (key: "prompt").
//   - Nested option fields are promoted to the top:
//     image_option.ratio       -> aspect_ratio
//     image_option.resolution  -> resolution
//     image_option.format      -> format
//     video_option.duration    -> duration
//     video_option.ratio       -> aspect_ratio
//     video_option.resolution  -> resolution
//     music_option.duration    -> duration
//   - Server-injected fields are dropped: gen_type,
//     image_option.type, video_option.type, music_option.type,
//     resource_url, resource_path.
//   - Any other top-level property the schema introduces is preserved
//     verbatim under its original name (forward-compat).
//
// Returned shape: {"model_params": {...}}, mirroring the legacy
// nexushub.PlatformClient.GetOperationSchemas response so the CLI's
// `models <m> schema` output stays stable.
func flattenDiscoverySchema(schema map[string]any) map[string]any {
	if len(schema) == 0 {
		return nil
	}
	props, _ := schema["properties"].(map[string]any)
	if len(props) == 0 {
		return nil
	}

	flat := make(map[string]any, 8)

	for key, raw := range props {
		switch key {
		case "gen_type", "resource_url", "resource_path":
			continue
		case "image_option":
			mergeOption(flat, raw, imageOptionRenames())
		case "video_option":
			mergeOption(flat, raw, videoOptionRenames())
		case "music_option":
			mergeOption(flat, raw, musicOptionRenames())
		default:
			// Pass through any other property unchanged.
			if _, exists := flat[key]; !exists {
				flat[key] = raw
			}
		}
	}

	if len(flat) == 0 {
		return nil
	}
	return map[string]any{"model_params": flat}
}

func imageOptionRenames() map[string]string {
	return map[string]string{
		"type":       "", // dropped (algo type, server-injected)
		"ratio":      "aspect_ratio",
		"resolution": "resolution",
		"format":     "format",

		// Reference image fields are injected by the server when the caller
		// passes --ref / --image; users do not set these directly.
		"refer_image_urls":          "",
		"refer_image_resource_path": "",
		"refer_image_resource_url":  "",
		"reference_image_urls":      "",
		"reference_image_url":       "",
		"image_url":                 "",
		"image_urls":                "",
	}
}

func videoOptionRenames() map[string]string {
	return map[string]string{
		"type":       "",
		"ratio":      "aspect_ratio",
		"resolution": "resolution",
		"duration":   "duration",
		"format":     "format",

		// Reference media injection (image/video) is server-managed.
		"refer_image_urls":          "",
		"refer_image_resource_path": "",
		"refer_image_resource_url":  "",
		"reference_image_urls":      "",
		"reference_video_url":       "",
		"first_image_url":           "",
		"last_image_url":            "",
	}
}

func musicOptionRenames() map[string]string {
	return map[string]string{
		"type":     "",
		"duration": "duration",
		"format":   "format",
	}
}

// mergeOption flattens one *_option subtree into the top-level params map,
// applying the rename table and the "first-wins" rule. Only dict-shaped
// property descriptors are promoted; primitive values (e.g. an option-level
// "description" string) are skipped to keep the flattened schema clean.
func mergeOption(out map[string]any, raw any, renames map[string]string) {
	option, ok := raw.(map[string]any)
	if !ok {
		return
	}
	subProps, _ := option["properties"].(map[string]any)
	for inKey, inValue := range subProps {
		if _, isMap := inValue.(map[string]any); !isMap {
			continue
		}
		outKey, mapped := renames[inKey]
		if mapped {
			if outKey == "" {
				continue // explicitly dropped
			}
		} else {
			outKey = inKey // forward-compat: pass through unknown keys
		}
		if _, exists := out[outKey]; exists {
			continue // first wins (covers e.g. ratio appearing in both image+video)
		}
		out[outKey] = inValue
	}
}
