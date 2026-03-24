package model

import (
	"testing"
)

func TestImageUnderstandRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     ImageUnderstandRequest
		wantErr error
	}{
		{
			name:    "valid url",
			req:     ImageUnderstandRequest{URL: "https://example.com/img.png"},
			wantErr: nil,
		},
		{
			name:    "valid base64 with mime",
			req:     ImageUnderstandRequest{Data: "aGVsbG8=", MIMEType: "image/png"},
			wantErr: nil,
		},
		{
			name:    "missing input",
			req:     ImageUnderstandRequest{},
			wantErr: ErrMissingInput,
		},
		{
			name:    "ambiguous input",
			req:     ImageUnderstandRequest{URL: "https://example.com/img.png", Data: "aGVsbG8=", MIMEType: "image/png"},
			wantErr: ErrAmbiguousInput,
		},
		{
			name:    "base64 without mime",
			req:     ImageUnderstandRequest{Data: "aGVsbG8="},
			wantErr: ErrMissingMIME,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if err != tt.wantErr {
				t.Errorf("Validate() = %v, want %v", err, tt.wantErr)
			}
		})
	}
}

func TestVideoReadRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     VideoReadRequest
		wantErr error
	}{
		{
			name:    "valid url",
			req:     VideoReadRequest{URL: "https://example.com/video.mp4"},
			wantErr: nil,
		},
		{
			name:    "missing url",
			req:     VideoReadRequest{},
			wantErr: ErrMissingInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if err != tt.wantErr {
				t.Errorf("Validate() = %v, want %v", err, tt.wantErr)
			}
		})
	}
}
