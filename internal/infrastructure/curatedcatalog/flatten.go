package curatedcatalog

// flattenDiscoverySchema converts the new NexusHub tool_definition schema
// (a JSON Schema with nested image_option/video_option/music_option) into
// the legacy flat shape used by the AnyCap CLI:
//
//	old:  {"model_params": {"aspect_ratio": {...}, "resolution": {...}, ...}}
//	new:  {"type":"object", "required":[...], "properties":{
//	          "gen_type": {...}, "prompt": {...},
//	          "image_option": {"properties":{"ratio":{...}, ...}}
//	      }}
//
// The flatten output is shaped like the old `operation_schemas[algo]`
// body so existing CLI agents continue to work without change. It also
// preserves the richer "description" text that Discovery now exposes.
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
//   - Server-injected and reference-media wire fields are dropped (see
//     droppedTopLevelFields and droppedOptionFields). They never escape
//     to the agent-facing schema; reference media is exposed via the
//     synthetic "images"/"videos"/"audios" fields (see referenceMediaParams below).
//   - Any other top-level property the schema introduces is preserved
//     verbatim under its original name (forward-compat).
//
// When the route supports reference images, a synthetic "images" array is appended:
//
//	"images": {"type":"array","items":{"type":"string","format":"file-or-url"}, ...}
//
// When the route supports reference videos, a synthetic "videos" array is appended:
//
//	"videos": {"type":"array","items":{"type":"string","format":"file-or-url"}, ...}
//
// CLI's resolveFileParams recognizes format=file-or-url and uploads
// local file paths or accepts plain http(s) URLs. The server then maps
// the uploaded URLs into the right upstream slot using the route's
// ResourceTargets. The decision to set these fields lives in the catalog
// layer and is driven by Discovery's annotation.resource block.
//
// Returned shape: {"model_params": {...}}, mirroring the legacy
// PlatformClient.GetOperationSchemas response so the CLI's
// `models <m> schema` output stays stable.
func flattenDiscoverySchema(schema map[string]any, withImages bool) map[string]any {
	return flattenDiscoverySchemaWithMedia(schema, referenceMediaParams{Images: withImages})
}

func flattenDiscoverySchemaWithMedia(schema map[string]any, media referenceMediaParams) map[string]any {
	if len(schema) == 0 {
		return nil
	}
	props, _ := schema["properties"].(map[string]any)
	if len(props) == 0 && !media.Images && !media.Videos && !media.Audios {
		return nil
	}

	flat := make(map[string]any, 8)

	for key, raw := range props {
		if _, drop := droppedTopLevelFields[key]; drop {
			continue
		}
		switch key {
		case "image_option":
			mergeOption(flat, raw, imageOptionRenames)
		case "video_option":
			mergeOption(flat, raw, videoOptionRenames)
		case "music_option":
			mergeOption(flat, raw, musicOptionRenames)
		default:
			if _, exists := flat[key]; !exists {
				flat[key] = raw
			}
		}
	}

	if media.Images {
		// First-wins: never overwrite a real schema field named "images".
		if _, exists := flat["images"]; !exists {
			flat["images"] = imagesParamSchema()
		}
	}
	if media.Videos {
		// First-wins: never overwrite a real schema field named "videos".
		if _, exists := flat["videos"]; !exists {
			flat["videos"] = videosParamSchema()
		}
	}
	if media.Audios {
		// First-wins: never overwrite a real schema field named "audios".
		if _, exists := flat["audios"]; !exists {
			flat["audios"] = audiosParamSchema()
		}
	}

	if len(flat) == 0 {
		return nil
	}
	return map[string]any{"model_params": flat}
}

// imagesParamSchema returns the synthetic schema for the AnyCap
// "images" parameter. CLI users pass file paths or URLs; the server
// uploads files via presign and forwards the resolved URLs to the
// upstream provider via RouteBinding.ResourceTargets.
func imagesParamSchema() map[string]any {
	return map[string]any{
		"type":     "array",
		"maxItems": 9,
		"items": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
		"description": "Reference image(s). Pass local file paths or http(s) URLs; AnyCap uploads files automatically and forwards them to the upstream provider.",
	}
}

func videosParamSchema() map[string]any {
	return map[string]any{
		"type":     "array",
		"maxItems": 3,
		"items": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
		"description": "Reference video(s). Pass local file paths or http(s) URLs; AnyCap uploads files automatically and forwards them to the upstream provider.",
	}
}

func audiosParamSchema() map[string]any {
	return map[string]any{
		"type":     "array",
		"maxItems": 3,
		"items": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
		"description": "Reference audio(s). Pass local file paths or http(s) URLs; AnyCap uploads files automatically and forwards them to the upstream provider.",
	}
}

// droppedTopLevelFields are fields the server injects or that contain
// reference media in upstream wire format. They never appear in the
// agent-facing schema. Reference media is exposed as synthetic
// "images"/"videos"/"audios" fields instead.
var droppedTopLevelFields = map[string]struct{}{
	"gen_type":      {},
	"model":         {},
	"resource_id":   {},
	"resource_url":  {},
	"resource_path": {},
}

// droppedOptionFields are nested (*_option.properties) fields that
// either describe upstream wire format (reference image / first-frame
// URLs) or carry the server-injected algo type. Same rationale as
// droppedTopLevelFields.
var droppedOptionFields = map[string]struct{}{
	"type": {}, // server-injected algo_type discriminator

	// Reference image fields (NexusHub wire format). Surfaced to the
	// agent through the synthetic "images" parameter when annotation
	// declares a reference target.
	"refer_image_urls":          {},
	"refer_image_resource_path": {},
	"refer_image_resource_url":  {},
	"refer_video_resource_path": {},
	"refer_video_url":           {},
	"refer_video_urls":          {},
	"refer_audio_url":           {},
	"refer_audio_urls":          {},
	"reference_image_urls":      {},
	"reference_image_url":       {},
	"reference_video_urls":      {},
	"reference_video_url":       {},
	"reference_audio_urls":      {},
	"reference_audio_url":       {},
	"first_frame_resource_path": {},
	"first_frame_url":           {},
	"last_frame_resource_path":  {},
	"last_frame_url":            {},
	"first_image_url":           {},
	"last_image_url":            {},
	"image_url":                 {},
	"image_urls":                {},
}

// imageOptionRenames maps NexusHub image_option child keys to their
// AnyCap-facing names. Keys absent from this map are passed through
// verbatim (forward-compat); keys in droppedOptionFields are dropped.
var imageOptionRenames = map[string]string{
	"ratio":      "aspect_ratio",
	"resolution": "resolution",
	"format":     "format",
}

// videoOptionRenames maps NexusHub video_option child keys to their
// AnyCap-facing names. Same rules as imageOptionRenames.
var videoOptionRenames = map[string]string{
	"ratio":      "aspect_ratio",
	"resolution": "resolution",
	"duration":   "duration",
	"format":     "format",
}

// musicOptionRenames maps NexusHub music_option child keys to their
// AnyCap-facing names. Same rules as imageOptionRenames.
//
// "model" inside music_option is the upstream provider variant (e.g.
// "v5", "v5.5"). It collides with the AnyCap top-level "model" param
// (the AnyCap model id), so we surface it as "model_variant" instead.
var musicOptionRenames = map[string]string{
	"duration": "duration",
	"format":   "format",
	"model":    "model_variant",
}

// mergeOption flattens one *_option subtree into the top-level params
// map, applying the rename table and the first-wins rule. Only
// dict-shaped property descriptors are promoted; primitive values
// (e.g. an option-level "description" string) are skipped to keep the
// flattened schema clean.
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
		if _, drop := droppedOptionFields[inKey]; drop {
			continue
		}
		outKey, mapped := renames[inKey]
		if !mapped {
			outKey = inKey // forward-compat: pass through unknown keys
		}
		if _, exists := out[outKey]; exists {
			continue // first wins (covers e.g. ratio in both image+video)
		}
		out[outKey] = inValue
	}
}
