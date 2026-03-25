//go:build windows

package selfupdate

import (
	"fmt"
	"os"
	"os/exec"
)

// ReExec on Windows cannot replace the current process in-place.
// It starts a new process and exits the current one.
func ReExec() error {
	exePath, err := ExecutablePath()
	if err != nil {
		return err
	}

	cmd := exec.Command(exePath, os.Args[1:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to restart: %w", err)
	}

	os.Exit(0)
	return nil // unreachable
}
