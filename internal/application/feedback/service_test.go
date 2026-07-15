package feedback

import (
	"context"
	"errors"
	"strings"
	"sync"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type memRepo struct {
	mu    sync.Mutex
	items []model.Feedback
}

func (r *memRepo) Insert(_ context.Context, fb model.Feedback) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.items = append(r.items, fb)
	return nil
}

type failRepo struct{}

func (r *failRepo) Insert(_ context.Context, _ model.Feedback) error {
	return errors.New("db down")
}

type spyNotifier struct {
	mu       sync.Mutex
	received []model.Feedback
}

func (n *spyNotifier) Notify(_ context.Context, fb model.Feedback) error {
	n.mu.Lock()
	defer n.mu.Unlock()
	n.received = append(n.received, fb)
	return nil
}

func (n *spyNotifier) count() int {
	n.mu.Lock()
	defer n.mu.Unlock()
	return len(n.received)
}

func TestSubmit_Success(t *testing.T) {
	repo := &memRepo{}
	notifier := &spyNotifier{}
	svc := NewService(repo, notifier, "test")

	id, err := svc.Submit(context.Background(), model.Feedback{
		Type:    "bug",
		Message: "something broke",
		Metadata: map[string]any{
			"cli_version": "0.1.0",
			"os":          "darwin/arm64",
		},
	})
	if err != nil {
		t.Fatalf("Submit() error = %v", err)
	}
	if id == "" {
		t.Fatal("expected non-empty feedback ID")
	}
	if !strings.HasPrefix(id, "fb_") {
		t.Fatalf("expected feedback id prefix fb_, got %q", id)
	}
	if len(repo.items) != 1 {
		t.Fatalf("expected 1 stored item, got %d", len(repo.items))
	}
	if repo.items[0].Type != "bug" {
		t.Fatalf("expected type bug, got %s", repo.items[0].Type)
	}
}

func TestSubmitStoresNormalizedInvocationDiagnosticsInMetadata(t *testing.T) {
	repo := &memRepo{}
	svc := NewService(repo, nil, "test")
	_, err := svc.Submit(context.Background(), model.Feedback{
		Type:    "bug",
		Message: "silent result",
		Diagnostics: model.FeedbackDiagnostics{
			TraceID: "trc_original", TaskID: "task_original", UpstreamRequestID: "gateway_original",
			Capability: "music.generate", Model: "suno-v5", Stage: "validate_result", ErrorCode: "UPSTREAM_EMPTY_RESULT",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	diagnostics, ok := repo.items[0].Metadata["diagnostics"].(map[string]any)
	if !ok {
		t.Fatalf("metadata diagnostics = %#v", repo.items[0].Metadata["diagnostics"])
	}
	if diagnostics["trace_id"] != "trc_original" || diagnostics["task_id"] != "task_original" || diagnostics["capability"] != "music.generate" || diagnostics["error_code"] != "UPSTREAM_EMPTY_RESULT" {
		t.Fatalf("diagnostics = %#v", diagnostics)
	}
}

func TestSubmitNormalizesLegacyInvocationFields(t *testing.T) {
	repo := &memRepo{}
	svc := NewService(repo, nil, "test")
	_, err := svc.Submit(context.Background(), model.Feedback{
		Type: "bug", Message: "legacy report", RequestID: "req_legacy",
		Context: map[string]any{"task_id": "task_legacy"}, Metadata: map[string]any{"trace_id": "trc_legacy"},
	})
	if err != nil {
		t.Fatal(err)
	}
	diagnostics := repo.items[0].Metadata["diagnostics"].(map[string]any)
	if diagnostics["trace_id"] != "trc_legacy" || diagnostics["request_id"] != "req_legacy" || diagnostics["task_id"] != "task_legacy" {
		t.Fatalf("diagnostics = %#v", diagnostics)
	}
}

func TestSubmit_InvalidType(t *testing.T) {
	svc := NewService(&memRepo{}, nil, "test")

	_, err := svc.Submit(context.Background(), model.Feedback{
		Type:    "invalid",
		Message: "something",
	})
	if err == nil {
		t.Fatal("expected error for invalid type")
	}
}

func TestSubmit_EmptyMessage(t *testing.T) {
	svc := NewService(&memRepo{}, nil, "test")

	_, err := svc.Submit(context.Background(), model.Feedback{
		Type:    "feature",
		Message: "",
	})
	if err == nil {
		t.Fatal("expected error for empty message")
	}
}

func TestSubmit_RepoFailure(t *testing.T) {
	svc := NewService(&failRepo{}, nil, "test")

	_, err := svc.Submit(context.Background(), model.Feedback{
		Type:    "bug",
		Message: "something broke",
	})
	if err == nil {
		t.Fatal("expected error when repo fails")
	}
}

func TestSubmit_NilNotifier(t *testing.T) {
	repo := &memRepo{}
	svc := NewService(repo, nil, "test")

	id, err := svc.Submit(context.Background(), model.Feedback{
		Type:    "feature",
		Message: "add batch generation",
	})
	if err != nil {
		t.Fatalf("Submit() error = %v", err)
	}
	if id == "" {
		t.Fatal("expected non-empty feedback ID")
	}
}

func TestSubmit_AllTypes(t *testing.T) {
	for _, typ := range []string{"bug", "feature", "other"} {
		t.Run(typ, func(t *testing.T) {
			repo := &memRepo{}
			svc := NewService(repo, nil, "test")
			_, err := svc.Submit(context.Background(), model.Feedback{
				Type:    typ,
				Message: "test " + typ,
			})
			if err != nil {
				t.Fatalf("Submit(%s) error = %v", typ, err)
			}
		})
	}
}
