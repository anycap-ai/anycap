package dto

type GenerateImageRequest struct {
	Prompt         string   `json:"prompt"`
	Model          string   `json:"model"`
	Mode           string   `json:"mode,omitempty"`
	NegativePrompt string   `json:"negative_prompt,omitempty"`
	AspectRatio    string   `json:"aspect_ratio,omitempty"`
	Resolution     string   `json:"resolution,omitempty"`
	Format         string   `json:"format,omitempty"`
	Images         []string `json:"images,omitempty"`

	// Provider-specific image-edit knobs (currently consumed by
	// gpt-image-2 and qwen-image img_edit). All optional.
	MoveForward   int  `json:"move_forward,omitempty"`
	RotateDegrees int  `json:"rotate_degrees,omitempty"`
	UseWideAngle  bool `json:"use_wide_angle,omitempty"`
	VerticalTilt  int  `json:"vertical_tilt,omitempty"`

	// Deprecated: use Images instead. Kept for backward compatibility.
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
	// Deprecated: use AspectRatio instead. Kept for backward compatibility.
	Ratio string `json:"ratio,omitempty"`
}

// EffectiveImages returns Images if set, otherwise falls back to ReferenceImageURLs.
func (r GenerateImageRequest) EffectiveImages() []string {
	if len(r.Images) > 0 {
		return r.Images
	}
	return r.ReferenceImageURLs
}

// EffectiveAspectRatio returns AspectRatio if set, otherwise falls back to Ratio.
func (r GenerateImageRequest) EffectiveAspectRatio() string {
	if r.AspectRatio != "" {
		return r.AspectRatio
	}
	return r.Ratio
}
