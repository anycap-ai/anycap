package dto

type GenerateMusicRequest struct {
	Prompt           string `json:"prompt,omitempty"`
	Model            string `json:"model"`
	Mode             string `json:"mode,omitempty"`
	MakeInstrumental bool   `json:"make_instrumental,omitempty"`
	CustomMode       bool   `json:"custom_mode,omitempty"`
	Tags             string `json:"tags,omitempty"`
	Title            string `json:"title,omitempty"`
	Lyrics           string `json:"lyrics,omitempty"`
	ContinueAt       int    `json:"continue_at,omitempty"`
	ContinueClipID   string `json:"continue_clip_id,omitempty"`
	VocalGender      string `json:"vocal_gender,omitempty"`
}
