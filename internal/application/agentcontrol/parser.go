package agentcontrol

import (
	"regexp"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

var (
	slashRunPattern   = regexp.MustCompile(`^/run\s+([A-Za-z0-9_-]+)\s+(.+)$`)
	chineseRunPattern = regexp.MustCompile(`^让\s+([A-Za-z0-9_-]+)\s+(?:(?:在|到)\s+([A-Za-z0-9._/-]+)\s+(?:里|中)\s*)?(?:去\s*)?(.+)$`)
)

func ParseChatCommand(raw string) (model.ParsedAgentChatCommand, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return model.ParsedAgentChatCommand{}, model.ErrValidation("message is required")
	}

	switch trimmed {
	case "/new":
		return model.ParsedAgentChatCommand{Action: model.AgentChatActionNew}, nil
	case "/reset":
		return model.ParsedAgentChatCommand{Action: model.AgentChatActionReset}, nil
	case "/status":
		return model.ParsedAgentChatCommand{Action: model.AgentChatActionStatus}, nil
	case "/stop":
		return model.ParsedAgentChatCommand{Action: model.AgentChatActionStop}, nil
	case "/fork":
		return model.ParsedAgentChatCommand{Action: model.AgentChatActionFork}, nil
	case "/fire":
		return model.ParsedAgentChatCommand{Action: model.AgentChatActionFire}, nil
	}

	if strings.HasPrefix(trimmed, "/bind ") {
		token, err := parseBindCommand(trimmed)
		if err != nil {
			return model.ParsedAgentChatCommand{}, err
		}
		return model.ParsedAgentChatCommand{
			Action:    model.AgentChatActionBind,
			BindToken: &token,
		}, nil
	}

	return model.ParsedAgentChatCommand{
		Action:  model.AgentChatActionContinue,
		Message: &trimmed,
	}, nil
}

func ParseCommand(raw string) (model.ParsedAgentCommand, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return model.ParsedAgentCommand{}, model.ErrValidation(`unsupported command format; use "/run codex <task>" or "让 codex <任务>"`)
	}

	if matches := slashRunPattern.FindStringSubmatch(trimmed); len(matches) == 3 {
		taskText := strings.TrimSpace(matches[2])
		if taskText == "" {
			return model.ParsedAgentCommand{}, model.ErrValidation(`unsupported command format; use "/run codex <task>" or "让 codex <任务>"`)
		}
		return model.ParsedAgentCommand{
			Agent:    strings.TrimSpace(matches[1]),
			Intent:   model.AgentIntentExecuteTask,
			TaskText: taskText,
		}, nil
	}

	if matches := chineseRunPattern.FindStringSubmatch(trimmed); len(matches) == 4 {
		taskText := strings.TrimSpace(matches[3])
		if taskText == "" {
			return model.ParsedAgentCommand{}, model.ErrValidation(`unsupported command format; use "/run codex <task>" or "让 codex <任务>"`)
		}
		result := model.ParsedAgentCommand{
			Agent:    strings.TrimSpace(matches[1]),
			Intent:   model.AgentIntentExecuteTask,
			TaskText: taskText,
		}
		if workspace := strings.TrimSpace(matches[2]); workspace != "" {
			result.WorkspaceHint = &workspace
		}
		return result, nil
	}

	return model.ParsedAgentCommand{}, model.ErrValidation(`unsupported command format; use "/run codex <task>" or "让 codex <任务>"`)
}
