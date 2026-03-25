// Package feature provides a feature flag registry that supports multiple
// override layers. Flags control which capabilities are exposed to users.
//
// Priority (highest to lowest):
//  1. Runtime override via Set/SetAll (e.g., server-pushed config)
//  2. Environment variable: ANYCAP_FEATURE_<NAME> (e.g., ANYCAP_FEATURE_IMAGE_GENERATE=1)
//  3. Compile-time ldflags: -ldflags "-X pkg/feature.overrides=image.generate=true,video.read=false"
//  4. Code-level defaults
package feature

import (
	"os"
	"strings"
	"sync"
)

// overrides is set via ldflags at compile time.
// Format: "feature.name=true,another.feature=false"
//
//nolint:gochecknoglobals
var overrides string

// Well-known feature flag names.
const (
	ImageGenerate   = "image.generate"
	ImageModels     = "image.models"
	ImageUnderstand = "image.understand"
	VideoRead       = "video.read"
	Login           = "login"
)

// defaults defines the code-level default state for each feature.
// Features not listed here default to false.
var defaults = map[string]bool{
	ImageGenerate:   false, // disabled until an execution provider is configured
	ImageModels:     false, // disabled until a catalog provider is configured
	ImageUnderstand: true,  // agent-platform real implementation
	VideoRead:       true,  // agent-platform real implementation
	Login:           true,  // auth flow (stub but expected soon)
}

var (
	mu        sync.RWMutex
	runtimeM  = map[string]bool{}
	ldflagsM  = map[string]bool{}
	initDone  bool
	parseOnce sync.Once
)

func ensureInit() {
	parseOnce.Do(func() {
		parseLDFlags()
		initDone = true
	})
}

func parseLDFlags() {
	if overrides == "" {
		return
	}
	for _, item := range strings.Split(overrides, ",") {
		parts := strings.SplitN(strings.TrimSpace(item), "=", 2)
		if len(parts) == 2 {
			ldflagsM[parts[0]] = parts[1] == "true" || parts[1] == "1"
		}
	}
}

// Enabled reports whether the named feature is enabled.
//
// Resolution order: runtime > env > ldflags > defaults.
func Enabled(name string) bool {
	ensureInit()

	// 1. Runtime override (server-pushed config).
	mu.RLock()
	if v, ok := runtimeM[name]; ok {
		mu.RUnlock()
		return v
	}
	mu.RUnlock()

	// 2. Environment variable: ANYCAP_FEATURE_IMAGE_GENERATE for "image.generate".
	envKey := "ANYCAP_FEATURE_" + strings.ToUpper(strings.ReplaceAll(name, ".", "_"))
	if v := os.Getenv(envKey); v != "" {
		return v == "true" || v == "1"
	}

	// 3. Compile-time ldflags override.
	if v, ok := ldflagsM[name]; ok {
		return v
	}

	// 4. Code-level default.
	if v, ok := defaults[name]; ok {
		return v
	}

	return false
}

// Set overrides a single feature flag at runtime.
// Use this for server-pushed configuration.
func Set(name string, enabled bool) {
	mu.Lock()
	defer mu.Unlock()
	runtimeM[name] = enabled
}

// SetAll overrides multiple feature flags at runtime.
// Typically called after fetching feature config from the server.
func SetAll(flags map[string]bool) {
	mu.Lock()
	defer mu.Unlock()
	for k, v := range flags {
		runtimeM[k] = v
	}
}

// All returns every known feature and its resolved state.
func All() map[string]bool {
	ensureInit()

	result := make(map[string]bool, len(defaults))
	for k := range defaults {
		result[k] = Enabled(k)
	}

	// Include any runtime-only flags not in defaults.
	mu.RLock()
	for k := range runtimeM {
		if _, ok := result[k]; !ok {
			result[k] = Enabled(k)
		}
	}
	mu.RUnlock()

	return result
}

// Reset clears all runtime overrides. Intended for testing only.
func Reset() {
	mu.Lock()
	defer mu.Unlock()
	runtimeM = map[string]bool{}
}
