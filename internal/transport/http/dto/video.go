package dto

type GenerateVideoRequest struct {
	Prompt         string   `json:"prompt"`
	Model          string   `json:"model"`
	Mode           string   `json:"mode,omitempty"`
	NegativePrompt string   `json:"negative_prompt,omitempty"`
	AspectRatio    string   `json:"aspect_ratio,omitempty"`
	Resolution     string   `json:"resolution,omitempty"`
	Duration       int      `json:"duration,omitempty"`
	Images         []string `json:"images,omitempty"`
}
