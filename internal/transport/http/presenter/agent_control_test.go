package presenter

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type agentControlTestMapper struct {
	PassthroughIDMapper
	userIDs         map[string]string
	bindingIDs      map[int64]string
	runnerIDs       map[int64]string
	conversationIDs map[int64]string
	taskIDs         map[int64]string
	sessionIDs      map[int64]string
	mailboxIDs      map[int64]string
}

func (m agentControlTestMapper) ResolveUserExternalIDs(_ context.Context, ids []string) (map[string]string, error) {
	result := make(map[string]string, len(ids))
	for _, id := range ids {
		result[id] = m.userIDs[id]
	}
	return result, nil
}

func (m agentControlTestMapper) ResolveUserExternalID(_ context.Context, id string) (string, error) {
	return m.userIDs[id], nil
}

func (m agentControlTestMapper) ResolveIMBindingExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	result := make(map[int64]string, len(ids))
	for _, id := range ids {
		result[id] = m.bindingIDs[id]
	}
	return result, nil
}

func (m agentControlTestMapper) ResolveRunnerExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	result := make(map[int64]string, len(ids))
	for _, id := range ids {
		result[id] = m.runnerIDs[id]
	}
	return result, nil
}

func (m agentControlTestMapper) ResolveAgentConversationExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	result := make(map[int64]string, len(ids))
	for _, id := range ids {
		result[id] = m.conversationIDs[id]
	}
	return result, nil
}

func (m agentControlTestMapper) ResolveAgentTaskExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	result := make(map[int64]string, len(ids))
	for _, id := range ids {
		result[id] = m.taskIDs[id]
	}
	return result, nil
}

func (m agentControlTestMapper) ResolveAgentSessionExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	result := make(map[int64]string, len(ids))
	for _, id := range ids {
		result[id] = m.sessionIDs[id]
	}
	return result, nil
}

func (m agentControlTestMapper) ResolveAgentMailboxMessageExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	result := make(map[int64]string, len(ids))
	for _, id := range ids {
		result[id] = m.mailboxIDs[id]
	}
	return result, nil
}

func TestPresentIMBinding(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 0, 0, 0, time.UTC)
	mapper := agentControlTestMapper{
		userIDs:    map[string]string{"2001": "u_2001"},
		bindingIDs: map[int64]string{11: "imb_11"},
	}

	dto, err := PresentIMBinding(context.Background(), mapper, &model.IMBinding{
		ID:        11,
		UserID:    "2001",
		Platform:  model.IMPlatformFeishu,
		BotID:     "bot-1",
		ChannelID: "chat-1",
		SenderID:  "sender-1",
		Status:    model.IMBindingStatusActive,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("PresentIMBinding() error = %v", err)
	}
	if dto.ID != "imb_11" || dto.UserID != "u_2001" {
		t.Fatalf("unexpected binding dto: %+v", dto)
	}
}

func TestPresentAgentRunner(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 5, 0, 0, time.UTC)
	lastHeartbeat := now.Add(-time.Minute)
	fixedBinding := int64(11)
	mapper := agentControlTestMapper{
		userIDs:    map[string]string{"2001": "u_2001"},
		bindingIDs: map[int64]string{11: "imb_11"},
		runnerIDs:  map[int64]string{21: "run_21"},
	}

	dto, err := PresentAgentRunner(context.Background(), mapper, &model.AgentRunner{
		ID:            21,
		UserID:        "2001",
		Name:          "mac-mini",
		Platform:      model.IMPlatformFeishu,
		FixedBinding:  &fixedBinding,
		State:         model.AgentRunnerStateIdle,
		LastHeartbeat: &lastHeartbeat,
		CreatedAt:     now,
		UpdatedAt:     now,
	})
	if err != nil {
		t.Fatalf("PresentAgentRunner() error = %v", err)
	}
	if dto.ID != "run_21" || dto.FixedBindingID == nil || *dto.FixedBindingID != "imb_11" {
		t.Fatalf("unexpected runner dto: %+v", dto)
	}
}

func TestPresentAgentTask(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 10, 0, 0, time.UTC)
	sessionID := int64(31)
	workspaceHint := "anycap"
	runnerSelector := "mac-mini"
	mapper := agentControlTestMapper{
		userIDs:    map[string]string{"2001": "u_2001"},
		runnerIDs:  map[int64]string{21: "run_21"},
		taskIDs:    map[int64]string{41: "agt_41"},
		sessionIDs: map[int64]string{31: "ags_31"},
	}

	dto, err := PresentAgentTask(context.Background(), mapper, &model.AgentTask{
		ID:             41,
		UserID:         "2001",
		RunnerID:       21,
		SessionID:      &sessionID,
		Platform:       model.IMPlatformFeishu,
		Intent:         model.AgentIntentExecuteTask,
		TaskText:       "fix parser panic",
		WorkspaceHint:  &workspaceHint,
		RunnerSelector: &runnerSelector,
		Status:         model.AgentTaskStatusRunning,
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		t.Fatalf("PresentAgentTask() error = %v", err)
	}
	if dto.ID != "agt_41" || dto.RunnerID != "run_21" || dto.SessionID == nil || *dto.SessionID != "ags_31" {
		t.Fatalf("unexpected task dto: %+v", dto)
	}
}

func TestPresentAgentTaskFailsWhenExternalIDMissing(t *testing.T) {
	mapper := agentControlTestMapper{
		userIDs:   map[string]string{"2001": "u_2001"},
		runnerIDs: map[int64]string{},
		taskIDs:   map[int64]string{41: "agt_41"},
	}

	_, err := PresentAgentTask(context.Background(), mapper, &model.AgentTask{
		ID:        41,
		UserID:    "2001",
		RunnerID:  21,
		Platform:  model.IMPlatformFeishu,
		Intent:    model.AgentIntentExecuteTask,
		TaskText:  "fix parser panic",
		Status:    model.AgentTaskStatusQueued,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})
	if err == nil {
		t.Fatal("expected missing runner external id error, got nil")
	}
}

func TestPresentAgentConversation(t *testing.T) {
	now := time.Date(2026, 4, 8, 16, 0, 0, 0, time.UTC)
	lastSessionID := int64(31)
	mapper := agentControlTestMapper{
		userIDs:         map[string]string{"2001": "u_2001"},
		runnerIDs:       map[int64]string{21: "run_21"},
		conversationIDs: map[int64]string{51: "agc_51"},
		sessionIDs:      map[int64]string{31: "ags_31"},
	}

	dto, err := PresentAgentConversation(context.Background(), mapper, &model.AgentConversation{
		ID:            51,
		UserID:        "2001",
		Platform:      model.IMPlatformFeishu,
		BotID:         "bot-1",
		ChatID:        "chat-1",
		RunnerID:      21,
		Agent:         "codex",
		Status:        model.AgentConversationStatusActive,
		LastSessionID: &lastSessionID,
		CreatedAt:     now,
		UpdatedAt:     now,
	})
	if err != nil {
		t.Fatalf("PresentAgentConversation() error = %v", err)
	}
	if dto.ID != "agc_51" || dto.RunnerID != "run_21" || dto.LastSessionID == nil || *dto.LastSessionID != "ags_31" {
		t.Fatalf("unexpected conversation dto: %+v", dto)
	}
}

func TestPresentAgentConversationWithLastSession(t *testing.T) {
	now := time.Date(2026, 4, 8, 16, 0, 0, 0, time.UTC)
	startedAt := now.Add(2 * time.Minute)
	completedAt := now.Add(5 * time.Minute)
	lastSessionID := int64(31)
	finalMessage := "已经修复 parser panic，并补了回归测试。"
	executorRef := "thread_123"
	mapper := agentControlTestMapper{
		userIDs:         map[string]string{"2001": "u_2001"},
		runnerIDs:       map[int64]string{21: "run_21"},
		conversationIDs: map[int64]string{51: "agc_51"},
		sessionIDs:      map[int64]string{31: "ags_31"},
	}

	dto, err := PresentAgentConversationWithLastSession(context.Background(), mapper, &model.AgentConversation{
		ID:            51,
		UserID:        "2001",
		Platform:      model.IMPlatformFeishu,
		BotID:         "bot-1",
		ChatID:        "chat-1",
		RunnerID:      21,
		Agent:         "codex",
		Status:        model.AgentConversationStatusActive,
		LastSessionID: &lastSessionID,
		CreatedAt:     now,
		UpdatedAt:     now,
	}, &model.AgentSession{
		ID:             31,
		UserID:         "2001",
		ConversationID: 51,
		RunnerID:       21,
		Agent:          "codex",
		Mode:           model.AgentSessionModeContinue,
		Status:         model.AgentSessionStatusCommitted,
		FinalMessage:   &finalMessage,
		ExecutorRef:    &executorRef,
		StartedAt:      &startedAt,
		CompletedAt:    &completedAt,
		CreatedAt:      now,
		UpdatedAt:      completedAt,
	})
	if err != nil {
		t.Fatalf("PresentAgentConversationWithLastSession() error = %v", err)
	}
	if dto.LastSession == nil {
		t.Fatalf("expected last_session summary, got %+v", dto)
	}
	if dto.LastSession.ID != "ags_31" || dto.LastSession.Status != model.AgentSessionStatusCommitted {
		t.Fatalf("unexpected last_session summary: %+v", dto.LastSession)
	}
	if dto.LastSession.ExecutorRef == nil || *dto.LastSession.ExecutorRef != executorRef {
		t.Fatalf("unexpected executor_ref in last_session: %+v", dto.LastSession)
	}
	if dto.LastSession.FinalMessage == nil || *dto.LastSession.FinalMessage != finalMessage {
		t.Fatalf("unexpected final_message in last_session: %+v", dto.LastSession)
	}
}

func TestPresentAgentConversationSession(t *testing.T) {
	now := time.Date(2026, 4, 8, 16, 5, 0, 0, time.UTC)
	parentID := int64(31)
	userMessage := "继续"
	finalMessage := "已完成"
	mapper := agentControlTestMapper{
		userIDs:         map[string]string{"2001": "u_2001"},
		runnerIDs:       map[int64]string{21: "run_21"},
		conversationIDs: map[int64]string{51: "agc_51"},
		sessionIDs:      map[int64]string{31: "ags_31", 41: "ags_41"},
	}

	dto, err := PresentAgentConversationSession(context.Background(), mapper, &model.AgentSession{
		ID:              41,
		UserID:          "2001",
		ConversationID:  51,
		ParentSessionID: &parentID,
		RunnerID:        21,
		Agent:           "codex",
		Mode:            model.AgentSessionModeContinue,
		UserMessage:     &userMessage,
		FinalMessage:    &finalMessage,
		Status:          model.AgentSessionStatusCommitted,
		CreatedAt:       now,
		UpdatedAt:       now,
	})
	if err != nil {
		t.Fatalf("PresentAgentConversationSession() error = %v", err)
	}
	if dto.ID != "ags_41" || dto.ConversationID != "agc_51" || dto.ParentSessionID == nil || *dto.ParentSessionID != "ags_31" {
		t.Fatalf("unexpected session dto: %+v", dto)
	}
}

func TestPresentAgentMailboxMessage(t *testing.T) {
	now := time.Date(2026, 4, 8, 16, 10, 0, 0, time.UTC)
	deliveredTo := int64(41)
	mapper := agentControlTestMapper{
		conversationIDs: map[int64]string{51: "agc_51"},
		sessionIDs:      map[int64]string{31: "ags_31", 41: "ags_41"},
		mailboxIDs:      map[int64]string{61: "agm_61"},
	}

	dto, err := PresentAgentMailboxMessage(context.Background(), mapper, &model.AgentMailboxMessage{
		ID:                   61,
		ConversationID:       51,
		SourceSessionID:      31,
		SourceType:           model.AgentMailboxSourceToolResult,
		Payload:              `{"summary":"done"}`,
		DeliveredToSessionID: &deliveredTo,
		CreatedAt:            now,
	})
	if err != nil {
		t.Fatalf("PresentAgentMailboxMessage() error = %v", err)
	}
	if dto.ID != "agm_61" || dto.ConversationID != "agc_51" || dto.DeliveredToSessionID == nil || *dto.DeliveredToSessionID != "ags_41" {
		t.Fatalf("unexpected mailbox dto: %+v", dto)
	}
}
