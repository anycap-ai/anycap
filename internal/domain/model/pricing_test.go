package model

import "testing"

func TestCreditsFromUSD(t *testing.T) {
	tests := []struct {
		name string
		usd  float64
		want int64
	}{
		{name: "zero defaults to min one", usd: 0, want: 1},
		{name: "below single credit rounds up", usd: 0.001, want: 1},
		{name: "exact single credit", usd: 0.02, want: 1},
		{name: "slightly above single credit", usd: 0.021, want: 2},
		{name: "multiple exact credits", usd: 0.04, want: 2},
		{name: "multiple rounded credits", usd: 0.081, want: 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := CreditsFromUSD(tt.usd); got != tt.want {
				t.Fatalf("CreditsFromUSD(%v) = %d, want %d", tt.usd, got, tt.want)
			}
		})
	}
}
