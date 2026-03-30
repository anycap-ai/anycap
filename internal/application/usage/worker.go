package usage

import (
	"context"
	"fmt"
	"time"
)

const (
	defaultPollInterval = 1 * time.Minute
	defaultBatchSize    = 50
)

type Syncer interface {
	SyncPendingRuns(ctx context.Context, limit int) (int, error)
}

type WorkerConfig struct {
	PollInterval time.Duration
	BatchSize    int
}

type Worker struct {
	syncer    Syncer
	interval  time.Duration
	batchSize int
}

func NewWorker(syncer Syncer, cfg WorkerConfig) *Worker {
	interval := cfg.PollInterval
	if interval <= 0 {
		interval = defaultPollInterval
	}
	batchSize := cfg.BatchSize
	if batchSize <= 0 {
		batchSize = defaultBatchSize
	}
	return &Worker{
		syncer:    syncer,
		interval:  interval,
		batchSize: batchSize,
	}
}

func (w *Worker) Run(ctx context.Context) error {
	if w == nil || w.syncer == nil {
		return fmt.Errorf("usage sync worker is not configured")
	}

	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		_, _ = w.syncer.SyncPendingRuns(ctx, w.batchSize)

		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
		}
	}
}
