package kvsync

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const (
	defaultWorkerPollInterval = 1 * time.Second
	defaultWorkerLockTTL      = 5 * time.Minute
	defaultWaitPollInterval   = 100 * time.Millisecond
	defaultWaitTimeout        = 5 * time.Second
)

type JobRepo interface {
	Create(ctx context.Context, job model.KVSyncJob) (*model.KVSyncJob, error)
	GetByID(ctx context.Context, id int64) (*model.KVSyncJob, error)
	ClaimNext(ctx context.Context, workerID string, now time.Time) (*model.KVSyncJob, error)
	MarkDone(ctx context.Context, id int64) error
	MarkObsolete(ctx context.Context, id int64) error
	MarkFailed(ctx context.Context, id int64, lastError string, nextRetryAt time.Time) (model.KVSyncJobStatus, error)
	RequeueStaleProcessing(ctx context.Context, staleBefore time.Time) (int64, error)
}

type ProjectResult int

const (
	ProjectResultDone ProjectResult = iota
	ProjectResultObsolete
)

type Projector interface {
	Project(ctx context.Context, job model.KVSyncJob) (ProjectResult, error)
}

type WorkerConfig struct {
	WorkerID     string
	PollInterval time.Duration
	LockTTL      time.Duration
}

type Worker struct {
	repo       JobRepo
	projectors map[string]Projector
	workerID   string
	interval   time.Duration
	lockTTL    time.Duration
	now        func() time.Time
}

func NewWorker(repo JobRepo, projectors map[string]Projector, cfg WorkerConfig) *Worker {
	workerID := strings.TrimSpace(cfg.WorkerID)
	if workerID == "" {
		workerID = "kvsync-worker"
	}
	interval := cfg.PollInterval
	if interval <= 0 {
		interval = defaultWorkerPollInterval
	}
	lockTTL := cfg.LockTTL
	if lockTTL <= 0 {
		lockTTL = defaultWorkerLockTTL
	}
	return &Worker{
		repo:       repo,
		projectors: projectors,
		workerID:   workerID,
		interval:   interval,
		lockTTL:    lockTTL,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func (w *Worker) Run(ctx context.Context) error {
	if w == nil || w.repo == nil {
		return fmt.Errorf("kvsync worker repo is not configured")
	}

	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		if err := w.processOne(ctx); err != nil {
			return err
		}

		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
		}
	}
}

func (w *Worker) processOne(ctx context.Context) error {
	if w == nil || w.repo == nil {
		return fmt.Errorf("kvsync worker repo is not configured")
	}

	_, _ = w.repo.RequeueStaleProcessing(ctx, w.now().Add(-w.lockTTL))

	job, err := w.repo.ClaimNext(ctx, w.workerID, w.now())
	if err != nil {
		return err
	}
	if job == nil {
		return nil
	}

	projector, ok := w.projectors[job.JobType]
	if !ok || projector == nil {
		_, markErr := w.repo.MarkFailed(ctx, job.ID, "unsupported job type: "+job.JobType, w.now().Add(time.Duration(model.KVSyncJobDefaultBackoffSeconds)*time.Second))
		return markErr
	}

	result, err := projector.Project(ctx, *job)
	if err != nil {
		_, markErr := w.repo.MarkFailed(ctx, job.ID, err.Error(), w.nextRetryAt(job.Attempts))
		return markErr
	}

	switch result {
	case ProjectResultObsolete:
		return w.repo.MarkObsolete(ctx, job.ID)
	default:
		return w.repo.MarkDone(ctx, job.ID)
	}
}

func (w *Worker) nextRetryAt(currentAttempts int) time.Time {
	baseSeconds := model.KVSyncJobDefaultBackoffSeconds
	shift := currentAttempts
	if shift < 0 {
		shift = 0
	}
	if shift > 8 {
		shift = 8
	}
	backoffSeconds := baseSeconds << shift
	return w.now().Add(time.Duration(backoffSeconds) * time.Second)
}

type Waiter struct {
	repo         JobRepo
	pollInterval time.Duration
	timeout      time.Duration
	now          func() time.Time
}

type WaiterConfig struct {
	PollInterval time.Duration
	Timeout      time.Duration
}

func NewWaiter(repo JobRepo, cfg WaiterConfig) *Waiter {
	interval := cfg.PollInterval
	if interval <= 0 {
		interval = defaultWaitPollInterval
	}
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = defaultWaitTimeout
	}
	return &Waiter{
		repo:         repo,
		pollInterval: interval,
		timeout:      timeout,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func (w *Waiter) Wait(ctx context.Context, jobIDs []int64) error {
	if w == nil || w.repo == nil || len(jobIDs) == 0 {
		return nil
	}

	waitCtx := ctx
	if _, hasDeadline := ctx.Deadline(); !hasDeadline {
		var cancel context.CancelFunc
		waitCtx, cancel = context.WithTimeout(ctx, w.timeout)
		defer cancel()
	}

	pending := make(map[int64]struct{}, len(jobIDs))
	for _, id := range jobIDs {
		if id > 0 {
			pending[id] = struct{}{}
		}
	}
	if len(pending) == 0 {
		return nil
	}

	ticker := time.NewTicker(w.pollInterval)
	defer ticker.Stop()

	for len(pending) > 0 {
		for id := range pending {
			job, err := w.repo.GetByID(waitCtx, id)
			if err != nil {
				return err
			}
			if job == nil {
				continue
			}
			switch job.Status {
			case model.KVSyncJobStatusDone, model.KVSyncJobStatusObsolete:
				delete(pending, id)
			case model.KVSyncJobStatusDead, model.KVSyncJobStatusFailed:
				return fmt.Errorf("kvsync job %d failed with status=%s", id, job.Status)
			}
		}
		if len(pending) == 0 {
			break
		}

		select {
		case <-waitCtx.Done():
			return waitCtx.Err()
		case <-ticker.C:
		}
	}

	return nil
}
