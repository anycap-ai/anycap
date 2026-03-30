package model

import (
	"errors"
	"testing"
)

func TestImageReadRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     ImageReadRequest
		wantErr error
	}{
		{
			name:    "valid url",
			req:     ImageReadRequest{URL: "https://example.com/img.png"},
			wantErr: nil,
		},
		{
			name:    "valid base64 with mime",
			req:     ImageReadRequest{Data: "aGVsbG8=", MIMEType: "image/png"},
			wantErr: nil,
		},
		{
			name:    "missing input",
			req:     ImageReadRequest{},
			wantErr: ErrMissingInput,
		},
		{
			name:    "ambiguous input",
			req:     ImageReadRequest{URL: "https://example.com/img.png", Data: "aGVsbG8=", MIMEType: "image/png"},
			wantErr: ErrAmbiguousInput,
		},
		{
			name:    "base64 without mime",
			req:     ImageReadRequest{Data: "aGVsbG8="},
			wantErr: ErrMissingMIME,
		},
		{
			name: "valid multi-image",
			req: ImageReadRequest{
				Images: []MediaInput{
					{URL: "https://example.com/img1.png"},
					{Data: "aGVsbG8=", MIMEType: "image/png"},
				},
			},
			wantErr: nil,
		},
		{
			name: "ambiguous single and multi",
			req: ImageReadRequest{
				URL:    "https://example.com/img.png",
				Images: []MediaInput{{URL: "https://example.com/img2.png"}},
			},
			wantErr: ErrAmbiguousInput,
		},
		{
			name: "too many images",
			req: ImageReadRequest{
				Images: func() []MediaInput {
					imgs := make([]MediaInput, MaxImagesPerRequest+1)
					for i := range imgs {
						imgs[i] = MediaInput{URL: "https://example.com/img.png"}
					}
					return imgs
				}(),
			},
			wantErr: ErrTooManyImages,
		},
		{
			name: "multi-image with invalid item",
			req: ImageReadRequest{
				Images: []MediaInput{
					{URL: "https://example.com/img.png"},
					{Data: "aGVsbG8="},
				},
			},
			wantErr: ErrMissingMIME,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr == nil {
				if err != nil {
					t.Errorf("Validate() = %v, want nil", err)
				}
			} else {
				if !errors.Is(err, tt.wantErr) {
					t.Errorf("Validate() = %v, want %v", err, tt.wantErr)
				}
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

func TestAudioReadRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     AudioReadRequest
		wantErr error
	}{
		{
			name:    "valid url",
			req:     AudioReadRequest{URL: "https://example.com/audio.mp3"},
			wantErr: nil,
		},
		{
			name:    "missing url",
			req:     AudioReadRequest{},
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

func TestPresignRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     PresignRequest
		wantErr error // nil means expect no error; sentinel means errors.Is match
		wantAny bool  // true = expect any non-nil error (for generic errors without sentinels)
	}{
		{
			name: "valid image",
			req:  PresignRequest{Filename: "photo.jpg", ContentType: "image/jpeg", ContentLength: 1024},
		},
		{
			name: "valid video",
			req:  PresignRequest{Filename: "clip.mp4", ContentType: "video/mp4", ContentLength: 50 * 1024 * 1024},
		},
		{
			name: "max image size boundary",
			req:  PresignRequest{Filename: "big.png", ContentType: "image/png", ContentLength: MaxImageUploadSize},
		},
		{
			name: "max video size boundary",
			req:  PresignRequest{Filename: "big.mp4", ContentType: "video/mp4", ContentLength: MaxVideoUploadSize},
		},
		{
			name:    "image too large",
			req:     PresignRequest{Filename: "huge.png", ContentType: "image/png", ContentLength: MaxImageUploadSize + 1},
			wantErr: ErrFileTooLarge,
		},
		{
			name:    "video too large",
			req:     PresignRequest{Filename: "huge.mp4", ContentType: "video/mp4", ContentLength: MaxVideoUploadSize + 1},
			wantErr: ErrFileTooLarge,
		},
		{
			name:    "zero content length",
			req:     PresignRequest{Filename: "test.png", ContentType: "image/png", ContentLength: 0},
			wantErr: ErrContentLengthRequired,
		},
		{
			name:    "negative content length",
			req:     PresignRequest{Filename: "test.png", ContentType: "image/png", ContentLength: -1},
			wantErr: ErrContentLengthRequired,
		},
		{
			name:    "disallowed content type text/plain",
			req:     PresignRequest{Filename: "test.txt", ContentType: "text/plain", ContentLength: 100},
			wantErr: ErrInvalidContentType,
		},
		{
			name:    "disallowed content type image/svg+xml",
			req:     PresignRequest{Filename: "icon.svg", ContentType: "image/svg+xml", ContentLength: 100},
			wantErr: ErrInvalidContentType,
		},
		{
			name:    "filename with slash",
			req:     PresignRequest{Filename: "../etc/passwd", ContentType: "image/png", ContentLength: 100},
			wantErr: ErrInvalidFilename,
		},
		{
			name:    "filename with backslash",
			req:     PresignRequest{Filename: "..\\secret", ContentType: "image/png", ContentLength: 100},
			wantErr: ErrInvalidFilename,
		},
		{
			name:    "filename dot-dot",
			req:     PresignRequest{Filename: "..", ContentType: "image/png", ContentLength: 100},
			wantErr: ErrInvalidFilename,
		},
		{
			name:    "empty filename",
			req:     PresignRequest{Filename: "", ContentType: "image/png", ContentLength: 100},
			wantAny: true,
		},
		{
			name:    "empty content type",
			req:     PresignRequest{Filename: "test.png", ContentType: "", ContentLength: 100},
			wantAny: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			switch {
			case tt.wantErr != nil:
				if err == nil {
					t.Fatalf("expected error wrapping %v, got nil", tt.wantErr)
				}
				if !errors.Is(err, tt.wantErr) {
					t.Errorf("expected error wrapping %v, got %v", tt.wantErr, err)
				}
			case tt.wantAny:
				if err == nil {
					t.Error("expected an error, got nil")
				}
			default:
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
			}
		})
	}
}
