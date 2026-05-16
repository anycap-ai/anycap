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
// Unknown or malformed entries are silently skipped so that adding a
// new resource Kind upstream does not break older AnyCap servers.
func parseResourceTargets(annotation map[string]any) []model.ResourceTarget {
	if len(annotation) == 0 {
		return nil
	}
	resource, ok := annotation["resource"].(map[string]any)
	if !ok {
		return nil
	}
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
			Key:  key,
			Kind: model.ResourceKind(kind),
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
