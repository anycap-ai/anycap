//go:build windows

package meta

import "os/exec"

func configureCommandForCancellation(cmd *exec.Cmd) {}

func terminateCommand(cmd *exec.Cmd) error {
	if cmd == nil || cmd.Process == nil {
		return nil
	}
	return cmd.Process.Kill()
}
