package model

import "errors"

var (
	ErrVideoExecutionNotConfigured = errors.New("video execution is not configured")
)

type GenerateVideoRequest struct {
	RequestID          string   `json:"request_id,omitempty"`
	UserID             string   `json:"user_id,omitempty"`
	Prompt             string   `json:"prompt"`
	Model              string   `json:"model"`
	NegativePrompt     string   `json:"negative_prompt,omitempty"`
	Ratio              string   `json:"ratio,omitempty"`
	Resolution         string   `json:"resolution,omitempty"`
	Duration           int      `json:"duration,omitempty"`
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
}

func (r GenerateVideoRequest) Validate() error {
	if r.Prompt == "" {
		return ErrPromptRequired
	}
	if r.Model == "" {
		return ErrModelRequired
	}

	return nil
}

type GenerateVideoResult struct {
	ID         string         `json:"id"`
	Status     string         `json:"status"`
	Model      string         `json:"model"`
	Outputs    []Artifact     `json:"outputs,omitempty"`
	Usage      map[string]any `json:"usage,omitempty"`
	CreditCost int64          `json:"credit_cost,omitempty"`
}
