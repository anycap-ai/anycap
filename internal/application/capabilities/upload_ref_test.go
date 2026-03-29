package capabilities

import "testing"

func TestUploadRefURL(t *testing.T) {
	got := uploadRefURL("cu_A1b2C3d4E5f6G7h8")
	if got != "anycap://upload/cu_A1b2C3d4E5f6G7h8" {
		t.Fatalf("unexpected upload ref url %q", got)
	}
}

func TestParseUploadRefExternalID(t *testing.T) {
	tests := []struct {
		name   string
		input  string
		wantID string
		wantOK bool
	}{
		{
			name:   "valid",
			input:  "anycap://upload/cu_A1b2C3d4E5f6G7h8",
			wantID: "cu_A1b2C3d4E5f6G7h8",
			wantOK: true,
		},
		{
			name:   "case insensitive scheme",
			input:  "ANYCAP://UPLOAD/cu_A1b2C3d4E5f6G7h8",
			wantID: "cu_A1b2C3d4E5f6G7h8",
			wantOK: true,
		},
		{
			name:   "invalid prefix",
			input:  "anycap://upload/upl_A1b2C3d4E5f6G7h8",
			wantID: "",
			wantOK: false,
		},
		{
			name:   "invalid numeric legacy",
			input:  "anycap://upload/123",
			wantID: "",
			wantOK: false,
		},
		{
			name:   "contains slash",
			input:  "anycap://upload/cu_A1b2/extra",
			wantID: "",
			wantOK: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotID, gotOK := parseUploadRefExternalID(tt.input)
			if gotID != tt.wantID || gotOK != tt.wantOK {
				t.Fatalf("parseUploadRefExternalID(%q) = (%q, %v), want (%q, %v)", tt.input, gotID, gotOK, tt.wantID, tt.wantOK)
			}
		})
	}
}
