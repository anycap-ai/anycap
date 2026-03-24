package auth

import (
	"os/exec"
	"runtime"
)

// BrowserLauncher is the function used to open URLs in a browser.
// Override in tests to suppress browser opening.
var BrowserLauncher = defaultOpenBrowser

// OpenBrowser tries to open the URL in the default browser.
// Returns an error if it fails (caller should print the URL to stderr as fallback).
func OpenBrowser(url string) error {
	return BrowserLauncher(url)
}

func defaultOpenBrowser(url string) error {
	switch runtime.GOOS {
	case "darwin":
		return exec.Command("open", url).Start()
	case "linux":
		return exec.Command("xdg-open", url).Start()
	case "windows":
		return exec.Command("cmd", "/c", "start", url).Start()
	default:
		return exec.Command("xdg-open", url).Start()
	}
}
