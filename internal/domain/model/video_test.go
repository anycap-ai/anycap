package model

import (
	"errors"
	"testing"
)

func TestGenerateVideoRequestValidate_AllowsMultiShotWithoutTopLevelPrompt(t *testing.T) {
	req := GenerateVideoRequest{
		Model:    "kling-3.0",
		Duration: 3,
		MultiShotClips: []VideoShotClip{
			{Prompt: "shot one", Duration: 1},
			{Prompt: "shot two", Duration: 2},
		},
	}
	if err := req.Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}
}

func TestGenerateVideoRequestValidate_RejectsInvalidMultiShotDurationSum(t *testing.T) {
	req := GenerateVideoRequest{
		Model:    "kling-3.0",
		Duration: 3,
		MultiShotClips: []VideoShotClip{
			{Prompt: "shot one", Duration: 2},
			{Prompt: "shot two", Duration: 2},
		},
	}
	err := req.Validate()
	if !errors.Is(err, ErrInvalidParam) {
		t.Fatalf("expected ErrInvalidParam, got %v", err)
	}
}

func TestGenerateVideoRequestValidate_RejectsMultiModalWithoutReference(t *testing.T) {
	req := GenerateVideoRequest{
		Model:  "seedance-2",
		Mode:   ModeMultiModalRef,
		Prompt: "make a video",
	}
	err := req.Validate()
	if !errors.Is(err, ErrInvalidParam) {
		t.Fatalf("expected ErrInvalidParam, got %v", err)
	}
}

func TestGenerateVideoRequestValidate_AllowsMultiModalWithAudioReference(t *testing.T) {
	req := GenerateVideoRequest{
		Model:              "seedance-2",
		Mode:               ModeMultiModalRef,
		Prompt:             "make a video",
		ReferenceAudioURLs: []string{"https://cdn/ref.wav"},
	}
	if err := req.Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}
}

func TestInferVideoMode_MultiShotClips(t *testing.T) {
	got := InferVideoMode(GenerateVideoRequest{
		MultiShotClips: []VideoShotClip{{Prompt: "shot one", Duration: 1}},
	})
	if got != ModeMultiShotVideo {
		t.Fatalf("expected %s, got %s", ModeMultiShotVideo, got)
	}
}

func TestInferVideoMode_AudioReference(t *testing.T) {
	got := InferVideoMode(GenerateVideoRequest{
		ReferenceAudioURLs: []string{"https://cdn/ref.wav"},
	})
	if got != ModeMultiModalRef {
		t.Fatalf("expected %s, got %s", ModeMultiModalRef, got)
	}
}
