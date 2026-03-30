package model

import "errors"

var (
	ErrModelRequired               = errors.New("model is required")
	ErrImageExecutionNotConfigured = errors.New("image execution is not configured")
)

type GenerateImageRequest struct {
	RequestID          string   `json:"request_id,omitempty"`
	UserID             string   `json:"user_id,omitempty"`
	APIKeyID           string   `json:"api_key_id,omitempty"`
	Prompt             string   `json:"prompt"`
	Model              string   `json:"model"`
	NegativePrompt     string   `json:"negative_prompt,omitempty"`
	Ratio              string   `json:"ratio,omitempty"`
	Resolution         string   `json:"resolution,omitempty"`
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
}

func (r GenerateImageRequest) Validate() error {
	if r.Prompt == "" {
		return ErrPromptRequired
	}
	if r.Model == "" {
		return ErrModelRequired
	}

	return nil
}

type Artifact struct {
	Type     string `json:"type"`
	URL      string `json:"url"`
	MIMEType string `json:"mime_type"`
}

type GenerateImageResult struct {
	ID         string         `json:"id"`
	Status     string         `json:"status"`
	Model      string         `json:"model"`
	Outputs    []Artifact     `json:"outputs,omitempty"`
	Usage      map[string]any `json:"usage,omitempty"`
	CreditCost int64          `json:"credit_cost,omitempty"`
}
