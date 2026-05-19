package kvsync

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
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
			if ctx.Err() != nil {
				return nil
			}
			logging.WithError(err).WithField("worker_id", w.workerID).Warn("kvsync worker process failed")
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

	waitCtx, cancel := context.WithTimeout(ctx, w.timeout)
	defer cancel()

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
	lastSeen := make(map[int64]string, len(pending))

	for len(pending) > 0 {
		for id := range pending {
			job, err := w.repo.GetByID(waitCtx, id)
			if err != nil {
				if waitCtx.Err() != nil {
					return fmt.Errorf("kvsync wait timeout after %s: pending=%s: %w", w.timeout, formatPendingJobs(pending, lastSeen), waitCtx.Err())
				}
				return err
			}
			if job == nil {
				lastSeen[id] = "not_found"
				continue
			}
			lastSeen[id] = describeJobStatus(job)
			switch job.Status {
			case model.KVSyncJobStatusDone, model.KVSyncJobStatusObsolete:
				delete(pending, id)
			case model.KVSyncJobStatusDead, model.KVSyncJobStatusFailed:
				return fmt.Errorf("kvsync job %d failed: %s", id, describeJobStatus(job))
			}
		}
		if len(pending) == 0 {
			break
		}

		select {
		case <-waitCtx.Done():
			return fmt.Errorf("kvsync wait timeout after %s: pending=%s: %w", w.timeout, formatPendingJobs(pending, lastSeen), waitCtx.Err())
		case <-ticker.C:
		}
	}

	return nil
}

func describeJobStatus(job *model.KVSyncJob) string {
	if job == nil {
		return "not_found"
	}
	parts := []string{
		"status=" + string(job.Status),
		fmt.Sprintf("attempts=%d/%d", job.Attempts, job.MaxAttempts),
	}
	if job.LockedBy != nil && strings.TrimSpace(*job.LockedBy) != "" {
		parts = append(parts, "locked_by="+strings.TrimSpace(*job.LockedBy))
	}
	if job.LockedAt != nil {
		parts = append(parts, "locked_at="+job.LockedAt.UTC().Format(time.RFC3339))
	}
	if job.LastError != nil && strings.TrimSpace(*job.LastError) != "" {
		parts = append(parts, "last_error="+strings.TrimSpace(*job.LastError))
	}
	return strings.Join(parts, " ")
}

func formatPendingJobs(pending map[int64]struct{}, lastSeen map[int64]string) string {
	if len(pending) == 0 {
		return "none"
	}
	ids := make([]int64, 0, len(pending))
	for id := range pending {
		ids = append(ids, id)
	}
	sort.Slice(ids, func(i, j int) bool { return ids[i] < ids[j] })

	items := make([]string, 0, len(ids))
	for _, id := range ids {
		status := lastSeen[id]
		if status == "" {
			status = "unknown"
		}
		items = append(items, fmt.Sprintf("%d{%s}", id, status))
	}
	return strings.Join(items, ",")
}
