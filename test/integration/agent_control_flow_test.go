package integration

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	infraim "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	agentcontrolhandler "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type integrationFeatureProvider struct{}

func (integrationFeatureProvider) EnabledFor(_ *model.Principal, _ string) (bool, bool) {
	return true, true
}

type memoryAgentControlRepo struct {
	tokens   map[string]model.IMBindToken
	bindings []model.IMBinding
	runners  map[int64]model.AgentRunner
	tasks    map[int64]model.AgentTask
	nextTask int64
}

func newMemoryAgentControlRepo() *memoryAgentControlRepo {
	return &memoryAgentControlRepo{
		tokens: map[string]model.IMBindToken{},
		runners: map[int64]model.AgentRunner{
			21: {
				ID:       21,
				UserID:   "2000000001",
				Name:     "mac-mini",
				Platform: model.IMPlatformFeishu,
				State:    model.AgentRunnerStateIdle,
			},
		},
		tasks: map[int64]model.AgentTask{},
	}
}

func (r *memoryAgentControlRepo) CreateIMBindToken(_ context.Context, token model.IMBindToken) (*model.IMBindToken, error) {
	token.ID = int64(len(r.tokens) + 1)
	r.tokens[token.Token] = token
	copy := token
	return &copy, nil
}

func (r *memoryAgentControlRepo) GetIMBindTokenByToken(_ context.Context, token string) (*model.IMBindToken, error) {
	item, ok := r.tokens[token]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *memoryAgentControlRepo) MarkIMBindTokenUsed(_ context.Context, id int64) error {
	for key, item := range r.tokens {
		if item.ID == id {
			now := time.Now().UTC()
			item.UsedAt = &now
			r.tokens[key] = item
			return nil
		}
	}
	return model.ErrNotFound("token not found")
}

func (r *memoryAgentControlRepo) CreateBinding(_ context.Context, binding model.IMBinding) (*model.IMBinding, error) {
	binding.ID = int64(len(r.bindings) + 1)
	r.bindings = append(r.bindings, binding)
	copy := binding
	return &copy, nil
}

func (r *memoryAgentControlRepo) GetActiveByPlatformSender(_ context.Context, platform string, botID string, senderID string) (*model.IMBinding, error) {
	for _, item := range r.bindings {
		if item.Platform == platform && item.BotID == botID && item.SenderID == senderID && item.Status == model.IMBindingStatusActive {
			copy := item
			return &copy, nil
		}
	}
	return nil, nil
}

func (r *memoryAgentControlRepo) ListBindingsByUser(_ context.Context, userID string) ([]model.IMBinding, error) {
	var result []model.IMBinding
	for _, item := range r.bindings {
		if item.UserID == userID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *memoryAgentControlRepo) RevokeBinding(_ context.Context, id int64) error {
	for i := range r.bindings {
		if r.bindings[i].ID == id {
			r.bindings[i].Status = model.IMBindingStatusRevoked
			return nil
		}
	}
	return model.ErrNotFound("binding not found")
}

func (r *memoryAgentControlRepo) CreateRunner(_ context.Context, runner model.AgentRunner) (*model.AgentRunner, error) {
	if runner.ID == 0 {
		runner.ID = int64(len(r.runners) + 1)
	}
	r.runners[runner.ID] = runner
	copy := runner
	return &copy, nil
}

func (r *memoryAgentControlRepo) GetRunnerByID(_ context.Context, id int64) (*model.AgentRunner, error) {
	item, ok := r.runners[id]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *memoryAgentControlRepo) ListRunnersByUser(_ context.Context, userID string) ([]model.AgentRunner, error) {
	var result []model.AgentRunner
	for _, item := range r.runners {
		if item.UserID == userID {
			result = append(result, item)
		}
	}
	return result, nil
}

func (r *memoryAgentControlRepo) UpdateRunnerState(_ context.Context, id int64, state string) (*model.AgentRunner, error) {
	item, ok := r.runners[id]
	if !ok {
		return nil, nil
	}
	item.State = state
	r.runners[id] = item
	copy := item
	return &copy, nil
}

func (r *memoryAgentControlRepo) CreateTask(_ context.Context, task model.AgentTask) (*model.AgentTask, error) {
	r.nextTask++
	task.ID = r.nextTask
	r.tasks[task.ID] = task
	copy := task
	return &copy, nil
}

func (r *memoryAgentControlRepo) GetTaskByID(_ context.Context, id int64) (*model.AgentTask, error) {
	item, ok := r.tasks[id]
	if !ok {
		return nil, nil
	}
	copy := item
	return &copy, nil
}

func (r *memoryAgentControlRepo) ListDispatchableTasksByRunner(_ context.Context, runnerID int64, limit int) ([]model.AgentTask, error) {
	if limit <= 0 {
		limit = 1
	}
	result := make([]model.AgentTask, 0, limit)
	for _, item := range r.tasks {
		if item.RunnerID != runnerID {
			continue
		}
		if item.Status != model.AgentTaskStatusDispatched && item.Status != model.AgentTaskStatusQueued {
			continue
		}
		result = append(result, item)
		if len(result) >= limit {
			break
		}
	}
	return result, nil
}

func (r *memoryAgentControlRepo) UpdateTask(_ context.Context, input model.AgentTaskUpdate) (*model.AgentTask, error) {
	item, ok := r.tasks[input.ID]
	if !ok {
		return nil, nil
	}
	item.Status = input.Status
	item.ErrorMessage = input.ErrorMessage
	if input.DispatchedAt != nil {
		item.DispatchedAt = input.DispatchedAt
	}
	if input.StartedAt != nil {
		item.StartedAt = input.StartedAt
	}
	if input.CompletedAt != nil {
		item.CompletedAt = input.CompletedAt
	}
	item.UpdatedAt = input.UpdatedAt
	r.tasks[input.ID] = item
	copy := item
	return &copy, nil
}

type integrationDispatcher struct {
	dispatched []model.AgentTask
}

func (d *integrationDispatcher) DispatchTask(_ context.Context, _ model.AgentRunner, task model.AgentTask) error {
	d.dispatched = append(d.dispatched, task)
	return nil
}

func TestAgentControlFlow_BindDispatchAndRunnerUpdate(t *testing.T) {
	apiKeys := apikey.NewMemoryService()
	created, err := apiKeys.CreateAPIKey(context.Background(), "2000000001", "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}

	replyCount := 0
	replyServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		replyCount++
		w.WriteHeader(http.StatusOK)
	}))
	defer replyServer.Close()

	repo := newMemoryAgentControlRepo()
	dispatcher := &integrationDispatcher{}
	bindingService := agentcontrolapp.NewBindingService(repo, repo,
		agentcontrolapp.WithBindTokenGenerator(func() (string, error) { return "bind_fixed_123", nil }),
		agentcontrolapp.WithBindingClock(time.Now),
	)
	taskService := agentcontrolapp.NewTaskService(repo, repo, repo, dispatcher,
		agentcontrolapp.WithTaskClock(time.Now),
		agentcontrolapp.WithFixedRunnerResolver(func(platform string, botID string) (int64, error) {
			if platform == model.IMPlatformFeishu && botID == "cli_bot" {
				return 21, nil
			}
			return 0, model.ErrNotFound("runner not found")
		}),
	)
	adapter := infraim.NewFeishuAdapter(infraim.FeishuAdapterConfig{
		VerificationToken: "verify_token",
		EncryptKey:        "encrypt_key",
		ReplyAPI:          replyServer.URL,
	})

	h := server.Default()
	root := h.Group("", middleware.FeatureGate(integrationFeatureProvider{}))
	protected := h.Group("/v1", middleware.Auth(apiKeys, nil), middleware.FeatureGate(integrationFeatureProvider{}))
	resolver := idresolver.PassthroughIDResolver{}
	mapper := presenter.PassthroughIDMapper{}

	agentcontrolhandler.NewWebhookHandler(bindingService, nil, taskService, adapter).RegisterRoutes(root)
	agentcontrolhandler.NewBindingHandler(bindingService, repo, resolver, mapper).RegisterRoutes(protected)
	agentcontrolhandler.NewTaskHandler(taskService, repo, resolver, mapper).RegisterRoutes(protected)
	agentcontrolhandler.NewRunnerHandler(repo, repo, nil, taskService, nil, adapter, resolver, mapper).RegisterRoutes(protected)

	authz := ut.Header{Key: "Authorization", Value: "Bearer " + created.RawKey}
	contentType := ut.Header{Key: "Content-Type", Value: "application/json"}

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/agent/im-bindings/token",
		&ut.Body{Body: strings.NewReader(`{"platform":"feishu"}`), Len: len(`{"platform":"feishu"}`)},
		authz, contentType,
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("create bind token: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), "bind_fixed_123") {
		t.Fatalf("expected bind token in response, got %s", resp.Body.String())
	}

	bindEvent := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/bind bind_fixed_123\"}"}}}`)
	resp = ut.PerformRequest(h.Engine, http.MethodPost, "/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(bindEvent), Len: len(bindEvent)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000000"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-bind"},
		ut.Header{Key: "X-Lark-Signature", Value: integrationFeishuSignature("1710000000", "nonce-bind", "encrypt_key", string(bindEvent))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("bind webhook: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(repo.bindings) != 1 {
		t.Fatalf("expected 1 binding, got %d", len(repo.bindings))
	}

	runEvent := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/run codex fix parser panic on empty input\"}"}}}`)
	resp = ut.PerformRequest(h.Engine, http.MethodPost, "/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(runEvent), Len: len(runEvent)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000001"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-run"},
		ut.Header{Key: "X-Lark-Signature", Value: integrationFeishuSignature("1710000001", "nonce-run", "encrypt_key", string(runEvent))},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("run webhook: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if len(dispatcher.dispatched) != 1 {
		t.Fatalf("expected 1 dispatched task, got %d", len(dispatcher.dispatched))
	}
	if replyCount != 1 {
		t.Fatalf("expected accepted reply to be sent once, got %d", replyCount)
	}

	resp = ut.PerformRequest(h.Engine, http.MethodGet, "/v1/agent/runners/21/tasks/next", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("runner next task: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), "fix parser panic on empty input") {
		t.Fatalf("expected next task payload, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, "/v1/agent/runners/21/tasks/1",
		&ut.Body{Body: strings.NewReader(`{"status":"running"}`), Len: len(`{"status":"running"}`)},
		authz, contentType,
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("runner update running: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	resp = ut.PerformRequest(h.Engine, http.MethodPost, "/v1/agent/runners/21/tasks/1",
		&ut.Body{Body: strings.NewReader(`{"status":"succeeded"}`), Len: len(`{"status":"succeeded"}`)},
		authz, contentType,
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("runner update succeeded: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	task, _ := repo.GetTaskByID(context.Background(), 1)
	if task == nil || task.Status != model.AgentTaskStatusSucceeded {
		t.Fatalf("expected task status succeeded, got %+v", task)
	}
}

func TestAgentControlFlow_RejectsInvalidSignatureAndUnboundSender(t *testing.T) {
	apiKeys := apikey.NewMemoryService()
	repo := newMemoryAgentControlRepo()
	adapter := infraim.NewFeishuAdapter(infraim.FeishuAdapterConfig{
		VerificationToken: "verify_token",
		EncryptKey:        "encrypt_key",
		ReplyAPI:          "http://127.0.0.1/reply",
	})
	taskService := agentcontrolapp.NewTaskService(repo, repo, repo, &integrationDispatcher{},
		agentcontrolapp.WithTaskClock(time.Now),
		agentcontrolapp.WithFixedRunnerResolver(func(platform string, botID string) (int64, error) { return 21, nil }),
	)

	h := server.Default()
	root := h.Group("", middleware.FeatureGate(integrationFeatureProvider{}))
	protected := h.Group("/v1", middleware.Auth(apiKeys, nil), middleware.FeatureGate(integrationFeatureProvider{}))
	resolver := idresolver.PassthroughIDResolver{}
	mapper := presenter.PassthroughIDMapper{}

	agentcontrolhandler.NewWebhookHandler(agentcontrolapp.NewBindingService(repo, repo), nil, taskService, adapter).RegisterRoutes(root)
	agentcontrolhandler.NewBindingHandler(agentcontrolapp.NewBindingService(repo, repo), repo, resolver, mapper).RegisterRoutes(protected)

	body := []byte(`{"schema":"2.0","header":{"event_type":"im.message.receive_v1","app_id":"cli_bot"},"event":{"sender":{"sender_id":{"open_id":"ou_sender"}},"message":{"chat_id":"oc_chat","content":"{\"text\":\"/run codex fix parser panic\"}"}}}`)
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000002"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-bad"},
		ut.Header{Key: "X-Lark-Signature", Value: "bad-signature"},
	)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for invalid signature, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, "/im/events/feishu",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "X-Lark-Request-Timestamp", Value: "1710000003"},
		ut.Header{Key: "X-Lark-Request-Nonce", Value: "nonce-unbound"},
		ut.Header{Key: "X-Lark-Signature", Value: integrationFeishuSignature("1710000003", "nonce-unbound", "encrypt_key", string(body))},
	)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for unbound sender, got %d body=%s", resp.Code, resp.Body.String())
	}
}

var (
	_ port.IMBindTokenRepository = (*memoryAgentControlRepo)(nil)
	_ port.IMBindingRepository   = (*memoryAgentControlRepo)(nil)
	_ port.AgentRunnerRepository = (*memoryAgentControlRepo)(nil)
	_ port.AgentTaskRepository   = (*memoryAgentControlRepo)(nil)
	_ port.AgentRunnerDispatcher = (*integrationDispatcher)(nil)
)

func integrationFeishuSignature(timestamp, nonce, encryptKey, body string) string {
	sum := sha256.Sum256([]byte(timestamp + nonce + encryptKey + body))
	return hex.EncodeToString(sum[:])
}
