package auth

import (
	"context"
	"io"
	"os"
	"runtime"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

// AutoFlow automatically selects the best auth flow based on environment detection.
//
// Decision logic:
//  1. If a browser is available: browser poll flow.
//  2. Otherwise: device code polling flow.
//
// The user can always override with --headless (force device code) or --with-token (stdin).
func AutoFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	if HasBrowser() {
		return BrowserPollFlow(ctx, client, stderr)
	}
	return DeviceFlow(ctx, client, stderr)
}

// HasBrowser returns true if the current environment likely has access to a
// graphical browser. Used by AutoFlow to decide the login method.
func HasBrowser() bool {
	if ci := os.Getenv("CI"); ci != "" {
		return false
	}
	if os.Getenv("SSH_CONNECTION") != "" || os.Getenv("SSH_TTY") != "" {
		return false
	}
	if os.Getenv("CODESPACES") != "" || os.Getenv("GITPOD_WORKSPACE_ID") != "" {
		return false
	}
	if runtime.GOOS == "linux" {
		if os.Getenv("DISPLAY") == "" && os.Getenv("WAYLAND_DISPLAY") == "" {
			return false
		}
	}
	return true
}
