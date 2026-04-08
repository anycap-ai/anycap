package agentcontrol

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeRunnerLoopClient struct {
	registerResp   *RunnerRegistration
	nextSessions   []*RunnerSession
	nextTasks      []*RunnerTask
	sessionByID    map[string][]*RunnerSession
	heartbeats     []string
	sessionUpdates []runnerSessionUpdateCall
	updates        []runnerTaskUpdateCall
}

type runnerSessionUpdateCall struct {
	sessionID      string
	status         string
	finalMessage   *string
	executorRef    *string
	idempotencyKey string
}

type runnerTaskUpdateCall struct {
	taskID         string
	status         string
	errorMessage   *string
	idempotencyKey string
}

func (c *fakeRunnerLoopClient) Register(_ context.Context, name string, platform string) (*RunnerRegistration, error) {
	if c.registerResp != nil {
		return c.registerResp, nil
	}
	return &RunnerRegistration{ID: "run_123", Name: name, Platform: platform}, nil
}

func (c *fakeRunnerLoopClient) Heartbeat(_ context.Context, _ string, state string) error {
	c.heartbeats = append(c.heartbeats, state)
	return nil
}

func (c *fakeRunnerLoopClient) NextSession(_ context.Context, _ string) (*RunnerSession, error) {
	if len(c.nextSessions) == 0 {
		return nil, nil
	}
	session := c.nextSessions[0]
	c.nextSessions = c.nextSessions[1:]
	return session, nil
}

func (c *fakeRunnerLoopClient) NextTask(_ context.Context, _ string) (*RunnerTask, error) {
	if len(c.nextTasks) == 0 {
		return nil, nil
	}
	task := c.nextTasks[0]
	c.nextTasks = c.nextTasks[1:]
	return task, nil
}

func (c *fakeRunnerLoopClient) GetSession(_ context.Context, _ string, sessionID string) (*RunnerSession, error) {
	queue := c.sessionByID[sessionID]
	if len(queue) == 0 {
		return nil, nil
	}
	current := queue[0]
	if len(queue) > 1 {
		c.sessionByID[sessionID] = queue[1:]
	}
	return current, nil
}

func (c *fakeRunnerLoopClient) UpdateSession(_ context.Context, _ string, sessionID string, status string, finalMessage *string, executorRef *string, idempotencyKey string) error {
	c.sessionUpdates = append(c.sessionUpdates, runnerSessionUpdateCall{
		sessionID:      sessionID,
		status:         status,
		finalMessage:   finalMessage,
		executorRef:    executorRef,
		idempotencyKey: idempotencyKey,
	})
	return nil
}

func (c *fakeRunnerLoopClient) UpdateTask(_ context.Context, _ string, taskID string, status string, errorMessage *string, idempotencyKey string) error {
	c.updates = append(c.updates, runnerTaskUpdateCall{
		taskID:         taskID,
		status:         status,
		errorMessage:   errorMessage,
		idempotencyKey: idempotencyKey,
	})
	return nil
}

type fakeRunnerExecutor struct {
	err           error
	sessionResult RunnerSessionExecutionResult
}

func (e *fakeRunnerExecutor) ExecuteTask(_ context.Context, _ RunnerTask) (*RunnerTaskExecutionResult, error) {
	return &RunnerTaskExecutionResult{}, e.err
}

func (e *fakeRunnerExecutor) ExecuteSession(_ context.Context, _ RunnerSession) (*RunnerSessionExecutionResult, error) {
	return &e.sessionResult, e.err
}

type blockingRunnerExecutor struct {
	started chan struct{}
}

func (e *blockingRunnerExecutor) ExecuteTask(_ context.Context, _ RunnerTask) (*RunnerTaskExecutionResult, error) {
	return &RunnerTaskExecutionResult{}, nil
}

func (e *blockingRunnerExecutor) ExecuteSession(ctx context.Context, _ RunnerSession) (*RunnerSessionExecutionResult, error) {
	close(e.started)
	<-ctx.Done()
	return nil, ctx.Err()
}

func TestRunnerLoopRunOnceProcessesSessionBeforeTask(t *testing.T) {
	client := &fakeRunnerLoopClient{
		registerResp: &RunnerRegistration{ID: "run_123", Name: "mac-mini", Platform: "feishu"},
		nextSessions: []*RunnerSession{
			{ID: "ags_123", RunnerID: "run_123", ConversationID: "agc_123", UserMessage: ptrLoopString("继续修复 parser panic")},
		},
		nextTasks: []*RunnerTask{
			{ID: "agt_123", RunnerID: "run_123", TaskText: "should not run"},
		},
	}
	loop := NewRunnerLoop(client, &fakeRunnerExecutor{
		sessionResult: RunnerSessionExecutionResult{
			FinalMessage: ptrLoopString("修复完成"),
			ExecutorRef:  ptrLoopString("codex-exec"),
		},
	},
		WithLoopRunnerName("mac-mini"),
		WithLoopRunnerPlatform("feishu"),
		WithLoopOnce(true),
	)

	summary, err := loop.Run(context.Background())
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if summary.TasksProcessed != 1 || summary.TasksSucceeded != 1 || summary.TasksFailed != 0 {
		t.Fatalf("unexpected summary %+v", summary)
	}
	if len(client.sessionUpdates) != 2 {
		t.Fatalf("expected 2 session updates, got %d", len(client.sessionUpdates))
	}
	if client.sessionUpdates[0].status != model.AgentSessionStatusRunning || client.sessionUpdates[1].status != model.AgentSessionStatusCommitted {
		t.Fatalf("unexpected session updates %+v", client.sessionUpdates)
	}
	if client.sessionUpdates[1].finalMessage == nil || *client.sessionUpdates[1].finalMessage != "修复完成" {
		t.Fatalf("expected final message to be propagated, got %+v", client.sessionUpdates[1].finalMessage)
	}
	if client.sessionUpdates[1].executorRef == nil || *client.sessionUpdates[1].executorRef != "codex-exec" {
		t.Fatalf("expected executor ref to be propagated, got %+v", client.sessionUpdates[1].executorRef)
	}
	if len(client.updates) != 0 {
		t.Fatalf("expected no task updates, got %+v", client.updates)
	}
}

func TestRunnerLoopRunOnceCancelsSessionWhenInterruptedRemotely(t *testing.T) {
	client := &fakeRunnerLoopClient{
		registerResp: &RunnerRegistration{ID: "run_123", Name: "mac-mini", Platform: "feishu"},
		nextSessions: []*RunnerSession{
			{ID: "ags_123", RunnerID: "run_123", ConversationID: "agc_123", Status: model.AgentSessionStatusCreated, UserMessage: ptrLoopString("继续修复 parser panic")},
		},
		sessionByID: map[string][]*RunnerSession{
			"ags_123": {
				{ID: "ags_123", RunnerID: "run_123", ConversationID: "agc_123", Status: model.AgentSessionStatusRunning},
				{ID: "ags_123", RunnerID: "run_123", ConversationID: "agc_123", Status: model.AgentSessionStatusInterrupted},
			},
		},
	}
	executor := &blockingRunnerExecutor{started: make(chan struct{})}
	loop := NewRunnerLoop(client, executor,
		WithLoopRunnerName("mac-mini"),
		WithLoopRunnerPlatform("feishu"),
		WithLoopOnce(true),
		WithLoopSessionWatchInterval(1*time.Millisecond),
	)

	summary, err := loop.Run(context.Background())
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if summary.TasksProcessed != 1 || summary.TasksFailed != 0 {
		t.Fatalf("unexpected summary %+v", summary)
	}
	if len(client.sessionUpdates) != 1 {
		t.Fatalf("expected only running update, got %+v", client.sessionUpdates)
	}
	if client.sessionUpdates[0].status != model.AgentSessionStatusRunning {
		t.Fatalf("unexpected session updates %+v", client.sessionUpdates)
	}
	if len(client.heartbeats) < 3 {
		t.Fatalf("expected idle,busy,idle heartbeats, got %+v", client.heartbeats)
	}
	if client.heartbeats[len(client.heartbeats)-1] != model.AgentRunnerStateIdle {
		t.Fatalf("expected final heartbeat idle, got %+v", client.heartbeats)
	}
}

func TestRunnerLoopRunOnceProcessesSuccessTask(t *testing.T) {
	client := &fakeRunnerLoopClient{
		registerResp: &RunnerRegistration{ID: "run_123", Name: "mac-mini", Platform: "feishu"},
		nextTasks: []*RunnerTask{
			{ID: "agt_123", RunnerID: "run_123", TaskText: "fix parser panic"},
		},
	}
	loop := NewRunnerLoop(client, &fakeRunnerExecutor{},
		WithLoopRunnerName("mac-mini"),
		WithLoopRunnerPlatform("feishu"),
		WithLoopOnce(true),
	)

	summary, err := loop.Run(context.Background())
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if summary.RunnerID != "run_123" {
		t.Fatalf("expected runner id run_123, got %q", summary.RunnerID)
	}
	if summary.TasksProcessed != 1 || summary.TasksSucceeded != 1 || summary.TasksFailed != 0 {
		t.Fatalf("unexpected summary %+v", summary)
	}
	if len(client.updates) != 2 {
		t.Fatalf("expected 2 task updates, got %d", len(client.updates))
	}
	if client.updates[0].status != "running" || client.updates[1].status != "succeeded" {
		t.Fatalf("unexpected updates %+v", client.updates)
	}
}

func TestRunnerLoopRunOnceMarksFailedTask(t *testing.T) {
	client := &fakeRunnerLoopClient{
		registerResp: &RunnerRegistration{ID: "run_123", Name: "mac-mini", Platform: "feishu"},
		nextTasks: []*RunnerTask{
			{ID: "agt_123", RunnerID: "run_123", TaskText: "fix parser panic"},
		},
	}
	loop := NewRunnerLoop(client, &fakeRunnerExecutor{err: errors.New("executor failed")},
		WithLoopRunnerName("mac-mini"),
		WithLoopRunnerPlatform("feishu"),
		WithLoopOnce(true),
	)

	summary, err := loop.Run(context.Background())
	if err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if summary.TasksProcessed != 1 || summary.TasksSucceeded != 0 || summary.TasksFailed != 1 {
		t.Fatalf("unexpected summary %+v", summary)
	}
	if len(client.updates) != 2 {
		t.Fatalf("expected 2 task updates, got %d", len(client.updates))
	}
	if client.updates[1].status != "failed" {
		t.Fatalf("expected failed update, got %+v", client.updates[1])
	}
	if client.updates[1].errorMessage == nil || *client.updates[1].errorMessage != "executor failed" {
		t.Fatalf("expected executor failed message, got %+v", client.updates[1].errorMessage)
	}
}

func TestRunnerLoopRunRequiresRunnerIdentity(t *testing.T) {
	loop := NewRunnerLoop(&fakeRunnerLoopClient{}, &fakeRunnerExecutor{},
		WithLoopOnce(true),
		WithLoopPollInterval(10*time.Millisecond),
	)
	if _, err := loop.Run(context.Background()); err == nil {
		t.Fatal("expected validation error without runner id or registration identity")
	}
}

func ptrLoopString(v string) *string {
	return &v
}
