package model

import "errors"

var ErrPromptRequired = errors.New("prompt is required")

type ImageModel struct {
	ID          string   `json:"id"`
	Capability  string   `json:"capability"`
	DisplayName string   `json:"display_name"`
	Operations  []string `json:"operations,omitempty"`
}

type GenerateImageRequest struct {
	Prompt string `json:"prompt"`
	Model  string `json:"model"`
}

func (r GenerateImageRequest) Validate() error {
	if r.Prompt == "" {
		return ErrPromptRequired
	}

	return nil
}

type Artifact struct {
	Type     string `json:"type"`
	URL      string `json:"url"`
	MIMEType string `json:"mime_type"`
}

type GenerateImageResult struct {
	ID      string         `json:"id"`
	Status  string         `json:"status"`
	Model   string         `json:"model"`
	Outputs []Artifact     `json:"outputs,omitempty"`
	Usage   map[string]any `json:"usage,omitempty"`
}
