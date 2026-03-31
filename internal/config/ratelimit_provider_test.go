package config

import (
	"bytes"
	"errors"
	"log"
	"strings"
	"testing"
)

type fakeRateLimitContainer struct {
	current *RateLimitConfig
}

func (f fakeRateLimitContainer) Get() *RateLimitConfig {
	return f.current
}

func TestRateLimitProvider_UsesFallbackConfigWhenDConfDisabled(t *testing.T) {
	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 10},
		RateLimitDConfEnabled: false,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})

	if got := provider.ResolveCapabilityRateLimitRPM("image.generate"); got != 10 {
		t.Fatalf("expected env override 10, got %d", got)
	}
	if got := provider.ResolveCapabilityRateLimitRPM("video.generate"); got != 60 {
		t.Fatalf("expected fallback default 60, got %d", got)
	}
}

func TestNewRateLimitProvider_LoadsDConfContainerWhenEnabled(t *testing.T) {
	originalLoader := loadRateLimitConfigContainer
	t.Cleanup(func() {
		loadRateLimitConfigContainer = originalLoader
	})

	expected := fakeRateLimitContainer{
		current: &RateLimitConfig{
			DefaultRPM: 88,
		},
	}
	loadRateLimitConfigContainer = func(cfg Config) (RateLimitConfigContainer, error) {
		return expected, nil
	}

	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})

	if got := provider.ResolveCapabilityRateLimitRPM("image.generate"); got != 88 {
		t.Fatalf("expected loaded dconf default 88, got %d", got)
	}
}

func TestNewRateLimitProvider_LogsDConfSnapshotWhenEnabled(t *testing.T) {
	originalLoader := loadRateLimitConfigContainer
	originalWriter := log.Writer()
	originalFlags := log.Flags()
	t.Cleanup(func() {
		loadRateLimitConfigContainer = originalLoader
		log.SetOutput(originalWriter)
		log.SetFlags(originalFlags)
	})

	var buf bytes.Buffer
	log.SetOutput(&buf)
	log.SetFlags(0)
	loadRateLimitConfigContainer = func(cfg Config) (RateLimitConfigContainer, error) {
		return fakeRateLimitContainer{
			current: &RateLimitConfig{
				DefaultRPM: 88,
				Capabilities: map[string]int{
					"image.generate": 9,
					"video.generate": 5,
				},
			},
		}, nil
	}

	_ = NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})

	output := buf.String()
	if !strings.Contains(output, "rate-limit: dconf snapshot group=anycap data_id=rate_limit payload=") {
		t.Fatalf("expected dconf snapshot log, got %q", output)
	}
	if !strings.Contains(output, `"default_rpm":88`) {
		t.Fatalf("expected default_rpm in log, got %q", output)
	}
	if !strings.Contains(output, `"image.generate":9`) {
		t.Fatalf("expected image.generate capability in log, got %q", output)
	}
}

func TestNewRateLimitProvider_FallsBackWhenDConfLoadFails(t *testing.T) {
	originalLoader := loadRateLimitConfigContainer
	t.Cleanup(func() {
		loadRateLimitConfigContainer = originalLoader
	})

	loadRateLimitConfigContainer = func(cfg Config) (RateLimitConfigContainer, error) {
		return nil, errors.New("boom")
	}

	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 14},
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})

	if got := provider.ResolveCapabilityRateLimitRPM("image.generate"); got != 14 {
		t.Fatalf("expected fallback env override 14, got %d", got)
	}
}

func TestRateLimitProvider_UsesFallbackConfigWhenContainerMissing(t *testing.T) {
	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 12},
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})

	if got := provider.ResolveCapabilityRateLimitRPM("image.generate"); got != 12 {
		t.Fatalf("expected env override 12, got %d", got)
	}
}

func TestRateLimitProvider_UsesDConfCapabilityOverride(t *testing.T) {
	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 12},
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})
	provider.container = fakeRateLimitContainer{
		current: &RateLimitConfig{
			DefaultRPM:   80,
			Capabilities: map[string]int{"image.generate": 9},
		},
	}

	if got := provider.ResolveCapabilityRateLimitRPM("image.generate"); got != 9 {
		t.Fatalf("expected dconf override 9, got %d", got)
	}
}

func TestRateLimitProvider_UsesDConfDefaultRPM(t *testing.T) {
	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 12},
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})
	provider.container = fakeRateLimitContainer{
		current: &RateLimitConfig{
			DefaultRPM:   77,
			Capabilities: map[string]int{"video.generate": 6},
		},
	}

	if got := provider.ResolveCapabilityRateLimitRPM("music.generate"); got != 77 {
		t.Fatalf("expected dconf default 77, got %d", got)
	}
}

func TestRateLimitProvider_IgnoresInvalidDConfCapabilityValue(t *testing.T) {
	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 12},
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})
	provider.container = fakeRateLimitContainer{
		current: &RateLimitConfig{
			DefaultRPM:   70,
			Capabilities: map[string]int{"image.generate": 0},
		},
	}

	if got := provider.ResolveCapabilityRateLimitRPM("image.generate"); got != 70 {
		t.Fatalf("expected dconf default 70 when capability value invalid, got %d", got)
	}
}

func TestRateLimitProvider_FallsBackWhenDConfDefaultInvalid(t *testing.T) {
	provider := NewRateLimitProvider(Config{
		RateLimitRPM:          60,
		RateLimitOverrides:    map[string]int{"image.generate": 12},
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   "anycap",
		RateLimitDConfDataID:  "rate_limit",
	})
	provider.container = fakeRateLimitContainer{
		current: &RateLimitConfig{
			DefaultRPM:   0,
			Capabilities: map[string]int{},
		},
	}

	if got := provider.ResolveCapabilityRateLimitRPM("music.generate"); got != 60 {
		t.Fatalf("expected env fallback 60 when dconf default invalid, got %d", got)
	}
}
