package agentcontrol

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strconv"
	"strings"
	"testing"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	infraim "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type testFeatureProvider struct {
	enabled bool
}

func (p testFeatureProvider) EnabledFor(_ *model.Principal, _ string) (bool, bool) {
	return p.enabled, p.enabled
}

type testBindTokenRepo struct {
	token model.IMBindToken
}

func (r *testBindTokenRepo) CreateIMBindToken(_ context.Context, token model.IMBindToken) (*model.IMBindToken, error) {
	r.token = token
	r.token.ID = 1
	return &r.token, nil
}

func (r *testBindTokenRepo) GetIMBindTokenByToken(_ context.Context, token string) (*model.IMBindToken, error) {
	if token != r.token.Token {
		return nil, nil
	}
	copy := r.token
	return &copy, nil
}

func (r *testBindTokenRepo) MarkIMBindTokenUsed(_ context.Context, id int64) error {
	if id == r.token.ID {
		now := time.Now().UTC()
		r.token.UsedAt = &now
	}
	return nil
}

type testBindingRepo struct {
	items []model.IMBinding
}

func (r *testBindingRepo) CreateBinding(_ context.Context, binding model.IMBinding) (*model.IMBinding, error) {
	binding.ID = int64(len(r.items) + 1)
	r.items = append(r.items, binding)
	return &binding, nil
}

func (r *testBindingRepo) GetActiveByPlatformSender(_ context.Context, platform string, botID string, senderID string) (*model.IMBinding, error) {
	for _, item := range r.items {
		if item.Platform == platform && item.BotID == botID && item.SenderID == senderID && item.Status == model.IMBindingStatusActive {
			copy := item
			return &copy, nil
		}
	}
	return nil, nil
}

func (r *testBindingRepo) ListBindingsByUser(_ context.Context, userID string) ([]model.IMBinding, error) {
	result := make([]model.IMBinding, 0)
	for _, item := range r.items {
		if item.UserID == userID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *testBindingRepo) RevokeBinding(_ context.Context, id int64) error {
	for i := range r.items {
		if r.items[i].ID == id {
			r.items[i].Status = model.IMBindingStatusRevoked
			return nil
		}
	}
	return model.ErrNotFound("binding not found")
}

type testRunnerRepo struct {
	items                 map[int64]model.AgentRunner
	primaryByUserPlatform map[string]model.AgentPrimaryRunner
}

func (r *testRunnerRepo) CreateRunner(_ context.Context, runner model.AgentRunner) (*model.AgentRunner, error) {
	if r.items == nil {
		r.items = map[int64]model.AgentRunner{}
	}
	runner.ID = int64(len(r.items) + 1)
	r.items[runner.ID] = runner
	return &runner, nil
}

func (r *testRunnerRepo) GetRunnerByID(_ context.Context, id int64) (*model.AgentRunner, error) {
	item, ok := r.items[id]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *testRunnerRepo) GetPrimaryRunner(_ context.Context, userID string, platform string) (*model.AgentPrimaryRunner, error) {
	if r.primaryByUserPlatform == nil {
		return nil, nil
	}
	item, ok := r.primaryByUserPlatform[userID+"|"+platform]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *testRunnerRepo) ListRunnersByUser(_ context.Context, _ string) ([]model.AgentRunner, error) {
	return nil, nil
}

func (r *testRunnerRepo) ClaimPrimaryRunner(_ context.Context, userID string, platform string, runnerID int64, updatedAt time.Time) (*model.AgentPrimaryRunner, error) {
	if r.primaryByUserPlatform == nil {
		r.primaryByUserPlatform = map[string]model.AgentPrimaryRunner{}
	}
	item := model.AgentPrimaryRunner{
		ID:        int64(len(r.primaryByUserPlatform) + 1),
		UserID:    userID,
		Platform:  platform,
		RunnerID:  runnerID,
		UpdatedAt: updatedAt,
	}
	r.primaryByUserPlatform[userID+"|"+platform] = item
	copy := item
	return &copy, nil
}

func (r *testRunnerRepo) UpdateRunnerState(_ context.Context, id int64, state string) (*model.AgentRunner, error) {
	item, ok := r.items[id]
	if !ok {
		return nil, nil
	}
	item.State = state
	r.items[id] = item
	copy := item
	return &copy, nil
}

type testConversationRepo struct {
	itemsByID       map[int64]model.AgentConversation
	activeByChatKey map[string]model.AgentConversation
	nextID          int64
}

func (r *testConversationRepo) CreateConversation(_ context.Context, conversation model.AgentConversation) (*model.AgentConversation, error) {
	r.nextID++
	conversation.ID = r.nextID
	if r.itemsByID == nil {
		r.itemsByID = map[int64]model.AgentConversation{}
	}
	if r.activeByChatKey == nil {
		r.activeByChatKey = map[string]model.AgentConversation{}
	}
	r.itemsByID[conversation.ID] = conversation
	if conversation.Status == model.AgentConversationStatusActive {
		r.activeByChatKey[conversation.UserID+"|"+conversation.Platform+"|"+conversation.BotID+"|"+conversation.ChatID] = conversation
	}
	return &conversation, nil
}

func (r *testConversationRepo) GetConversationByID(_ context.Context, id int64) (*model.AgentConversation, error) {
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *testConversationRepo) GetActiveConversationByChat(_ context.Context, userID string, platform string, botID string, chatID string) (*model.AgentConversation, error) {
	item, ok := r.activeByChatKey[userID+"|"+platform+"|"+botID+"|"+chatID]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *testConversationRepo) ListConversationsByUser(_ context.Context, _ string) ([]model.AgentConversation, error) {
	result := make([]model.AgentConversation, 0, len(r.itemsByID))
	for _, item := range r.itemsByID {
		result = append(result, item)
	}
	return result, nil
}

func (r *testConversationRepo) UpdateConversationLastSession(_ context.Context, id int64, lastSessionID int64) (*model.AgentConversation, error) {
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	item.LastSessionID = &lastSessionID
	r.itemsByID[id] = item
	if item.Status == model.AgentConversationStatusActive {
		r.activeByChatKey[item.UserID+"|"+item.Platform+"|"+item.BotID+"|"+item.ChatID] = item
	}
	copy := item
	return &copy, nil
}

func (r *testConversationRepo) UpdateConversationRunner(_ context.Context, id int64, runnerID int64, agent string) (*model.AgentConversation, error) {
	item, ok := r.itemsByID[id]
	if !ok {
		return nil, nil
	}
	item.RunnerID = runnerID
	item.Agent = agent
	r.itemsByID[id] = item
	if item.Status == model.AgentConversationStatusActive {
		r.activeByChatKey[item.UserID+"|"+item.Platform+"|"+item.BotID+"|"+item.ChatID] = item
	}
	copy := item
	return &copy, nil
}

func (r *testConversationRepo) ArchiveConversation(_ context.Context, id int64) (*model.AgentConversation, error) {
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

type testSessionRepo struct {
	items []model.AgentSession
}

func (r *testSessionRepo) CreateSession(_ context.Context, session model.AgentSession) (*model.AgentSession, error) {
	session.ID = int64(len(r.items) + 1)
	r.items = append(r.items, session)
	return &session, nil
}

func (r *testSessionRepo) GetSessionByID(_ context.Context, id int64) (*model.AgentSession, error) {
	for _, item := range r.items {
		if item.ID == id {
			copy := item
			return &copy, nil
		}
	}
	return nil, nil
}

func (r *testSessionRepo) ListSessionsByConversation(_ context.Context, conversationID int64) ([]model.AgentSession, error) {
	result := make([]model.AgentSession, 0)
	for _, item := range r.items {
		if item.ConversationID == conversationID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *testSessionRepo) ListRunnableSessionsByRunner(_ context.Context, runnerID int64, limit int) ([]model.AgentSession, error) {
	if limit <= 0 {
		limit = 1
	}
	result := make([]model.AgentSession, 0, limit)
	for _, item := range r.items {
		if item.RunnerID == runnerID && item.Status == model.AgentSessionStatusCreated {
			result = append(result, item)
			if len(result) == limit {
				break
			}
		}
	}
	return result, nil
}

func (r *testSessionRepo) UpdateSession(_ context.Context, session model.AgentSession) (*model.AgentSession, error) {
	for i := range r.items {
		if r.items[i].ID == session.ID {
			r.items[i] = session
			return &session, nil
		}
	}
	return nil, nil
}

type testMailboxRepo struct {
	items  []model.AgentMailboxMessage
	nextID int64
}

func (r *testMailboxRepo) CreateMailboxMessage(_ context.Context, message model.AgentMailboxMessage) (*model.AgentMailboxMessage, error) {
	r.nextID++
	message.ID = r.nextID
	r.items = append(r.items, message)
	return &message, nil
}

func (r *testMailboxRepo) ListUndeliveredMailboxMessages(_ context.Context, conversationID int64) ([]model.AgentMailboxMessage, error) {
	result := make([]model.AgentMailboxMessage, 0)
	for _, item := range r.items {
		if item.ConversationID == conversationID && item.DeliveredToSessionID == nil {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *testMailboxRepo) ListMailboxMessagesDeliveredToSession(_ context.Context, sessionID int64) ([]model.AgentMailboxMessage, error) {
	result := make([]model.AgentMailboxMessage, 0)
	for _, item := range r.items {
		if item.DeliveredToSessionID != nil && *item.DeliveredToSessionID == sessionID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *testMailboxRepo) MarkMailboxMessagesDelivered(_ context.Context, ids []int64, sessionID int64) error {
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

type testWebhookAdapter struct {
	base          webhookAdapter
	sentMessages  []string
	sentChannelID []string
}

func (a *testWebhookAdapter) VerifyAndNormalize(req *http.Request) (infraim.NormalizedInboundEvent, error) {
	return a.base.VerifyAndNormalize(req)
}

func (a *testWebhookAdapter) SendMessage(_ context.Context, binding model.IMBinding, message string) error {
	a.sentMessages = append(a.sentMessages, message)
	a.sentChannelID = append(a.sentChannelID, binding.ChannelID)
	return nil
}

func (a *testWebhookAdapter) SendAccepted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error {
	return a.base.SendAccepted(ctx, binding, task)
}

func (a *testWebhookAdapter) SendCompleted(ctx context.Context, binding model.IMBinding, task model.AgentTask) error {
	return a.base.SendCompleted(ctx, binding, task)
}

func (a *testWebhookAdapter) SendFailure(ctx context.Context, binding model.IMBinding, task model.AgentTask) error {
	return a.base.SendFailure(ctx, binding, task)
}

func TestWebhookRouteAcceptsValidFeishuEventWithoutAuth(t *testing.T) {
	engine, _, _, _, _ := newAgentControlTestEngine(t, true)

	body := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(body))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestWebhookRouteRejectsInvalidSignature(t *testing.T) {
	engine, _, _, _, _ := newAgentControlTestEngine(t, true)

	body := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: "bad-signature"},
	)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestProtectedRoutesRequireAuth(t *testing.T) {
	engine, _, _, _, _ := newAgentControlTestEngine(t, true)

	cases := []struct {
		name   string
		method string
		path   string
		body   string
	}{
		{name: "bind token", method: http.MethodPost, path: "/v1/agent/im-bindings/token", body: `{"platform":"feishu"}`},
		{name: "conversations list", method: http.MethodGet, path: "/v1/agent/conversations"},
		{name: "conversation get", method: http.MethodGet, path: "/v1/agent/conversations/1"},
		{name: "conversation sessions", method: http.MethodGet, path: "/v1/agent/conversations/1/sessions"},
		{name: "conversation mailbox list", method: http.MethodGet, path: "/v1/agent/conversations/1/mailbox"},
		{name: "conversation mailbox create", method: http.MethodPost, path: "/v1/agent/conversations/1/mailbox", body: `{"source_type":"tool_result","payload":"done"}`},
		{name: "conversation stop", method: http.MethodPost, path: "/v1/agent/conversations/1/stop", body: `{}`},
		{name: "conversation reset", method: http.MethodPost, path: "/v1/agent/conversations/1/reset", body: `{}`},
		{name: "conversation fork", method: http.MethodPost, path: "/v1/agent/conversations/1/fork", body: `{}`},
		{name: "conversation fire", method: http.MethodPost, path: "/v1/agent/conversations/1/fire", body: `{}`},
		{name: "task get", method: http.MethodGet, path: "/v1/agent/tasks/1"},
		{name: "task cancel", method: http.MethodPost, path: "/v1/agent/tasks/1/cancel", body: `{}`},
		{name: "runner next task", method: http.MethodGet, path: "/v1/agent/runners/1/tasks/next"},
		{name: "runner next session", method: http.MethodGet, path: "/v1/agent/runners/1/sessions/next"},
		{name: "runner update", method: http.MethodPost, path: "/v1/agent/runners/1/tasks/1", body: `{"status":"running"}`},
		{name: "runner session update", method: http.MethodPost, path: "/v1/agent/runners/1/sessions/1", body: `{"status":"running"}`},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var bodyArg *ut.Body
			if tc.body != "" {
				bodyArg = &ut.Body{Body: bytes.NewReader([]byte(tc.body)), Len: len(tc.body)}
			}
			resp := ut.PerformRequest(engine.Engine, tc.method, tc.path, bodyArg)
			if resp.Code != http.StatusUnauthorized {
				t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
			}
		})
	}
}

func TestWebhookRouteReturnsFeatureDisabled(t *testing.T) {
	engine, _, _, _, _ := newAgentControlTestEngine(t, false)

	body := []byte(`{"type":"url_verification","token":"verify_token","challenge":"challenge-123"}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
	)
	if resp.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestWebhookRouteCreatesConversationSessionForPlainText(t *testing.T) {
	engine, _, conversations, sessions, _ := newAgentControlTestEngine(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	nowBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"帮我看下 anycap 这个 bug\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(nowBody), Len: len(nowBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(nowBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(conversations.itemsByID) != 1 {
		t.Fatalf("expected 1 conversation, got %d", len(conversations.itemsByID))
	}
	if len(sessions.items) != 1 {
		t.Fatalf("expected 1 session, got %d", len(sessions.items))
	}
}

func TestWebhookRouteRepliesWhenPrimaryRunnerOffline(t *testing.T) {
	engine, _, _, _, runners, adapter := newAgentControlTestEngineWithRepos(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	delete(runners.primaryByUserPlatform, "2000000001|feishu")

	nowBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"帮我看下 anycap 这个 bug\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(nowBody), Len: len(nowBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(nowBody))},
	)
	if resp.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(adapter.sentMessages) == 0 {
		t.Fatalf("expected offline reply to be sent")
	}
	got := adapter.sentMessages[len(adapter.sentMessages)-1]
	if !strings.Contains(got, "当前不在线") {
		t.Fatalf("expected offline reply, got %q", got)
	}
}

func TestRunnerRouteAcceptsDaemonOwnedInboundIMChat(t *testing.T) {
	engine, rawKey, conversations, sessions, _ := newAgentControlTestEngine(t, true)
	reqBody := `{"platform":"feishu","bot_id":"cli_personal_bot","chat_id":"oc_chat","message_id":"om_message","sender_id":"ou_owner","message":"<feishu-message message_id=\"om_message\" chat_id=\"oc_chat\" chat_type=\"p2p\" message_type=\"text\" sender_open_id=\"ou_owner\">\n请回复 hello\n</feishu-message>"}`
	req := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/im/inbound",
		&ut.Body{Body: bytes.NewReader([]byte(reqBody)), Len: len(reqBody)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
	)
	if req.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", req.Code, req.Body.String())
	}
	if !strings.Contains(req.Body.String(), `"reply_message":"会话已接收，正在处理中"`) {
		t.Fatalf("expected reply_message in response, got %s", req.Body.String())
	}
	if len(conversations.itemsByID) != 1 {
		t.Fatalf("expected conversation to be created, got %d", len(conversations.itemsByID))
	}
	if len(sessions.items) != 1 {
		t.Fatalf("expected session to be created, got %d", len(sessions.items))
	}
	if sessions.items[0].UserMessage == nil || !strings.Contains(*sessions.items[0].UserMessage, `message_id="om_message"`) {
		t.Fatalf("expected created session to retain inbound message context, got %+v", sessions.items[0].UserMessage)
	}
}

func TestRunnerSessionUpdateRepliesForOwnedInboundWithoutBinding(t *testing.T) {
	engine, rawKey, conversations, sessions, adapter := newAgentControlTestEngine(t, true)
	now := time.Now().UTC()
	lastSessionID := int64(1)

	reqBody := `{"platform":"feishu","bot_id":"cli_personal_bot","chat_id":"oc_chat","message_id":"om_message","sender_id":"ou_owner","message":"请回复 hello"}`
	req := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/im/inbound",
		&ut.Body{Body: bytes.NewReader([]byte(reqBody)), Len: len(reqBody)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
	)
	if req.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", req.Code, req.Body.String())
	}
	if len(conversations.itemsByID) != 1 || len(sessions.items) != 1 {
		t.Fatalf("expected owned inbound to create conversation+session, got conversations=%d sessions=%d", len(conversations.itemsByID), len(sessions.items))
	}

	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_personal_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     now,
			UpdatedAt:     now,
		},
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusCreated,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}

	authHeader := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	nextResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/runners/21/sessions/next", nil, authHeader)
	if nextResp.Code != http.StatusOK {
		t.Fatalf("expected 200 next session, got %d body=%s", nextResp.Code, nextResp.Body.String())
	}

	updateResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/runners/21/sessions/1",
		&ut.Body{Body: bytes.NewReader([]byte(`{"status":"running"}`)), Len: len(`{"status":"running"}`)},
		authHeader,
	)
	if updateResp.Code != http.StatusOK {
		t.Fatalf("expected 200 update session, got %d body=%s", updateResp.Code, updateResp.Body.String())
	}

	commitResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/runners/21/sessions/1",
		&ut.Body{Body: bytes.NewReader([]byte(`{"status":"committed","final_message":"hello back"}`)), Len: len(`{"status":"committed","final_message":"hello back"}`)},
		authHeader,
	)
	if commitResp.Code != http.StatusOK {
		t.Fatalf("expected 200 commit session, got %d body=%s", commitResp.Code, commitResp.Body.String())
	}
	if len(adapter.sentMessages) == 0 || adapter.sentMessages[len(adapter.sentMessages)-1] != "hello back" {
		t.Fatalf("expected owned inbound committed session reply message, got %+v", adapter.sentMessages)
	}
}

func TestRunnerRouteSuppressesImmediateReplyWhenPreviousSessionStillRunning(t *testing.T) {
	engine, rawKey, conversations, sessions, _ := newAgentControlTestEngine(t, true)
	lastSessionID := int64(7)
	conversations.itemsByID = map[int64]model.AgentConversation{
		51: {
			ID:            51,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_personal_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     time.Now().UTC().Add(-10 * time.Minute),
			UpdatedAt:     time.Now().UTC().Add(-5 * time.Minute),
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_personal_bot|oc_chat": conversations.itemsByID[51],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             7,
			UserID:         "2000000001",
			ConversationID: 51,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusRunning,
			CreatedAt:      time.Now().UTC().Add(-2 * time.Minute),
			UpdatedAt:      time.Now().UTC().Add(-1 * time.Minute),
		},
	}

	reqBody := `{"platform":"feishu","bot_id":"cli_personal_bot","chat_id":"oc_chat","sender_id":"ou_owner","message":"好的。你是谁"}`
	req := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/im/inbound",
		&ut.Body{Body: bytes.NewReader([]byte(reqBody)), Len: len(reqBody)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
	)
	if req.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", req.Code, req.Body.String())
	}
	if !strings.Contains(req.Body.String(), `"reply_message":""`) {
		t.Fatalf("expected immediate reply to be suppressed for burst follow-up, got %s", req.Body.String())
	}
}

func TestWebhookRouteResetArchivesConversationAndCreatesNewOne(t *testing.T) {
	engine, _, conversations, sessions, _ := newAgentControlTestEngine(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	plainBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"先创建一个会话\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(plainBody), Len: len(plainBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(plainBody))},
	)

	resetBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/reset\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(resetBody), Len: len(resetBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(resetBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(conversations.itemsByID) != 2 {
		t.Fatalf("expected 2 conversations, got %d", len(conversations.itemsByID))
	}
	if conversations.itemsByID[1].Status != model.AgentConversationStatusArchived {
		t.Fatalf("expected conversation 1 archived, got %+v", conversations.itemsByID[1])
	}
	if len(sessions.items) != 2 {
		t.Fatalf("expected 2 sessions, got %d", len(sessions.items))
	}
}

func TestWebhookRouteStopInterruptsActiveConversation(t *testing.T) {
	engine, _, _, sessions, adapter := newAgentControlTestEngine(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	plainBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"先创建一个会话\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(plainBody), Len: len(plainBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(plainBody))},
	)

	stopBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/stop\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(stopBody), Len: len(stopBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(stopBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(sessions.items) != 1 {
		t.Fatalf("expected 1 session, got %d", len(sessions.items))
	}
	if sessions.items[0].Status != model.AgentSessionStatusInterrupted {
		t.Fatalf("expected interrupted session, got %+v", sessions.items[0])
	}
	if got := adapter.sentMessages[len(adapter.sentMessages)-1]; got != "会话已停止" {
		t.Fatalf("expected stop reply, got %q", got)
	}
}

func TestWebhookRouteForkArchivesConversationAndCreatesBranch(t *testing.T) {
	engine, _, conversations, sessions, adapter := newAgentControlTestEngine(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	plainBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"先创建一个会话\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(plainBody), Len: len(plainBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(plainBody))},
	)

	forkBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/fork\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(forkBody), Len: len(forkBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(forkBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(conversations.itemsByID) != 2 {
		t.Fatalf("expected 2 conversations, got %d", len(conversations.itemsByID))
	}
	if conversations.itemsByID[1].Status != model.AgentConversationStatusArchived {
		t.Fatalf("expected conversation 1 archived, got %+v", conversations.itemsByID[1])
	}
	if len(sessions.items) != 2 {
		t.Fatalf("expected 2 sessions, got %d", len(sessions.items))
	}
	if sessions.items[1].Mode != model.AgentSessionModeFork {
		t.Fatalf("expected fork session, got %+v", sessions.items[1])
	}
	if sessions.items[1].ParentSessionID == nil || *sessions.items[1].ParentSessionID != sessions.items[0].ID {
		t.Fatalf("expected parent session %d, got %+v", sessions.items[0].ID, sessions.items[1].ParentSessionID)
	}
	if got := adapter.sentMessages[len(adapter.sentMessages)-1]; got != "已创建新的会话分支，正在处理中" {
		t.Fatalf("expected fork reply, got %q", got)
	}
}

func TestWebhookRouteStatusReturnsStructuredRunningSummary(t *testing.T) {
	engine, _, conversations, sessions, adapter := newAgentControlTestEngine(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	startedAt := time.Date(2026, 4, 8, 9, 30, 0, 0, time.UTC)
	executorRef := "thread_123"
	lastSessionID := int64(1)
	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     time.Now().UTC(),
			UpdatedAt:     time.Now().UTC(),
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_bot|oc_chat": conversations.itemsByID[1],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusRunning,
			ExecutorRef:    &executorRef,
			StartedAt:      &startedAt,
			CreatedAt:      time.Now().UTC(),
			UpdatedAt:      time.Now().UTC(),
		},
	}

	statusBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/status\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(statusBody), Len: len(statusBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(statusBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	got := adapter.sentMessages[len(adapter.sentMessages)-1]
	if !strings.Contains(got, "当前会话：codex / 继续") {
		t.Fatalf("expected agent/mode summary, got %q", got)
	}
	if !strings.Contains(got, "状态：执行中") {
		t.Fatalf("expected running status, got %q", got)
	}
	if !strings.Contains(got, "上下文：已复用") {
		t.Fatalf("expected reuse summary, got %q", got)
	}
	if !strings.Contains(got, "开始时间：2026-04-08 09:30:00 UTC") {
		t.Fatalf("expected started_at in reply, got %q", got)
	}
}

func TestWebhookRouteStatusIncludesFinalSummaryForCommittedSession(t *testing.T) {
	engine, _, conversations, sessions, adapter := newAgentControlTestEngine(t, true)

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	_ = ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(bindBody))},
	)

	completedAt := time.Date(2026, 4, 8, 10, 0, 0, 0, time.UTC)
	lastSessionID := int64(1)
	finalMessage := "已经修复 parser panic，并补了回归测试。"
	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     time.Now().UTC(),
			UpdatedAt:     time.Now().UTC(),
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_bot|oc_chat": conversations.itemsByID[1],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusCommitted,
			FinalMessage:   &finalMessage,
			CompletedAt:    &completedAt,
			CreatedAt:      time.Now().UTC(),
			UpdatedAt:      time.Now().UTC(),
		},
	}

	statusBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/status\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(statusBody), Len: len(statusBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-123"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-123", "encrypt_key", string(statusBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	got := adapter.sentMessages[len(adapter.sentMessages)-1]
	if !strings.Contains(got, "状态：已完成") {
		t.Fatalf("expected committed status, got %q", got)
	}
	if !strings.Contains(got, "完成时间：2026-04-08 10:00:00 UTC") {
		t.Fatalf("expected completed_at in reply, got %q", got)
	}
	if !strings.Contains(got, "结果：已经修复 parser panic，并补了回归测试。") {
		t.Fatalf("expected final summary, got %q", got)
	}
}

func TestConversationRoutesListGetAndSessions(t *testing.T) {
	engine, rawKey, conversations, sessions, _ := newAgentControlTestEngine(t, true)

	lastSessionID := int64(1)
	finalMessage := "已经修复 parser panic，并补了回归测试。"
	executorRef := "thread_123"
	startedAt := time.Date(2026, 4, 8, 9, 30, 0, 0, time.UTC)
	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     time.Now().UTC(),
			UpdatedAt:     time.Now().UTC(),
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_bot|oc_chat": conversations.itemsByID[1],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusCommitted,
			FinalMessage:   &finalMessage,
			ExecutorRef:    &executorRef,
			StartedAt:      &startedAt,
			CreatedAt:      time.Now().UTC(),
			UpdatedAt:      time.Now().UTC(),
		},
	}

	authHeader := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}

	listResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/conversations", nil, authHeader)
	if listResp.Code != http.StatusOK {
		t.Fatalf("expected 200 list, got %d body=%s", listResp.Code, listResp.Body.String())
	}
	if !strings.Contains(listResp.Body.String(), `"last_session":{"id":"1"`) {
		t.Fatalf("expected list response to include last_session summary, got body=%s", listResp.Body.String())
	}
	if !strings.Contains(listResp.Body.String(), `"executor_ref":"thread_123"`) {
		t.Fatalf("expected list response to include executor_ref, got body=%s", listResp.Body.String())
	}

	getResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/conversations/1", nil, authHeader)
	if getResp.Code != http.StatusOK {
		t.Fatalf("expected 200 get, got %d body=%s", getResp.Code, getResp.Body.String())
	}
	if !strings.Contains(getResp.Body.String(), `"last_session":{"id":"1"`) {
		t.Fatalf("expected get response to include last_session summary, got body=%s", getResp.Body.String())
	}
	if !strings.Contains(getResp.Body.String(), `"final_message":"已经修复 parser panic，并补了回归测试。"`) {
		t.Fatalf("expected get response to include final_message summary, got body=%s", getResp.Body.String())
	}

	sessionsResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/conversations/1/sessions", nil, authHeader)
	if sessionsResp.Code != http.StatusOK {
		t.Fatalf("expected 200 sessions, got %d body=%s", sessionsResp.Code, sessionsResp.Body.String())
	}
}

func TestConversationRoutesStopResetAndFork(t *testing.T) {
	engine, rawKey, conversations, sessions, _ := newAgentControlTestEngine(t, true)
	now := time.Now().UTC()
	lastSessionID := int64(1)
	conversations.nextID = 1
	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     now.Add(-time.Hour),
			UpdatedAt:     now.Add(-time.Minute),
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_bot|oc_chat": conversations.itemsByID[1],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusRunning,
			CreatedAt:      now.Add(-time.Minute),
			UpdatedAt:      now.Add(-time.Minute),
		},
	}

	authHeader := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}

	stopResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/conversations/1/stop",
		&ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: len(`{}`)},
		authHeader,
	)
	if stopResp.Code != http.StatusOK {
		t.Fatalf("expected 200 stop, got %d body=%s", stopResp.Code, stopResp.Body.String())
	}
	if !strings.Contains(stopResp.Body.String(), `"status":"interrupted"`) {
		t.Fatalf("expected interrupted session summary, got body=%s", stopResp.Body.String())
	}

	resetResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/conversations/1/reset",
		&ut.Body{Body: bytes.NewReader([]byte(`{"message":"重新开始"}`)), Len: len(`{"message":"重新开始"}`)},
		authHeader,
	)
	if resetResp.Code != http.StatusOK {
		t.Fatalf("expected 200 reset, got %d body=%s", resetResp.Code, resetResp.Body.String())
	}
	if conversations.itemsByID[1].Status != model.AgentConversationStatusArchived {
		t.Fatalf("expected archived original conversation after reset, got %+v", conversations.itemsByID[1])
	}
	if !strings.Contains(resetResp.Body.String(), `"mode":"system"`) {
		t.Fatalf("expected system session summary after reset, got body=%s", resetResp.Body.String())
	}

	latestID := conversations.nextID
	forkResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/conversations/"+strconv.FormatInt(latestID, 10)+"/fork",
		&ut.Body{Body: bytes.NewReader([]byte(`{"message":"分支尝试"}`)), Len: len(`{"message":"分支尝试"}`)},
		authHeader,
	)
	if forkResp.Code != http.StatusOK {
		t.Fatalf("expected 200 fork, got %d body=%s", forkResp.Code, forkResp.Body.String())
	}
	if !strings.Contains(forkResp.Body.String(), `"mode":"fork"`) {
		t.Fatalf("expected fork session summary, got body=%s", forkResp.Body.String())
	}
}

func TestConversationRoutesMailboxAndFire(t *testing.T) {
	engine, rawKey, conversations, sessions, adapter := newAgentControlTestEngine(t, true)
	now := time.Now().UTC()
	lastSessionID := int64(1)
	executorRef := "thread_123"
	conversations.nextID = 1
	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     now.Add(-time.Hour),
			UpdatedAt:     now.Add(-time.Minute),
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_bot|oc_chat": conversations.itemsByID[1],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
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
	}

	authHeader := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}

	createResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/conversations/1/mailbox",
		&ut.Body{Body: bytes.NewReader([]byte(`{"source_type":"tool_result","payload":"测试完成：1 失败","source_session_id":"1"}`)), Len: len(`{"source_type":"tool_result","payload":"测试完成：1 失败","source_session_id":"1"}`)},
		authHeader,
	)
	if createResp.Code != http.StatusOK {
		t.Fatalf("expected 200 mailbox create, got %d body=%s", createResp.Code, createResp.Body.String())
	}
	if !strings.Contains(createResp.Body.String(), `"source_type":"tool_result"`) {
		t.Fatalf("expected mailbox create response, got body=%s", createResp.Body.String())
	}

	listResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/conversations/1/mailbox", nil, authHeader)
	if listResp.Code != http.StatusOK {
		t.Fatalf("expected 200 mailbox list, got %d body=%s", listResp.Code, listResp.Body.String())
	}
	if strings.Contains(listResp.Body.String(), `测试完成：1 失败`) {
		t.Fatalf("expected mailbox item to auto-fire and leave mailbox empty, got body=%s", listResp.Body.String())
	}

	fireResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/conversations/1/fire",
		&ut.Body{Body: bytes.NewReader([]byte(`{"message":"继续处理这些结果"}`)), Len: len(`{"message":"继续处理这些结果"}`)},
		authHeader,
	)
	if fireResp.Code != http.StatusOK {
		t.Fatalf("expected 200 fire, got %d body=%s", fireResp.Code, fireResp.Body.String())
	}
	if !strings.Contains(fireResp.Body.String(), `"id":"1"`) {
		t.Fatalf("expected fire response to return conversation summary, got body=%s", fireResp.Body.String())
	}

	conversationResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/conversations/1", nil, authHeader)
	if conversationResp.Code != http.StatusOK {
		t.Fatalf("expected 200 conversation get, got %d body=%s", conversationResp.Code, conversationResp.Body.String())
	}
	if !strings.Contains(conversationResp.Body.String(), `"mode":"fire"`) {
		t.Fatalf("expected auto-fired session summary on conversation, got body=%s", conversationResp.Body.String())
	}
	if !strings.Contains(conversationResp.Body.String(), `"executor_ref":"thread_123"`) {
		t.Fatalf("expected auto-fired session to inherit executor_ref, got body=%s", conversationResp.Body.String())
	}

	postFireListResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/conversations/1/mailbox", nil, authHeader)
	if postFireListResp.Code != http.StatusOK {
		t.Fatalf("expected 200 mailbox list after fire, got %d body=%s", postFireListResp.Code, postFireListResp.Body.String())
	}
	if strings.Contains(postFireListResp.Body.String(), `测试完成：1 失败`) {
		t.Fatalf("expected mailbox item to be delivered after fire, got body=%s", postFireListResp.Body.String())
	}

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	bindResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-bind"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-bind", "encrypt_key", string(bindBody))},
	)
	if bindResp.Code != http.StatusOK {
		t.Fatalf("expected 200 bind, got %d body=%s", bindResp.Code, bindResp.Body.String())
	}

	fireBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/fire\"}"}}}`)
	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(fireBody), Len: len(fireBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-fire"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-fire", "encrypt_key", string(fireBody))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200 webhook fire, got %d body=%s", resp.Code, resp.Body.String())
	}
	if got := adapter.sentMessages[len(adapter.sentMessages)-1]; got != "当前没有待处理的异步结果" {
		t.Fatalf("expected empty fire reply after delivery, got %q", got)
	}
}

func TestRunnerSessionRoutesNextAndUpdate(t *testing.T) {
	engine, rawKey, conversations, sessions, adapter := newAgentControlTestEngine(t, true)
	now := time.Now().UTC()

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	bindResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-bind"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-bind", "encrypt_key", string(bindBody))},
	)
	if bindResp.Code != http.StatusOK {
		t.Fatalf("expected 200 bind, got %d body=%s", bindResp.Code, bindResp.Body.String())
	}

	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:        1,
			UserID:    "2000000001",
			Platform:  model.IMPlatformFeishu,
			BotID:     "cli_bot",
			ChatID:    "oc_chat",
			RunnerID:  21,
			Agent:     "codex",
			Status:    model.AgentConversationStatusActive,
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusCreated,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}

	authHeader := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	nextResp := ut.PerformRequest(engine.Engine, http.MethodGet, "/v1/agent/runners/21/sessions/next", nil, authHeader)
	if nextResp.Code != http.StatusOK {
		t.Fatalf("expected 200 next session, got %d body=%s", nextResp.Code, nextResp.Body.String())
	}

	updateResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/runners/21/sessions/1",
		&ut.Body{Body: bytes.NewReader([]byte(`{"status":"running"}`)), Len: len(`{"status":"running"}`)},
		authHeader,
	)
	if updateResp.Code != http.StatusOK {
		t.Fatalf("expected 200 update session, got %d body=%s", updateResp.Code, updateResp.Body.String())
	}
	if sessions.items[0].Status != model.AgentSessionStatusRunning {
		t.Fatalf("expected session running, got %+v", sessions.items[0])
	}

	commitResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/runners/21/sessions/1",
		&ut.Body{Body: bytes.NewReader([]byte(`{"status":"committed","final_message":"修复完成"}`)), Len: len(`{"status":"committed","final_message":"修复完成"}`)},
		authHeader,
	)
	if commitResp.Code != http.StatusOK {
		t.Fatalf("expected 200 commit session, got %d body=%s", commitResp.Code, commitResp.Body.String())
	}
	if len(adapter.sentMessages) == 0 || adapter.sentMessages[len(adapter.sentMessages)-1] != "修复完成" {
		t.Fatalf("expected committed session reply message, got %+v", adapter.sentMessages)
	}
}

func TestRunnerSessionUpdateRepliesWithAutoFireContinuationMessage(t *testing.T) {
	engine, rawKey, conversations, sessions, adapter := newAgentControlTestEngine(t, true)
	now := time.Now().UTC()

	bindBody := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_abc\"}"}}}`)
	bindResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindBody), Len: len(bindBody)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-bind"},
		ut.Header{Key: "X-Lark-Signature", Value: feishuTestSignature("1710000000", "nonce-bind", "encrypt_key", string(bindBody))},
	)
	if bindResp.Code != http.StatusOK {
		t.Fatalf("expected 200 bind, got %d body=%s", bindResp.Code, bindResp.Body.String())
	}

	lastSessionID := int64(1)
	conversations.itemsByID = map[int64]model.AgentConversation{
		1: {
			ID:            1,
			UserID:        "2000000001",
			Platform:      model.IMPlatformFeishu,
			BotID:         "cli_bot",
			ChatID:        "oc_chat",
			RunnerID:      21,
			Agent:         "codex",
			Status:        model.AgentConversationStatusActive,
			LastSessionID: &lastSessionID,
			CreatedAt:     now,
			UpdatedAt:     now,
		},
	}
	conversations.activeByChatKey = map[string]model.AgentConversation{
		"2000000001|feishu|cli_bot|oc_chat": conversations.itemsByID[1],
	}
	sessions.items = []model.AgentSession{
		{
			ID:             1,
			UserID:         "2000000001",
			ConversationID: 1,
			RunnerID:       21,
			Agent:          "codex",
			Mode:           model.AgentSessionModeContinue,
			Status:         model.AgentSessionStatusRunning,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}

	authHeader := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	createMailboxResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/conversations/1/mailbox",
		&ut.Body{Body: bytes.NewReader([]byte(`{"source_type":"tool_result","payload":"测试完成：1 失败","source_session_id":"1"}`)), Len: len(`{"source_type":"tool_result","payload":"测试完成：1 失败","source_session_id":"1"}`)},
		authHeader,
	)
	if createMailboxResp.Code != http.StatusOK {
		t.Fatalf("expected 200 mailbox create, got %d body=%s", createMailboxResp.Code, createMailboxResp.Body.String())
	}

	commitResp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/runners/21/sessions/1",
		&ut.Body{Body: bytes.NewReader([]byte(`{"status":"committed","final_message":"修复完成"}`)), Len: len(`{"status":"committed","final_message":"修复完成"}`)},
		authHeader,
	)
	if commitResp.Code != http.StatusOK {
		t.Fatalf("expected 200 commit session, got %d body=%s", commitResp.Code, commitResp.Body.String())
	}
	if len(adapter.sentMessages) == 0 {
		t.Fatalf("expected reply message after auto-fire")
	}
	if got := adapter.sentMessages[len(adapter.sentMessages)-1]; got != "修复完成\n后台结果已返回：测试完成：1 失败，继续处理中" {
		t.Fatalf("unexpected auto-fire continuation reply %q", got)
	}
	if conversations.itemsByID[1].LastSessionID == nil || *conversations.itemsByID[1].LastSessionID == 1 {
		t.Fatalf("expected auto-fire session to become last session, got %+v", conversations.itemsByID[1].LastSessionID)
	}
}

func TestBuildAutoContinueReplyMessageFallsBackWithoutSummary(t *testing.T) {
	got := buildAutoContinueReplyMessage("前台已完成", &model.AgentConversationEvent{
		EventType:    model.AgentConversationEventSessionCommitted,
		PendingCount: 1,
	})
	if got != "前台已完成\n已收到新的后台结果，继续处理中" {
		t.Fatalf("unexpected fallback reply %q", got)
	}
}

func TestRunnerClaimPrimaryRouteClaimsRunnerForCurrentUser(t *testing.T) {
	engine, rawKey, _, _, _ := newAgentControlTestEngine(t, true)

	resp := ut.PerformRequest(
		engine.Engine,
		http.MethodPost,
		"/v1/agent/runners/21/claim-primary",
		nil,
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200 claim primary, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func newAgentControlTestEngine(t *testing.T, featureEnabled bool) (*server.Hertz, string, *testConversationRepo, *testSessionRepo, *testWebhookAdapter) {
	h, rawKey, conversations, sessions, _, adapter := newAgentControlTestEngineWithRepos(t, featureEnabled)
	return h, rawKey, conversations, sessions, adapter
}

func newAgentControlTestEngineWithRepos(t *testing.T, featureEnabled bool) (*server.Hertz, string, *testConversationRepo, *testSessionRepo, *testRunnerRepo, *testWebhookAdapter) {
	t.Helper()

	apiKeys := apikey.NewMemoryService()
	created, err := apiKeys.CreateAPIKey(context.Background(), "2000000001", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}

	tokens := &testBindTokenRepo{
		token: model.IMBindToken{
			ID:        1,
			UserID:    "2000000001",
			Token:     "bind_abc",
			Platform:  model.IMPlatformFeishu,
			ExpiresAt: time.Now().UTC().Add(10 * time.Minute),
			CreatedAt: time.Now().UTC(),
		},
	}
	bindings := &testBindingRepo{}
	bindingService := agentcontrolapp.NewBindingService(tokens, bindings,
		agentcontrolapp.WithBindingClock(time.Now),
	)
	runners := &testRunnerRepo{
		items: map[int64]model.AgentRunner{
			21: {
				ID:       21,
				UserID:   "2000000001",
				Name:     "runner-a",
				Platform: model.IMPlatformFeishu,
				State:    model.AgentRunnerStateIdle,
			},
		},
		primaryByUserPlatform: map[string]model.AgentPrimaryRunner{
			"2000000001|feishu": {
				ID:       1,
				UserID:   "2000000001",
				Platform: model.IMPlatformFeishu,
				RunnerID: 21,
			},
		},
	}
	conversations := &testConversationRepo{}
	sessions := &testSessionRepo{}
	conversationService := agentcontrolapp.NewConversationService(
		bindings,
		runners,
		conversations,
		sessions,
		&testMailboxRepo{},
		agentcontrolapp.WithConversationClock(time.Now),
		agentcontrolapp.WithConversationFixedRunnerResolver(func(platform string, botID string) (int64, error) {
			if platform == model.IMPlatformFeishu && botID == "cli_bot" {
				return 21, nil
			}
			return 0, model.ErrNotFound("runner mapping not found")
		}),
	)
	baseAdapter := infraim.NewFeishuAdapter(infraim.FeishuAdapterConfig{
		VerificationToken: "verify_token",
		EncryptKey:        "encrypt_key",
		ReplyAPI:          "http://127.0.0.1/reply",
	})
	adapter := &testWebhookAdapter{base: baseAdapter}

	h := server.Default()
	root := h.Group("", middleware.FeatureGate(testFeatureProvider{enabled: featureEnabled}))
	NewWebhookHandler(bindingService, conversationService, nil, adapter).RegisterRoutes(root)

	protected := h.Group("/v1", middleware.Auth(apiKeys, nil), middleware.FeatureGate(testFeatureProvider{enabled: featureEnabled}))
	resolver := idresolver.PassthroughIDResolver{}
	mapper := presenter.PassthroughIDMapper{}
	NewBindingHandler(bindingService, bindings, resolver, mapper).RegisterRoutes(protected)
	NewConversationHandler(conversationService, conversations, sessions, resolver, mapper).RegisterRoutes(protected)
	NewTaskHandler(nil, nil, resolver, mapper).RegisterRoutes(protected)
	NewRunnerHandler(bindings, runners, conversations, nil, conversationService, adapter, resolver, mapper).RegisterRoutes(protected)

	return h, created.RawKey, conversations, sessions, runners, adapter
}

func feishuTestSignature(timestamp, nonce, encryptKey, body string) string {
	sum := sha256.Sum256([]byte(timestamp + nonce + encryptKey + body))
	return hex.EncodeToString(sum[:])
}
