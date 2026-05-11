package middleware

import (
	"strings"
	"testing"
)

func TestNormalizeChromeExtensionInstallID(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		want string
		ok   bool
	}{
		{
			name: "uuid",
			raw:  "550e8400-e29b-41d4-a716-446655440000",
			want: "550e8400-e29b-41d4-a716-446655440000",
			ok:   true,
		},
		{
			name: "legacy test id with underscore",
			raw:  " install_abc ",
			want: "install_abc",
			ok:   true,
		},
		{
			name: "empty",
			raw:  " ",
			ok:   false,
		},
		{
			name: "space inside",
			raw:  "install abc",
			ok:   false,
		},
		{
			name: "slash",
			raw:  "install/abc",
			ok:   false,
		},
		{
			name: "too long",
			raw:  strings.Repeat("a", 129),
			ok:   false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, ok := NormalizeChromeExtensionInstallID(tc.raw)
			if ok != tc.ok {
				t.Fatalf("ok=%v, want %v", ok, tc.ok)
			}
			if got != tc.want {
				t.Fatalf("got %q, want %q", got, tc.want)
			}
		})
	}
}
