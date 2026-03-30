package usage

import (
	"context"
	"sync"
	"testing"
	"time"
)

type fakeSyncer struct {
	mu    sync.Mutex
	calls int
}

func (f *fakeSyncer) SyncPendingRuns(_ context.Context, _ int) (int, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.calls++
	return 0, nil
}

func (f *fakeSyncer) count() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.calls
}

func TestWorker_RunPollsSyncer(t *testing.T) {
	syncer := &fakeSyncer{}
	worker := NewWorker(syncer, WorkerConfig{
		PollInterval: 10 * time.Millisecond,
		BatchSize:    5,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 25*time.Millisecond)
	defer cancel()

	if err := worker.Run(ctx); err != nil {
		t.Fatalf("Run() error = %v", err)
	}
	if syncer.count() < 2 {
		t.Fatalf("expected worker to poll syncer at least twice, got %d", syncer.count())
	}
}
