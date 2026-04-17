package presenter

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type IMBindingDTO struct {
	ID          string  `json:"id"`
	UserID      string  `json:"user_id"`
	Platform    string  `json:"platform"`
	BotID       string  `json:"bot_id"`
	ChannelID   string  `json:"channel_id,omitempty"`
	SenderID    string  `json:"sender_id"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
	LastBoundAt *string `json:"last_bound_at,omitempty"`
}

type AgentRunnerDTO struct {
	ID             string  `json:"id"`
	UserID         string  `json:"user_id"`
	Name           string  `json:"name"`
	Platform       string  `json:"platform"`
	FixedBindingID *string `json:"fixed_binding_id,omitempty"`
	State          string  `json:"state"`
	LastHeartbeat  *string `json:"last_heartbeat,omitempty"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type AgentTaskDTO struct {
	ID             string  `json:"id"`
	UserID         string  `json:"user_id"`
	RunnerID       string  `json:"runner_id"`
	SessionID      *string `json:"session_id,omitempty"`
	Platform       string  `json:"platform"`
	Intent         string  `json:"intent"`
	TaskText       string  `json:"task_text"`
	WorkspaceHint  *string `json:"workspace_hint,omitempty"`
	RunnerSelector *string `json:"runner_selector,omitempty"`
	Status         string  `json:"status"`
	ErrorMessage   *string `json:"error_message,omitempty"`
	DispatchedAt   *string `json:"dispatched_at,omitempty"`
	StartedAt      *string `json:"started_at,omitempty"`
	CompletedAt    *string `json:"completed_at,omitempty"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type AgentConversationDTO struct {
	ID            string                           `json:"id"`
	UserID        string                           `json:"user_id"`
	Platform      string                           `json:"platform"`
	BotID         string                           `json:"bot_id"`
	ChatID        string                           `json:"chat_id"`
	RunnerID      string                           `json:"runner_id"`
	Agent         string                           `json:"agent"`
	Status        string                           `json:"status"`
	LastSessionID *string                          `json:"last_session_id,omitempty"`
	LastSession   *AgentConversationLastSessionDTO `json:"last_session,omitempty"`
	CreatedAt     string                           `json:"created_at"`
	UpdatedAt     string                           `json:"updated_at"`
}

type AgentConversationLastSessionDTO struct {
	ID           string  `json:"id"`
	Mode         string  `json:"mode"`
	Status       string  `json:"status"`
	FinalMessage *string `json:"final_message,omitempty"`
	ExecutorRef  *string `json:"executor_ref,omitempty"`
	StartedAt    *string `json:"started_at,omitempty"`
	CompletedAt  *string `json:"completed_at,omitempty"`
	UpdatedAt    string  `json:"updated_at"`
}

type AgentConversationSessionDTO struct {
	ID              string  `json:"id"`
	UserID          string  `json:"user_id"`
	ConversationID  string  `json:"conversation_id"`
	ParentSessionID *string `json:"parent_session_id,omitempty"`
	RunnerID        string  `json:"runner_id"`
	Agent           string  `json:"agent"`
	Mode            string  `json:"mode"`
	UserMessage     *string `json:"user_message,omitempty"`
	FinalMessage    *string `json:"final_message,omitempty"`
	Status          string  `json:"status"`
	ExecutorRef     *string `json:"executor_ref,omitempty"`
	StartedAt       *string `json:"started_at,omitempty"`
	CompletedAt     *string `json:"completed_at,omitempty"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
}

type AgentMailboxMessageDTO struct {
	ID                   string  `json:"id"`
	ConversationID       string  `json:"conversation_id"`
	SourceSessionID      string  `json:"source_session_id"`
	SourceType           string  `json:"source_type"`
	Payload              string  `json:"payload"`
	DeliveredToSessionID *string `json:"delivered_to_session_id,omitempty"`
	CreatedAt            string  `json:"created_at"`
}

func PresentIMBinding(ctx context.Context, mapper IDMapper, binding *model.IMBinding) (IMBindingDTO, error) {
	items, err := PresentIMBindings(ctx, mapper, []model.IMBinding{*binding})
	if err != nil {
		return IMBindingDTO{}, err
	}
	if len(items) == 0 {
		return IMBindingDTO{}, fmt.Errorf("im binding not found")
	}
	return items[0], nil
}

func PresentIMBindings(ctx context.Context, mapper IDMapper, bindings []model.IMBinding) ([]IMBindingDTO, error) {
	if len(bindings) == 0 {
		return []IMBindingDTO{}, nil
	}

	bindingIDs := make([]int64, 0, len(bindings))
	userIDs := make([]string, 0, len(bindings))
	for _, item := range bindings {
		bindingIDs = append(bindingIDs, item.ID)
		userIDs = append(userIDs, item.UserID)
	}

	bindingMap, err := mapper.ResolveIMBindingExternalIDs(ctx, bindingIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	result := make([]IMBindingDTO, 0, len(bindings))
	for _, item := range bindings {
		externalID := bindingMap[item.ID]
		userID := userMap[item.UserID]
		if externalID == "" || userID == "" {
			return nil, fmt.Errorf("failed to resolve im binding external ids")
		}

		dto := IMBindingDTO{
			ID:        externalID,
			UserID:    userID,
			Platform:  item.Platform,
			BotID:     item.BotID,
			ChannelID: item.ChannelID,
			SenderID:  item.SenderID,
			Status:    item.Status,
			CreatedAt: item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt: item.UpdatedAt.UTC().Format(TimeLayout),
		}
		if item.LastBoundAt != nil {
			value := item.LastBoundAt.UTC().Format(TimeLayout)
			dto.LastBoundAt = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentAgentRunner(ctx context.Context, mapper IDMapper, runner *model.AgentRunner) (AgentRunnerDTO, error) {
	items, err := PresentAgentRunners(ctx, mapper, []model.AgentRunner{*runner})
	if err != nil {
		return AgentRunnerDTO{}, err
	}
	if len(items) == 0 {
		return AgentRunnerDTO{}, fmt.Errorf("agent runner not found")
	}
	return items[0], nil
}

func PresentAgentRunners(ctx context.Context, mapper IDMapper, runners []model.AgentRunner) ([]AgentRunnerDTO, error) {
	if len(runners) == 0 {
		return []AgentRunnerDTO{}, nil
	}

	runnerIDs := make([]int64, 0, len(runners))
	bindingIDs := make([]int64, 0, len(runners))
	userIDs := make([]string, 0, len(runners))
	for _, item := range runners {
		runnerIDs = append(runnerIDs, item.ID)
		userIDs = append(userIDs, item.UserID)
		if item.FixedBinding != nil {
			bindingIDs = append(bindingIDs, *item.FixedBinding)
		}
	}

	runnerMap, err := mapper.ResolveRunnerExternalIDs(ctx, runnerIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}
	bindingMap, err := mapper.ResolveIMBindingExternalIDs(ctx, bindingIDs)
	if err != nil {
		return nil, err
	}

	result := make([]AgentRunnerDTO, 0, len(runners))
	for _, item := range runners {
		externalID := runnerMap[item.ID]
		userID := userMap[item.UserID]
		if externalID == "" || userID == "" {
			return nil, fmt.Errorf("failed to resolve agent runner external ids")
		}

		dto := AgentRunnerDTO{
			ID:        externalID,
			UserID:    userID,
			Name:      item.Name,
			Platform:  item.Platform,
			State:     item.State,
			CreatedAt: item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt: item.UpdatedAt.UTC().Format(TimeLayout),
		}
		if item.FixedBinding != nil {
			value := bindingMap[*item.FixedBinding]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve agent runner fixed binding id")
			}
			dto.FixedBindingID = &value
		}
		if item.LastHeartbeat != nil {
			value := item.LastHeartbeat.UTC().Format(TimeLayout)
			dto.LastHeartbeat = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentAgentTask(ctx context.Context, mapper IDMapper, task *model.AgentTask) (AgentTaskDTO, error) {
	items, err := PresentAgentTasks(ctx, mapper, []model.AgentTask{*task})
	if err != nil {
		return AgentTaskDTO{}, err
	}
	if len(items) == 0 {
		return AgentTaskDTO{}, fmt.Errorf("agent task not found")
	}
	return items[0], nil
}

func PresentAgentTasks(ctx context.Context, mapper IDMapper, tasks []model.AgentTask) ([]AgentTaskDTO, error) {
	if len(tasks) == 0 {
		return []AgentTaskDTO{}, nil
	}

	taskIDs := make([]int64, 0, len(tasks))
	runnerIDs := make([]int64, 0, len(tasks))
	sessionIDs := make([]int64, 0, len(tasks))
	userIDs := make([]string, 0, len(tasks))
	for _, item := range tasks {
		taskIDs = append(taskIDs, item.ID)
		runnerIDs = append(runnerIDs, item.RunnerID)
		userIDs = append(userIDs, item.UserID)
		if item.SessionID != nil {
			sessionIDs = append(sessionIDs, *item.SessionID)
		}
	}

	taskMap, err := mapper.ResolveAgentTaskExternalIDs(ctx, taskIDs)
	if err != nil {
		return nil, err
	}
	runnerMap, err := mapper.ResolveRunnerExternalIDs(ctx, runnerIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}
	sessionMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, sessionIDs)
	if err != nil {
		return nil, err
	}

	result := make([]AgentTaskDTO, 0, len(tasks))
	for _, item := range tasks {
		externalID := taskMap[item.ID]
		runnerID := runnerMap[item.RunnerID]
		userID := userMap[item.UserID]
		if externalID == "" || runnerID == "" || userID == "" {
			return nil, fmt.Errorf("failed to resolve agent task external ids")
		}

		dto := AgentTaskDTO{
			ID:             externalID,
			UserID:         userID,
			RunnerID:       runnerID,
			Platform:       item.Platform,
			Intent:         item.Intent,
			TaskText:       item.TaskText,
			WorkspaceHint:  item.WorkspaceHint,
			RunnerSelector: item.RunnerSelector,
			Status:         item.Status,
			ErrorMessage:   item.ErrorMessage,
			CreatedAt:      item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt:      item.UpdatedAt.UTC().Format(TimeLayout),
		}
		if item.SessionID != nil {
			value := sessionMap[*item.SessionID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve agent task session id")
			}
			dto.SessionID = &value
		}
		if item.DispatchedAt != nil {
			value := item.DispatchedAt.UTC().Format(TimeLayout)
			dto.DispatchedAt = &value
		}
		if item.StartedAt != nil {
			value := item.StartedAt.UTC().Format(TimeLayout)
			dto.StartedAt = &value
		}
		if item.CompletedAt != nil {
			value := item.CompletedAt.UTC().Format(TimeLayout)
			dto.CompletedAt = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentAgentConversation(ctx context.Context, mapper IDMapper, conversation *model.AgentConversation) (AgentConversationDTO, error) {
	items, err := PresentAgentConversations(ctx, mapper, []model.AgentConversation{*conversation})
	if err != nil {
		return AgentConversationDTO{}, err
	}
	if len(items) == 0 {
		return AgentConversationDTO{}, fmt.Errorf("agent conversation not found")
	}
	return items[0], nil
}

func PresentAgentConversationWithLastSession(ctx context.Context, mapper IDMapper, conversation *model.AgentConversation, lastSession *model.AgentSession) (AgentConversationDTO, error) {
	items, err := PresentAgentConversationsWithLastSessions(ctx, mapper, []model.AgentConversation{*conversation}, map[int64]model.AgentSession{
		conversation.ID: derefSession(lastSession),
	})
	if err != nil {
		return AgentConversationDTO{}, err
	}
	if len(items) == 0 {
		return AgentConversationDTO{}, fmt.Errorf("agent conversation not found")
	}
	return items[0], nil
}

func PresentAgentConversations(ctx context.Context, mapper IDMapper, conversations []model.AgentConversation) ([]AgentConversationDTO, error) {
	return PresentAgentConversationsWithLastSessions(ctx, mapper, conversations, nil)
}

func PresentAgentConversationsWithLastSessions(ctx context.Context, mapper IDMapper, conversations []model.AgentConversation, lastSessionsByConversationID map[int64]model.AgentSession) ([]AgentConversationDTO, error) {
	if len(conversations) == 0 {
		return []AgentConversationDTO{}, nil
	}

	conversationIDs := make([]int64, 0, len(conversations))
	runnerIDs := make([]int64, 0, len(conversations))
	sessionIDs := make([]int64, 0, len(conversations))
	userIDs := make([]string, 0, len(conversations))
	for _, item := range conversations {
		conversationIDs = append(conversationIDs, item.ID)
		runnerIDs = append(runnerIDs, item.RunnerID)
		userIDs = append(userIDs, item.UserID)
		if item.LastSessionID != nil {
			sessionIDs = append(sessionIDs, *item.LastSessionID)
		}
	}

	conversationMap, err := mapper.ResolveAgentConversationExternalIDs(ctx, conversationIDs)
	if err != nil {
		return nil, err
	}
	runnerMap, err := mapper.ResolveRunnerExternalIDs(ctx, runnerIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}
	sessionMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, sessionIDs)
	if err != nil {
		return nil, err
	}

	result := make([]AgentConversationDTO, 0, len(conversations))
	lastSessionSummaries := map[int64]*AgentConversationLastSessionDTO{}
	if len(lastSessionsByConversationID) > 0 {
		summaries, err := presentConversationLastSessions(ctx, mapper, lastSessionsByConversationID)
		if err != nil {
			return nil, err
		}
		lastSessionSummaries = summaries
	}
	for _, item := range conversations {
		externalID := conversationMap[item.ID]
		runnerID := runnerMap[item.RunnerID]
		userID := userMap[item.UserID]
		if externalID == "" || runnerID == "" || userID == "" {
			return nil, fmt.Errorf("failed to resolve agent conversation external ids")
		}

		dto := AgentConversationDTO{
			ID:        externalID,
			UserID:    userID,
			Platform:  item.Platform,
			BotID:     item.BotID,
			ChatID:    item.ChatID,
			RunnerID:  runnerID,
			Agent:     item.Agent,
			Status:    item.Status,
			CreatedAt: item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt: item.UpdatedAt.UTC().Format(TimeLayout),
		}
		if item.LastSessionID != nil {
			value := sessionMap[*item.LastSessionID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve agent conversation last session id")
			}
			dto.LastSessionID = &value
		}
		if summary, ok := lastSessionSummaries[item.ID]; ok {
			dto.LastSession = summary
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentAgentConversationSession(ctx context.Context, mapper IDMapper, session *model.AgentSession) (AgentConversationSessionDTO, error) {
	items, err := PresentAgentConversationSessions(ctx, mapper, []model.AgentSession{*session})
	if err != nil {
		return AgentConversationSessionDTO{}, err
	}
	if len(items) == 0 {
		return AgentConversationSessionDTO{}, fmt.Errorf("agent conversation session not found")
	}
	return items[0], nil
}

func PresentAgentConversationSessions(ctx context.Context, mapper IDMapper, sessions []model.AgentSession) ([]AgentConversationSessionDTO, error) {
	if len(sessions) == 0 {
		return []AgentConversationSessionDTO{}, nil
	}

	sessionIDs := make([]int64, 0, len(sessions))
	conversationIDs := make([]int64, 0, len(sessions))
	runnerIDs := make([]int64, 0, len(sessions))
	parentSessionIDs := make([]int64, 0, len(sessions))
	userIDs := make([]string, 0, len(sessions))
	for _, item := range sessions {
		sessionIDs = append(sessionIDs, item.ID)
		conversationIDs = append(conversationIDs, item.ConversationID)
		runnerIDs = append(runnerIDs, item.RunnerID)
		userIDs = append(userIDs, item.UserID)
		if item.ParentSessionID != nil {
			parentSessionIDs = append(parentSessionIDs, *item.ParentSessionID)
		}
	}

	sessionMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, sessionIDs)
	if err != nil {
		return nil, err
	}
	conversationMap, err := mapper.ResolveAgentConversationExternalIDs(ctx, conversationIDs)
	if err != nil {
		return nil, err
	}
	runnerMap, err := mapper.ResolveRunnerExternalIDs(ctx, runnerIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}
	parentMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, parentSessionIDs)
	if err != nil {
		return nil, err
	}

	result := make([]AgentConversationSessionDTO, 0, len(sessions))
	for _, item := range sessions {
		externalID := sessionMap[item.ID]
		conversationID := conversationMap[item.ConversationID]
		runnerID := runnerMap[item.RunnerID]
		userID := userMap[item.UserID]
		if externalID == "" || conversationID == "" || runnerID == "" || userID == "" {
			return nil, fmt.Errorf("failed to resolve agent conversation session external ids")
		}
		dto := AgentConversationSessionDTO{
			ID:             externalID,
			UserID:         userID,
			ConversationID: conversationID,
			RunnerID:       runnerID,
			Agent:          item.Agent,
			Mode:           item.Mode,
			UserMessage:    item.UserMessage,
			FinalMessage:   item.FinalMessage,
			Status:         item.Status,
			ExecutorRef:    item.ExecutorRef,
			CreatedAt:      item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt:      item.UpdatedAt.UTC().Format(TimeLayout),
		}
		if item.ParentSessionID != nil {
			value := parentMap[*item.ParentSessionID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve parent agent session id")
			}
			dto.ParentSessionID = &value
		}
		if item.StartedAt != nil {
			value := item.StartedAt.UTC().Format(TimeLayout)
			dto.StartedAt = &value
		}
		if item.CompletedAt != nil {
			value := item.CompletedAt.UTC().Format(TimeLayout)
			dto.CompletedAt = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentAgentMailboxMessage(ctx context.Context, mapper IDMapper, message *model.AgentMailboxMessage) (AgentMailboxMessageDTO, error) {
	items, err := PresentAgentMailboxMessages(ctx, mapper, []model.AgentMailboxMessage{*message})
	if err != nil {
		return AgentMailboxMessageDTO{}, err
	}
	if len(items) == 0 {
		return AgentMailboxMessageDTO{}, fmt.Errorf("agent mailbox message not found")
	}
	return items[0], nil
}

func PresentAgentMailboxMessages(ctx context.Context, mapper IDMapper, messages []model.AgentMailboxMessage) ([]AgentMailboxMessageDTO, error) {
	if len(messages) == 0 {
		return []AgentMailboxMessageDTO{}, nil
	}

	mailboxIDs := make([]int64, 0, len(messages))
	conversationIDs := make([]int64, 0, len(messages))
	sourceSessionIDs := make([]int64, 0, len(messages))
	deliveredSessionIDs := make([]int64, 0, len(messages))
	for _, item := range messages {
		mailboxIDs = append(mailboxIDs, item.ID)
		conversationIDs = append(conversationIDs, item.ConversationID)
		sourceSessionIDs = append(sourceSessionIDs, item.SourceSessionID)
		if item.DeliveredToSessionID != nil {
			deliveredSessionIDs = append(deliveredSessionIDs, *item.DeliveredToSessionID)
		}
	}

	mailboxMap, err := mapper.ResolveAgentMailboxMessageExternalIDs(ctx, mailboxIDs)
	if err != nil {
		return nil, err
	}
	conversationMap, err := mapper.ResolveAgentConversationExternalIDs(ctx, conversationIDs)
	if err != nil {
		return nil, err
	}
	sourceMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, sourceSessionIDs)
	if err != nil {
		return nil, err
	}
	deliveredMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, deliveredSessionIDs)
	if err != nil {
		return nil, err
	}

	result := make([]AgentMailboxMessageDTO, 0, len(messages))
	for _, item := range messages {
		externalID := mailboxMap[item.ID]
		conversationID := conversationMap[item.ConversationID]
		sourceSessionID := sourceMap[item.SourceSessionID]
		if externalID == "" || conversationID == "" || sourceSessionID == "" {
			return nil, fmt.Errorf("failed to resolve agent mailbox message external ids")
		}
		dto := AgentMailboxMessageDTO{
			ID:              externalID,
			ConversationID:  conversationID,
			SourceSessionID: sourceSessionID,
			SourceType:      item.SourceType,
			Payload:         item.Payload,
			CreatedAt:       item.CreatedAt.UTC().Format(TimeLayout),
		}
		if item.DeliveredToSessionID != nil {
			value := deliveredMap[*item.DeliveredToSessionID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve delivered agent session id")
			}
			dto.DeliveredToSessionID = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func presentConversationLastSessions(ctx context.Context, mapper IDMapper, lastSessionsByConversationID map[int64]model.AgentSession) (map[int64]*AgentConversationLastSessionDTO, error) {
	if len(lastSessionsByConversationID) == 0 {
		return map[int64]*AgentConversationLastSessionDTO{}, nil
	}

	sessionIDs := make([]int64, 0, len(lastSessionsByConversationID))
	for _, session := range lastSessionsByConversationID {
		if session.ID > 0 {
			sessionIDs = append(sessionIDs, session.ID)
		}
	}

	sessionMap, err := mapper.ResolveAgentSessionExternalIDs(ctx, sessionIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[int64]*AgentConversationLastSessionDTO, len(lastSessionsByConversationID))
	for conversationID, session := range lastSessionsByConversationID {
		if session.ID <= 0 {
			continue
		}
		externalID := sessionMap[session.ID]
		if externalID == "" {
			return nil, fmt.Errorf("failed to resolve agent conversation last session summary id")
		}

		dto := &AgentConversationLastSessionDTO{
			ID:           externalID,
			Mode:         session.Mode,
			Status:       session.Status,
			FinalMessage: session.FinalMessage,
			ExecutorRef:  session.ExecutorRef,
			UpdatedAt:    session.UpdatedAt.UTC().Format(TimeLayout),
		}
		if session.StartedAt != nil {
			value := session.StartedAt.UTC().Format(TimeLayout)
			dto.StartedAt = &value
		}
		if session.CompletedAt != nil {
			value := session.CompletedAt.UTC().Format(TimeLayout)
			dto.CompletedAt = &value
		}
		result[conversationID] = dto
	}
	return result, nil
}

func derefSession(session *model.AgentSession) model.AgentSession {
	if session == nil {
		return model.AgentSession{}
	}
	return *session
}
