package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type IMBindTokenRepository interface {
	CreateIMBindToken(ctx context.Context, token model.IMBindToken) (*model.IMBindToken, error)
	GetIMBindTokenByToken(ctx context.Context, token string) (*model.IMBindToken, error)
	MarkIMBindTokenUsed(ctx context.Context, id int64) error
}

type IMBindingRepository interface {
	CreateBinding(ctx context.Context, binding model.IMBinding) (*model.IMBinding, error)
	GetActiveByPlatformSender(ctx context.Context, platform string, botID string, senderID string) (*model.IMBinding, error)
	ListBindingsByUser(ctx context.Context, userID string) ([]model.IMBinding, error)
	RevokeBinding(ctx context.Context, id int64) error
}

type AgentRunnerRepository interface {
	CreateRunner(ctx context.Context, runner model.AgentRunner) (*model.AgentRunner, error)
	GetRunnerByID(ctx context.Context, id int64) (*model.AgentRunner, error)
	GetPrimaryRunner(ctx context.Context, userID string, platform string) (*model.AgentPrimaryRunner, error)
	ListRunnersByUser(ctx context.Context, userID string) ([]model.AgentRunner, error)
	ClaimPrimaryRunner(ctx context.Context, userID string, platform string, runnerID int64, updatedAt time.Time) (*model.AgentPrimaryRunner, error)
	UpdateRunnerState(ctx context.Context, id int64, state string) (*model.AgentRunner, error)
}

type AgentConversationRepository interface {
	CreateConversation(ctx context.Context, conversation model.AgentConversation) (*model.AgentConversation, error)
	GetConversationByID(ctx context.Context, id int64) (*model.AgentConversation, error)
	GetActiveConversationByChat(ctx context.Context, userID string, platform string, botID string, chatID string) (*model.AgentConversation, error)
	ListConversationsByUser(ctx context.Context, userID string) ([]model.AgentConversation, error)
	UpdateConversationRunner(ctx context.Context, id int64, runnerID int64) (*model.AgentConversation, error)
	UpdateConversationLastSession(ctx context.Context, id int64, lastSessionID int64) (*model.AgentConversation, error)
	ArchiveConversation(ctx context.Context, id int64) (*model.AgentConversation, error)
}

type AgentSessionRepository interface {
	CreateSession(ctx context.Context, session model.AgentSession) (*model.AgentSession, error)
	GetSessionByID(ctx context.Context, id int64) (*model.AgentSession, error)
	ListSessionsByConversation(ctx context.Context, conversationID int64) ([]model.AgentSession, error)
	ListRunnableSessionsByRunner(ctx context.Context, runnerID int64, limit int) ([]model.AgentSession, error)
	UpdateSession(ctx context.Context, session model.AgentSession) (*model.AgentSession, error)
}

type AgentTaskRepository interface {
	CreateTask(ctx context.Context, task model.AgentTask) (*model.AgentTask, error)
	GetTaskByID(ctx context.Context, id int64) (*model.AgentTask, error)
	ListDispatchableTasksByRunner(ctx context.Context, runnerID int64, limit int) ([]model.AgentTask, error)
	UpdateTask(ctx context.Context, input model.AgentTaskUpdate) (*model.AgentTask, error)
}

type AgentMailboxRepository interface {
	CreateMailboxMessage(ctx context.Context, message model.AgentMailboxMessage) (*model.AgentMailboxMessage, error)
	ListUndeliveredMailboxMessages(ctx context.Context, conversationID int64) ([]model.AgentMailboxMessage, error)
	ListMailboxMessagesDeliveredToSession(ctx context.Context, sessionID int64) ([]model.AgentMailboxMessage, error)
	MarkMailboxMessagesDelivered(ctx context.Context, ids []int64, sessionID int64) error
}

type AgentConversationFollowupRepository interface {
	CreateConversationFollowup(ctx context.Context, followup model.AgentConversationFollowup) (*model.AgentConversationFollowup, error)
	ListUndeliveredConversationFollowups(ctx context.Context, conversationID int64) ([]model.AgentConversationFollowup, error)
	MarkConversationFollowupsDelivered(ctx context.Context, ids []int64, sessionID int64) error
}

type IMPlatformAdapter interface {
	SendAccepted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error
	SendCompleted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error
	SendFailure(ctx context.Context, binding model.IMBinding, task model.AgentTask) error
}

type AgentRunnerDispatcher interface {
	DispatchTask(ctx context.Context, runner model.AgentRunner, task model.AgentTask) error
}
