package model

import (
	"errors"
	"fmt"
)

var (
	ErrVideoExecutionNotConfigured = errors.New("video execution is not configured")
)

type GenerateVideoRequest struct {
	RequestID          string          `json:"request_id,omitempty"`
	UserID             string          `json:"user_id,omitempty"`
	APIKeyID           string          `json:"api_key_id,omitempty"`
	Prompt             string          `json:"prompt"`
	Model              string          `json:"model"`
	Mode               Mode            `json:"mode,omitempty"`
	NegativePrompt     string          `json:"negative_prompt,omitempty"`
	Ratio              string          `json:"ratio,omitempty"`
	Resolution         string          `json:"resolution,omitempty"`
	Duration           int             `json:"duration,omitempty"`
	Format             string          `json:"format,omitempty"`
	FPS                int             `json:"fps,omitempty"`
	GenerateAudio      *bool           `json:"generate_audio,omitempty"`
	FirstFrameURL      string          `json:"first_frame,omitempty"`
	LastFrameURL       string          `json:"last_frame,omitempty"`
	ReferenceImageURLs []string        `json:"reference_image_urls,omitempty"`
	ReferenceVideoURLs []string        `json:"reference_video_urls,omitempty"`
	ReferenceAudioURLs []string        `json:"reference_audio_urls,omitempty"`
	MultiShotClips     []VideoShotClip `json:"multi_shot_clips,omitempty"`
}

func (r GenerateVideoRequest) Validate() error {
	if r.Prompt == "" && len(r.MultiShotClips) == 0 {
		return ErrPromptRequired
	}
	if r.Model == "" {
		return ErrModelRequired
	}
	if (r.FirstFrameURL == "") != (r.LastFrameURL == "") {
		return fmt.Errorf("%w: first_frame and last_frame are both required", ErrInvalidParam)
	}
	if r.Mode == ModeMultiModalRef && len(r.ReferenceImageURLs) == 0 && len(r.ReferenceVideoURLs) == 0 && len(r.ReferenceAudioURLs) == 0 {
		return fmt.Errorf("%w: at least one reference input (image, video, or audio) is required", ErrInvalidParam)
	}
	if r.Mode == ModeEditVideo && len(r.ReferenceVideoURLs) == 0 {
		return fmt.Errorf("%w: an input video is required for edit-video mode", ErrInvalidParam)
	}
	if len(r.MultiShotClips) > 0 {
		total := 0
		for i, clip := range r.MultiShotClips {
			if clip.Prompt == "" {
				return fmt.Errorf("%w: multi_shot_clips[%d].prompt is required", ErrInvalidParam, i)
			}
			if clip.Duration < 1 || clip.Duration > 3 {
				return fmt.Errorf("%w: multi_shot_clips[%d].duration must be between 1 and 3 seconds", ErrInvalidParam, i)
			}
			total += clip.Duration
		}
		if r.Duration > 0 && total != r.Duration {
			return fmt.Errorf("%w: sum of shot durations must equal total video duration (%ds)", ErrInvalidParam, r.Duration)
		}
	}

	return nil
}

type VideoShotClip struct {
	Index    int    `json:"index,omitempty"`
	Prompt   string `json:"prompt"`
	Duration int    `json:"duration"`
}

type GenerateVideoResult struct {
	ID         string         `json:"id"`
	Status     string         `json:"status"`
	Model      string         `json:"model"`
	Outputs    []Artifact     `json:"outputs,omitempty"`
	Usage      map[string]any `json:"usage,omitempty"`
	CreditCost int64          `json:"credit_cost,omitempty"`
}
