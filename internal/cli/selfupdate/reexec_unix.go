//go:build !windows

package selfupdate

import (
	"os"
	"syscall"
)

// ReExec replaces the current process with the same executable and arguments.
// On Unix, this uses syscall.Exec which never returns on success.
func ReExec() error {
	exe, err := ExecutablePath()
	if err != nil {
		return err
	}
	return syscall.Exec(exe, os.Args, os.Environ())
}
