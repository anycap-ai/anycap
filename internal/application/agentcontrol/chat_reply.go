package agentcontrol

import (
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func BuildInboundChatReply(result InboundChatResult) string {
	switch result.Chat.Action {
	case model.AgentChatActionContinue:
		if result.Queued {
			return "上一条还在处理中，这条消息已排队"
		}
		return "会话已接收，正在处理中"
	case model.AgentChatActionNew, model.AgentChatActionReset:
		return "会话已接收，正在处理中"
	case model.AgentChatActionFork:
		if result.Conversation == nil || result.Conversation.ID <= 0 || result.Session == nil || result.Session.ID <= 0 {
			return "当前没有可分叉的活跃会话"
		}
		return "已创建新的会话分支，正在处理中"
	case model.AgentChatActionFire:
		if result.Conversation == nil || result.Conversation.ID <= 0 || result.Session == nil || result.Session.ID <= 0 {
			return "当前没有待处理的异步结果"
		}
		return "已触发异步结果回流，正在处理中"
	case model.AgentChatActionStatus:
		if result.Conversation == nil || result.Conversation.ID <= 0 {
			return "当前没有活跃会话"
		}
		if result.Session == nil || result.Session.ID <= 0 {
			return "当前会话已创建，等待执行"
		}
		return buildStatusReply(*result.Conversation, *result.Session)
	case model.AgentChatActionStop:
		if result.Conversation == nil || result.Conversation.ID <= 0 || result.Session == nil || result.Session.ID <= 0 {
			return "当前没有可停止的活跃会话"
		}
		if result.Session.FinalMessage != nil && strings.TrimSpace(*result.Session.FinalMessage) != "" {
			return strings.TrimSpace(*result.Session.FinalMessage)
		}
		return "会话已停止"
	default:
		return ""
	}
}

func buildStatusReply(conversation model.AgentConversation, session model.AgentSession) string {
	lines := []string{
		fmt.Sprintf("当前会话：%s / %s", agentLabel(conversation.Agent), sessionModeLabel(session.Mode)),
		"状态：" + sessionStatusLabel(session.Status),
	}
	if session.ExecutorRef != nil && strings.TrimSpace(*session.ExecutorRef) != "" {
		lines = append(lines, "上下文：已复用")
	}
	if session.StartedAt != nil {
		lines = append(lines, "开始时间："+formatStatusTime(*session.StartedAt))
	}
	if session.CompletedAt != nil {
		lines = append(lines, "完成时间："+formatStatusTime(*session.CompletedAt))
	}
	if session.FinalMessage != nil && strings.TrimSpace(*session.FinalMessage) != "" {
		lines = append(lines, "结果："+truncateStatusMessage(strings.TrimSpace(*session.FinalMessage), 120))
	}
	return strings.Join(lines, "\n")
}

func agentLabel(agent string) string {
	value := strings.TrimSpace(agent)
	if value == "" {
		return "agent"
	}
	return value
}

func sessionModeLabel(mode string) string {
	switch strings.TrimSpace(mode) {
	case model.AgentSessionModeContinue:
		return "继续"
	case model.AgentSessionModeFork:
		return "分支"
	case model.AgentSessionModeFire:
		return "触发"
	case model.AgentSessionModeSystem:
		return "系统"
	default:
		return "未知模式"
	}
}

func sessionStatusLabel(status string) string {
	switch strings.TrimSpace(status) {
	case model.AgentSessionStatusCreated:
		return "等待执行"
	case model.AgentSessionStatusRunning:
		return "执行中"
	case model.AgentSessionStatusCommitted:
		return "已完成"
	case model.AgentSessionStatusFailed:
		return "执行失败"
	case model.AgentSessionStatusInterrupted:
		return "已停止"
	default:
		return "未知状态"
	}
}

func formatStatusTime(value time.Time) string {
	return value.UTC().Format("2006-01-02 15:04:05 UTC")
}

func truncateStatusMessage(message string, limit int) string {
	value := strings.TrimSpace(message)
	if limit <= 0 || len([]rune(value)) <= limit {
		return value
	}
	runes := []rune(value)
	return string(runes[:limit]) + "..."
}
