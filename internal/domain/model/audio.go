package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

var ErrAudioExecutionNotConfigured = errors.New("audio execution is not configured")

type GenerateAudioRequest struct {
	RequestID          string   `json:"request_id,omitempty"`
	UserID             string   `json:"user_id,omitempty"`
	APIKeyID           string   `json:"api_key_id,omitempty"`
	Prompt             string   `json:"prompt"`
	Model              string   `json:"model"`
	Mode               Mode     `json:"mode,omitempty"`
	Format             string   `json:"format,omitempty"`
	SampleRate         int      `json:"sample_rate,omitempty"`
	SpeechRate         *int     `json:"speech_rate,omitempty"`
	LoudnessRate       *int     `json:"loudness_rate,omitempty"`
	PitchRate          *int     `json:"pitch_rate,omitempty"`
	EnableSubtitle     bool     `json:"enable_subtitle,omitempty"`
	SpeakerIDs         []string `json:"speaker_ids,omitempty"`
	ReferenceAudioURLs []string `json:"reference_audio_urls,omitempty"`
	ReferenceImageURLs []string `json:"reference_image_urls,omitempty"`
}

func (r GenerateAudioRequest) Validate() error {
	if strings.TrimSpace(r.Prompt) == "" {
		return ErrPromptRequired
	}
	if strings.TrimSpace(r.Model) == "" {
		return ErrModelRequired
	}
	if len(r.ReferenceAudioURLs) > 0 && len(r.ReferenceImageURLs) > 0 {
		return fmt.Errorf("%w: audio and image references cannot be combined", ErrInvalidParam)
	}
	if containsBlankAudioValue(r.SpeakerIDs) {
		return fmt.Errorf("%w: speaker IDs cannot be blank", ErrInvalidParam)
	}
	if containsBlankAudioValue(r.ReferenceAudioURLs) {
		return fmt.Errorf("%w: audio references cannot be blank", ErrInvalidParam)
	}
	if containsBlankAudioValue(r.ReferenceImageURLs) {
		return fmt.Errorf("%w: image references cannot be blank", ErrInvalidParam)
	}

	mode := r.Mode
	if mode == "" {
		mode = InferAudioMode(r)
	}
	switch mode {
	case ModeTextToAudio:
		if len(r.ReferenceAudioURLs) > 0 || len(r.ReferenceImageURLs) > 0 {
			return fmt.Errorf("%w: text-to-audio does not accept media references", ErrInvalidParam)
		}
		if len(r.SpeakerIDs) > 1 {
			return fmt.Errorf("%w: text-to-audio supports at most 1 speaker ID", ErrInvalidParam)
		}
	case ModeAudioToAudio:
		if len(r.ReferenceAudioURLs) < 1 || len(r.ReferenceAudioURLs) > 3 {
			return fmt.Errorf("%w: audio-to-audio requires 1 to 3 audio references", ErrInvalidParam)
		}
		if len(r.ReferenceImageURLs) > 0 || len(r.SpeakerIDs) > 0 {
			return fmt.Errorf("%w: audio-to-audio accepts only audio references", ErrInvalidParam)
		}
	case ModeImageToAudio:
		if len(r.ReferenceImageURLs) != 1 {
			return fmt.Errorf("%w: image-to-audio requires exactly 1 image reference", ErrInvalidParam)
		}
		if len(r.ReferenceAudioURLs) > 0 || len(r.SpeakerIDs) > 0 {
			return fmt.Errorf("%w: image-to-audio accepts only an image reference", ErrInvalidParam)
		}
	default:
		return fmt.Errorf("%w: unsupported audio mode %q", ErrInvalidParam, mode)
	}

	return nil
}

func containsBlankAudioValue(values []string) bool {
	for _, value := range values {
		if strings.TrimSpace(value) == "" {
			return true
		}
	}
	return false
}

type AudioArtifact struct {
	Artifact
	DurationSeconds         float64         `json:"duration_seconds,omitempty"`
	OriginalDurationSeconds float64         `json:"original_duration_seconds,omitempty"`
	SizeBytes               int64           `json:"size_bytes,omitempty"`
	Subtitle                json.RawMessage `json:"subtitle,omitempty"`
}

type GenerateAudioResult struct {
	ID         string          `json:"id"`
	Status     string          `json:"status"`
	Model      string          `json:"model"`
	Outputs    []AudioArtifact `json:"outputs,omitempty"`
	Usage      map[string]any  `json:"usage,omitempty"`
	CreditCost int64           `json:"credit_cost,omitempty"`
}
