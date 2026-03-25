package feature

import (
	"os"
	"testing"
)

func TestDefaults(t *testing.T) {
	Reset()

	tests := []struct {
		name    string
		feature string
		want    bool
	}{
		{"image.generate defaults off", ImageGenerate, false},
		{"image.models defaults off", ImageModels, false},
		{"image.understand defaults on", ImageUnderstand, true},
		{"video.read defaults on", VideoRead, true},
		{"login defaults on", Login, true},
		{"unknown defaults off", "unknown.feature", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Enabled(tt.feature); got != tt.want {
				t.Errorf("Enabled(%q) = %v, want %v", tt.feature, got, tt.want)
			}
		})
	}
}

func TestRuntimeOverride(t *testing.T) {
	Reset()
	defer Reset()

	if Enabled(ImageGenerate) {
		t.Fatal("ImageGenerate should be off by default")
	}

	Set(ImageGenerate, true)
	if !Enabled(ImageGenerate) {
		t.Fatal("ImageGenerate should be on after Set")
	}

	Set(ImageGenerate, false)
	if Enabled(ImageGenerate) {
		t.Fatal("ImageGenerate should be off after Set(false)")
	}
}

func TestSetAll(t *testing.T) {
	Reset()
	defer Reset()

	SetAll(map[string]bool{
		ImageGenerate: true,
		ImageModels:   true,
		VideoRead:     false,
	})

	if !Enabled(ImageGenerate) {
		t.Error("ImageGenerate should be on")
	}
	if !Enabled(ImageModels) {
		t.Error("ImageModels should be on")
	}
	if Enabled(VideoRead) {
		t.Error("VideoRead should be off")
	}
	// Untouched flag keeps default.
	if !Enabled(ImageUnderstand) {
		t.Error("ImageUnderstand should keep default (on)")
	}
}

func TestEnvOverride(t *testing.T) {
	Reset()
	defer Reset()

	// Env overrides default.
	t.Setenv("ANYCAP_FEATURE_IMAGE_GENERATE", "1")
	if !Enabled(ImageGenerate) {
		t.Error("ImageGenerate should be on via env")
	}

	// Runtime overrides env.
	Set(ImageGenerate, false)
	if Enabled(ImageGenerate) {
		t.Error("runtime override should beat env")
	}
}

func TestEnvDisable(t *testing.T) {
	Reset()
	defer Reset()

	// Env can disable a default-on feature.
	t.Setenv("ANYCAP_FEATURE_VIDEO_READ", "false")
	if Enabled(VideoRead) {
		t.Error("VideoRead should be off via env=false")
	}
}

func TestAll(t *testing.T) {
	Reset()
	defer Reset()

	Set("custom.flag", true)

	all := All()
	if !all["custom.flag"] {
		t.Error("All() should include runtime-only flags")
	}
	if _, ok := all[ImageGenerate]; !ok {
		t.Error("All() should include default flags")
	}
}

func TestEnvValues(t *testing.T) {
	Reset()
	defer Reset()

	cases := []struct {
		envVal string
		want   bool
	}{
		{"true", true},
		{"1", true},
		{"false", false},
		{"0", false},
		{"yes", false}, // only "true" and "1" are truthy
	}

	for _, c := range cases {
		os.Setenv("ANYCAP_FEATURE_IMAGE_GENERATE", c.envVal)
		got := Enabled(ImageGenerate)
		if got != c.want {
			t.Errorf("env=%q: Enabled()=%v, want %v", c.envVal, got, c.want)
		}
	}
	os.Unsetenv("ANYCAP_FEATURE_IMAGE_GENERATE")
}
