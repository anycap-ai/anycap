package agentcontrol

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeRunnerRepo struct {
	itemsByID map[int64]model.AgentRunner
	getErr    error
}

func (r *fakeRunnerRepo) CreateRunner(_ context.Context, _ model.AgentRunner) (*model.AgentRunner, error) {
	return nil, errors.New("unexpected CreateRunner call")
}

func (r *fakeRunnerRepo) GetRunnerByID(_ context.Context, id int64) (*model.AgentRunner, error) {
	if r.getErr != nil {
		return nil, r.getErr
	}
	if item, ok := r.itemsByID[id]; ok {
		copy := item
		return &copy, nil
	}
	return nil, nil
}

func (r *fakeRunnerRepo) ListRunnersByUser(_ context.Context, _ string) ([]model.AgentRunner, error) {
	return nil, errors.New("unexpected ListRunnersByUser call")
}

func (r *fakeRunnerRepo) UpdateRunnerState(_ context.Context, _ int64, _ string) (*model.AgentRunner, error) {
	return nil, errors.New("unexpected UpdateRunnerState call")
}

type fakeTaskRepo struct {
	created       []model.AgentTask
	updated       []model.AgentTaskUpdate
	tasksByID     map[int64]model.AgentTask
	createErr     error
	getErr        error
	updateErr     error
	createCalls   int
	updateCalls   int
	creationOrder []string
}

func (r *fakeTaskRepo) CreateTask(_ context.Context, task model.AgentTask) (*model.AgentTask, error) {
	if r.createErr != nil {
		return nil, r.createErr
	}
	r.createCalls++
	r.creationOrder = append(r.creationOrder, "create")
	r.created = append(r.created, task)
	item := task
	item.ID = int64(len(r.created))
	if r.tasksByID == nil {
		r.tasksByID = map[int64]model.AgentTask{}
	}
	r.tasksByID[item.ID] = item
	return &item, nil
}

func (r *fakeTaskRepo) GetTaskByID(_ context.Context, id int64) (*model.AgentTask, error) {
	if r.getErr != nil {
		return nil, r.getErr
	}
	if item, ok := r.tasksByID[id]; ok {
		copy := item
		return &copy, nil
	}
	return nil, nil
}

func (r *fakeTaskRepo) ListDispatchableTasksByRunner(_ context.Context, runnerID int64, limit int) ([]model.AgentTask, error) {
	result := make([]model.AgentTask, 0, limit)
	for _, item := range r.tasksByID {
		if item.RunnerID != runnerID {
			continue
		}
		if item.Status != model.AgentTaskStatusDispatched && item.Status != model.AgentTaskStatusQueued {
			continue
		}
		result = append(result, item)
		if limit > 0 && len(result) >= limit {
			break
		}
	}
	return result, nil
}

func (r *fakeTaskRepo) UpdateTask(_ context.Context, input model.AgentTaskUpdate) (*model.AgentTask, error) {
	if r.updateErr != nil {
		return nil, r.updateErr
	}
	r.updateCalls++
	r.creationOrder = append(r.creationOrder, "update")
	r.updated = append(r.updated, input)
	item, ok := r.tasksByID[input.ID]
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
	r.tasksByID[input.ID] = item
	return &item, nil
}

func TestTaskServiceGetNextTaskForRunnerReturnsDispatchableTask(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 10, 0, 0, time.UTC)
	taskRepo := &fakeTaskRepo{
		tasksByID: map[int64]model.AgentTask{
			1: {
				ID:        1,
				UserID:    "2000000001",
				RunnerID:  21,
				Platform:  model.IMPlatformFeishu,
				Intent:    model.AgentIntentExecuteTask,
				TaskText:  "fix parser panic",
				Status:    model.AgentTaskStatusDispatched,
				CreatedAt: now,
				UpdatedAt: now,
			},
		},
	}
	service := NewTaskService(&fakeBindingRepo{}, &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {
				ID:       21,
				UserID:   "2000000001",
				Name:     "runner-a",
				Platform: model.IMPlatformFeishu,
				State:    model.AgentRunnerStateIdle,
			},
		},
	}, taskRepo, NewPollingDispatcher())

	task, err := service.GetNextTaskForRunner(context.Background(), &model.Principal{
		UserID:   "2000000001",
		AuthType: "api_key",
	}, 21)
	if err != nil {
		t.Fatalf("GetNextTaskForRunner() error = %v", err)
	}
	if task == nil || task.ID != 1 {
		t.Fatalf("unexpected next task %+v", task)
	}
}

type fakeDispatcher struct {
	calls       []model.AgentTask
	runners     []model.AgentRunner
	dispatchErr error
	taskRepo    *fakeTaskRepo
}

func (d *fakeDispatcher) DispatchTask(_ context.Context, runner model.AgentRunner, task model.AgentTask) error {
	if d.dispatchErr != nil {
		return d.dispatchErr
	}
	d.runners = append(d.runners, runner)
	d.calls = append(d.calls, task)
	if d.taskRepo != nil && d.taskRepo.createCalls == 0 {
		return errors.New("dispatch happened before task persistence")
	}
	return nil
}

func TestTaskServiceCreateTaskFromInboundCommandCreatesQueuedTask(t *testing.T) {
	now := time.Date(2026, 4, 8, 12, 0, 0, 0, time.UTC)
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
			21: {
				ID:       21,
				UserID:   "2000000001",
				Name:     "runner-a",
				Platform: model.IMPlatformFeishu,
				State:    model.AgentRunnerStateIdle,
			},
		},
	}
	tasks := &fakeTaskRepo{}
	service := NewTaskService(bindings, runners, tasks, &fakeDispatcher{},
		WithTaskClock(func() time.Time { return now }),
		WithFixedRunnerResolver(func(platform string, botID string) (int64, error) {
			if platform == model.IMPlatformFeishu && botID == "bot_123" {
				return 21, nil
			}
			return 0, errors.New("unexpected bot")
		}),
	)

	task, err := service.CreateTaskFromInboundCommand(context.Background(), InboundCommandInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		SenderID: "ou_sender",
		Message:  "/run codex fix parser panic on empty input",
	})
	if err != nil {
		t.Fatalf("CreateTaskFromInboundCommand() error = %v", err)
	}
	if task.Status != model.AgentTaskStatusQueued {
		t.Fatalf("expected queued task, got %q", task.Status)
	}
	if task.RunnerID != 21 {
		t.Fatalf("expected runner 21, got %d", task.RunnerID)
	}
	if task.UserID != "2000000001" {
		t.Fatalf("expected user id 2000000001, got %q", task.UserID)
	}
	if task.Intent != model.AgentIntentExecuteTask {
		t.Fatalf("expected execute task intent, got %q", task.Intent)
	}
	if len(tasks.created) != 1 {
		t.Fatalf("expected 1 created task, got %d", len(tasks.created))
	}
}

func TestTaskServiceDispatchQueuedTaskPersistsBeforeDispatch(t *testing.T) {
	now := time.Date(2026, 4, 8, 12, 30, 0, 0, time.UTC)
	taskRepo := &fakeTaskRepo{
		tasksByID: map[int64]model.AgentTask{
			1: {
				ID:        1,
				UserID:    "2000000001",
				RunnerID:  21,
				Platform:  model.IMPlatformFeishu,
				Intent:    model.AgentIntentExecuteTask,
				TaskText:  "fix parser panic",
				Status:    model.AgentTaskStatusQueued,
				CreatedAt: now.Add(-time.Minute),
				UpdatedAt: now.Add(-time.Minute),
			},
		},
		createCalls: 1,
	}
	dispatcher := &fakeDispatcher{taskRepo: taskRepo}
	service := NewTaskService(&fakeBindingRepo{}, &fakeRunnerRepo{
		itemsByID: map[int64]model.AgentRunner{
			21: {
				ID:       21,
				UserID:   "2000000001",
				Name:     "runner-a",
				Platform: model.IMPlatformFeishu,
				State:    model.AgentRunnerStateIdle,
			},
		},
	}, taskRepo, dispatcher, WithTaskClock(func() time.Time { return now }))

	task, err := service.DispatchQueuedTask(context.Background(), 1)
	if err != nil {
		t.Fatalf("DispatchQueuedTask() error = %v", err)
	}
	if task.Status != model.AgentTaskStatusDispatched {
		t.Fatalf("expected dispatched status, got %q", task.Status)
	}
	if len(dispatcher.calls) != 1 {
		t.Fatalf("expected 1 dispatch call, got %d", len(dispatcher.calls))
	}
	if len(taskRepo.updated) != 1 || taskRepo.updated[0].Status != model.AgentTaskStatusDispatched {
		t.Fatalf("expected dispatched update, got %#v", taskRepo.updated)
	}
}

func TestTaskServiceApplyRunnerUpdateTransitionsTask(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 0, 0, 0, time.UTC)
	taskRepo := &fakeTaskRepo{
		tasksByID: map[int64]model.AgentTask{
			1: {
				ID:           1,
				UserID:       "2000000001",
				RunnerID:     21,
				Platform:     model.IMPlatformFeishu,
				Intent:       model.AgentIntentExecuteTask,
				TaskText:     "fix parser panic",
				Status:       model.AgentTaskStatusDispatched,
				DispatchedAt: ptrTime(now.Add(-2 * time.Minute)),
				CreatedAt:    now.Add(-3 * time.Minute),
				UpdatedAt:    now.Add(-2 * time.Minute),
			},
		},
	}
	service := NewTaskService(&fakeBindingRepo{}, &fakeRunnerRepo{}, taskRepo, &fakeDispatcher{}, WithTaskClock(func() time.Time { return now }))

	running, err := service.ApplyRunnerUpdate(context.Background(), RunnerTaskUpdateInput{
		TaskID: 1,
		Status: model.AgentTaskStatusRunning,
	})
	if err != nil {
		t.Fatalf("ApplyRunnerUpdate(running) error = %v", err)
	}
	if running.Status != model.AgentTaskStatusRunning || running.StartedAt == nil {
		t.Fatalf("expected running task with started_at, got %#v", running)
	}

	failed, err := service.ApplyRunnerUpdate(context.Background(), RunnerTaskUpdateInput{
		TaskID:       1,
		Status:       model.AgentTaskStatusFailed,
		ErrorMessage: ptrString("codex exited 1"),
	})
	if err != nil {
		t.Fatalf("ApplyRunnerUpdate(failed) error = %v", err)
	}
	if failed.Status != model.AgentTaskStatusFailed || failed.CompletedAt == nil {
		t.Fatalf("expected failed task with completed_at, got %#v", failed)
	}
	if failed.ErrorMessage == nil || *failed.ErrorMessage != "codex exited 1" {
		t.Fatalf("expected error message preserved, got %#v", failed.ErrorMessage)
	}
}

func TestTaskServiceApplyRunnerUpdateIsIdempotentForDuplicateStatus(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 30, 0, 0, time.UTC)
	taskRepo := &fakeTaskRepo{
		tasksByID: map[int64]model.AgentTask{
			1: {
				ID:          1,
				UserID:      "2000000001",
				RunnerID:    21,
				Platform:    model.IMPlatformFeishu,
				Intent:      model.AgentIntentExecuteTask,
				TaskText:    "fix parser panic",
				Status:      model.AgentTaskStatusSucceeded,
				CompletedAt: ptrTime(now.Add(-time.Minute)),
				CreatedAt:   now.Add(-2 * time.Minute),
				UpdatedAt:   now.Add(-time.Minute),
			},
		},
	}
	service := NewTaskService(&fakeBindingRepo{}, &fakeRunnerRepo{}, taskRepo, &fakeDispatcher{}, WithTaskClock(func() time.Time { return now }))

	task, err := service.ApplyRunnerUpdate(context.Background(), RunnerTaskUpdateInput{
		TaskID: 1,
		Status: model.AgentTaskStatusSucceeded,
	})
	if err != nil {
		t.Fatalf("ApplyRunnerUpdate() error = %v", err)
	}
	if task.Status != model.AgentTaskStatusSucceeded {
		t.Fatalf("expected succeeded status, got %q", task.Status)
	}
	if len(taskRepo.updated) != 0 {
		t.Fatalf("expected no update write for duplicate status, got %#v", taskRepo.updated)
	}
}

func TestTaskServiceCreateTaskFromInboundCommandRejectsUnauthorizedSender(t *testing.T) {
	service := NewTaskService(&fakeBindingRepo{activeBySender: map[string]model.IMBinding{}}, &fakeRunnerRepo{}, &fakeTaskRepo{}, &fakeDispatcher{},
		WithFixedRunnerResolver(func(platform string, botID string) (int64, error) { return 21, nil }),
	)

	_, err := service.CreateTaskFromInboundCommand(context.Background(), InboundCommandInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		SenderID: "ou_sender",
		Message:  "/run codex fix parser panic on empty input",
	})
	if err == nil {
		t.Fatal("expected unauthorized sender error")
	}
}

func ptrString(v string) *string {
	return &v
}
