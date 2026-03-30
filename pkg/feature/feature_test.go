package feature

import (
	"testing"
)

func TestDefaults(t *testing.T) {
	Reset()

	tests := []struct {
		name    string
		feature string
		want    bool
	}{
		{"image.generate defaults on", ImageGenerate, true},
		{"image.models defaults on", ImageModels, true},
		{"image.read defaults on", ImageRead, true},
		{"video.read defaults on", VideoRead, true},
		{"drive defaults on", Drive, true},
		{"page defaults on", Page, true},
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

	if !Enabled(ImageGenerate) {
		t.Fatal("ImageGenerate should be on by default")
	}

	Set(ImageGenerate, false)
	if Enabled(ImageGenerate) {
		t.Fatal("ImageGenerate should be off after Set(false)")
	}

	Set(ImageGenerate, true)
	if !Enabled(ImageGenerate) {
		t.Fatal("ImageGenerate should be on after Set(true)")
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
	if !Enabled(ImageRead) {
		t.Error("ImageRead should keep default (on)")
	}
}

func TestEnvVarsDoNotAffectEnabled(t *testing.T) {
	Reset()
	defer Reset()

	// CLI features come from preflight (SetAll), not env vars.
	// Setting ANYCAP_FEATURE_* should have no effect on Enabled().
	t.Setenv("ANYCAP_FEATURE_IMAGE_GENERATE", "false")
	if !Enabled(ImageGenerate) {
		t.Error("env var should not disable ImageGenerate; CLI features come from server preflight only")
	}

	t.Setenv("ANYCAP_FEATURE_VIDEO_READ", "false")
	if !Enabled(VideoRead) {
		t.Error("env var should not disable VideoRead; CLI features come from server preflight only")
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
