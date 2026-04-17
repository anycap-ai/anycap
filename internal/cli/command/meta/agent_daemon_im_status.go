package meta

import (
	"bufio"
	"os"
	"regexp"
	"strings"
	"time"
)

type daemonPersonalBotStatus struct {
	Configured      bool
	Connected       bool
	LastConnectedAt string
	LastError       string
	LastErrorAt     string
}

var daemonLogLinePattern = regexp.MustCompile(`^\[(Info|Error|Warn)\]\s+(\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}\.\d+)\s+(.*)$`)

func inspectDaemonPersonalBotStatus(state *daemonProcessState) *daemonPersonalBotStatus {
	if state == nil || !state.PersonalBotEnabled {
		return nil
	}
	status := &daemonPersonalBotStatus{Configured: true}
	body, err := os.ReadFile(strings.TrimSpace(state.LogPath))
	if err != nil {
		status.LastError = "failed to read daemon log"
		return status
	}

	startedAt := parseDaemonStartedAt(state.StartedAt)
	var lastConnected time.Time
	var lastError time.Time

	scanner := bufio.NewScanner(strings.NewReader(string(body)))
	for scanner.Scan() {
		matches := daemonLogLinePattern.FindStringSubmatch(strings.TrimSpace(scanner.Text()))
		if len(matches) != 4 {
			continue
		}
		ts, err := time.Parse("2006/01/02 15:04:05.999999", matches[2])
		if err != nil {
			continue
		}
		if !startedAt.IsZero() && ts.Before(startedAt) {
			continue
		}
		message := strings.TrimSpace(matches[3])
		switch {
		case strings.Contains(message, "connected to wss://"):
			lastConnected = ts
			status.LastConnectedAt = ts.UTC().Format(time.RFC3339)
		case strings.Contains(message, "connect failed"):
			lastError = ts
			status.LastErrorAt = ts.UTC().Format(time.RFC3339)
			status.LastError = extractDaemonConnectError(message)
		}
	}

	if !lastConnected.IsZero() && (lastError.IsZero() || lastConnected.After(lastError)) {
		status.Connected = true
	}
	return status
}

func parseDaemonStartedAt(value string) time.Time {
	startedAt, err := time.Parse(time.RFC3339, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}
	}
	return startedAt.UTC()
}

func extractDaemonConnectError(message string) string {
	trimmed := strings.TrimSpace(message)
	if idx := strings.Index(trimmed, "err:"); idx >= 0 {
		return strings.TrimSpace(trimmed[idx+4:])
	}
	return trimmed
}
