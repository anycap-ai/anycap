package curatedcatalog

var seedance1080pOverrideKeys = map[string]struct{}{
	"oversea-seedance-2|txt_2_video": {},
	"oversea-seedance-2|img_2_video": {},
}

func applySchemaOverrides(abilityKey, algo string, flat map[string]any) map[string]any {
	if len(flat) == 0 {
		return flat
	}
	key := abilityKey + "|" + algo
	if _, ok := seedance1080pOverrideKeys[key]; ok {
		return appendResolutionEnum(flat, "1080p")
	}
	return flat
}

func appendResolutionEnum(flat map[string]any, value string) map[string]any {
	params, _ := flat["model_params"].(map[string]any)
	resolution, _ := params["resolution"].(map[string]any)
	if len(params) == 0 || len(resolution) == 0 {
		return flat
	}

	rawEnum, ok := resolution["enum"].([]any)
	if !ok {
		return flat
	}
	for _, existing := range rawEnum {
		if existing == value {
			return flat
		}
	}

	nextFlat := cloneFlat(flat)
	nextParams := cloneAnyMap(params)
	nextResolution := cloneAnyMap(resolution)
	nextEnum := append(append([]any(nil), rawEnum...), value)
	nextResolution["enum"] = nextEnum
	nextParams["resolution"] = nextResolution
	nextFlat["model_params"] = nextParams
	return nextFlat
}

func cloneAnyMap(in map[string]any) map[string]any {
	out := make(map[string]any, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}
