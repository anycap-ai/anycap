package agentcontrol

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type ConversationService struct {
	bindings            port.IMBindingRepository
	runners             port.AgentRunnerRepository
	conversations       port.AgentConversationRepository
	sessions            port.AgentSessionRepository
	mailbox             port.AgentMailboxRepository
	followups           port.AgentConversationFollowupRepository
	now                 func() time.Time
	fixedRunnerResolver FixedRunnerResolver
}

type ConversationServiceOption func(*ConversationService)

type InboundChatInput struct {
	Platform  string
	BotID     string
	ChatID    string
	MessageID string
	SenderID  string
	Message   string
}

type OwnedInboundChatInput struct {
	UserID    string
	Platform  string
	BotID     string
	ChatID    string
	MessageID string
	SenderID  string
	Message   string
}

type InboundChatResult struct {
	Chat           model.ParsedAgentChatCommand
	Binding        *model.IMBinding
	Conversation   *model.AgentConversation
	Session        *model.AgentSession
	Queued         bool
	Duplicated     bool
	FollowupQueued bool
}

type RunnerSessionUpdateInput struct {
	SessionID    int64
	Status       string
	FinalMessage *string
	ExecutorRef  *string
}

type RunnerSessionUpdateResult struct {
	Session         *model.AgentSession
	FollowupSession *model.AgentSession
	AutoFireSession *model.AgentSession
	Event           *model.AgentConversationEvent
}

func NewConversationService(
	bindings port.IMBindingRepository,
	runners port.AgentRunnerRepository,
	conversations port.AgentConversationRepository,
	sessions port.AgentSessionRepository,
	mailbox port.AgentMailboxRepository,
	options ...ConversationServiceOption,
) *ConversationService {
	service := &ConversationService{
		bindings:      bindings,
		runners:       runners,
		conversations: conversations,
		sessions:      sessions,
		mailbox:       mailbox,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
	for _, option := range options {
		if option != nil {
			option(service)
		}
	}
	return service
}

func WithConversationClock(now func() time.Time) ConversationServiceOption {
	return func(s *ConversationService) {
		if now != nil {
			s.now = now
		}
	}
}

func WithConversationFixedRunnerResolver(resolver FixedRunnerResolver) ConversationServiceOption {
	return func(s *ConversationService) {
		if resolver != nil {
			s.fixedRunnerResolver = resolver
		}
	}
}

func WithConversationFollowups(repo port.AgentConversationFollowupRepository) ConversationServiceOption {
	return func(s *ConversationService) {
		if repo != nil {
			s.followups = repo
		}
	}
}

func (s *ConversationService) HandleInboundMessage(ctx context.Context, input InboundChatInput) (*InboundChatResult, error) {
	if s == nil || s.bindings == nil || s.runners == nil || s.conversations == nil || s.sessions == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}

	platform, err := normalizeIMPlatform(input.Platform)
	if err != nil {
		return nil, err
	}
	binding, runner, err := s.resolveAuthorizedBindingAndRunner(ctx, platform, input.BotID, input.SenderID)
	if err != nil {
		return nil, err
	}

	return s.handleResolvedInboundMessage(ctx, *binding, *runner, strings.TrimSpace(input.ChatID), strings.TrimSpace(input.MessageID), input.Message)
}

func (s *ConversationService) HandleOwnedInboundMessage(ctx context.Context, input OwnedInboundChatInput) (*InboundChatResult, error) {
	if s == nil || s.runners == nil || s.conversations == nil || s.sessions == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	userID := strings.TrimSpace(input.UserID)
	if userID == "" {
		return nil, model.ErrAuthInvalid
	}
	platform, err := normalizeIMPlatform(input.Platform)
	if err != nil {
		return nil, err
	}
	runner, err := s.resolvePrimaryRunnerByUser(ctx, userID, platform)
	if err != nil {
		return nil, err
	}
	binding := model.IMBinding{
		UserID:    userID,
		Platform:  platform,
		BotID:     strings.TrimSpace(input.BotID),
		ChannelID: strings.TrimSpace(input.ChatID),
		SenderID:  strings.TrimSpace(input.SenderID),
		Status:    model.IMBindingStatusActive,
	}
	if binding.BotID == "" {
		return nil, model.ErrValidation("bot_id is required")
	}
	if binding.ChannelID == "" {
		return nil, model.ErrValidation("chat_id is required")
	}
	return s.handleResolvedInboundMessage(ctx, binding, *runner, binding.ChannelID, strings.TrimSpace(input.MessageID), input.Message)
}

func (s *ConversationService) handleResolvedInboundMessage(ctx context.Context, binding model.IMBinding, runner model.AgentRunner, chatID string, messageID string, message string) (*InboundChatResult, error) {
	chat, err := ParseChatCommand(message)
	if err != nil {
		return nil, err
	}

	switch chat.Action {
	case model.AgentChatActionContinue:
		conversation, session, queued, duplicated, followupQueued, err := s.continueConversation(ctx, binding, runner, strings.TrimSpace(chatID), strings.TrimSpace(messageID), chat)
		if err != nil {
			return nil, err
		}
		return &InboundChatResult{Chat: chat, Binding: &binding, Conversation: conversation, Session: session, Queued: queued, Duplicated: duplicated, FollowupQueued: followupQueued}, nil
	case model.AgentChatActionNew, model.AgentChatActionReset:
		conversation, session, err := s.resetConversation(ctx, binding, runner, strings.TrimSpace(chatID), chat)
		if err != nil {
			return nil, err
		}
		return &InboundChatResult{Chat: chat, Binding: &binding, Conversation: conversation, Session: session}, nil
	case model.AgentChatActionStatus:
		conversation, session, err := s.getConversationStatus(ctx, binding, strings.TrimSpace(chatID))
		if err != nil {
			return nil, err
		}
		return &InboundChatResult{Chat: chat, Binding: &binding, Conversation: conversation, Session: session}, nil
	case model.AgentChatActionStop:
		conversation, session, err := s.stopConversation(ctx, binding, strings.TrimSpace(chatID))
		if err != nil {
			return nil, err
		}
		return &InboundChatResult{Chat: chat, Binding: &binding, Conversation: conversation, Session: session}, nil
	case model.AgentChatActionFork:
		conversation, session, err := s.forkConversation(ctx, binding, runner, strings.TrimSpace(chatID), chat)
		if err != nil {
			return nil, err
		}
		return &InboundChatResult{Chat: chat, Binding: &binding, Conversation: conversation, Session: session}, nil
	case model.AgentChatActionFire:
		conversation, session, err := s.fireConversation(ctx, binding, strings.TrimSpace(chatID), chat)
		if err != nil {
			return nil, err
		}
		return &InboundChatResult{Chat: chat, Binding: &binding, Conversation: conversation, Session: session}, nil
	default:
		return nil, model.ErrValidation("unsupported chat action")
	}
}

func (s *ConversationService) GetNextSessionForRunner(ctx context.Context, principal *model.Principal, runnerID int64) (*model.AgentSession, error) {
	if s == nil || s.sessions == nil || s.runners == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	if principal == nil || strings.TrimSpace(principal.UserID) == "" || strings.TrimSpace(principal.AuthType) == "" {
		return nil, model.ErrAuthInvalid
	}

	runner, err := s.runners.GetRunnerByID(ctx, runnerID)
	if err != nil {
		return nil, err
	}
	if runner == nil || runner.ID <= 0 {
		return nil, model.ErrNotFound("agent runner not found")
	}
	if strings.TrimSpace(runner.UserID) != strings.TrimSpace(principal.UserID) {
		return nil, model.ErrAuthInvalid
	}

	items, err := s.sessions.ListRunnableSessionsByRunner(ctx, runnerID, 1)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, nil
	}
	session := items[0]
	return &session, nil
}

func (s *ConversationService) GetSessionForRunner(ctx context.Context, principal *model.Principal, runnerID int64, sessionID int64) (*model.AgentSession, error) {
	if s == nil || s.sessions == nil || s.runners == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	if principal == nil || strings.TrimSpace(principal.UserID) == "" || strings.TrimSpace(principal.AuthType) == "" {
		return nil, model.ErrAuthInvalid
	}

	runner, err := s.runners.GetRunnerByID(ctx, runnerID)
	if err != nil {
		return nil, err
	}
	if runner == nil || runner.ID <= 0 {
		return nil, model.ErrNotFound("agent runner not found")
	}
	if strings.TrimSpace(runner.UserID) != strings.TrimSpace(principal.UserID) {
		return nil, model.ErrAuthInvalid
	}

	session, err := s.sessions.GetSessionByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if session == nil || session.ID <= 0 {
		return nil, model.ErrNotFound("agent session not found")
	}
	if session.RunnerID != runnerID {
		return nil, model.ErrAuthInvalid
	}
	return session, nil
}

func (s *ConversationService) ApplyRunnerSessionUpdate(ctx context.Context, input RunnerSessionUpdateInput) (*model.AgentSession, error) {
	result, err := s.ApplyRunnerSessionUpdateDetailed(ctx, input)
	if err != nil {
		return nil, err
	}
	if result == nil {
		return nil, nil
	}
	return result.Session, nil
}

func (s *ConversationService) ApplyRunnerSessionUpdateDetailed(ctx context.Context, input RunnerSessionUpdateInput) (*RunnerSessionUpdateResult, error) {
	if s == nil || s.sessions == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	session, err := s.sessions.GetSessionByID(ctx, input.SessionID)
	if err != nil {
		return nil, err
	}
	if session == nil || session.ID <= 0 {
		return nil, model.ErrNotFound("agent session not found")
	}
	if strings.TrimSpace(input.Status) == "" {
		return nil, model.ErrValidation("session status is required")
	}
	if session.Status == model.AgentSessionStatusInterrupted {
		return &RunnerSessionUpdateResult{Session: session}, nil
	}
	if session.Status == input.Status {
		return &RunnerSessionUpdateResult{Session: session}, nil
	}

	next := *session
	if err := next.TransitionTo(input.Status); err != nil {
		return nil, err
	}

	now := s.now().UTC()
	next.Status = input.Status
	next.UpdatedAt = now
	if input.FinalMessage != nil {
		value := strings.TrimSpace(*input.FinalMessage)
		next.FinalMessage = &value
	}
	if input.ExecutorRef != nil {
		value := strings.TrimSpace(*input.ExecutorRef)
		next.ExecutorRef = &value
	}
	switch next.Status {
	case model.AgentSessionStatusRunning:
		next.StartedAt = &now
	case model.AgentSessionStatusCommitted, model.AgentSessionStatusFailed, model.AgentSessionStatusInterrupted:
		next.CompletedAt = &now
	}
	updated, err := s.sessions.UpdateSession(ctx, next)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, nil
	}
	result := &RunnerSessionUpdateResult{
		Session: updated,
		Event: &model.AgentConversationEvent{
			EventType:      conversationEventTypeFromSessionStatus(updated.Status),
			ConversationID: updated.ConversationID,
			SessionID:      updated.ID,
			SessionStatus:  updated.Status,
		},
	}
	if isTerminalAgentSessionStatus(updated.Status) && s.conversations != nil {
		conversation, err := s.conversations.GetConversationByID(ctx, updated.ConversationID)
		if err != nil {
			return nil, err
		}
		if conversation != nil && conversation.ID > 0 && conversation.LastSessionID != nil && *conversation.LastSessionID == updated.ID {
			_, followupSession, followupItems, err := s.tryAutoFollowupConversation(ctx, *conversation)
			if err != nil {
				return nil, err
			}
			if followupSession != nil {
				result.FollowupSession = followupSession
				if result.Event != nil {
					result.Event.PendingCount = len(followupItems)
				}
				return result, nil
			}
			if updated.Status == model.AgentSessionStatusInterrupted {
				return result, nil
			}
			_, autoFireSession, autoFireMailbox, err := s.tryAutoFireConversation(ctx, *conversation)
			if err != nil {
				return nil, err
			}
			result.AutoFireSession = autoFireSession
			if result.Event != nil {
				result.Event.PendingCount = len(autoFireMailbox)
				result.Event.MailboxSummary = buildMailboxEventSummary(autoFireMailbox)
			}
		}
	}
	return result, nil
}

func (s *ConversationService) StopConversationByID(ctx context.Context, principal *model.Principal, conversationID int64) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.loadAuthorizedConversation(ctx, principal, conversationID)
	if err != nil {
		return nil, nil, err
	}
	binding := model.IMBinding{
		UserID:   conversation.UserID,
		Platform: conversation.Platform,
		BotID:    conversation.BotID,
	}
	return s.stopConversation(ctx, binding, conversation.ChatID)
}

func (s *ConversationService) CreateMailboxMessageByConversationID(ctx context.Context, principal *model.Principal, conversationID int64, sourceType string, payload string, sourceSessionID *int64) (*model.AgentMailboxMessage, error) {
	conversation, err := s.loadAuthorizedConversation(ctx, principal, conversationID)
	if err != nil {
		return nil, err
	}
	if s.mailbox == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	if err := model.ValidateAgentMailboxSourceType(strings.TrimSpace(sourceType)); err != nil {
		return nil, err
	}
	payload = strings.TrimSpace(payload)
	if payload == "" {
		return nil, model.ErrValidation("mailbox payload is required")
	}
	resolvedSourceSessionID, err := s.resolveMailboxSourceSessionID(ctx, *conversation, sourceSessionID)
	if err != nil {
		return nil, err
	}
	item, err := s.mailbox.CreateMailboxMessage(ctx, model.AgentMailboxMessage{
		ConversationID:  conversation.ID,
		SourceSessionID: resolvedSourceSessionID,
		SourceType:      strings.TrimSpace(sourceType),
		Payload:         payload,
		CreatedAt:       s.now().UTC(),
	})
	if err != nil {
		return nil, err
	}
	if _, _, _, err := s.tryAutoFireConversation(ctx, *conversation); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *ConversationService) ListMailboxMessagesByConversationID(ctx context.Context, principal *model.Principal, conversationID int64) ([]model.AgentMailboxMessage, error) {
	conversation, err := s.loadAuthorizedConversation(ctx, principal, conversationID)
	if err != nil {
		return nil, err
	}
	if s.mailbox == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	return s.mailbox.ListUndeliveredMailboxMessages(ctx, conversation.ID)
}

func (s *ConversationService) FireConversationByID(ctx context.Context, principal *model.Principal, conversationID int64, message *string) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.loadAuthorizedConversation(ctx, principal, conversationID)
	if err != nil {
		return nil, nil, err
	}
	return s.fireConversationForConversation(ctx, *conversation, model.ParsedAgentChatCommand{
		Action:  model.AgentChatActionFire,
		Message: trimOptionalMessage(message),
	})
}

func (s *ConversationService) ResetConversationByID(ctx context.Context, principal *model.Principal, conversationID int64, message *string) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.loadAuthorizedConversation(ctx, principal, conversationID)
	if err != nil {
		return nil, nil, err
	}
	runner, err := s.loadAuthorizedRunner(ctx, conversation.UserID, conversation.RunnerID)
	if err != nil {
		return nil, nil, err
	}
	binding := model.IMBinding{
		UserID:   conversation.UserID,
		Platform: conversation.Platform,
		BotID:    conversation.BotID,
	}
	return s.resetConversation(ctx, binding, *runner, conversation.ChatID, model.ParsedAgentChatCommand{
		Action:  model.AgentChatActionReset,
		Message: trimOptionalMessage(message),
	})
}

func (s *ConversationService) ForkConversationByID(ctx context.Context, principal *model.Principal, conversationID int64, message *string) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.loadAuthorizedConversation(ctx, principal, conversationID)
	if err != nil {
		return nil, nil, err
	}
	runner, err := s.loadAuthorizedRunner(ctx, conversation.UserID, conversation.RunnerID)
	if err != nil {
		return nil, nil, err
	}
	binding := model.IMBinding{
		UserID:   conversation.UserID,
		Platform: conversation.Platform,
		BotID:    conversation.BotID,
	}
	return s.forkConversation(ctx, binding, *runner, conversation.ChatID, model.ParsedAgentChatCommand{
		Action:  model.AgentChatActionFork,
		Message: trimOptionalMessage(message),
	})
}

func (s *ConversationService) resolveAuthorizedBindingAndRunner(ctx context.Context, platform string, botID string, senderID string) (*model.IMBinding, *model.AgentRunner, error) {
	binding, err := s.bindings.GetActiveByPlatformSender(ctx, platform, strings.TrimSpace(botID), strings.TrimSpace(senderID))
	if err != nil {
		return nil, nil, err
	}
	if binding == nil || binding.ID <= 0 {
		return nil, nil, model.ErrAuthInvalid
	}

	runner, err := s.resolvePrimaryRunnerByUser(ctx, binding.UserID, platform)
	if err != nil {
		return nil, nil, err
	}
	if runner.FixedBinding != nil && *runner.FixedBinding != binding.ID {
		return nil, nil, model.ErrAuthInvalid
	}
	return binding, runner, nil
}

func (s *ConversationService) resolvePrimaryRunnerByUser(ctx context.Context, userID string, platform string) (*model.AgentRunner, error) {
	runnerID := int64(0)
	primary, err := s.runners.GetPrimaryRunner(ctx, userID, platform)
	if err != nil {
		return nil, err
	}
	if primary != nil && primary.ID > 0 {
		runnerID = primary.RunnerID
	} else {
		return nil, model.ErrNotConfigured("你的本地 AnyCap agent 当前不在线")
	}
	runner, err := s.runners.GetRunnerByID(ctx, runnerID)
	if err != nil {
		return nil, err
	}
	if runner == nil || runner.ID <= 0 {
		return nil, model.ErrNotConfigured("你的本地 AnyCap agent 当前不在线")
	}
	if strings.TrimSpace(runner.UserID) != strings.TrimSpace(userID) {
		return nil, model.ErrAuthInvalid
	}
	if strings.TrimSpace(runner.State) == model.AgentRunnerStateOffline {
		return nil, model.ErrNotConfigured("你的本地 AnyCap agent 当前不在线")
	}
	return runner, nil
}

func (s *ConversationService) loadAuthorizedConversation(ctx context.Context, principal *model.Principal, conversationID int64) (*model.AgentConversation, error) {
	if s == nil || s.conversations == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	if principal == nil || strings.TrimSpace(principal.UserID) == "" || strings.TrimSpace(principal.AuthType) == "" {
		return nil, model.ErrAuthInvalid
	}
	conversation, err := s.conversations.GetConversationByID(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	if conversation == nil || conversation.ID <= 0 {
		return nil, model.ErrNotFound("agent conversation not found")
	}
	if strings.TrimSpace(conversation.UserID) != strings.TrimSpace(principal.UserID) {
		return nil, model.ErrAuthInvalid
	}
	return conversation, nil
}

func (s *ConversationService) loadAuthorizedRunner(ctx context.Context, userID string, runnerID int64) (*model.AgentRunner, error) {
	if s == nil || s.runners == nil {
		return nil, model.ErrNotConfigured("conversation service is not configured")
	}
	runner, err := s.runners.GetRunnerByID(ctx, runnerID)
	if err != nil {
		return nil, err
	}
	if runner == nil || runner.ID <= 0 {
		return nil, model.ErrNotFound("agent runner not found")
	}
	if strings.TrimSpace(runner.UserID) != strings.TrimSpace(userID) {
		return nil, model.ErrAuthInvalid
	}
	return runner, nil
}

func (s *ConversationService) continueConversation(ctx context.Context, binding model.IMBinding, runner model.AgentRunner, chatID string, messageID string, chat model.ParsedAgentChatCommand) (*model.AgentConversation, *model.AgentSession, bool, bool, bool, error) {
	conversation, err := s.conversations.GetActiveConversationByChat(ctx, binding.UserID, binding.Platform, binding.BotID, chatID)
	if err != nil {
		return nil, nil, false, false, false, err
	}
	if conversation != nil {
		conversation, err = s.ensureConversationRunner(ctx, *conversation, runner)
		if err != nil {
			return nil, nil, false, false, false, err
		}
	}
	if existingConversation, existing, err := s.findDuplicateInboundSessionByChat(ctx, binding, chatID, messageID); err != nil {
		return nil, nil, false, false, false, err
	} else if existing != nil {
		return existingConversation, existing, false, true, false, nil
	}
	if conversation == nil {
		conversation, err = s.createConversation(ctx, binding, runner, chatID)
		if err != nil {
			return nil, nil, false, false, false, err
		}
	}
	queued, err := s.isConversationBusy(ctx, *conversation)
	if err != nil {
		return nil, nil, false, false, false, err
	}
	if queued {
		followupQueued, err := s.tryEnqueueStructuredFollowup(ctx, *conversation, messageID, chat)
		if err != nil {
			return nil, nil, false, false, false, err
		}
		if followupQueued {
			return conversation, nil, true, false, true, nil
		}
	}

	session, err := s.createSession(ctx, binding.UserID, *conversation, model.AgentSessionModeContinue, chat.Message, conversation.LastSessionID)
	if err != nil {
		return nil, nil, false, false, false, err
	}
	conversation, err = s.conversations.UpdateConversationLastSession(ctx, conversation.ID, session.ID)
	if err != nil {
		return nil, nil, false, false, false, err
	}
	return conversation, session, queued, false, false, nil
}

func (s *ConversationService) resetConversation(ctx context.Context, binding model.IMBinding, runner model.AgentRunner, chatID string, chat model.ParsedAgentChatCommand) (*model.AgentConversation, *model.AgentSession, error) {
	existing, err := s.conversations.GetActiveConversationByChat(ctx, binding.UserID, binding.Platform, binding.BotID, chatID)
	if err != nil {
		return nil, nil, err
	}
	if existing != nil && existing.ID > 0 {
		if _, err := s.conversations.ArchiveConversation(ctx, existing.ID); err != nil {
			return nil, nil, err
		}
	}
	conversation, err := s.createConversation(ctx, binding, runner, chatID)
	if err != nil {
		return nil, nil, err
	}
	message := chat.Message
	if message == nil {
		defaultMessage := "开始新会话"
		if chat.Action == model.AgentChatActionReset {
			defaultMessage = "重置当前会话"
		}
		message = &defaultMessage
	}
	session, err := s.createSession(ctx, binding.UserID, *conversation, model.AgentSessionModeSystem, message, nil)
	if err != nil {
		return nil, nil, err
	}
	conversation, err = s.conversations.UpdateConversationLastSession(ctx, conversation.ID, session.ID)
	if err != nil {
		return nil, nil, err
	}
	return conversation, session, nil
}

func (s *ConversationService) getConversationStatus(ctx context.Context, binding model.IMBinding, chatID string) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.conversations.GetActiveConversationByChat(ctx, binding.UserID, binding.Platform, binding.BotID, chatID)
	if err != nil {
		return nil, nil, err
	}
	if conversation == nil || conversation.ID <= 0 {
		return nil, nil, nil
	}
	if conversation.LastSessionID == nil || *conversation.LastSessionID <= 0 {
		return conversation, nil, nil
	}
	session, err := s.sessions.GetSessionByID(ctx, *conversation.LastSessionID)
	if err != nil {
		return nil, nil, err
	}
	return conversation, session, nil
}

func (s *ConversationService) stopConversation(ctx context.Context, binding model.IMBinding, chatID string) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.conversations.GetActiveConversationByChat(ctx, binding.UserID, binding.Platform, binding.BotID, chatID)
	if err != nil {
		return nil, nil, err
	}
	if conversation == nil || conversation.ID <= 0 {
		return nil, nil, nil
	}
	if conversation.LastSessionID == nil || *conversation.LastSessionID <= 0 {
		return conversation, nil, nil
	}
	session, err := s.sessions.GetSessionByID(ctx, *conversation.LastSessionID)
	if err != nil {
		return nil, nil, err
	}
	if session == nil || session.ID <= 0 {
		return conversation, nil, nil
	}
	if session.Status == model.AgentSessionStatusCommitted || session.Status == model.AgentSessionStatusFailed || session.Status == model.AgentSessionStatusInterrupted {
		return conversation, session, nil
	}

	message := "会话已停止"
	updated, err := s.ApplyRunnerSessionUpdate(ctx, RunnerSessionUpdateInput{
		SessionID:    session.ID,
		Status:       model.AgentSessionStatusInterrupted,
		FinalMessage: &message,
	})
	if err != nil {
		return nil, nil, err
	}
	return conversation, updated, nil
}

func (s *ConversationService) fireConversation(ctx context.Context, binding model.IMBinding, chatID string, chat model.ParsedAgentChatCommand) (*model.AgentConversation, *model.AgentSession, error) {
	conversation, err := s.conversations.GetActiveConversationByChat(ctx, binding.UserID, binding.Platform, binding.BotID, chatID)
	if err != nil {
		return nil, nil, err
	}
	if conversation == nil || conversation.ID <= 0 {
		return nil, nil, nil
	}
	return s.fireConversationForConversation(ctx, *conversation, chat)
}

func (s *ConversationService) fireConversationForConversation(ctx context.Context, conversation model.AgentConversation, chat model.ParsedAgentChatCommand) (*model.AgentConversation, *model.AgentSession, error) {
	if s.mailbox == nil {
		return nil, nil, model.ErrNotConfigured("conversation service is not configured")
	}
	runner, err := s.resolvePrimaryRunnerByUser(ctx, conversation.UserID, conversation.Platform)
	if err != nil {
		return nil, nil, err
	}
	updatedConversation, err := s.ensureConversationRunner(ctx, conversation, *runner)
	if err != nil {
		return nil, nil, err
	}
	conversation = *updatedConversation
	items, err := s.mailbox.ListUndeliveredMailboxMessages(ctx, conversation.ID)
	if err != nil {
		return nil, nil, err
	}
	if len(items) == 0 {
		return &conversation, nil, nil
	}
	message, ids := buildFireSessionMessage(chat.Message, items)
	session, err := s.createSession(ctx, conversation.UserID, conversation, model.AgentSessionModeFire, &message, conversation.LastSessionID)
	if err != nil {
		return nil, nil, err
	}
	if err := s.mailbox.MarkMailboxMessagesDelivered(ctx, ids, session.ID); err != nil {
		return nil, nil, err
	}
	updated, err := s.conversations.UpdateConversationLastSession(ctx, conversation.ID, session.ID)
	if err != nil {
		return nil, nil, err
	}
	return updated, session, nil
}

func (s *ConversationService) tryAutoFireConversation(ctx context.Context, conversation model.AgentConversation) (*model.AgentConversation, *model.AgentSession, []model.AgentMailboxMessage, error) {
	if s.mailbox == nil || s.sessions == nil {
		return nil, nil, nil, model.ErrNotConfigured("conversation service is not configured")
	}
	if conversation.LastSessionID != nil && *conversation.LastSessionID > 0 {
		lastSession, err := s.sessions.GetSessionByID(ctx, *conversation.LastSessionID)
		if err != nil {
			return nil, nil, nil, err
		}
		if lastSession != nil && (lastSession.Status == model.AgentSessionStatusCreated || lastSession.Status == model.AgentSessionStatusRunning) {
			return &conversation, nil, nil, nil
		}
	}
	updatedConversation, session, err := s.fireConversationForConversation(ctx, conversation, model.ParsedAgentChatCommand{
		Action: model.AgentChatActionFire,
	})
	if err != nil {
		return nil, nil, nil, err
	}
	var items []model.AgentMailboxMessage
	if session != nil && session.UserMessage != nil {
		items, err = s.mailbox.ListMailboxMessagesDeliveredToSession(ctx, session.ID)
		if err != nil {
			return nil, nil, nil, err
		}
	}
	return updatedConversation, session, items, nil
}

func (s *ConversationService) tryAutoFollowupConversation(ctx context.Context, conversation model.AgentConversation) (*model.AgentConversation, *model.AgentSession, []model.AgentConversationFollowup, error) {
	if s == nil || s.followups == nil || s.sessions == nil {
		return &conversation, nil, nil, nil
	}
	items, err := s.followups.ListUndeliveredConversationFollowups(ctx, conversation.ID)
	if err != nil {
		return nil, nil, nil, err
	}
	if len(items) == 0 {
		return &conversation, nil, nil, nil
	}
	message, ids := buildFollowupSessionMessage(items)
	session, err := s.createSession(ctx, conversation.UserID, conversation, model.AgentSessionModeContinue, &message, conversation.LastSessionID)
	if err != nil {
		return nil, nil, nil, err
	}
	if err := s.followups.MarkConversationFollowupsDelivered(ctx, ids, session.ID); err != nil {
		return nil, nil, nil, err
	}
	updated, err := s.conversations.UpdateConversationLastSession(ctx, conversation.ID, session.ID)
	if err != nil {
		return nil, nil, nil, err
	}
	return updated, session, items, nil
}

func (s *ConversationService) forkConversation(ctx context.Context, binding model.IMBinding, runner model.AgentRunner, chatID string, chat model.ParsedAgentChatCommand) (*model.AgentConversation, *model.AgentSession, error) {
	existing, err := s.conversations.GetActiveConversationByChat(ctx, binding.UserID, binding.Platform, binding.BotID, chatID)
	if err != nil {
		return nil, nil, err
	}
	if existing == nil || existing.ID <= 0 {
		return nil, nil, nil
	}
	parentSessionID := existing.LastSessionID
	if parentSessionID == nil || *parentSessionID <= 0 {
		return nil, nil, nil
	}
	if _, err := s.conversations.ArchiveConversation(ctx, existing.ID); err != nil {
		return nil, nil, err
	}
	conversation, err := s.createConversation(ctx, binding, runner, chatID)
	if err != nil {
		return nil, nil, err
	}
	message := chat.Message
	if message == nil {
		defaultMessage := "从当前会话创建新分支"
		message = &defaultMessage
	}
	session, err := s.createSession(ctx, binding.UserID, *conversation, model.AgentSessionModeFork, message, parentSessionID)
	if err != nil {
		return nil, nil, err
	}
	conversation, err = s.conversations.UpdateConversationLastSession(ctx, conversation.ID, session.ID)
	if err != nil {
		return nil, nil, err
	}
	return conversation, session, nil
}

func (s *ConversationService) createConversation(ctx context.Context, binding model.IMBinding, runner model.AgentRunner, chatID string) (*model.AgentConversation, error) {
	now := s.now().UTC()
	return s.conversations.CreateConversation(ctx, model.AgentConversation{
		UserID:    binding.UserID,
		Platform:  binding.Platform,
		BotID:     binding.BotID,
		ChatID:    chatID,
		RunnerID:  runner.ID,
		Agent:     conversationAgentForRunner(runner),
		Status:    model.AgentConversationStatusActive,
		CreatedAt: now,
		UpdatedAt: now,
	})
}

func (s *ConversationService) createSession(ctx context.Context, userID string, conversation model.AgentConversation, mode string, message *string, parentSessionID *int64) (*model.AgentSession, error) {
	now := s.now().UTC()
	var executorRef *string
	if parentSessionID != nil && *parentSessionID > 0 && (mode == model.AgentSessionModeContinue || mode == model.AgentSessionModeFire) && s.sessions != nil {
		parent, err := s.sessions.GetSessionByID(ctx, *parentSessionID)
		if err != nil {
			return nil, err
		}
		if parent != nil && parent.ExecutorRef != nil && strings.TrimSpace(*parent.ExecutorRef) != "" {
			value := strings.TrimSpace(*parent.ExecutorRef)
			executorRef = &value
		}
	}
	session := model.AgentSession{
		UserID:          userID,
		ConversationID:  conversation.ID,
		ParentSessionID: parentSessionID,
		RunnerID:        conversation.RunnerID,
		Agent:           conversation.Agent,
		Mode:            mode,
		UserMessage:     message,
		ExecutorRef:     executorRef,
		Status:          model.AgentSessionStatusCreated,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
	return s.sessions.CreateSession(ctx, session)
}

func (s *ConversationService) isConversationBusy(ctx context.Context, conversation model.AgentConversation) (bool, error) {
	if s.sessions == nil || conversation.LastSessionID == nil || *conversation.LastSessionID <= 0 {
		return false, nil
	}
	lastSession, err := s.sessions.GetSessionByID(ctx, *conversation.LastSessionID)
	if err != nil {
		return false, err
	}
	if lastSession == nil {
		return false, nil
	}
	return lastSession.Status == model.AgentSessionStatusCreated || lastSession.Status == model.AgentSessionStatusRunning, nil
}

func (s *ConversationService) tryEnqueueStructuredFollowup(ctx context.Context, conversation model.AgentConversation, messageID string, chat model.ParsedAgentChatCommand) (bool, error) {
	if s == nil || s.followups == nil || s.sessions == nil || chat.Message == nil {
		return false, nil
	}
	payload := strings.TrimSpace(*chat.Message)
	if payload == "" {
		return false, nil
	}
	if !s.isStructuredFollowup(ctx, conversation, payload) {
		return false, nil
	}
	metadata := extractFeishuMetadata(payload)
	if strings.TrimSpace(messageID) != "" {
		metadata["message_id"] = strings.TrimSpace(messageID)
	}
	_, err := s.followups.CreateConversationFollowup(ctx, model.AgentConversationFollowup{
		ConversationID:    conversation.ID,
		PlatformMessageID: strings.TrimSpace(metadata["message_id"]),
		ThreadID:          strings.TrimSpace(metadata["thread_id"]),
		RootID:            strings.TrimSpace(metadata["root_id"]),
		ParentID:          strings.TrimSpace(metadata["parent_id"]),
		Payload:           payload,
		CreatedAt:         s.now().UTC(),
	})
	if err != nil {
		return false, err
	}
	return true, nil
}

func (s *ConversationService) isStructuredFollowup(ctx context.Context, conversation model.AgentConversation, payload string) bool {
	metadata := extractFeishuMetadata(payload)
	threadID := strings.TrimSpace(metadata["thread_id"])
	rootID := strings.TrimSpace(metadata["root_id"])
	parentID := strings.TrimSpace(metadata["parent_id"])
	if threadID == "" && rootID == "" && parentID == "" {
		return false
	}
	items, err := s.sessions.ListSessionsByConversation(ctx, conversation.ID)
	if err != nil {
		return false
	}
	for _, item := range items {
		if item.UserMessage == nil {
			continue
		}
		prior := extractFeishuMetadata(*item.UserMessage)
		if parentID != "" && strings.TrimSpace(prior["message_id"]) == parentID {
			return true
		}
		if rootID != "" && strings.TrimSpace(prior["root_id"]) == rootID {
			return true
		}
		if threadID != "" && strings.TrimSpace(prior["thread_id"]) == threadID {
			return true
		}
	}
	return false
}

func (s *ConversationService) findDuplicateInboundSessionByChat(ctx context.Context, binding model.IMBinding, chatID string, messageID string) (*model.AgentConversation, *model.AgentSession, error) {
	messageID = strings.TrimSpace(messageID)
	if s == nil || s.conversations == nil || s.sessions == nil || messageID == "" {
		return nil, nil, nil
	}
	conversations, err := s.conversations.ListConversationsByUser(ctx, binding.UserID)
	if err != nil {
		return nil, nil, err
	}
	for _, conversation := range conversations {
		if strings.TrimSpace(conversation.Platform) != strings.TrimSpace(binding.Platform) ||
			strings.TrimSpace(conversation.BotID) != strings.TrimSpace(binding.BotID) ||
			strings.TrimSpace(conversation.ChatID) != strings.TrimSpace(chatID) {
			continue
		}
		session, err := s.findDuplicateInboundSession(ctx, conversation, messageID)
		if err != nil {
			return nil, nil, err
		}
		if session != nil {
			copy := conversation
			return &copy, session, nil
		}
	}
	return nil, nil, nil
}

func (s *ConversationService) findDuplicateInboundSession(ctx context.Context, conversation model.AgentConversation, messageID string) (*model.AgentSession, error) {
	messageID = strings.TrimSpace(messageID)
	if s.sessions == nil || conversation.ID <= 0 || messageID == "" {
		return nil, nil
	}
	items, err := s.sessions.ListSessionsByConversation(ctx, conversation.ID)
	if err != nil {
		return nil, err
	}
	for i := len(items) - 1; i >= 0; i-- {
		item := items[i]
		if inboundMessageIDForSession(item) != messageID {
			continue
		}
		copy := item
		return &copy, nil
	}
	return nil, nil
}

func inboundMessageIDForSession(session model.AgentSession) string {
	if session.UserMessage == nil {
		return ""
	}
	return extractFeishuMessageID(*session.UserMessage)
}

func extractFeishuMessageID(message string) string {
	return extractFeishuMetadata(message)["message_id"]
}

func extractFeishuMetadata(message string) map[string]string {
	return map[string]string{
		"message_id": extractFeishuAttr(message, "message_id"),
		"thread_id":  extractFeishuAttr(message, "thread_id"),
		"root_id":    extractFeishuAttr(message, "root_id"),
		"parent_id":  extractFeishuAttr(message, "parent_id"),
	}
}

func extractFeishuAttr(message string, name string) string {
	message = strings.TrimSpace(message)
	name = strings.TrimSpace(name)
	if message == "" || name == "" {
		return ""
	}
	marker := name + `="`
	start := strings.Index(message, marker)
	if start < 0 {
		return ""
	}
	start += len(marker)
	end := strings.Index(message[start:], `"`)
	if end < 0 {
		return ""
	}
	return strings.TrimSpace(message[start : start+end])
}

func (s *ConversationService) ensureConversationRunner(ctx context.Context, conversation model.AgentConversation, runner model.AgentRunner) (*model.AgentConversation, error) {
	agent := conversationAgentForRunner(runner)
	if conversation.RunnerID == runner.ID && strings.TrimSpace(conversation.Agent) == agent {
		copy := conversation
		return &copy, nil
	}
	updated, err := s.conversations.UpdateConversationRunner(ctx, conversation.ID, runner.ID, agent)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, model.ErrNotFound("agent conversation not found")
	}
	return updated, nil
}

func conversationAgentForRunner(runner model.AgentRunner) string {
	value := strings.ToLower(strings.TrimSpace(runner.Agent))
	if value == "" {
		return model.AgentRunnerAgentCodex
	}
	return value
}

func trimOptionalMessage(message *string) *string {
	if message == nil {
		return nil
	}
	value := strings.TrimSpace(*message)
	if value == "" {
		return nil
	}
	return &value
}

func (s *ConversationService) resolveMailboxSourceSessionID(ctx context.Context, conversation model.AgentConversation, sourceSessionID *int64) (int64, error) {
	if sourceSessionID != nil && *sourceSessionID > 0 {
		session, err := s.sessions.GetSessionByID(ctx, *sourceSessionID)
		if err != nil {
			return 0, err
		}
		if session == nil || session.ID <= 0 {
			return 0, model.ErrNotFound("agent session not found")
		}
		if session.ConversationID != conversation.ID {
			return 0, model.ErrValidation("source session does not belong to conversation")
		}
		return session.ID, nil
	}
	if conversation.LastSessionID == nil || *conversation.LastSessionID <= 0 {
		return 0, model.ErrValidation("source session is required")
	}
	return *conversation.LastSessionID, nil
}

func buildFireSessionMessage(prefix *string, items []model.AgentMailboxMessage) (string, []int64) {
	lines := make([]string, 0, len(items)+2)
	ids := make([]int64, 0, len(items))
	if prefix != nil && strings.TrimSpace(*prefix) != "" {
		lines = append(lines, strings.TrimSpace(*prefix))
	}
	lines = append(lines, "以下是待处理的异步结果，请继续处理：")
	for idx, item := range items {
		ids = append(ids, item.ID)
		payload := strings.TrimSpace(item.Payload)
		if payload == "" {
			payload = "(empty)"
		}
		lines = append(lines, fmt.Sprintf("%d. [%s] %s", idx+1, item.SourceType, payload))
	}
	return strings.Join(lines, "\n"), ids
}

func buildFollowupSessionMessage(items []model.AgentConversationFollowup) (string, []int64) {
	lines := make([]string, 0, len(items)+2)
	ids := make([]int64, 0, len(items))
	lines = append(lines, "<feishu-follow-up-burst>")
	for _, item := range items {
		ids = append(ids, item.ID)
		attrs := make([]string, 0, 4)
		if value := strings.TrimSpace(item.PlatformMessageID); value != "" {
			attrs = append(attrs, fmt.Sprintf(`message_id="%s"`, value))
		}
		if value := strings.TrimSpace(item.ThreadID); value != "" {
			attrs = append(attrs, fmt.Sprintf(`thread_id="%s"`, value))
		}
		if value := strings.TrimSpace(item.RootID); value != "" {
			attrs = append(attrs, fmt.Sprintf(`root_id="%s"`, value))
		}
		if value := strings.TrimSpace(item.ParentID); value != "" {
			attrs = append(attrs, fmt.Sprintf(`parent_id="%s"`, value))
		}
		attrText := ""
		if len(attrs) > 0 {
			attrText = " " + strings.Join(attrs, " ")
		}
		lines = append(lines, fmt.Sprintf("  <item%s>", attrText))
		payload := strings.TrimSpace(item.Payload)
		if payload == "" {
			payload = "(empty)"
		}
		lines = append(lines, payload)
		lines = append(lines, "  </item>")
	}
	lines = append(lines, "</feishu-follow-up-burst>")
	return strings.Join(lines, "\n"), ids
}

func isTerminalAgentSessionStatus(status string) bool {
	switch strings.TrimSpace(status) {
	case model.AgentSessionStatusCommitted, model.AgentSessionStatusFailed, model.AgentSessionStatusInterrupted:
		return true
	default:
		return false
	}
}

func conversationEventTypeFromSessionStatus(status string) string {
	switch status {
	case model.AgentSessionStatusCommitted:
		return model.AgentConversationEventSessionCommitted
	case model.AgentSessionStatusFailed:
		return model.AgentConversationEventSessionFailed
	case model.AgentSessionStatusInterrupted:
		return model.AgentConversationEventSessionInterrupted
	default:
		return ""
	}
}

func buildMailboxEventSummary(items []model.AgentMailboxMessage) *string {
	if len(items) == 0 {
		return nil
	}
	first := ""
	for _, item := range items {
		payload := strings.TrimSpace(item.Payload)
		if payload == "" {
			continue
		}
		for _, part := range strings.Split(payload, "\n") {
			part = strings.TrimSpace(part)
			if part != "" {
				first = strings.Join(strings.Fields(part), " ")
				break
			}
		}
		if first != "" {
			break
		}
	}
	if first == "" {
		return nil
	}
	summary := truncateMailboxSummary(first, 48)
	if len(items) > 1 {
		summary = fmt.Sprintf("%s 等 %d 条结果", summary, len(items))
	}
	return &summary
}

func truncateMailboxSummary(value string, limit int) string {
	if limit <= 0 {
		return ""
	}
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit]) + "..."
}
