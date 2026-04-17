package meta

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
)

type daemonProcessState struct {
	PID                int    `json:"pid"`
	Platform           string `json:"platform"`
	RunnerID           string `json:"runner_id,omitempty"`
	MachineName        string `json:"machine_name,omitempty"`
	Executor           string `json:"executor,omitempty"`
	CursorForce        bool   `json:"cursor_force,omitempty"`
	Workspace          string `json:"workspace,omitempty"`
	LogPath            string `json:"log_path,omitempty"`
	StartedAt          string `json:"started_at,omitempty"`
	PersonalBotEnabled bool   `json:"personal_bot_enabled,omitempty"`
}

func daemonStatePath(platform string) string {
	return filepath.Join(cliconfig.ConfigDir(), fmt.Sprintf("daemon.%s.json", daemonPlatformKey(platform)))
}

func daemonLogPath(platform string) string {
	return filepath.Join(cliconfig.ConfigDir(), fmt.Sprintf("daemon.%s.log", daemonPlatformKey(platform)))
}

func daemonPlatformKey(platform string) string {
	key := strings.ToLower(strings.TrimSpace(platform))
	if key == "" {
		key = "default"
	}
	return key
}

func loadDaemonProcessState(platform string) (*daemonProcessState, error) {
	body, err := os.ReadFile(daemonStatePath(platform))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var state daemonProcessState
	if err := json.Unmarshal(body, &state); err != nil {
		return nil, err
	}
	return &state, nil
}

func saveDaemonProcessState(state daemonProcessState) error {
	state.Platform = daemonPlatformKey(state.Platform)
	if strings.TrimSpace(state.StartedAt) == "" {
		state.StartedAt = time.Now().UTC().Format(time.RFC3339)
	}
	body, err := json.Marshal(state)
	if err != nil {
		return err
	}
	return os.WriteFile(daemonStatePath(state.Platform), body, 0o600)
}

func removeDaemonProcessState(platform string) error {
	err := os.Remove(daemonStatePath(platform))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
