package dto

type GenerateAudioRequest struct {
	Prompt         string   `json:"prompt"`
	Model          string   `json:"model"`
	Mode           string   `json:"mode,omitempty"`
	Format         string   `json:"format,omitempty"`
	SampleRate     int      `json:"sample_rate,omitempty"`
	SpeechRate     *int     `json:"speech_rate,omitempty"`
	LoudnessRate   *int     `json:"loudness_rate,omitempty"`
	PitchRate      *int     `json:"pitch_rate,omitempty"`
	EnableSubtitle bool     `json:"enable_subtitle,omitempty"`
	SpeakerIDs     []string `json:"speaker_ids,omitempty"`
	Audios         []string `json:"audios,omitempty"`
	Images         []string `json:"images,omitempty"`
}
