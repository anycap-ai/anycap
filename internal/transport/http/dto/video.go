package dto

type GenerateVideoRequest struct {
	Prompt         string   `json:"prompt"`
	Model          string   `json:"model"`
	Mode           string   `json:"mode,omitempty"`
	NegativePrompt string   `json:"negative_prompt,omitempty"`
	AspectRatio    string   `json:"aspect_ratio,omitempty"`
	Resolution     string   `json:"resolution,omitempty"`
	Duration       int      `json:"duration,omitempty"`
	Format         string   `json:"format,omitempty"`
	FPS            int      `json:"fps,omitempty"`
	GenerateAudio  *bool    `json:"generate_audio,omitempty"`
	Images         []string `json:"images,omitempty"`
}
