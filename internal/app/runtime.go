package app

import (
	"context"
	"fmt"
	"sync"

	"gitlab.knoffice.tech/open/common-go/logging"
)

type backgroundRunner interface {
	Run(ctx context.Context) error
}

type runtimeTask struct {
	name   string
	runner backgroundRunner
}

type serverRuntime struct {
	mu      sync.Mutex
	ctx     context.Context
	cancel  context.CancelFunc
	started bool
	tasks   []runtimeTask
	wg      sync.WaitGroup
}

func newServerRuntime() *serverRuntime {
	return &serverRuntime{}
}

func (r *serverRuntime) Register(name string, runner backgroundRunner) {
	if r == nil || runner == nil {
		return
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.tasks = append(r.tasks, runtimeTask{name: name, runner: runner})
}

func (r *serverRuntime) Start(parent context.Context) error {
	if r == nil {
		return fmt.Errorf("server runtime is not configured")
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if r.started {
		return nil
	}
	if parent == nil {
		parent = context.Background()
	}

	r.ctx, r.cancel = context.WithCancel(parent)
	r.started = true
	for _, task := range r.tasks {
		task := task
		r.wg.Add(1)
		go func() {
			defer r.wg.Done()
			if err := task.runner.Run(r.ctx); err != nil {
				logging.WithError(err).WithField("task", task.name).Error("runtime task stopped")
			}
		}()
	}
	return nil
}

func (r *serverRuntime) Shutdown(ctx context.Context) error {
	if r == nil {
		return nil
	}

	r.mu.Lock()
	if !r.started {
		r.mu.Unlock()
		return nil
	}
	cancel := r.cancel
	r.started = false
	r.cancel = nil
	r.ctx = nil
	r.mu.Unlock()

	if cancel != nil {
		cancel()
	}

	done := make(chan struct{})
	go func() {
		r.wg.Wait()
		close(done)
	}()

	if ctx == nil {
		ctx = context.Background()
	}
	select {
	case <-done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func registerRuntimeTasks(runtime *serverRuntime, deps serverDependencies) {
	if runtime == nil {
		return
	}

	if deps.kvSyncWorker != nil {
		runtime.Register("kvsync", deps.kvSyncWorker)
	}
	if deps.usageSyncWorker != nil {
		runtime.Register("usage-sync", deps.usageSyncWorker)
	}
	if deps.billingWorker != nil {
		runtime.Register("billing", deps.billingWorker)
	}
	if deps.paymentEventsWorker != nil {
		runtime.Register("payment-events", deps.paymentEventsWorker)
	}
	if deps.legacyFeishuLongConnBot != nil {
		runtime.Register("legacy-feishu-long-connection", deps.legacyFeishuLongConnBot)
	}
}
