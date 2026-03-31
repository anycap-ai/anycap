package model

import (
	"errors"
	"fmt"
	"strings"
)

var (
	ErrMusicExecutionNotConfigured = errors.New("music execution is not configured")
)

type GenerateMusicRequest struct {
	RequestID        string `json:"request_id,omitempty"`
	UserID           string `json:"user_id,omitempty"`
	APIKeyID         string `json:"api_key_id,omitempty"`
	Prompt           string `json:"prompt,omitempty"`
	Model            string `json:"model"`
	Mode             Mode   `json:"mode,omitempty"`
	MakeInstrumental bool   `json:"make_instrumental,omitempty"`
	CustomMode       bool   `json:"custom_mode,omitempty"`
	Tags             string `json:"tags,omitempty"`
	Title            string `json:"title,omitempty"`
	Lyrics           string `json:"lyrics,omitempty"`
	ContinueAt       int    `json:"continue_at,omitempty"`
	ContinueClipID   string `json:"continue_clip_id,omitempty"`
	VocalGender      string `json:"vocal_gender,omitempty"`
}

func (r GenerateMusicRequest) Validate() error {
	if strings.TrimSpace(r.Model) == "" {
		return ErrModelRequired
	}
	if strings.TrimSpace(r.Prompt) == "" && strings.TrimSpace(r.Tags) == "" {
		return fmt.Errorf("%w: prompt or tags is required", ErrInvalidParam)
	}

	return nil
}

type GenerateMusicResult struct {
	ID         string         `json:"id"`
	Status     string         `json:"status"`
	Model      string         `json:"model"`
	Outputs    []Artifact     `json:"outputs,omitempty"`
	Usage      map[string]any `json:"usage,omitempty"`
	CreditCost int64          `json:"credit_cost,omitempty"`
}
