package app

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	infraratelimit "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type blockingRuntimeTask struct {
	started  chan struct{}
	canceled chan struct{}
	done     chan struct{}
}

func newBlockingRuntimeTask() *blockingRuntimeTask {
	return &blockingRuntimeTask{
		started:  make(chan struct{}, 1),
		canceled: make(chan struct{}, 1),
		done:     make(chan struct{}, 1),
	}
}

func (t *blockingRuntimeTask) Run(ctx context.Context) error {
	t.started <- struct{}{}
	<-ctx.Done()
	t.canceled <- struct{}{}
	t.done <- struct{}{}
	return nil
}

func TestBuildServerDependencies_DevModeUsesRealInfraAdapters(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:       "anycap-server",
		AppEnv:        "dev",
		HTTPAddr:      ":0",
		RuntimeMode:   "dev",
		PGDSN:         "postgres://kntech:secret@pg.example.com:5432/postgres?sslmode=require",
		RedisAddr:     "redis.example.com:6379",
		RedisUsername: "default",
		RedisPassword: "secret",
		RateLimitRPM:  60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.apiKeyService == nil {
		t.Fatal("expected api key service")
	}
	if _, ok := deps.rateLimiter.(*infraratelimit.RedisLimiter); !ok {
		t.Fatalf("expected redis limiter, got %T", deps.rateLimiter)
	}
}

func TestBuildServerDependencies_ProdModeUsesRealInfraAdapters(t *testing.T) {
	deps, err := buildServerDependencies(config.Config{
		AppName:       "anycap-server",
		AppEnv:        "prod",
		HTTPAddr:      ":0",
		RuntimeMode:   "prod",
		PGDSN:         "postgres://kntech:secret@pg.example.com:5432/postgres?sslmode=require",
		RedisAddr:     "redis.example.com:6379",
		RedisUsername: "default",
		RedisPassword: "secret",
		RateLimitRPM:  60,
	}, buildinfo.Info{Version: "dev"})
	if err != nil {
		t.Fatalf("buildServerDependencies() error = %v", err)
	}
	if deps.apiKeyService == nil {
		t.Fatal("expected api key service")
	}
	if _, ok := deps.rateLimiter.(*infraratelimit.RedisLimiter); !ok {
		t.Fatalf("expected redis limiter, got %T", deps.rateLimiter)
	}
}

func TestNewServer_DoesNotStartRuntimeDuringConstruction(t *testing.T) {
	server := NewServer(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})

	if server.runtime == nil {
		t.Fatal("expected runtime to be initialized")
	}
	if server.runtime.started {
		t.Fatal("expected runtime to remain stopped after construction")
	}
	if server.runtime.ctx != nil {
		t.Fatal("expected runtime context to be nil before Start")
	}
	if server.adminHTTPServer == nil {
		t.Fatal("expected admin http server to be initialized during construction")
	}
	if server.adminHTTPServer.IsRunning() {
		t.Fatal("expected admin http server to remain stopped after construction")
	}
}

func TestNewServer_InitializesAdminHTTPServerWhenConfigured(t *testing.T) {
	server := NewServer(config.Config{
		AppName:       "anycap-server",
		AppEnv:        "test",
		HTTPAddr:      ":0",
		AdminHTTPAddr: ":0",
		RuntimeMode:   "stub",
		RateLimitRPM:  60,
	}, buildinfo.Info{Version: "dev"})

	if server.adminHTTPServer == nil {
		t.Fatal("expected admin http server when admin addr is configured")
	}
}

func TestServerStart_CreatesCancelableRuntimeContext(t *testing.T) {
	server := NewServer(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})

	if err := server.Start(context.Background()); err != nil {
		t.Fatalf("Start() error = %v", err)
	}

	if server.runtime == nil || server.runtime.ctx == nil {
		t.Fatal("expected runtime context after Start")
	}
	if !server.runtime.started {
		t.Fatal("expected runtime to be marked started")
	}

	if err := server.Shutdown(context.Background()); err != nil {
		t.Fatalf("Shutdown() error = %v", err)
	}
}

func TestServerShutdown_CancelsRuntimeContext(t *testing.T) {
	server := NewServer(config.Config{
		AppName:      "anycap-server",
		AppEnv:       "test",
		HTTPAddr:     ":0",
		RuntimeMode:  "stub",
		RateLimitRPM: 60,
	}, buildinfo.Info{Version: "dev"})

	if err := server.Start(context.Background()); err != nil {
		t.Fatalf("Start() error = %v", err)
	}

	runtimeCtx := server.runtime.ctx
	if runtimeCtx == nil {
		t.Fatal("expected runtime context after Start")
	}

	if err := server.Shutdown(context.Background()); err != nil {
		t.Fatalf("Shutdown() error = %v", err)
	}

	select {
	case <-runtimeCtx.Done():
	default:
		t.Fatal("expected runtime context to be canceled")
	}
	if server.runtime.started {
		t.Fatal("expected runtime to be marked stopped after Shutdown")
	}
}

func TestServerRuntimeStart_StartsRegisteredTasks(t *testing.T) {
	runtime := newServerRuntime()
	task := newBlockingRuntimeTask()
	runtime.Register("usage-sync", task)

	if err := runtime.Start(context.Background()); err != nil {
		t.Fatalf("Start() error = %v", err)
	}
	defer func() {
		if err := runtime.Shutdown(context.Background()); err != nil {
			t.Fatalf("Shutdown() error = %v", err)
		}
	}()

	select {
	case <-task.started:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected runtime to start registered task")
	}
}

func TestServerRuntimeShutdown_CancelsRegisteredTasks(t *testing.T) {
	runtime := newServerRuntime()
	task := newBlockingRuntimeTask()
	runtime.Register("payment-events", task)

	if err := runtime.Start(context.Background()); err != nil {
		t.Fatalf("Start() error = %v", err)
	}

	select {
	case <-task.started:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected runtime to start registered task")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	if err := runtime.Shutdown(shutdownCtx); err != nil {
		t.Fatalf("Shutdown() error = %v", err)
	}

	select {
	case <-task.canceled:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected runtime shutdown to cancel registered task")
	}

	select {
	case <-task.done:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("expected runtime to wait for task completion")
	}
}
