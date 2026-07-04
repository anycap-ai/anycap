package curatedcatalog

import "gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

// parseResourceTargets converts NexusHub's Discovery annotation block
// into a list of model.ResourceTarget. The expected shape is
//
//	{
//	  "resource": {
//	    "oneOf": [
//	      {"key": "image_option.refer_image_urls", "type": "url_array"},
//	      ...
//	    ]
//	  }
//	}
//
// Newer abilities declare the modality explicitly with media-typed
// blocks ("image_resource", "video_resource", "audio_resource") of the
// same shape; targets parsed from those carry the matching Media so
// adapters do not have to guess from key names (e.g. edit_video's
// input video arrives via the generic "resource_url" slot).
//
// Unknown or malformed entries are silently skipped so that adding a
// new resource Kind upstream does not break older AnyCap servers.
func parseResourceTargets(annotation map[string]any) []model.ResourceTarget {
	if len(annotation) == 0 {
		return nil
	}

	blocks := []struct {
		key   string
		media model.ResourceMedia
	}{
		{"resource", ""},
		{"image_resource", model.ResourceMediaImage},
		{"video_resource", model.ResourceMediaVideo},
		{"audio_resource", model.ResourceMediaAudio},
	}

	var targets []model.ResourceTarget
	for _, block := range blocks {
		resource, ok := annotation[block.key].(map[string]any)
		if !ok {
			continue
		}
		targets = append(targets, parseResourceBlock(resource, block.media)...)
	}
	if len(targets) == 0 {
		return nil
	}
	return targets
}

func parseResourceBlock(resource map[string]any, media model.ResourceMedia) []model.ResourceTarget {
	rawAlternatives, ok := resource["oneOf"].([]any)
	if !ok || len(rawAlternatives) == 0 {
		return nil
	}

	targets := make([]model.ResourceTarget, 0, len(rawAlternatives))
	for _, raw := range rawAlternatives {
		entry, ok := raw.(map[string]any)
		if !ok {
			continue
		}
		key, _ := entry["key"].(string)
		kind, _ := entry["type"].(string)
		if key == "" || !isKnownResourceKind(kind) {
			continue
		}
		targets = append(targets, model.ResourceTarget{
			Key:   key,
			Kind:  model.ResourceKind(kind),
			Media: media,
		})
	}
	return targets
}

func isKnownResourceKind(s string) bool {
	switch model.ResourceKind(s) {
	case model.ResourceKindURL,
		model.ResourceKindURLArray,
		model.ResourceKindStorage,
		model.ResourceKindStorageArray:
		return true
	default:
		return false
	}
}
