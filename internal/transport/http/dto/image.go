package dto

type GenerateImageRequest struct {
	Prompt string `json:"prompt"`
	Model  string `json:"model"`
}
