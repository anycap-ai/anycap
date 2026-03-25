//go:build windows

package selfupdate

import (
	"fmt"
	"os"
	"os/exec"
)

// ReExec on Windows cannot replace the current process in-place (no execve).
// It runs the new binary as a child process, waits for it to finish, then
// exits with the same exit code.
func ReExec() error {
	exePath, err := ExecutablePath()
	if err != nil {
		return err
	}

	fmt.Fprintf(os.Stderr, "Updated successfully. Re-running command with new version...\n")

	cmd := exec.Command(exePath, os.Args[1:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		return fmt.Errorf("failed to restart: %w", err)
	}

	os.Exit(0)
	return nil // unreachable
}
