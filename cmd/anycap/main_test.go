package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"
)

func TestSyncServerFeatures_PrefersMeFeaturesWhenAuthenticated(t *testing.T) {
	feature.Reset()
	t.Cleanup(feature.Reset)

	t.Setenv("ANYCAP_API_KEY", "ak_test_123")
	originalArgs := os.Args
	os.Args = []string{"anycap", "status"}
	t.Cleanup(func() { os.Args = originalArgs })

	var seenMe bool
	var seenGlobal bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/me/features":
			seenMe = true
			if got := r.Header.Get("Authorization"); got != "Bearer ak_test_123" {
				t.Fatalf("expected bearer token for /v1/me/features, got %q", got)
			}
			_, _ = w.Write([]byte(`{"data":{"features":{"music.generate":false}}}`))
		case "/v1/features":
			seenGlobal = true
			_, _ = w.Write([]byte(`{"data":{"features":{"music.generate":true}}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(server.Close)

	syncServerFeatures(server.URL)

	if !seenMe {
		t.Fatal("expected /v1/me/features to be requested first")
	}
	if seenGlobal {
		t.Fatal("did not expect /v1/features fallback when /v1/me/features succeeds")
	}
	if feature.Enabled("music.generate") {
		t.Fatal("expected user-specific feature view to disable music.generate")
	}
}

func TestSyncServerFeatures_FallsBackToGlobalFeaturesWhenUserSpecificRequestFails(t *testing.T) {
	feature.Reset()
	t.Cleanup(feature.Reset)

	t.Setenv("ANYCAP_API_KEY", "ak_test_123")
	originalArgs := os.Args
	os.Args = []string{"anycap", "status"}
	t.Cleanup(func() { os.Args = originalArgs })

	var seenMe bool
	var seenGlobal bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/me/features":
			seenMe = true
			http.Error(w, `{"error":{"code":"AUTH_INVALID","message":"nope"}}`, http.StatusUnauthorized)
		case "/v1/features":
			seenGlobal = true
			_, _ = w.Write([]byte(`{"data":{"features":{"music.generate":true}}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(server.Close)

	syncServerFeatures(server.URL)

	if !seenMe {
		t.Fatal("expected /v1/me/features to be attempted")
	}
	if !seenGlobal {
		t.Fatal("expected fallback to /v1/features when user-specific request fails")
	}
	if !feature.Enabled("music.generate") {
		t.Fatal("expected fallback global feature view to enable music.generate")
	}
}

func TestSyncServerFeatures_UsesGlobalFeaturesWhenUnauthenticated(t *testing.T) {
	feature.Reset()
	t.Cleanup(feature.Reset)

	t.Setenv("ANYCAP_API_KEY", "")
	originalArgs := os.Args
	os.Args = []string{"anycap", "status"}
	t.Cleanup(func() { os.Args = originalArgs })

	var seenMe bool
	var seenGlobal bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/me/features":
			seenMe = true
			http.NotFound(w, r)
		case "/v1/features":
			seenGlobal = true
			_, _ = w.Write([]byte(`{"data":{"features":{"image.generate":false}}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(server.Close)

	_ = cliconfig.DeleteCredential()
	syncServerFeatures(server.URL)

	if seenMe {
		t.Fatal("did not expect /v1/me/features without credentials")
	}
	if !seenGlobal {
		t.Fatal("expected /v1/features when unauthenticated")
	}
	if feature.Enabled("image.generate") {
		t.Fatal("expected global feature view to disable image.generate")
	}
}
