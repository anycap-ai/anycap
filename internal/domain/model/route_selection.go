package model

import "fmt"

// SelectRoute finds the best route for a given operation and mode.
// If mode is specified, it matches exactly. If mode is empty and only one mode
// exists for the operation, it uses that. If multiple modes exist and mode is
// empty, it returns ErrModeRequired.
func SelectRoute(spec *ModelSpec, operation Operation, mode Mode) (RouteBinding, error) {
	if spec == nil {
		return RouteBinding{}, fmt.Errorf("%w: model spec is nil", ErrModelRouteNotConfigured)
	}

	opSpec, ok := spec.Operations[operation]
	if !ok || len(opSpec.Routes) == 0 {
		return RouteBinding{}, fmt.Errorf("%w: model=%s operation=%s",
			ErrModelRouteNotConfigured, spec.ModelID, operation)
	}

	// If mode is specified, find exact match
	if mode != "" {
		return selectRouteByMode(spec.ModelID, operation, mode, opSpec.Routes)
	}

	// If mode is empty, check how many distinct modes exist
	modes := distinctModes(opSpec.Routes)
	switch len(modes) {
	case 0:
		// No modes set (legacy data) -- fall back to priority-based selection
		return selectBestRoute(spec.ModelID, operation, opSpec.Routes)
	case 1:
		// Only one mode -- use it implicitly
		return selectRouteByMode(spec.ModelID, operation, modes[0], opSpec.Routes)
	default:
		// Multiple modes -- caller must specify
		return RouteBinding{}, fmt.Errorf("%w: model=%s has multiple modes for operation=%s",
			ErrModeRequired, spec.ModelID, operation)
	}
}

// InferVideoMode infers the mode from request content.
// Returns empty string if no inference can be made.
func InferVideoMode(req GenerateVideoRequest) Mode {
	if len(req.MultiShotClips) > 0 {
		return ModeMultiShotVideo
	}
	if len(req.ReferenceImageURLs) > 0 || len(req.ReferenceVideoURLs) > 0 {
		return ModeImageToVideo
	}
	return ModeTextToVideo
}

// InferImageMode infers the mode from request content.
func InferImageMode(req GenerateImageRequest) Mode {
	if len(req.ReferenceImageURLs) > 0 {
		return ModeImageToImage
	}
	return ModeTextToImage
}

// InferMusicMode returns the default music mode (text-to-music).
func InferMusicMode(_ GenerateMusicRequest) Mode {
	return ModeTextToMusic
}

func selectRouteByMode(modelID string, operation Operation, mode Mode, routes []RouteBinding) (RouteBinding, error) {
	var (
		selected RouteBinding
		found    bool
	)

	for _, route := range routes {
		if !route.Enabled || route.AbilityKey == "" {
			continue
		}
		if route.Mode != mode {
			continue
		}
		if !found || route.Priority > selected.Priority {
			selected = route
			found = true
		}
	}

	if !found {
		return RouteBinding{}, fmt.Errorf("%w: model=%s operation=%s mode=%s",
			ErrModeNotSupported, modelID, operation, mode)
	}

	return selected, nil
}

func selectBestRoute(modelID string, operation Operation, routes []RouteBinding) (RouteBinding, error) {
	var (
		selected RouteBinding
		found    bool
	)

	for _, route := range routes {
		if !route.Enabled || route.AbilityKey == "" {
			continue
		}
		if !found || route.Priority > selected.Priority {
			selected = route
			found = true
		}
	}

	if !found {
		return RouteBinding{}, fmt.Errorf("%w: model=%s operation=%s",
			ErrModelRouteNotConfigured, modelID, operation)
	}

	return selected, nil
}

func distinctModes(routes []RouteBinding) []Mode {
	seen := make(map[Mode]bool)
	var modes []Mode

	for _, route := range routes {
		if route.Mode == "" || !route.Enabled {
			continue
		}
		if !seen[route.Mode] {
			seen[route.Mode] = true
			modes = append(modes, route.Mode)
		}
	}

	return modes
}
