package dto

type GenerateImageRequest struct {
	Prompt             string   `json:"prompt"`
	Model              string   `json:"model"`
	NegativePrompt     string   `json:"negative_prompt,omitempty"`
	Ratio              string   `json:"ratio,omitempty"`
	Resolution         string   `json:"resolution,omitempty"`
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
}
