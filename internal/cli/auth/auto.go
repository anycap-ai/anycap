package auth

import (
	"context"
	"errors"
	"fmt"
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
		cred, email, err = BrowserPollFlow(ctx, client, stderr)
		if err != nil && errors.Is(err, ErrBrowserUnavailable) {
			fmt.Fprintln(stderr, "Browser unavailable, falling back to device code flow...")
			return DeviceFlow(ctx, client, stderr)
		}
		return cred, email, err
	}
	return DeviceFlow(ctx, client, stderr)
}

// HasBrowser returns true if the current environment likely has access to a
// graphical browser. Used by AutoFlow to decide the login method.
//
// On Linux, we default to headless (device code flow) because graphical
// environment detection is unreliable. DISPLAY or WAYLAND_DISPLAY being set
// does not guarantee a working browser (Docker inherited env, WSL X11
// forwarding, SSH X11 forwarding, broken xdg-open, etc.). Users on Linux
// desktops who want browser-based login can open the device-code URL in
// their browser manually -- the UX is nearly identical.
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
	// Linux: default to headless. Browser detection via DISPLAY/WAYLAND_DISPLAY
	// is too fragile -- false positives cause xdg-open to hang or fail silently.
	if runtime.GOOS == "linux" {
		return false
	}
	return true
}
