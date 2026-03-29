package externalid

import (
	"strings"
	"testing"
)

func TestGenerate(t *testing.T) {
	got := Generate(PrefixCapsUpload)
	if !strings.HasPrefix(got, PrefixCapsUpload) {
		t.Fatalf("expected prefix %q, got %q", PrefixCapsUpload, got)
	}

	suffix := strings.TrimPrefix(got, PrefixCapsUpload)
	if len(suffix) != DefaultRandomLength {
		t.Fatalf("expected suffix length %d, got %d", DefaultRandomLength, len(suffix))
	}
	if err := ValidatePrefix(got, PrefixCapsUpload); err != nil {
		t.Fatalf("expected valid generated id, got error %v", err)
	}
}

func TestGenerateWithLen(t *testing.T) {
	got := GenerateWithLen(PrefixFeedback, 24)
	if !strings.HasPrefix(got, PrefixFeedback) {
		t.Fatalf("expected prefix %q, got %q", PrefixFeedback, got)
	}
	if len(strings.TrimPrefix(got, PrefixFeedback)) != 24 {
		t.Fatalf("expected suffix length 24, got %d", len(strings.TrimPrefix(got, PrefixFeedback)))
	}
}

func TestValidatePrefix(t *testing.T) {
	tests := []struct {
		name    string
		id      string
		prefix  string
		wantErr bool
	}{
		{name: "ok", id: "dn_Abc123XYZ9", prefix: PrefixDriveNode, wantErr: false},
		{name: "bad prefix", id: "pg_Abc123XYZ9", prefix: PrefixDriveNode, wantErr: true},
		{name: "empty suffix", id: "dn_", prefix: PrefixDriveNode, wantErr: true},
		{name: "invalid char", id: "dn_abc-123", prefix: PrefixDriveNode, wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidatePrefix(tt.id, tt.prefix)
			if tt.wantErr && err == nil {
				t.Fatal("expected error, got nil")
			}
			if !tt.wantErr && err != nil {
				t.Fatalf("expected nil error, got %v", err)
			}
		})
	}
}
