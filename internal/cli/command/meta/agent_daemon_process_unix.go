//go:build !windows

package meta

import (
	"context"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
)

func configureCommandForDaemon(cmd *exec.Cmd) {
	if cmd == nil {
		return
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

func daemonProcessExists(pid int) bool {
	if pid <= 0 {
		return false
	}
	err := syscall.Kill(pid, 0)
	return err == nil || err == syscall.EPERM
}

func stopDaemonProcess(pid int) error {
	if pid <= 0 {
		return nil
	}
	return syscall.Kill(-pid, syscall.SIGTERM)
}

func findDaemonProcess(pid int) (*os.Process, error) {
	return os.FindProcess(pid)
}

func daemonNotifyContext(parent context.Context) (context.Context, context.CancelFunc) {
	return signal.NotifyContext(parent, os.Interrupt, syscall.SIGTERM)
}
