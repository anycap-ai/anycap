package auth

import (
	"context"
	"io"
	"os"
	"runtime"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

// AutoFlow automatically selects the best auth flow based on environment detection.
//
// Decision logic:
//  1. If a browser is available AND we can bind a local port: localhost callback flow.
//  2. Otherwise: device code polling flow.
//
// The user can always override with --headless (force device code) or --with-token (stdin).
func AutoFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (apiKey string, email string, err error) {
	if HasBrowser() && CanBindLocalPort() {
		return LocalhostFlow(ctx, client, stderr)
	}
	return DeviceFlow(ctx, client, stderr)
}

// HasBrowser returns true if the current environment likely has access to a
// graphical browser. Used by AutoFlow to decide the login method.
//
// Detection rules:
//   - CI=true / CI=1 env var set -> no browser (CI/CD pipeline)
//   - SSH_CONNECTION or SSH_TTY set -> no browser (remote session)
//   - Linux without DISPLAY or WAYLAND_DISPLAY -> no browser (headless server)
//   - macOS/Windows without SSH -> has browser (desktop OS)
func HasBrowser() bool {
	// CI environments never have browsers
	if ci := os.Getenv("CI"); ci != "" {
		return false
	}

	// SSH sessions don't have local browser access
	if os.Getenv("SSH_CONNECTION") != "" || os.Getenv("SSH_TTY") != "" {
		return false
	}

	// Common container/remote indicators
	if os.Getenv("CODESPACES") != "" || os.Getenv("GITPOD_WORKSPACE_ID") != "" {
		return false
	}

	// Linux needs a display server for a browser
	if runtime.GOOS == "linux" {
		if os.Getenv("DISPLAY") == "" && os.Getenv("WAYLAND_DISPLAY") == "" {
			return false
		}
	}

	// macOS and Windows normally have browsers on desktop
	return true
}
