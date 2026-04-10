package agentcontrol

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeConversationRepo struct {
	created         []model.AgentConversation
	itemsByID       map[int64]model.AgentConversation
	activeByChatKey map[string]model.AgentConversation
	createErr       error
	getErr          error
	updateRunnerErr error
	updateLastErr   error
	archiveErr      error
	nextID          int64
}

func (r *fakeConversationRepo) CreateConversation(_ context.Context, conversation model.AgentConversation) (*model.AgentConversation, error) {
	if r.createErr != nil {
		return nil, r.createErr
	}
	r.nextID++
	conversation.ID = r.nextID
	r.created = append(r.created, conversation)
	if r.itemsByID == nil {
		r.itemsByID = map[int64]model.AgentConversation{}
	}
	r.itemsByID[conversation.ID] = conversation
	if r.activeByChatKey == nil {
		r.activeByChatKey = map[string]model.AgentConversation{}
	}
	if conversation.Status == model.AgentConversationStatusActive {
		r.activeByChatKey[conversation.UserID+"|"+conversation.Platform+"|"+conversation.BotID+"|"+conversation.ChatID] = conversation
	}
	return &conversation, nil
}

func (r *fakeConversationRepo) GetConversationByID(_ context.Context, id int64) (*model.AgentConversation, error) {
	if r.getErr != nil {
		return nil, r.getErr
	}
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *fakeConversationRepo) GetActiveConversationByChat(_ context.Context, userID string, platform string, botID string, chatID string) (*model.AgentConversation, error) {
	key := userID + "|" + platform + "|" + botID + "|" + chatID
	item, ok := r.activeByChatKey[key]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *fakeConversationRepo) ListConversationsByUser(_ context.Context, _ string) ([]model.AgentConversation, error) {
	return nil, errors.New("unexpected ListConversationsByUser call")
}

func (r *fakeConversationRepo) UpdateConversationLastSession(_ context.Context, id int64, lastSessionID int64) (*model.AgentConversation, error) {
	if r.updateLastErr != nil {
		return nil, r.updateLastErr
	}
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	item.LastSessionID = &lastSessionID
	r.itemsByID[id] = item
	if r.activeByChatKey != nil && item.Status == model.AgentConversationStatusActive {
		r.activeByChatKey[item.UserID+"|"+item.Platform+"|"+item.BotID+"|"+item.ChatID] = item
	}
	copy := item
	return &copy, nil
}

func (r *fakeConversationRepo) UpdateConversationRunner(_ context.Context, id int64, runnerID int64) (*model.AgentConversation, error) {
	if r.updateRunnerErr != nil {
		return nil, r.updateRunnerErr
	}
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	item.RunnerID = runnerID
	r.itemsByID[id] = item
	if r.activeByChatKey != nil && item.Status == model.AgentConversationStatusActive {
		r.activeByChatKey[item.UserID+"|"+item.Platform+"|"+item.BotID+"|"+item.ChatID] = item
	}
	copy := item
	return &copy, nil
}

func (r *fakeConversationRepo) ArchiveConversation(_ context.Context, id int64) (*model.AgentConversation, error) {
	if r.archiveErr != nil {
		return nil, r.archiveErr
	}
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	item.Status = model.AgentConversationStatusArchived
	r.itemsByID[id] = item
	delete(r.activeByChatKey, item.UserID+"|"+item.Platform+"|"+item.BotID+"|"+item.ChatID)
	copy := item
	return &copy, nil
}

type fakeSessionRepo struct {
	created []model.AgentSession
	nextID  int64
}

func (r *fakeSessionRepo) CreateSession(_ context.Context, session model.AgentSession) (*model.AgentSession, error) {
	r.nextID++
	session.ID = r.nextID
	r.created = append(r.created, session)
	return &session, nil
}

func (r *fakeSessionRepo) GetSessionByID(_ context.Context, id int64) (*model.AgentSession, error) {
	for _, item := range r.created {
		if item.ID == id {
			copy := item
			return &copy, nil
		}
	}
	return nil, nil
}

func (r *fakeSessionRepo) ListSessionsByConversation(_ context.Context, conversationID int64) ([]model.AgentSession, error) {
	result := make([]model.AgentSession, 0)
	for _, item := range r.created {
		if item.ConversationID == conversationID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *fakeSessionRepo) ListRunnableSessionsByRunner(_ context.Context, runnerID int64, limit int) ([]model.AgentSession, error) {
	if limit <= 0 {
		limit = 1
	}
	result := make([]model.AgentSession, 0, limit)
	for _, item := range r.created {
		if item.RunnerID == runnerID && item.Status == model.AgentSessionStatusCreated {
			result = append(result, item)
			if len(result) == limit {
				break
			}
		}
	}
	return result, nil
}

func (r *fakeSessionRepo) UpdateSession(_ context.Context, session model.AgentSession) (*model.AgentSession, error) {
	for i := range r.created {
		if r.created[i].ID == session.ID {
			r.created[i] = session
			copy := session
			return &copy, nil
		}
	}
	return nil, nil
}

type fakeMailboxRepo struct {
	items   []model.AgentMailboxMessage
	nextID  int64
	lastIDs []int64
}

func stringPtr(value string) *string {
	return &value
}

func (r *fakeMailboxRepo) CreateMailboxMessage(_ context.Context, message model.AgentMailboxMessage) (*model.AgentMailboxMessage, error) {
	r.nextID++
	message.ID = r.nextID
	r.items = append(r.items, message)
	return &message, nil
}

func (r *fakeMailboxRepo) ListUndeliveredMailboxMessages(_ context.Context, conversationID int64) ([]model.AgentMailboxMessage, error) {
	result := make([]model.AgentMailboxMessage, 0)
	for _, item := range r.items {
		if item.ConversationID == conversationID && item.DeliveredToSessionID == nil {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *fakeMailboxRepo) ListMailboxMessagesDeliveredToSession(_ context.Context, sessionID int64) ([]model.AgentMailboxMessage, error) {
	result := make([]model.AgentMailboxMessage, 0)
	for _, item := range r.items {
		if item.DeliveredToSessionID != nil && *item.DeliveredToSessionID == sessionID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *fakeMailboxRepo) MarkMailboxMessagesDelivered(_ context.Context, ids []int64, sessionID int64) error {
	r.lastIDs = ids
	for i := range r.items {
		for _, id := range ids {
			if r.items[i].ID == id {
				value := sessionID
				r.items[i].DeliveredToSessionID = &value
			}
		}
	}
	return nil
}

type fakePrimaryRunnerBinding struct {
	UserID    string
	Platform  string
	RunnerID  int64
	UpdatedAt time.Time
}

func TestConversationServiceHandleInboundMessageCreatesConversationAndSession(t *testing.T) {
	now := time.Date(2026, 4, 8, 15, 0, 0, 0, time.UTC)
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:        11,
				UserID:    "2000000001",
				Platform:  model.IMPlatformFeishu,
				BotID:     "bot_123",
				ChannelID: "oc_chat",
				SenderID:  "ou_sender",
				Status:    model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	conversations := &fakeConversationRepo{}
	sessions := &fakeSessionRepo{}
	service := NewConversationService(bindings, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "帮我看下 anycap 这个 bug",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage() error = %v", err)
	}
	if result.Conversation == nil || result.Conversation.ID == 0 {
		t.Fatalf("expected conversation, got %+v", result.Conversation)
	}
	if result.Session == nil || result.Session.Mode != model.AgentSessionModeContinue {
		t.Fatalf("expected continue session, got %+v", result.Session)
	}
	if result.Chat.Action != model.AgentChatActionContinue {
		t.Fatalf("expected continue action, got %q", result.Chat.Action)
	}
}

func TestConversationServiceHandleOwnedInboundMessageCreatesConversationAndSession(t *testing.T) {
	now := time.Date(2026, 4, 9, 12, 0, 0, 0, time.UTC)
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	conversations := &fakeConversationRepo{}
	sessions := &fakeSessionRepo{}
	service := NewConversationService(nil, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.HandleOwnedInboundMessage(context.Background(), OwnedInboundChatInput{
		UserID:   "2000000001",
		Platform: model.IMPlatformFeishu,
		BotID:    "cli_personal_bot",
		ChatID:   "oc_chat",
		SenderID: "ou_owner",
		Message:  "帮我看下 anycap 这个 bug",
	})
	if err != nil {
		t.Fatalf("HandleOwnedInboundMessage() error = %v", err)
	}
	if result.Binding == nil || result.Binding.UserID != "2000000001" {
		t.Fatalf("expected synthetic binding for owner user, got %+v", result.Binding)
	}
	if result.Conversation == nil || result.Conversation.ID == 0 {
		t.Fatalf("expected conversation, got %+v", result.Conversation)
	}
	if result.Session == nil || result.Session.Mode != model.AgentSessionModeContinue {
		t.Fatalf("expected continue session, got %+v", result.Session)
	}
	if result.Chat.Action != model.AgentChatActionContinue {
		t.Fatalf("expected continue action, got %q", result.Chat.Action)
	}
}

func TestConversationServiceHandleOwnedInboundMessageRequiresPrimaryRunner(t *testing.T) {
	now := time.Date(2026, 4, 9, 12, 30, 0, 0, time.UTC)
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
	}
	service := NewConversationService(nil, runners, &fakeConversationRepo{}, &fakeSessionRepo{}, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	_, err := service.HandleOwnedInboundMessage(context.Background(), OwnedInboundChatInput{
		UserID:   "2000000001",
		Platform: model.IMPlatformFeishu,
		BotID:    "cli_personal_bot",
		ChatID:   "oc_chat",
		SenderID: "ou_owner",
		Message:  "帮我看下 anycap 这个 bug",
	})
	if err == nil || !strings.Contains(err.Error(), "当前不在线") {
		t.Fatalf("expected offline primary runner error, got %v", err)
	}
}

func TestConversationServiceHandleOwnedInboundMessageMigratesExistingConversationToPrimaryRunner(t *testing.T) {
	now := time.Date(2026, 4, 9, 15, 40, 0, 0, time.UTC)
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			51: {
				ID:        51,
				UserID:    "2000000001",
				Platform:  model.IMPlatformFeishu,
				BotID:     "cli_personal_bot",
				ChatID:    "oc_chat",
				RunnerID:  21,
				Agent:     "codex",
				Status:    model.AgentConversationStatusActive,
				CreatedAt: now.Add(-10 * time.Minute),
				UpdatedAt: now.Add(-5 * time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|cli_personal_bot|oc_chat": {
				ID:        51,
				UserID:    "2000000001",
				Platform:  model.IMPlatformFeishu,
				BotID:     "cli_personal_bot",
				ChatID:    "oc_chat",
				RunnerID:  21,
				Agent:     "codex",
				Status:    model.AgentConversationStatusActive,
				CreatedAt: now.Add(-10 * time.Minute),
				UpdatedAt: now.Add(-5 * time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
			99: {ID: 99, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 99},
		},
	}
	sessions := &fakeSessionRepo{}
	service := NewConversationService(nil, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.HandleOwnedInboundMessage(context.Background(), OwnedInboundChatInput{
		UserID:   "2000000001",
		Platform: model.IMPlatformFeishu,
		BotID:    "cli_personal_bot",
		ChatID:   "oc_chat",
		SenderID: "ou_owner",
		Message:  "继续刚才那个任务",
	})
	if err != nil {
		t.Fatalf("HandleOwnedInboundMessage() error = %v", err)
	}
	if result.Conversation == nil || result.Conversation.RunnerID != 99 {
		t.Fatalf("expected conversation runner to migrate to 99, got %+v", result.Conversation)
	}
	if result.Session == nil || result.Session.RunnerID != 99 {
		t.Fatalf("expected session runner to use current primary runner, got %+v", result.Session)
	}
}

func TestConversationServiceHandleOwnedInboundMessageSuppressesImmediateReplyWhenPreviousSessionStillRunning(t *testing.T) {
	now := time.Date(2026, 4, 9, 15, 50, 0, 0, time.UTC)
	lastSessionID := int64(7)
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			51: {
				ID:            51,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "cli_personal_bot",
				ChatID:        "oc_chat",
				RunnerID:      99,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-10 * time.Minute),
				UpdatedAt:     now.Add(-5 * time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|cli_personal_bot|oc_chat": {
				ID:            51,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "cli_personal_bot",
				ChatID:        "oc_chat",
				RunnerID:      99,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-10 * time.Minute),
				UpdatedAt:     now.Add(-5 * time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			99: {ID: 99, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 99},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             7,
				UserID:         "2000000001",
				ConversationID: 51,
				RunnerID:       99,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusRunning,
				CreatedAt:      now.Add(-2 * time.Minute),
				UpdatedAt:      now.Add(-1 * time.Minute),
			},
		},
		nextID: 7,
	}
	service := NewConversationService(nil, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.HandleOwnedInboundMessage(context.Background(), OwnedInboundChatInput{
		UserID:   "2000000001",
		Platform: model.IMPlatformFeishu,
		BotID:    "cli_personal_bot",
		ChatID:   "oc_chat",
		SenderID: "ou_owner",
		Message:  "好的。你是谁",
	})
	if err != nil {
		t.Fatalf("HandleOwnedInboundMessage() error = %v", err)
	}
	if !result.Queued {
		t.Fatalf("expected inbound result to be marked queued, got %+v", result)
	}
	if reply := BuildInboundChatReply(*result); reply != "" {
		t.Fatalf("expected immediate reply to be suppressed for burst follow-up, got %q", reply)
	}
}

func TestConversationServiceHandleOwnedInboundMessageDedupesDuplicateMessageID(t *testing.T) {
	now := time.Date(2026, 4, 10, 4, 37, 28, 0, time.UTC)
	lastSessionID := int64(7)
	originalMessage := `<feishu-message message_id="om_x100b52b3a64844a0b4c3001d2a52d4c" chat_id="oc_chat" chat_type="p2p" message_type="text" sender_open_id="ou_owner">
哈咯
</feishu-message>`
	existingSession := model.AgentSession{
		ID:             7,
		UserID:         "2000000001",
		ConversationID: 51,
		RunnerID:       99,
		Agent:          "codex",
		Mode:           model.AgentSessionModeContinue,
		Status:         model.AgentSessionStatusCommitted,
		UserMessage:    stringPtr(originalMessage),
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			51: {
				ID:            51,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "cli_personal_bot",
				ChatID:        "oc_chat",
				RunnerID:      99,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-10 * time.Minute),
				UpdatedAt:     now.Add(-5 * time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|cli_personal_bot|oc_chat": {
				ID:            51,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "cli_personal_bot",
				ChatID:        "oc_chat",
				RunnerID:      99,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-10 * time.Minute),
				UpdatedAt:     now.Add(-5 * time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			99: {ID: 99, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 99},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{existingSession},
		nextID:  7,
	}
	service := NewConversationService(nil, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now.Add(20 * time.Second) }),
	)

	result, err := service.HandleOwnedInboundMessage(context.Background(), OwnedInboundChatInput{
		UserID:    "2000000001",
		Platform:  model.IMPlatformFeishu,
		BotID:     "cli_personal_bot",
		ChatID:    "oc_chat",
		MessageID: "om_x100b52b3a64844a0b4c3001d2a52d4c",
		SenderID:  "ou_owner",
		Message:   originalMessage,
	})
	if err != nil {
		t.Fatalf("HandleOwnedInboundMessage() error = %v", err)
	}
	if !result.Duplicated {
		t.Fatalf("expected inbound result to be marked duplicated, got %+v", result)
	}
	if result.Session == nil || result.Session.ID != 7 {
		t.Fatalf("expected existing session 7 to be reused, got %+v", result.Session)
	}
	if len(sessions.created) != 1 {
		t.Fatalf("expected no new session to be created, got %d sessions", len(sessions.created))
	}
	if reply := BuildInboundChatReply(*result); reply != "" {
		t.Fatalf("expected duplicate inbound reply to be suppressed, got %q", reply)
	}
}

func TestConversationServiceHandleInboundMessageRequiresPrimaryRunner(t *testing.T) {
	now := time.Date(2026, 4, 9, 11, 0, 0, 0, time.UTC)
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:        11,
				UserID:    "2000000001",
				Platform:  model.IMPlatformFeishu,
				BotID:     "bot_123",
				ChannelID: "oc_chat",
				SenderID:  "ou_sender",
				Status:    model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
	}
	service := NewConversationService(bindings, runners, &fakeConversationRepo{}, &fakeSessionRepo{}, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	_, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "帮我看下 anycap 这个 bug",
	})
	if err == nil || !strings.Contains(err.Error(), "当前不在线") {
		t.Fatalf("expected offline primary runner error, got %v", err)
	}
}

func TestConversationServiceHandleInboundMessageResetArchivesOldConversation(t *testing.T) {
	now := time.Date(2026, 4, 8, 15, 30, 0, 0, time.UTC)
	lastSessionID := int64(88)
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:        11,
				UserID:    "2000000001",
				Platform:  model.IMPlatformFeishu,
				BotID:     "bot_123",
				ChannelID: "oc_chat",
				SenderID:  "ou_sender",
				Status:    model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	conversations := &fakeConversationRepo{
		nextID: 1,
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
	}
	sessions := &fakeSessionRepo{}
	service := NewConversationService(bindings, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "/reset",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage() error = %v", err)
	}
	if conversations.itemsByID[1].Status != model.AgentConversationStatusArchived {
		t.Fatalf("expected old conversation archived, got %+v", conversations.itemsByID[1])
	}
	if result.Conversation == nil || result.Conversation.ID == 1 {
		t.Fatalf("expected fresh conversation, got %+v", result.Conversation)
	}
}

func TestConversationServiceGetNextSessionForRunnerReturnsCreatedSession(t *testing.T) {
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{ID: 11, UserID: "2000000001", RunnerID: 21, ConversationID: 31, Status: model.AgentSessionStatusCreated},
			{ID: 12, UserID: "2000000001", RunnerID: 21, ConversationID: 31, Status: model.AgentSessionStatusCommitted},
		},
	}
	service := NewConversationService(nil, runners, &fakeConversationRepo{}, sessions, &fakeMailboxRepo{})

	session, err := service.GetNextSessionForRunner(context.Background(), &model.Principal{
		UserID:   "2000000001",
		AuthType: "api_key",
	}, 21)
	if err != nil {
		t.Fatalf("GetNextSessionForRunner() error = %v", err)
	}
	if session == nil || session.ID != 11 {
		t.Fatalf("unexpected session %+v", session)
	}
}

func TestConversationServiceApplyRunnerSessionUpdateTransitionsStatus(t *testing.T) {
	now := time.Date(2026, 4, 8, 16, 0, 0, 0, time.UTC)
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{ID: 11, UserID: "2000000001", RunnerID: 21, ConversationID: 31, Status: model.AgentSessionStatusCreated, CreatedAt: now, UpdatedAt: now},
		},
	}
	service := NewConversationService(nil, nil, nil, sessions, nil, WithConversationClock(func() time.Time { return now }))

	running, err := service.ApplyRunnerSessionUpdate(context.Background(), RunnerSessionUpdateInput{
		SessionID: 11,
		Status:    model.AgentSessionStatusRunning,
	})
	if err != nil {
		t.Fatalf("ApplyRunnerSessionUpdate(running) error = %v", err)
	}
	if running.Status != model.AgentSessionStatusRunning || running.StartedAt == nil {
		t.Fatalf("unexpected running session %+v", running)
	}

	finalMessage := "修复完成"
	committed, err := service.ApplyRunnerSessionUpdate(context.Background(), RunnerSessionUpdateInput{
		SessionID:    11,
		Status:       model.AgentSessionStatusCommitted,
		FinalMessage: &finalMessage,
	})
	if err != nil {
		t.Fatalf("ApplyRunnerSessionUpdate(committed) error = %v", err)
	}
	if committed.Status != model.AgentSessionStatusCommitted || committed.CompletedAt == nil {
		t.Fatalf("unexpected committed session %+v", committed)
	}
	if committed.FinalMessage == nil || *committed.FinalMessage != finalMessage {
		t.Fatalf("unexpected final message %+v", committed.FinalMessage)
	}
}

func TestConversationServiceHandleInboundMessageStatusReturnsActiveConversation(t *testing.T) {
	lastSessionID := int64(11)
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:       11,
				UserID:   "2000000001",
				Platform: model.IMPlatformFeishu,
				BotID:    "bot_123",
				SenderID: "ou_sender",
				Status:   model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			31: {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{ID: 11, UserID: "2000000001", ConversationID: 31, RunnerID: 21, Status: model.AgentSessionStatusRunning},
		},
	}
	service := NewConversationService(bindings, runners, conversations, sessions, &fakeMailboxRepo{})

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "/status",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage(status) error = %v", err)
	}
	if result.Conversation == nil || result.Conversation.ID != 31 {
		t.Fatalf("unexpected conversation %+v", result.Conversation)
	}
	if result.Session == nil || result.Session.ID != 11 {
		t.Fatalf("unexpected session %+v", result.Session)
	}
}

func TestConversationServiceHandleInboundMessageStopInterruptsActiveSession(t *testing.T) {
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:       11,
				UserID:   "2000000001",
				Platform: model.IMPlatformFeishu,
				BotID:    "bot_123",
				SenderID: "ou_sender",
				Status:   model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	lastSessionID := int64(7)
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			31: {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             7,
				UserID:         "2000000001",
				ConversationID: 31,
				RunnerID:       21,
				Status:         model.AgentSessionStatusRunning,
			},
		},
	}
	service := NewConversationService(bindings, runners, conversations, sessions, &fakeMailboxRepo{})

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "/stop",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage(stop) error = %v", err)
	}
	if result.Session == nil || result.Session.Status != model.AgentSessionStatusInterrupted {
		t.Fatalf("expected interrupted session, got %+v", result.Session)
	}
	if result.Session.FinalMessage == nil || *result.Session.FinalMessage != "会话已停止" {
		t.Fatalf("unexpected final message %+v", result.Session.FinalMessage)
	}
}

func TestConversationServiceHandleInboundMessageContinueInheritsParentExecutorRef(t *testing.T) {
	lastSessionID := int64(7)
	parentExecutorRef := "019d6c4f-4859-7031-9076-87c387b3b369"
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:       11,
				UserID:   "2000000001",
				Platform: model.IMPlatformFeishu,
				BotID:    "bot_123",
				SenderID: "ou_sender",
				Status:   model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			31: {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             7,
				UserID:         "2000000001",
				ConversationID: 31,
				RunnerID:       21,
				Status:         model.AgentSessionStatusCommitted,
				ExecutorRef:    &parentExecutorRef,
			},
		},
		nextID: 7,
	}
	service := NewConversationService(bindings, runners, conversations, sessions, &fakeMailboxRepo{})

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "继续刚才的修复",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage(continue) error = %v", err)
	}
	if result.Session == nil || result.Session.ExecutorRef == nil || *result.Session.ExecutorRef != parentExecutorRef {
		t.Fatalf("expected inherited executor ref, got %+v", result.Session)
	}
}

func TestConversationServiceHandleInboundMessageForkArchivesConversationAndCreatesBranch(t *testing.T) {
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:       11,
				UserID:   "2000000001",
				Platform: model.IMPlatformFeishu,
				BotID:    "bot_123",
				SenderID: "ou_sender",
				Status:   model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	lastSessionID := int64(7)
	conversations := &fakeConversationRepo{
		nextID: 31,
		itemsByID: map[int64]model.AgentConversation{
			31: {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            31,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             7,
				UserID:         "2000000001",
				ConversationID: 31,
				RunnerID:       21,
				Status:         model.AgentSessionStatusCommitted,
			},
		},
		nextID: 7,
	}
	service := NewConversationService(bindings, runners, conversations, sessions, &fakeMailboxRepo{})

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "/fork",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage(fork) error = %v", err)
	}
	if conversations.itemsByID[31].Status != model.AgentConversationStatusArchived {
		t.Fatalf("expected archived old conversation, got %+v", conversations.itemsByID[31])
	}
	if result.Conversation == nil || result.Conversation.ID == 31 {
		t.Fatalf("expected new conversation, got %+v", result.Conversation)
	}
	if result.Session == nil || result.Session.Mode != model.AgentSessionModeFork {
		t.Fatalf("expected fork session, got %+v", result.Session)
	}
	if result.Session.ParentSessionID == nil || *result.Session.ParentSessionID != 7 {
		t.Fatalf("expected parent session 7, got %+v", result.Session.ParentSessionID)
	}
}

func TestConversationServiceApplyRunnerSessionUpdateIgnoresLateUpdateAfterInterrupted(t *testing.T) {
	service := NewConversationService(nil, nil, nil, &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             9,
				UserID:         "2000000001",
				ConversationID: 31,
				RunnerID:       21,
				Status:         model.AgentSessionStatusInterrupted,
			},
		},
	}, &fakeMailboxRepo{})

	msg := "runner says done"
	session, err := service.ApplyRunnerSessionUpdate(context.Background(), RunnerSessionUpdateInput{
		SessionID:    9,
		Status:       model.AgentSessionStatusCommitted,
		FinalMessage: &msg,
	})
	if err != nil {
		t.Fatalf("ApplyRunnerSessionUpdate error = %v", err)
	}
	if session.Status != model.AgentSessionStatusInterrupted {
		t.Fatalf("expected interrupted session, got %+v", session)
	}
	if session.FinalMessage != nil {
		t.Fatalf("expected final message unchanged, got %+v", session.FinalMessage)
	}
}

func TestConversationServiceStopConversationByIDInterruptsActiveSession(t *testing.T) {
	now := time.Date(2026, 4, 8, 19, 0, 0, 0, time.UTC)
	lastSessionID := int64(11)
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             11,
				UserID:         "2000000001",
				ConversationID: 1,
				RunnerID:       21,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusRunning,
				CreatedAt:      now.Add(-time.Minute),
				UpdatedAt:      now.Add(-time.Minute),
			},
		},
		nextID: 11,
	}
	service := NewConversationService(nil, &fakeRunnerRepo{}, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)

	conversation, session, err := service.StopConversationByID(context.Background(), &model.Principal{
		UserID:   "2000000001",
		AuthType: "api_key",
	}, 1)
	if err != nil {
		t.Fatalf("StopConversationByID() error = %v", err)
	}
	if conversation == nil || conversation.ID != 1 {
		t.Fatalf("expected conversation 1, got %+v", conversation)
	}
	if session == nil || session.Status != model.AgentSessionStatusInterrupted {
		t.Fatalf("expected interrupted session, got %+v", session)
	}
}

func TestConversationServiceResetConversationByIDArchivesAndCreatesNewConversation(t *testing.T) {
	now := time.Date(2026, 4, 8, 19, 10, 0, 0, time.UTC)
	lastSessionID := int64(11)
	conversations := &fakeConversationRepo{
		nextID: 1,
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	sessions := &fakeSessionRepo{}
	service := NewConversationService(nil, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)
	message := "重新开始，从头分析"

	conversation, session, err := service.ResetConversationByID(context.Background(), &model.Principal{
		UserID:   "2000000001",
		AuthType: "api_key",
	}, 1, &message)
	if err != nil {
		t.Fatalf("ResetConversationByID() error = %v", err)
	}
	if conversation == nil || conversation.ID == 1 {
		t.Fatalf("expected new conversation, got %+v", conversation)
	}
	if conversations.itemsByID[1].Status != model.AgentConversationStatusArchived {
		t.Fatalf("expected original conversation archived, got %+v", conversations.itemsByID[1])
	}
	if session == nil || session.Mode != model.AgentSessionModeSystem {
		t.Fatalf("expected system session, got %+v", session)
	}
	if session.UserMessage == nil || *session.UserMessage != message {
		t.Fatalf("expected custom reset message, got %+v", session)
	}
}

func TestConversationServiceForkConversationByIDCreatesBranch(t *testing.T) {
	now := time.Date(2026, 4, 8, 19, 20, 0, 0, time.UTC)
	lastSessionID := int64(11)
	conversations := &fakeConversationRepo{
		nextID: 1,
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             11,
				UserID:         "2000000001",
				ConversationID: 1,
				RunnerID:       21,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusCommitted,
				CreatedAt:      now.Add(-time.Minute),
				UpdatedAt:      now.Add(-time.Minute),
			},
		},
		nextID: 11,
	}
	service := NewConversationService(nil, runners, conversations, sessions, &fakeMailboxRepo{},
		WithConversationClock(func() time.Time { return now }),
	)
	message := "换一条思路重做"

	conversation, session, err := service.ForkConversationByID(context.Background(), &model.Principal{
		UserID:   "2000000001",
		AuthType: "api_key",
	}, 1, &message)
	if err != nil {
		t.Fatalf("ForkConversationByID() error = %v", err)
	}
	if conversation == nil || conversation.ID == 1 {
		t.Fatalf("expected new conversation branch, got %+v", conversation)
	}
	if session == nil || session.Mode != model.AgentSessionModeFork {
		t.Fatalf("expected fork session, got %+v", session)
	}
	if session.ParentSessionID == nil || *session.ParentSessionID != 11 {
		t.Fatalf("expected parent session 11, got %+v", session.ParentSessionID)
	}
}

func TestConversationServiceHandleInboundMessageFireConsumesMailbox(t *testing.T) {
	now := time.Date(2026, 4, 8, 20, 0, 0, 0, time.UTC)
	lastSessionID := int64(11)
	executorRef := "thread_123"
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:        11,
				UserID:    "2000000001",
				Platform:  model.IMPlatformFeishu,
				BotID:     "bot_123",
				ChannelID: "oc_chat",
				SenderID:  "ou_sender",
				Status:    model.IMBindingStatusActive,
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
		primaryByUserPlatform: map[string]fakePrimaryRunnerBinding{
			"2000000001|feishu": {UserID: "2000000001", Platform: model.IMPlatformFeishu, RunnerID: 21},
		},
	}
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             11,
				UserID:         "2000000001",
				ConversationID: 1,
				RunnerID:       21,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusCommitted,
				ExecutorRef:    &executorRef,
				CreatedAt:      now.Add(-time.Minute),
				UpdatedAt:      now.Add(-time.Minute),
			},
		},
		nextID: 11,
	}
	mailbox := &fakeMailboxRepo{
		items: []model.AgentMailboxMessage{
			{
				ID:              1,
				ConversationID:  1,
				SourceSessionID: 11,
				SourceType:      model.AgentMailboxSourceToolResult,
				Payload:         "测试完成：2 通过，1 失败",
				CreatedAt:       now.Add(-30 * time.Second),
			},
		},
		nextID: 1,
	}
	service := NewConversationService(bindings, runners, conversations, sessions, mailbox,
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.HandleInboundMessage(context.Background(), InboundChatInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		ChatID:   "oc_chat",
		SenderID: "ou_sender",
		Message:  "/fire",
	})
	if err != nil {
		t.Fatalf("HandleInboundMessage(/fire) error = %v", err)
	}
	if result == nil || result.Session == nil {
		t.Fatalf("expected fire session, got %+v", result)
	}
	if result.Session.Mode != model.AgentSessionModeFire {
		t.Fatalf("expected fire mode, got %+v", result.Session)
	}
	if result.Session.ExecutorRef == nil || *result.Session.ExecutorRef != executorRef {
		t.Fatalf("expected inherited executor ref, got %+v", result.Session.ExecutorRef)
	}
	if result.Session.UserMessage == nil || !strings.Contains(*result.Session.UserMessage, "测试完成：2 通过，1 失败") {
		t.Fatalf("expected mailbox payload in fire session message, got %+v", result.Session.UserMessage)
	}
	if mailbox.items[0].DeliveredToSessionID == nil || *mailbox.items[0].DeliveredToSessionID != result.Session.ID {
		t.Fatalf("expected mailbox delivered to new session, got %+v", mailbox.items[0].DeliveredToSessionID)
	}
}

func TestConversationServiceCreateMailboxAutoFiresWhenConversationIsIdle(t *testing.T) {
	now := time.Date(2026, 4, 8, 20, 10, 0, 0, time.UTC)
	lastSessionID := int64(11)
	executorRef := "thread_456"
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             11,
				UserID:         "2000000001",
				ConversationID: 1,
				RunnerID:       21,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusCommitted,
				ExecutorRef:    &executorRef,
				CreatedAt:      now.Add(-time.Minute),
				UpdatedAt:      now.Add(-time.Minute),
			},
		},
		nextID: 11,
	}
	mailbox := &fakeMailboxRepo{}
	service := NewConversationService(nil, runners, conversations, sessions, mailbox,
		WithConversationClock(func() time.Time { return now }),
	)
	principal := &model.Principal{UserID: "2000000001", AuthType: "api_key"}

	created, err := service.CreateMailboxMessageByConversationID(context.Background(), principal, 1, model.AgentMailboxSourceToolResult, "lint 完成：无错误", nil)
	if err != nil {
		t.Fatalf("CreateMailboxMessageByConversationID() error = %v", err)
	}
	if created.SourceSessionID != 11 {
		t.Fatalf("expected source session 11, got %+v", created)
	}

	items, err := service.ListMailboxMessagesByConversationID(context.Background(), principal, 1)
	if err != nil {
		t.Fatalf("ListMailboxMessagesByConversationID() error = %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("expected mailbox to auto-fire and become empty, got %+v", items)
	}
	if len(sessions.created) != 2 {
		t.Fatalf("expected auto-created fire session, got %+v", sessions.created)
	}
	session := sessions.created[1]
	conversation, err := conversations.GetConversationByID(context.Background(), 1)
	if err != nil {
		t.Fatalf("GetConversationByID() error = %v", err)
	}
	if conversation == nil {
		t.Fatalf("expected conversation after auto fire")
	}
	if conversation.LastSessionID == nil || *conversation.LastSessionID != session.ID {
		t.Fatalf("expected conversation last session to point to auto-fire session, got %+v", conversation.LastSessionID)
	}
	if conversation == nil || session.Mode != model.AgentSessionModeFire {
		t.Fatalf("unexpected fire result: conversation=%+v session=%+v", conversation, session)
	}
	if session.UserMessage == nil || !strings.Contains(*session.UserMessage, "lint 完成：无错误") {
		t.Fatalf("expected mailbox payload in fire session message, got %+v", session.UserMessage)
	}
	if session.ExecutorRef == nil || *session.ExecutorRef != executorRef {
		t.Fatalf("expected auto-fire session to inherit executor_ref, got %+v", session.ExecutorRef)
	}
	if mailbox.items[0].DeliveredToSessionID == nil || *mailbox.items[0].DeliveredToSessionID != session.ID {
		t.Fatalf("expected mailbox delivered to auto-fire session, got %+v", mailbox.items[0].DeliveredToSessionID)
	}
}

func TestConversationServiceCreateMailboxDoesNotAutoFireWhileSessionRunning(t *testing.T) {
	now := time.Date(2026, 4, 8, 20, 20, 0, 0, time.UTC)
	lastSessionID := int64(11)
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	runners := &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {ID: 21, UserID: "2000000001", Platform: model.IMPlatformFeishu},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             11,
				UserID:         "2000000001",
				ConversationID: 1,
				RunnerID:       21,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusRunning,
				CreatedAt:      now.Add(-time.Minute),
				UpdatedAt:      now.Add(-time.Minute),
			},
		},
		nextID: 11,
	}
	mailbox := &fakeMailboxRepo{}
	service := NewConversationService(nil, runners, conversations, sessions, mailbox,
		WithConversationClock(func() time.Time { return now }),
	)
	principal := &model.Principal{UserID: "2000000001", AuthType: "api_key"}

	if _, err := service.CreateMailboxMessageByConversationID(context.Background(), principal, 1, model.AgentMailboxSourceToolResult, "测试仍在运行", nil); err != nil {
		t.Fatalf("CreateMailboxMessageByConversationID() error = %v", err)
	}
	if len(sessions.created) != 1 {
		t.Fatalf("expected no auto-fire session while running, got %+v", sessions.created)
	}
	items, err := service.ListMailboxMessagesByConversationID(context.Background(), principal, 1)
	if err != nil {
		t.Fatalf("ListMailboxMessagesByConversationID() error = %v", err)
	}
	if len(items) != 1 || items[0].Payload != "测试仍在运行" {
		t.Fatalf("expected mailbox item to remain pending, got %+v", items)
	}
}

func TestConversationServiceApplyRunnerSessionUpdateAutoFiresPendingMailbox(t *testing.T) {
	now := time.Date(2026, 4, 8, 20, 30, 0, 0, time.UTC)
	lastSessionID := int64(11)
	executorRef := "thread_789"
	conversations := &fakeConversationRepo{
		itemsByID: map[int64]model.AgentConversation{
			1: {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
		activeByChatKey: map[string]model.AgentConversation{
			"2000000001|feishu|bot_123|oc_chat": {
				ID:            1,
				UserID:        "2000000001",
				Platform:      model.IMPlatformFeishu,
				BotID:         "bot_123",
				ChatID:        "oc_chat",
				RunnerID:      21,
				Agent:         "codex",
				Status:        model.AgentConversationStatusActive,
				LastSessionID: &lastSessionID,
				CreatedAt:     now.Add(-time.Hour),
				UpdatedAt:     now.Add(-time.Minute),
			},
		},
	}
	sessions := &fakeSessionRepo{
		created: []model.AgentSession{
			{
				ID:             11,
				UserID:         "2000000001",
				ConversationID: 1,
				RunnerID:       21,
				Agent:          "codex",
				Mode:           model.AgentSessionModeContinue,
				Status:         model.AgentSessionStatusRunning,
				ExecutorRef:    &executorRef,
				CreatedAt:      now.Add(-time.Minute),
				UpdatedAt:      now.Add(-time.Minute),
			},
		},
		nextID: 11,
	}
	mailbox := &fakeMailboxRepo{
		items: []model.AgentMailboxMessage{
			{
				ID:              1,
				ConversationID:  1,
				SourceSessionID: 11,
				SourceType:      model.AgentMailboxSourceToolResult,
				Payload:         "后台测试失败：TestX",
				CreatedAt:       now.Add(-10 * time.Second),
			},
		},
		nextID: 1,
	}
	service := NewConversationService(nil, nil, conversations, sessions, mailbox,
		WithConversationClock(func() time.Time { return now }),
	)

	result, err := service.ApplyRunnerSessionUpdateDetailed(context.Background(), RunnerSessionUpdateInput{
		SessionID:    11,
		Status:       model.AgentSessionStatusCommitted,
		FinalMessage: stringPtr("前台步骤完成"),
	})
	if err != nil {
		t.Fatalf("ApplyRunnerSessionUpdateDetailed() error = %v", err)
	}
	updated := result.Session
	if updated == nil || updated.Status != model.AgentSessionStatusCommitted {
		t.Fatalf("expected committed update, got %+v", updated)
	}
	if len(sessions.created) != 2 {
		t.Fatalf("expected auto-fire session after commit, got %+v", sessions.created)
	}
	autoFire := sessions.created[1]
	if result.AutoFireSession == nil || result.AutoFireSession.ID != autoFire.ID {
		t.Fatalf("expected detailed result to include auto-fire session, got %+v", result.AutoFireSession)
	}
	if result.Event == nil {
		t.Fatalf("expected detailed result to include event")
	}
	if result.Event.EventType != model.AgentConversationEventSessionCommitted {
		t.Fatalf("expected committed event, got %+v", result.Event)
	}
	if result.Event.PendingCount != 1 {
		t.Fatalf("expected pending_count=1, got %+v", result.Event)
	}
	if result.Event.MailboxSummary == nil || *result.Event.MailboxSummary != "后台测试失败：TestX" {
		t.Fatalf("expected mailbox summary in event, got %+v", result.Event)
	}
	if autoFire.Mode != model.AgentSessionModeFire {
		t.Fatalf("expected fire session, got %+v", autoFire)
	}
	if autoFire.ExecutorRef == nil || *autoFire.ExecutorRef != executorRef {
		t.Fatalf("expected fire session to inherit executor_ref, got %+v", autoFire.ExecutorRef)
	}
	if autoFire.UserMessage == nil || !strings.Contains(*autoFire.UserMessage, "后台测试失败：TestX") {
		t.Fatalf("expected fire session message to include mailbox payload, got %+v", autoFire.UserMessage)
	}
	if mailbox.items[0].DeliveredToSessionID == nil || *mailbox.items[0].DeliveredToSessionID != autoFire.ID {
		t.Fatalf("expected mailbox delivered to auto-fire session, got %+v", mailbox.items[0].DeliveredToSessionID)
	}
}
