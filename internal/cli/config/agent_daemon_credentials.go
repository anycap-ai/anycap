package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// AgentDaemonFeishuCredentials are local-only credentials for the personal
// Feishu bot daemon. They are intentionally separate from config.toml because
// AppSecret must be stored with credential-file permissions.
type AgentDaemonFeishuCredentials struct {
	AppID     string `json:"app_id"`
	AppSecret string `json:"app_secret"`
}

func AgentDaemonFeishuCredentialsPath() (string, error) {
	dir, err := configDir()
	if err != nil {
		return "", err
	}
	name := "agent-daemon-feishu.json"
	if env := ResolvedEnvironment(); env != "" {
		name = "agent-daemon-feishu." + env + ".json"
	}
	return filepath.Join(dir, name), nil
}

func LoadAgentDaemonFeishuCredentials() (*AgentDaemonFeishuCredentials, error) {
	path, err := AgentDaemonFeishuCredentialsPath()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var cred AgentDaemonFeishuCredentials
	if err := json.Unmarshal(data, &cred); err != nil {
		return nil, err
	}
	cred.AppID = strings.TrimSpace(cred.AppID)
	cred.AppSecret = strings.TrimSpace(cred.AppSecret)
	if cred.AppID == "" && cred.AppSecret == "" {
		return nil, nil
	}
	return &cred, nil
}

func SaveAgentDaemonFeishuCredentials(cred AgentDaemonFeishuCredentials) error {
	cred.AppID = strings.TrimSpace(cred.AppID)
	cred.AppSecret = strings.TrimSpace(cred.AppSecret)
	data, err := json.MarshalIndent(cred, "", "  ")
	if err != nil {
		return err
	}
	path, err := AgentDaemonFeishuCredentialsPath()
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(data, '\n'), 0o600)
}

func DeleteAgentDaemonFeishuCredentials() error {
	path, err := AgentDaemonFeishuCredentialsPath()
	if err != nil {
		return err
	}
	err = os.Remove(path)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
