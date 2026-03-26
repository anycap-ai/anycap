package dto

type GenerateVideoRequest struct {
	Prompt             string   `json:"prompt"`
	Model              string   `json:"model"`
	NegativePrompt     string   `json:"negative_prompt,omitempty"`
	Ratio              string   `json:"ratio,omitempty"`
	Resolution         string   `json:"resolution,omitempty"`
	Duration           int      `json:"duration,omitempty"`
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
}
