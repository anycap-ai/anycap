package model

import (
	"fmt"
	"time"
)

const (
	IMPlatformFeishu   = "feishu"
	IMPlatformWeChat   = "wechat"
	IMPlatformTelegram = "telegram"
)

const (
	IMBindingStatusPending = "pending"
	IMBindingStatusActive  = "active"
	IMBindingStatusRevoked = "revoked"
)

const (
	AgentRunnerStateOffline  = "offline"
	AgentRunnerStateIdle     = "idle"
	AgentRunnerStateBusy     = "busy"
	AgentRunnerStateDraining = "draining"
)

const (
	AgentTaskStatusQueued     = "queued"
	AgentTaskStatusDispatched = "dispatched"
	AgentTaskStatusRunning    = "running"
	AgentTaskStatusSucceeded  = "succeeded"
	AgentTaskStatusFailed     = "failed"
	AgentTaskStatusCanceled   = "canceled"
	AgentTaskStatusTimedOut   = "timed_out"
)

const (
	AgentIntentExecuteTask = "execute_task"
)

const (
	AgentConversationStatusActive   = "active"
	AgentConversationStatusArchived = "archived"
)

const (
	AgentSessionModeContinue = "continue"
	AgentSessionModeFork     = "fork"
	AgentSessionModeFire     = "fire"
	AgentSessionModeSystem   = "system"
)

const (
	AgentSessionStatusCreated     = "created"
	AgentSessionStatusRunning     = "running"
	AgentSessionStatusCommitted   = "committed"
	AgentSessionStatusFailed      = "failed"
	AgentSessionStatusInterrupted = "interrupted"
)

const (
	AgentMailboxSourceSubtaskResult = "subtask_result"
	AgentMailboxSourceSubtaskFailed = "subtask_failed"
	AgentMailboxSourceToolResult    = "tool_result"
)

const (
	AgentConversationEventSessionCommitted   = "session.committed"
	AgentConversationEventSessionFailed      = "session.failed"
	AgentConversationEventSessionInterrupted = "session.interrupted"
)

const (
	AgentChatActionContinue = "continue"
	AgentChatActionBind     = "bind"
	AgentChatActionNew      = "new"
	AgentChatActionReset    = "reset"
	AgentChatActionStatus   = "status"
	AgentChatActionStop     = "stop"
	AgentChatActionFork     = "fork"
	AgentChatActionFire     = "fire"
)

type IMBinding struct {
	ID          int64
	UserID      string
	Platform    string
	BotID       string
	ChannelID   string
	SenderID    string
	Status      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	LastBoundAt *time.Time
}

type AgentRunner struct {
	ID            int64
	UserID        string
	Name          string
	Platform      string
	FixedBinding  *int64
	State         string
	LastHeartbeat *time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type AgentPrimaryRunner struct {
	ID        int64
	UserID    string
	Platform  string
	RunnerID  int64
	UpdatedAt time.Time
}

type AgentTask struct {
	ID             int64
	UserID         string
	RunnerID       int64
	SessionID      *int64
	Platform       string
	Intent         string
	TaskText       string
	WorkspaceHint  *string
	RunnerSelector *string
	Status         string
	ErrorMessage   *string
	DispatchedAt   *time.Time
	StartedAt      *time.Time
	CompletedAt    *time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type AgentConversation struct {
	ID            int64
	UserID        string
	Platform      string
	BotID         string
	ChatID        string
	RunnerID      int64
	Agent         string
	Status        string
	LastSessionID *int64
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type AgentSession struct {
	ID              int64
	UserID          string
	ConversationID  int64
	ParentSessionID *int64
	RunnerID        int64
	Agent           string
	Mode            string
	UserMessage     *string
	FinalMessage    *string
	Status          string
	ExecutorRef     *string
	StartedAt       *time.Time
	CompletedAt     *time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type AgentMailboxMessage struct {
	ID                   int64
	ConversationID       int64
	SourceSessionID      int64
	SourceType           string
	Payload              string
	DeliveredToSessionID *int64
	CreatedAt            time.Time
}

type AgentConversationFollowup struct {
	ID                   int64
	ConversationID       int64
	PlatformMessageID    string
	ThreadID             string
	RootID               string
	ParentID             string
	Payload              string
	DeliveredToSessionID *int64
	CreatedAt            time.Time
}

type AgentConversationEvent struct {
	EventType      string
	ConversationID int64
	SessionID      int64
	SessionStatus  string
	PendingCount   int
	MailboxSummary *string
}

type IMBindToken struct {
	ID        int64
	UserID    string
	Token     string
	Platform  string
	ExpiresAt time.Time
	UsedAt    *time.Time
	CreatedAt time.Time
}

type AgentTaskUpdate struct {
	ID           int64
	Status       string
	ErrorMessage *string
	DispatchedAt *time.Time
	StartedAt    *time.Time
	CompletedAt  *time.Time
	UpdatedAt    time.Time
}

type ParsedAgentCommand struct {
	Agent          string
	Intent         string
	TaskText       string
	WorkspaceHint  *string
	RunnerSelector *string
}

type ParsedAgentChatCommand struct {
	Action        string
	BindToken     *string
	Message       *string
	ForkSessionID *string
}

func ValidateIMBindingStatus(status string) error {
	switch status {
	case IMBindingStatusPending, IMBindingStatusActive, IMBindingStatusRevoked:
		return nil
	default:
		return fmt.Errorf("%w: invalid im binding status %q", ErrInvalidParam, status)
	}
}

func ValidateAgentRunnerState(state string) error {
	switch state {
	case AgentRunnerStateOffline, AgentRunnerStateIdle, AgentRunnerStateBusy, AgentRunnerStateDraining:
		return nil
	default:
		return fmt.Errorf("%w: invalid agent runner state %q", ErrInvalidParam, state)
	}
}

func ValidateAgentTaskStatus(status string) error {
	switch status {
	case AgentTaskStatusQueued,
		AgentTaskStatusDispatched,
		AgentTaskStatusRunning,
		AgentTaskStatusSucceeded,
		AgentTaskStatusFailed,
		AgentTaskStatusCanceled,
		AgentTaskStatusTimedOut:
		return nil
	default:
		return fmt.Errorf("%w: invalid agent task status %q", ErrInvalidParam, status)
	}
}

func ValidateAgentConversationStatus(status string) error {
	switch status {
	case AgentConversationStatusActive, AgentConversationStatusArchived:
		return nil
	default:
		return fmt.Errorf("%w: invalid agent conversation status %q", ErrInvalidParam, status)
	}
}

func ValidateAgentSessionMode(mode string) error {
	switch mode {
	case AgentSessionModeContinue, AgentSessionModeFork, AgentSessionModeFire, AgentSessionModeSystem:
		return nil
	default:
		return fmt.Errorf("%w: invalid agent session mode %q", ErrInvalidParam, mode)
	}
}

func ValidateAgentSessionStatus(status string) error {
	switch status {
	case AgentSessionStatusCreated,
		AgentSessionStatusRunning,
		AgentSessionStatusCommitted,
		AgentSessionStatusFailed,
		AgentSessionStatusInterrupted:
		return nil
	default:
		return fmt.Errorf("%w: invalid agent session status %q", ErrInvalidParam, status)
	}
}

func ValidateAgentMailboxSourceType(sourceType string) error {
	switch sourceType {
	case AgentMailboxSourceSubtaskResult, AgentMailboxSourceSubtaskFailed, AgentMailboxSourceToolResult:
		return nil
	default:
		return fmt.Errorf("%w: invalid agent mailbox source type %q", ErrInvalidParam, sourceType)
	}
}

func (t *AgentTask) TransitionTo(next string) error {
	if t == nil {
		return fmt.Errorf("%w: agent task is required", ErrInvalidParam)
	}
	if err := ValidateAgentTaskStatus(next); err != nil {
		return err
	}
	if !canTransitionAgentTaskStatus(t.Status, next) {
		return ErrConflict(fmt.Sprintf("cannot transition agent task from %q to %q", t.Status, next))
	}
	t.Status = next
	return nil
}

func (s *AgentSession) TransitionTo(next string) error {
	if s == nil {
		return fmt.Errorf("%w: agent session is required", ErrInvalidParam)
	}
	if err := ValidateAgentSessionStatus(next); err != nil {
		return err
	}
	if !canTransitionAgentSessionStatus(s.Status, next) {
		return ErrConflict(fmt.Sprintf("cannot transition agent session from %q to %q", s.Status, next))
	}
	s.Status = next
	return nil
}

func canTransitionAgentTaskStatus(current, next string) bool {
	switch current {
	case "":
		return next == AgentTaskStatusQueued
	case AgentTaskStatusQueued:
		return next == AgentTaskStatusDispatched || next == AgentTaskStatusCanceled || next == AgentTaskStatusTimedOut
	case AgentTaskStatusDispatched:
		return next == AgentTaskStatusRunning || next == AgentTaskStatusFailed || next == AgentTaskStatusCanceled || next == AgentTaskStatusTimedOut
	case AgentTaskStatusRunning:
		return next == AgentTaskStatusSucceeded || next == AgentTaskStatusFailed || next == AgentTaskStatusCanceled || next == AgentTaskStatusTimedOut
	case AgentTaskStatusSucceeded, AgentTaskStatusFailed, AgentTaskStatusCanceled, AgentTaskStatusTimedOut:
		return false
	default:
		return false
	}
}

func canTransitionAgentSessionStatus(current, next string) bool {
	switch current {
	case "":
		return next == AgentSessionStatusCreated
	case AgentSessionStatusCreated:
		return next == AgentSessionStatusRunning || next == AgentSessionStatusFailed || next == AgentSessionStatusInterrupted
	case AgentSessionStatusRunning:
		return next == AgentSessionStatusCommitted || next == AgentSessionStatusFailed || next == AgentSessionStatusInterrupted
	case AgentSessionStatusCommitted, AgentSessionStatusFailed, AgentSessionStatusInterrupted:
		return false
	default:
		return false
	}
}
