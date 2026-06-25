package dto

type GenerateVideoRequest struct {
	Prompt         string          `json:"prompt"`
	Model          string          `json:"model"`
	Mode           string          `json:"mode,omitempty"`
	NegativePrompt string          `json:"negative_prompt,omitempty"`
	AspectRatio    string          `json:"aspect_ratio,omitempty"`
	Resolution     string          `json:"resolution,omitempty"`
	Duration       int             `json:"duration,omitempty"`
	Format         string          `json:"format,omitempty"`
	FPS            int             `json:"fps,omitempty"`
	GenerateAudio  *bool           `json:"generate_audio,omitempty"`
	Images         []string        `json:"images,omitempty"`
	Videos         []string        `json:"videos,omitempty"`
	Audios         []string        `json:"audios,omitempty"`
	MultiShotClips []VideoShotClip `json:"multi_shot_clips,omitempty"`
	ShotClips      []VideoShotClip `json:"shot_clips,omitempty"`
	GenerationType string          `json:"generation_type,omitempty"`

	// Deprecated: use Images instead. Kept for backward compatibility.
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
	// Deprecated: use Videos instead. Kept for backward compatibility.
	ReferenceVideoURLs []string `json:"reference_video_urls,omitempty"`
	// Deprecated: use Audios instead. Kept for backward compatibility.
	ReferenceAudioURLs []string `json:"reference_audio_urls,omitempty"`
}

// EffectiveImages returns Images if set, otherwise falls back to ReferenceImageURLs.
func (r GenerateVideoRequest) EffectiveImages() []string {
	if len(r.Images) > 0 {
		return r.Images
	}
	return r.ReferenceImageURLs
}

// EffectiveVideos returns Videos if set, otherwise falls back to ReferenceVideoURLs.
func (r GenerateVideoRequest) EffectiveVideos() []string {
	if len(r.Videos) > 0 {
		return r.Videos
	}
	return r.ReferenceVideoURLs
}

func (r GenerateVideoRequest) EffectiveAudios() []string {
	if len(r.Audios) > 0 {
		return r.Audios
	}
	return r.ReferenceAudioURLs
}

func (r GenerateVideoRequest) EffectiveMultiShotClips() []VideoShotClip {
	if len(r.MultiShotClips) > 0 {
		return r.MultiShotClips
	}
	return r.ShotClips
}

type VideoShotClip struct {
	Index    int    `json:"index,omitempty"`
	Prompt   string `json:"prompt"`
	Duration int    `json:"duration"`
}
