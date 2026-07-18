package cap

import "testing"

func TestMediaOutputPath(t *testing.T) {
	tests := []struct {
		name     string
		prefix   string
		userPath string
		url      string
		index    int
		total    int
		fallback string
		want     string
	}{
		{name: "single explicit path", prefix: "audio", userPath: "sound.wav", url: "https://cdn.test/a.mp3", total: 1, fallback: ".mp3", want: "sound.wav"},
		{name: "signed URL extension", prefix: "audio", url: "https://cdn.test/a.wav?sig=1", total: 1, fallback: ".mp3", want: "audio_20260718_120000.wav"},
		{name: "multiple explicit extension", prefix: "audio", userPath: "sound.flac", url: "https://cdn.test/a.mp3", index: 1, total: 2, fallback: ".mp3", want: "sound_2.flac"},
		{name: "multiple fallback extension", prefix: "audio", url: "https://cdn.test/download?sig=1", total: 2, fallback: ".mp3", want: "audio_20260718_120000_1.mp3"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := mediaOutputPath(tt.prefix, tt.userPath, tt.url, "20260718_120000", tt.index, tt.total, tt.fallback); got != tt.want {
				t.Fatalf("mediaOutputPath() = %q, want %q", got, tt.want)
			}
		})
	}
}
