package model

import (
	"errors"
	"testing"
)

func TestGenerateAudioRequestValidate_AcceptsSupportedModes(t *testing.T) {
	tests := []struct {
		name string
		req  GenerateAudioRequest
	}{
		{
			name: "text to audio",
			req: GenerateAudioRequest{
				Model:      "doubao-seed-audio-1-0",
				Prompt:     "a calm dawn",
				Mode:       ModeTextToAudio,
				SpeakerIDs: []string{"voice-1"},
			},
		},
		{
			name: "audio to audio",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "make it warmer",
				Mode:               ModeAudioToAudio,
				ReferenceAudioURLs: []string{"https://cdn.example/ref.wav"},
			},
		},
		{
			name: "image to audio",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "create the matching soundscape",
				Mode:               ModeImageToAudio,
				ReferenceImageURLs: []string{"https://cdn.example/ref.png"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := tt.req.Validate(); err != nil {
				t.Fatalf("Validate() error = %v", err)
			}
		})
	}
}

func TestGenerateAudioRequestValidate_RejectsInvalidRequests(t *testing.T) {
	tests := []struct {
		name string
		req  GenerateAudioRequest
	}{
		{name: "missing model", req: GenerateAudioRequest{Prompt: "sound"}},
		{name: "missing prompt", req: GenerateAudioRequest{Model: "doubao-seed-audio-1-0"}},
		{
			name: "audio mode without audio",
			req:  GenerateAudioRequest{Model: "doubao-seed-audio-1-0", Prompt: "sound", Mode: ModeAudioToAudio},
		},
		{
			name: "audio mode with too many references",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "sound",
				Mode:               ModeAudioToAudio,
				ReferenceAudioURLs: []string{"a", "b", "c", "d"},
			},
		},
		{
			name: "image mode without exactly one image",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "sound",
				Mode:               ModeImageToAudio,
				ReferenceImageURLs: []string{"a", "b"},
			},
		},
		{
			name: "text mode with audio",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "sound",
				Mode:               ModeTextToAudio,
				ReferenceAudioURLs: []string{"a"},
			},
		},
		{
			name: "speaker references exceed limit",
			req: GenerateAudioRequest{
				Model:      "doubao-seed-audio-1-0",
				Prompt:     "sound",
				Mode:       ModeTextToAudio,
				SpeakerIDs: []string{"a", "b"},
			},
		},
		{
			name: "empty speaker id",
			req: GenerateAudioRequest{
				Model:      "doubao-seed-audio-1-0",
				Prompt:     "sound",
				Mode:       ModeTextToAudio,
				SpeakerIDs: []string{" "},
			},
		},
		{
			name: "empty audio reference",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "sound",
				Mode:               ModeAudioToAudio,
				ReferenceAudioURLs: []string{""},
			},
		},
		{
			name: "empty image reference",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "sound",
				Mode:               ModeImageToAudio,
				ReferenceImageURLs: []string{"\t"},
			},
		},
		{
			name: "ambiguous inferred references",
			req: GenerateAudioRequest{
				Model:              "doubao-seed-audio-1-0",
				Prompt:             "sound",
				ReferenceAudioURLs: []string{"a"},
				ReferenceImageURLs: []string{"b"},
			},
		},
		{
			name: "unknown mode",
			req:  GenerateAudioRequest{Model: "doubao-seed-audio-1-0", Prompt: "sound", Mode: Mode("unknown")},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if err == nil {
				t.Fatal("Validate() error = nil")
			}
			if tt.name == "missing model" {
				if !errors.Is(err, ErrModelRequired) {
					t.Fatalf("expected ErrModelRequired, got %v", err)
				}
				return
			}
			if tt.name == "missing prompt" {
				if !errors.Is(err, ErrPromptRequired) {
					t.Fatalf("expected ErrPromptRequired, got %v", err)
				}
				return
			}
			if !errors.Is(err, ErrInvalidParam) {
				t.Fatalf("expected ErrInvalidParam, got %v", err)
			}
		})
	}
}

func TestInferAudioMode(t *testing.T) {
	tests := []struct {
		name string
		req  GenerateAudioRequest
		want Mode
	}{
		{name: "default text", req: GenerateAudioRequest{}, want: ModeTextToAudio},
		{name: "speaker text", req: GenerateAudioRequest{SpeakerIDs: []string{"voice-1"}}, want: ModeTextToAudio},
		{name: "audio", req: GenerateAudioRequest{ReferenceAudioURLs: []string{"a"}}, want: ModeAudioToAudio},
		{name: "image", req: GenerateAudioRequest{ReferenceImageURLs: []string{"a"}}, want: ModeImageToAudio},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := InferAudioMode(tt.req); got != tt.want {
				t.Fatalf("InferAudioMode() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestCanonicalAudioModeMapping(t *testing.T) {
	tests := []struct {
		mode Mode
		algo string
	}{
		{mode: ModeTextToAudio, algo: "txt_2_audio"},
		{mode: ModeAudioToAudio, algo: "audio_2_audio"},
		{mode: ModeImageToAudio, algo: "image_2_audio"},
	}

	for _, tt := range tests {
		algo, ok := CanonicalAlgoTypeForMode(tt.mode)
		if !ok || algo != tt.algo {
			t.Fatalf("CanonicalAlgoTypeForMode(%q) = %q, %v; want %q, true", tt.mode, algo, ok, tt.algo)
		}
		mode, ok := CanonicalModeForAlgoType(tt.algo)
		if !ok || mode != tt.mode {
			t.Fatalf("CanonicalModeForAlgoType(%q) = %q, %v; want %q, true", tt.algo, mode, ok, tt.mode)
		}
	}
}
