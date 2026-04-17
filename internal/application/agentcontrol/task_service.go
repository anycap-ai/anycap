package agentcontrol

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type FixedRunnerResolver func(platform string, botID string) (int64, error)

type TaskService struct {
	bindings            port.IMBindingRepository
	runners             port.AgentRunnerRepository
	tasks               port.AgentTaskRepository
	dispatcher          port.AgentRunnerDispatcher
	now                 func() time.Time
	fixedRunnerResolver FixedRunnerResolver
}

type TaskServiceOption func(*TaskService)

type InboundCommandInput struct {
	Platform string
	BotID    string
	SenderID string
	Message  string
}

type RunnerTaskUpdateInput struct {
	TaskID       int64
	Status       string
	ErrorMessage *string
}

func NewTaskService(bindings port.IMBindingRepository, runners port.AgentRunnerRepository, tasks port.AgentTaskRepository, dispatcher port.AgentRunnerDispatcher, options ...TaskServiceOption) *TaskService {
	service := &TaskService{
		bindings:   bindings,
		runners:    runners,
		tasks:      tasks,
		dispatcher: dispatcher,
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

func WithTaskClock(now func() time.Time) TaskServiceOption {
	return func(s *TaskService) {
		if now != nil {
			s.now = now
		}
	}
}

func WithFixedRunnerResolver(resolver FixedRunnerResolver) TaskServiceOption {
	return func(s *TaskService) {
		if resolver != nil {
			s.fixedRunnerResolver = resolver
		}
	}
}

func (s *TaskService) CreateTaskFromInboundCommand(ctx context.Context, input InboundCommandInput) (*model.AgentTask, error) {
	if s == nil || s.bindings == nil || s.runners == nil || s.tasks == nil {
		return nil, model.ErrNotConfigured("task service is not configured")
	}
	if s.fixedRunnerResolver == nil {
		return nil, model.ErrNotConfigured("fixed runner resolver is not configured")
	}
	platform, err := normalizeIMPlatform(input.Platform)
	if err != nil {
		return nil, err
	}
	binding, err := s.bindings.GetActiveByPlatformSender(ctx, platform, strings.TrimSpace(input.BotID), strings.TrimSpace(input.SenderID))
	if err != nil {
		return nil, err
	}
	if binding == nil || binding.ID <= 0 {
		return nil, model.ErrAuthInvalid
	}

	parsed, err := ParseCommand(input.Message)
	if err != nil {
		return nil, err
	}
	runnerID, err := s.fixedRunnerResolver(platform, strings.TrimSpace(input.BotID))
	if err != nil {
		return nil, fmt.Errorf("resolve fixed runner: %w", err)
	}
	runner, err := s.runners.GetRunnerByID(ctx, runnerID)
	if err != nil {
		return nil, err
	}
	if runner == nil || runner.ID <= 0 {
		return nil, model.ErrNotFound("agent runner not found")
	}
	if strings.TrimSpace(runner.UserID) != strings.TrimSpace(binding.UserID) {
		return nil, model.ErrAuthInvalid
	}
	if runner.FixedBinding != nil && *runner.FixedBinding != binding.ID {
		return nil, model.ErrAuthInvalid
	}

	now := s.now().UTC()
	task := model.AgentTask{
		UserID:         binding.UserID,
		RunnerID:       runner.ID,
		Platform:       platform,
		Intent:         parsed.Intent,
		TaskText:       parsed.TaskText,
		WorkspaceHint:  parsed.WorkspaceHint,
		RunnerSelector: parsed.RunnerSelector,
		Status:         model.AgentTaskStatusQueued,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	return s.tasks.CreateTask(ctx, task)
}

func (s *TaskService) DispatchQueuedTask(ctx context.Context, taskID int64) (*model.AgentTask, error) {
	if s == nil || s.tasks == nil || s.runners == nil || s.dispatcher == nil {
		return nil, model.ErrNotConfigured("task service is not configured")
	}
	task, err := s.tasks.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if task == nil || task.ID <= 0 {
		return nil, model.ErrNotFound("agent task not found")
	}
	if task.Status == model.AgentTaskStatusDispatched {
		return task, nil
	}
	if task.Status != model.AgentTaskStatusQueued {
		return nil, model.ErrConflict("agent task is not queued")
	}
	runner, err := s.runners.GetRunnerByID(ctx, task.RunnerID)
	if err != nil {
		return nil, err
	}
	if runner == nil || runner.ID <= 0 {
		return nil, model.ErrNotFound("agent runner not found")
	}

	if err := s.dispatcher.DispatchTask(ctx, *runner, *task); err != nil {
		return nil, err
	}
	now := s.now().UTC()
	return s.tasks.UpdateTask(ctx, model.AgentTaskUpdate{
		ID:           task.ID,
		Status:       model.AgentTaskStatusDispatched,
		DispatchedAt: &now,
		UpdatedAt:    now,
	})
}

func (s *TaskService) ApplyRunnerUpdate(ctx context.Context, input RunnerTaskUpdateInput) (*model.AgentTask, error) {
	if s == nil || s.tasks == nil {
		return nil, model.ErrNotConfigured("task service is not configured")
	}
	task, err := s.tasks.GetTaskByID(ctx, input.TaskID)
	if err != nil {
		return nil, err
	}
	if task == nil || task.ID <= 0 {
		return nil, model.ErrNotFound("agent task not found")
	}
	if strings.TrimSpace(input.Status) == "" {
		return nil, model.ErrValidation("task status is required")
	}
	if task.Status == input.Status {
		return task, nil
	}

	next := *task
	if err := next.TransitionTo(input.Status); err != nil {
		return nil, err
	}

	now := s.now().UTC()
	update := model.AgentTaskUpdate{
		ID:           task.ID,
		Status:       next.Status,
		ErrorMessage: input.ErrorMessage,
		UpdatedAt:    now,
	}
	switch next.Status {
	case model.AgentTaskStatusRunning:
		update.StartedAt = &now
	case model.AgentTaskStatusSucceeded, model.AgentTaskStatusFailed, model.AgentTaskStatusCanceled, model.AgentTaskStatusTimedOut:
		update.CompletedAt = &now
	}
	return s.tasks.UpdateTask(ctx, update)
}

func (s *TaskService) GetNextTaskForRunner(ctx context.Context, principal *model.Principal, runnerID int64) (*model.AgentTask, error) {
	if s == nil || s.tasks == nil || s.runners == nil {
		return nil, model.ErrNotConfigured("task service is not configured")
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

	items, err := s.tasks.ListDispatchableTasksByRunner(ctx, runnerID, 1)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, nil
	}
	task := items[0]
	return &task, nil
}

func (s *TaskService) CancelTask(ctx context.Context, principal *model.Principal, taskID int64) (*model.AgentTask, error) {
	if s == nil || s.tasks == nil {
		return nil, model.ErrNotConfigured("task service is not configured")
	}
	if principal == nil || strings.TrimSpace(principal.UserID) == "" || strings.TrimSpace(principal.AuthType) == "" {
		return nil, model.ErrAuthInvalid
	}
	task, err := s.tasks.GetTaskByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if task == nil || task.ID <= 0 {
		return nil, model.ErrNotFound("agent task not found")
	}
	if strings.TrimSpace(task.UserID) != strings.TrimSpace(principal.UserID) {
		return nil, model.ErrAuthInvalid
	}
	if task.Status == model.AgentTaskStatusCanceled {
		return task, nil
	}

	next := *task
	if err := next.TransitionTo(model.AgentTaskStatusCanceled); err != nil {
		return nil, err
	}
	now := s.now().UTC()
	return s.tasks.UpdateTask(ctx, model.AgentTaskUpdate{
		ID:          task.ID,
		Status:      model.AgentTaskStatusCanceled,
		CompletedAt: &now,
		UpdatedAt:   now,
	})
}
