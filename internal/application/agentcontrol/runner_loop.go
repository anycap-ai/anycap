package agentcontrol

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type RunnerRegistration struct {
	ID       string
	Name     string
	Platform string
}

type RunnerTask struct {
	ID             string
	UserID         string
	RunnerID       string
	Platform       string
	Intent         string
	TaskText       string
	WorkspaceHint  *string
	RunnerSelector *string
	Status         string
}

type RunnerSession struct {
	ID              string
	UserID          string
	ConversationID  string
	ParentSessionID *string
	RunnerID        string
	Agent           string
	Mode            string
	UserMessage     *string
	FinalMessage    *string
	Status          string
	ExecutorRef     *string
}

type RunnerTaskExecutionResult struct {
	ErrorMessage *string
}

type RunnerSessionExecutionResult struct {
	FinalMessage *string
	ExecutorRef  *string
}

type RunnerLoopSummary struct {
	RunnerID       string
	TasksProcessed int
	TasksSucceeded int
	TasksFailed    int
}

type RunnerLoopClient interface {
	Register(ctx context.Context, name string, platform string) (*RunnerRegistration, error)
	Heartbeat(ctx context.Context, runnerID string, state string) error
	NextSession(ctx context.Context, runnerID string) (*RunnerSession, error)
	GetSession(ctx context.Context, runnerID string, sessionID string) (*RunnerSession, error)
	UpdateSession(ctx context.Context, runnerID string, sessionID string, status string, finalMessage *string, executorRef *string, idempotencyKey string) error
	NextTask(ctx context.Context, runnerID string) (*RunnerTask, error)
	UpdateTask(ctx context.Context, runnerID string, taskID string, status string, errorMessage *string, idempotencyKey string) error
}

type RunnerTaskExecutor interface {
	ExecuteTask(ctx context.Context, task RunnerTask) (*RunnerTaskExecutionResult, error)
	ExecuteSession(ctx context.Context, session RunnerSession) (*RunnerSessionExecutionResult, error)
}

type RunnerLoop struct {
	client               RunnerLoopClient
	executor             RunnerTaskExecutor
	runnerID             string
	runnerName           string
	platform             string
	once                 bool
	pollInterval         time.Duration
	sessionWatchInterval time.Duration
	sleep                func(context.Context, time.Duration) error
}

type RunnerLoopOption func(*RunnerLoop)

func NewRunnerLoop(client RunnerLoopClient, executor RunnerTaskExecutor, opts ...RunnerLoopOption) *RunnerLoop {
	loop := &RunnerLoop{
		client:               client,
		executor:             executor,
		pollInterval:         3 * time.Second,
		sessionWatchInterval: 500 * time.Millisecond,
		sleep: func(ctx context.Context, d time.Duration) error {
			timer := time.NewTimer(d)
			defer timer.Stop()
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-timer.C:
				return nil
			}
		},
	}
	for _, opt := range opts {
		if opt != nil {
			opt(loop)
		}
	}
	return loop
}

func WithLoopSessionWatchInterval(interval time.Duration) RunnerLoopOption {
	return func(l *RunnerLoop) {
		if interval > 0 {
			l.sessionWatchInterval = interval
		}
	}
}

func WithLoopRunnerID(id string) RunnerLoopOption {
	return func(l *RunnerLoop) {
		l.runnerID = strings.TrimSpace(id)
	}
}

func WithLoopRunnerName(name string) RunnerLoopOption {
	return func(l *RunnerLoop) {
		l.runnerName = strings.TrimSpace(name)
	}
}

func WithLoopRunnerPlatform(platform string) RunnerLoopOption {
	return func(l *RunnerLoop) {
		l.platform = strings.ToLower(strings.TrimSpace(platform))
	}
}

func WithLoopOnce(once bool) RunnerLoopOption {
	return func(l *RunnerLoop) {
		l.once = once
	}
}

func WithLoopPollInterval(interval time.Duration) RunnerLoopOption {
	return func(l *RunnerLoop) {
		if interval > 0 {
			l.pollInterval = interval
		}
	}
}

func WithLoopSleep(fn func(context.Context, time.Duration) error) RunnerLoopOption {
	return func(l *RunnerLoop) {
		if fn != nil {
			l.sleep = fn
		}
	}
}

func (l *RunnerLoop) Run(ctx context.Context) (RunnerLoopSummary, error) {
	if l == nil || l.client == nil || l.executor == nil {
		return RunnerLoopSummary{}, model.ErrNotConfigured("runner loop is not configured")
	}
	if strings.TrimSpace(l.runnerID) == "" {
		if strings.TrimSpace(l.runnerName) == "" || strings.TrimSpace(l.platform) == "" {
			return RunnerLoopSummary{}, model.ErrValidation("runner name and platform are required when runner id is not provided")
		}
		reg, err := l.client.Register(ctx, l.runnerName, l.platform)
		if err != nil {
			return RunnerLoopSummary{}, err
		}
		if reg == nil || strings.TrimSpace(reg.ID) == "" {
			return RunnerLoopSummary{}, model.ErrValidation("runner registration response missing runner id")
		}
		l.runnerID = strings.TrimSpace(reg.ID)
	}

	summary := RunnerLoopSummary{RunnerID: l.runnerID}
	for {
		processed, succeeded, err := l.runIteration(ctx)
		if err != nil {
			return summary, err
		}
		if processed {
			summary.TasksProcessed++
			if succeeded {
				summary.TasksSucceeded++
			} else {
				summary.TasksFailed++
			}
		}
		if l.once {
			return summary, nil
		}
		if err := l.sleep(ctx, l.pollInterval); err != nil {
			if err == context.Canceled || err == context.DeadlineExceeded {
				return summary, nil
			}
			return summary, err
		}
	}
}

func (l *RunnerLoop) runIteration(ctx context.Context) (processed bool, succeeded bool, err error) {
	if err := l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateIdle); err != nil {
		return false, false, err
	}
	session, err := l.client.NextSession(ctx, l.runnerID)
	if err != nil {
		return false, false, err
	}
	if session != nil && strings.TrimSpace(session.ID) != "" {
		return l.processSession(ctx, *session)
	}
	task, err := l.client.NextTask(ctx, l.runnerID)
	if err != nil {
		return false, false, err
	}
	if task == nil || strings.TrimSpace(task.ID) == "" {
		return false, false, nil
	}
	return l.processTask(ctx, *task)
}

func (l *RunnerLoop) processSession(ctx context.Context, session RunnerSession) (processed bool, succeeded bool, err error) {
	if err := l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateBusy); err != nil {
		return false, false, err
	}
	if err := l.client.UpdateSession(ctx, l.runnerID, session.ID, model.AgentSessionStatusRunning, nil, nil, session.ID+":running"); err != nil {
		return true, false, err
	}
	execCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	interrupted := make(chan struct{}, 1)
	watchDone := make(chan struct{})
	go l.watchSessionInterruption(execCtx, session, cancel, interrupted, watchDone)

	execResult, execErr := l.executor.ExecuteSession(execCtx, session)
	close(watchDone)
	interruptedRemotely := false
	select {
	case <-interrupted:
		interruptedRemotely = true
	default:
	}
	if interruptedRemotely {
		if err := l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateIdle); err != nil {
			return true, true, err
		}
		return true, true, nil
	}
	if execErr != nil {
		msg := strings.TrimSpace(execErr.Error())
		if msg == "" {
			msg = "session execution failed"
		}
		if updateErr := l.client.UpdateSession(ctx, l.runnerID, session.ID, model.AgentSessionStatusFailed, &msg, nil, session.ID+":failed"); updateErr != nil {
			return true, false, fmt.Errorf("update failed session status: %w", updateErr)
		}
		_ = l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateIdle)
		return true, false, nil
	}
	var finalMessage *string
	var executorRef *string
	if execResult != nil {
		finalMessage = execResult.FinalMessage
		executorRef = execResult.ExecutorRef
	}
	if err := l.client.UpdateSession(ctx, l.runnerID, session.ID, model.AgentSessionStatusCommitted, finalMessage, executorRef, session.ID+":committed"); err != nil {
		return true, false, err
	}
	if err := l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateIdle); err != nil {
		return true, true, err
	}
	return true, true, nil
}

func (l *RunnerLoop) watchSessionInterruption(ctx context.Context, session RunnerSession, cancel context.CancelFunc, interrupted chan<- struct{}, done <-chan struct{}) {
	if l == nil || l.client == nil {
		return
	}
	ticker := time.NewTicker(l.sessionWatchInterval)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case <-ctx.Done():
			return
		case <-ticker.C:
			current, err := l.client.GetSession(ctx, l.runnerID, session.ID)
			if err != nil || current == nil {
				continue
			}
			if current.Status == model.AgentSessionStatusInterrupted {
				select {
				case interrupted <- struct{}{}:
				default:
				}
				cancel()
				return
			}
		}
	}
}

func (l *RunnerLoop) processTask(ctx context.Context, task RunnerTask) (processed bool, succeeded bool, err error) {
	if err := l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateBusy); err != nil {
		return false, false, err
	}
	if err := l.client.UpdateTask(ctx, l.runnerID, task.ID, model.AgentTaskStatusRunning, nil, task.ID+":running"); err != nil {
		return true, false, err
	}
	execResult, execErr := l.executor.ExecuteTask(ctx, task)
	if execErr != nil {
		msg := strings.TrimSpace(execErr.Error())
		if msg == "" {
			msg = "task execution failed"
		}
		if execResult != nil && execResult.ErrorMessage != nil && strings.TrimSpace(*execResult.ErrorMessage) != "" {
			msg = strings.TrimSpace(*execResult.ErrorMessage)
		}
		if updateErr := l.client.UpdateTask(ctx, l.runnerID, task.ID, model.AgentTaskStatusFailed, &msg, task.ID+":failed"); updateErr != nil {
			return true, false, fmt.Errorf("update failed task status: %w", updateErr)
		}
		_ = l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateIdle)
		return true, false, nil
	}
	if err := l.client.UpdateTask(ctx, l.runnerID, task.ID, model.AgentTaskStatusSucceeded, nil, task.ID+":succeeded"); err != nil {
		return true, false, err
	}
	if err := l.client.Heartbeat(ctx, l.runnerID, model.AgentRunnerStateIdle); err != nil {
		return true, true, err
	}
	return true, true, nil
}

type StubExecutor struct {
	Delay        time.Duration
	FailureError error
}

func (e StubExecutor) ExecuteTask(ctx context.Context, _ RunnerTask) (*RunnerTaskExecutionResult, error) {
	if e.Delay > 0 {
		timer := time.NewTimer(e.Delay)
		defer timer.Stop()
		select {
		case <-ctx.Done():
			return &RunnerTaskExecutionResult{}, ctx.Err()
		case <-timer.C:
		}
	}
	return &RunnerTaskExecutionResult{}, e.FailureError
}

func (e StubExecutor) ExecuteSession(ctx context.Context, _ RunnerSession) (*RunnerSessionExecutionResult, error) {
	_, err := e.ExecuteTask(ctx, RunnerTask{})
	return &RunnerSessionExecutionResult{}, err
}
