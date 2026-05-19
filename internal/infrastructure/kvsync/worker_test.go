package kvsync

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeJobRepo struct {
	jobs   map[int64]*model.KVSyncJob
	order  []int64
	nextID int64
}

func (r *fakeJobRepo) Create(_ context.Context, job model.KVSyncJob) (*model.KVSyncJob, error) {
	if r.jobs == nil {
		r.jobs = map[int64]*model.KVSyncJob{}
	}
	r.nextID++
	cloned := job
	cloned.ID = r.nextID
	if cloned.MaxAttempts <= 0 {
		cloned.MaxAttempts = model.KVSyncJobDefaultMaxAttempts
	}
	if cloned.Status == "" {
		cloned.Status = model.KVSyncJobStatusPending
	}
	r.jobs[cloned.ID] = &cloned
	r.order = append(r.order, cloned.ID)
	return cloneKVSyncJob(&cloned), nil
}

func (r *fakeJobRepo) GetByID(_ context.Context, id int64) (*model.KVSyncJob, error) {
	return cloneKVSyncJob(r.jobs[id]), nil
}

func (r *fakeJobRepo) ClaimNext(_ context.Context, workerID string, now time.Time) (*model.KVSyncJob, error) {
	for _, id := range r.order {
		job, ok := r.jobs[id]
		if !ok {
			continue
		}
		if job.Status != model.KVSyncJobStatusPending && job.Status != model.KVSyncJobStatusFailed {
			continue
		}
		job.Status = model.KVSyncJobStatusProcessing
		job.LockedBy = &workerID
		job.LockedAt = &now
		return cloneKVSyncJob(job), nil
	}
	return nil, nil
}

func (r *fakeJobRepo) MarkDone(_ context.Context, id int64) error {
	job, ok := r.jobs[id]
	if !ok {
		return fmt.Errorf("job not found")
	}
	job.Status = model.KVSyncJobStatusDone
	job.LockedBy = nil
	job.LockedAt = nil
	return nil
}

func (r *fakeJobRepo) MarkObsolete(_ context.Context, id int64) error {
	job, ok := r.jobs[id]
	if !ok {
		return fmt.Errorf("job not found")
	}
	job.Status = model.KVSyncJobStatusObsolete
	job.LockedBy = nil
	job.LockedAt = nil
	return nil
}

func (r *fakeJobRepo) MarkFailed(_ context.Context, id int64, lastError string, _ time.Time) (model.KVSyncJobStatus, error) {
	job, ok := r.jobs[id]
	if !ok {
		return "", fmt.Errorf("job not found")
	}
	job.Attempts++
	if job.Attempts >= job.MaxAttempts {
		job.Status = model.KVSyncJobStatusDead
	} else {
		job.Status = model.KVSyncJobStatusFailed
	}
	job.LastError = &lastError
	job.LockedBy = nil
	job.LockedAt = nil
	return job.Status, nil
}

func (r *fakeJobRepo) RequeueStaleProcessing(_ context.Context, _ time.Time) (int64, error) {
	return 0, nil
}

type fakeProjector struct {
	result ProjectResult
	err    error
}

func (p *fakeProjector) Project(_ context.Context, _ model.KVSyncJob) (ProjectResult, error) {
	return p.result, p.err
}

type flakyClaimJobRepo struct {
	*fakeJobRepo
	claimFailures atomic.Int32
	markedDone    chan struct{}
}

func (r *flakyClaimJobRepo) ClaimNext(ctx context.Context, workerID string, now time.Time) (*model.KVSyncJob, error) {
	if r.claimFailures.Add(-1) >= 0 {
		return nil, fmt.Errorf("temporary claim failure")
	}
	return r.fakeJobRepo.ClaimNext(ctx, workerID, now)
}

func (r *flakyClaimJobRepo) MarkDone(ctx context.Context, id int64) error {
	err := r.fakeJobRepo.MarkDone(ctx, id)
	if err == nil && r.markedDone != nil {
		select {
		case <-r.markedDone:
		default:
			close(r.markedDone)
		}
	}
	return err
}

func TestWorker_ProcessOne_Done(t *testing.T) {
	repo := &fakeJobRepo{}
	_, _ = repo.Create(context.Background(), model.KVSyncJob{
		JobType:     "job-1",
		TargetID:    "1",
		EdgeVersion: 1,
		MaxAttempts: 3,
	})

	worker := NewWorker(repo, map[string]Projector{
		"job-1": &fakeProjector{result: ProjectResultDone},
	}, WorkerConfig{WorkerID: "w1"})

	if err := worker.processOne(context.Background()); err != nil {
		t.Fatalf("processOne() error = %v", err)
	}

	job, _ := repo.GetByID(context.Background(), 1)
	if job == nil || job.Status != model.KVSyncJobStatusDone {
		t.Fatalf("expected done status, got %+v", job)
	}
}

func TestWorker_ProcessOne_Obsolete(t *testing.T) {
	repo := &fakeJobRepo{}
	_, _ = repo.Create(context.Background(), model.KVSyncJob{
		JobType:     "job-2",
		TargetID:    "1",
		EdgeVersion: 1,
		MaxAttempts: 3,
	})

	worker := NewWorker(repo, map[string]Projector{
		"job-2": &fakeProjector{result: ProjectResultObsolete},
	}, WorkerConfig{WorkerID: "w1"})

	if err := worker.processOne(context.Background()); err != nil {
		t.Fatalf("processOne() error = %v", err)
	}

	job, _ := repo.GetByID(context.Background(), 1)
	if job == nil || job.Status != model.KVSyncJobStatusObsolete {
		t.Fatalf("expected obsolete status, got %+v", job)
	}
}

func TestWorker_ProcessOne_FailedToDead(t *testing.T) {
	repo := &fakeJobRepo{}
	_, _ = repo.Create(context.Background(), model.KVSyncJob{
		JobType:     "job-3",
		TargetID:    "1",
		EdgeVersion: 1,
		MaxAttempts: 1,
	})

	worker := NewWorker(repo, map[string]Projector{
		"job-3": &fakeProjector{err: fmt.Errorf("boom")},
	}, WorkerConfig{WorkerID: "w1"})

	if err := worker.processOne(context.Background()); err != nil {
		t.Fatalf("processOne() error = %v", err)
	}

	job, _ := repo.GetByID(context.Background(), 1)
	if job == nil || job.Status != model.KVSyncJobStatusDead {
		t.Fatalf("expected dead status, got %+v", job)
	}
}

func TestWorker_RunContinuesAfterTransientClaimError(t *testing.T) {
	baseRepo := &fakeJobRepo{}
	_, _ = baseRepo.Create(context.Background(), model.KVSyncJob{
		JobType:     "job-1",
		TargetID:    "1",
		EdgeVersion: 1,
		MaxAttempts: 3,
	})
	repo := &flakyClaimJobRepo{
		fakeJobRepo: baseRepo,
		markedDone:  make(chan struct{}),
	}
	repo.claimFailures.Store(1)

	worker := NewWorker(repo, map[string]Projector{
		"job-1": &fakeProjector{result: ProjectResultDone},
	}, WorkerConfig{WorkerID: "w1", PollInterval: time.Millisecond})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	errCh := make(chan error, 1)
	go func() {
		errCh <- worker.Run(ctx)
	}()

	select {
	case <-repo.markedDone:
	case <-time.After(200 * time.Millisecond):
		cancel()
		t.Fatal("expected worker to continue and process job after transient claim error")
	}

	cancel()
	select {
	case err := <-errCh:
		if err != nil {
			t.Fatalf("Run() error = %v", err)
		}
	case <-time.After(200 * time.Millisecond):
		t.Fatal("worker did not stop after context cancellation")
	}
}

func TestWaiter_WaitDone(t *testing.T) {
	repo := &fakeJobRepo{}
	job, _ := repo.Create(context.Background(), model.KVSyncJob{
		JobType:     "job-1",
		TargetID:    "1",
		EdgeVersion: 1,
		MaxAttempts: 3,
	})

	waiter := NewWaiter(repo, WaiterConfig{
		PollInterval: 10 * time.Millisecond,
		Timeout:      500 * time.Millisecond,
	})

	go func() {
		time.Sleep(30 * time.Millisecond)
		_ = repo.MarkDone(context.Background(), job.ID)
	}()

	if err := waiter.Wait(context.Background(), []int64{job.ID}); err != nil {
		t.Fatalf("Wait() error = %v", err)
	}
}

func TestWaiter_UsesConfiguredTimeoutWhenParentDeadlineIsLonger(t *testing.T) {
	repo := &fakeJobRepo{}
	job, _ := repo.Create(context.Background(), model.KVSyncJob{
		JobType:     "job-1",
		TargetID:    "1",
		EdgeVersion: 1,
		MaxAttempts: 3,
	})

	waiter := NewWaiter(repo, WaiterConfig{
		PollInterval: 5 * time.Millisecond,
		Timeout:      20 * time.Millisecond,
	})
	ctx, cancel := context.WithTimeout(context.Background(), time.Hour)
	defer cancel()

	start := time.Now()
	err := waiter.Wait(ctx, []int64{job.ID})
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("expected deadline exceeded, got %v", err)
	}
	if !strings.Contains(err.Error(), "pending=1{status=pending attempts=0/3}") {
		t.Fatalf("expected pending job diagnostics, got %v", err)
	}
	if elapsed := time.Since(start); elapsed > 200*time.Millisecond {
		t.Fatalf("waiter ignored configured timeout; elapsed=%s", elapsed)
	}
}

func cloneKVSyncJob(job *model.KVSyncJob) *model.KVSyncJob {
	if job == nil {
		return nil
	}
	cloned := *job
	if job.Payload != nil {
		cloned.Payload = append([]byte(nil), job.Payload...)
	}
	if job.LockedBy != nil {
		value := *job.LockedBy
		cloned.LockedBy = &value
	}
	if job.LockedAt != nil {
		value := *job.LockedAt
		cloned.LockedAt = &value
	}
	if job.LastError != nil {
		value := *job.LastError
		cloned.LastError = &value
	}
	return &cloned
}
