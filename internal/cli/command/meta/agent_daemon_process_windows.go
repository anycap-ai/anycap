//go:build windows

package meta

import (
	"context"
	"os"
	"os/exec"
	"os/signal"
)

func configureCommandForDaemon(cmd *exec.Cmd) {}

func daemonProcessExists(pid int) bool {
	return pid > 0
}

func stopDaemonProcess(pid int) error {
	if pid <= 0 {
		return nil
	}
	process, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	return process.Kill()
}

func findDaemonProcess(pid int) (*os.Process, error) {
	return os.FindProcess(pid)
}

func daemonNotifyContext(parent context.Context) (context.Context, context.CancelFunc) {
	return signal.NotifyContext(parent, os.Interrupt)
}
