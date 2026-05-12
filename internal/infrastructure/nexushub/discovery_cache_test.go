package nexushub

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

type stubFetcher struct {
	getCalls  int32
	listCalls int32
	getErr    error
	listErr   error
	node      *DiscoveryNode
	nodes     []DiscoveryNode
}

func (s *stubFetcher) GetNode(_ context.Context, _, _ string) (*DiscoveryNode, error) {
	atomic.AddInt32(&s.getCalls, 1)
	if s.getErr != nil {
		return nil, s.getErr
	}
	return s.node, nil
}

func (s *stubFetcher) ListByCategory(_ context.Context, _, _ string) ([]DiscoveryNode, error) {
	atomic.AddInt32(&s.listCalls, 1)
	if s.listErr != nil {
		return nil, s.listErr
	}
	return s.nodes, nil
}

func TestDiscoveryCache_GetNode_HitsAndExpiry(t *testing.T) {
	node := &DiscoveryNode{AbilityKey: "x", State: "active"}
	stub := &stubFetcher{node: node}
	cache := NewDiscoveryCache(stub, time.Hour)

	ctx := context.Background()

	got, err := cache.GetNode(ctx, "x", "txt_2_img")
	if err != nil || got != node {
		t.Fatalf("first GetNode: got=%v err=%v", got, err)
	}
	got, err = cache.GetNode(ctx, "x", "txt_2_img")
	if err != nil || got != node {
		t.Fatalf("second GetNode: got=%v err=%v", got, err)
	}
	if atomic.LoadInt32(&stub.getCalls) != 1 {
		t.Fatalf("expected 1 upstream call, got %d", stub.getCalls)
	}

	// Force expiry by advancing the clock.
	cache.clock = func() time.Time { return time.Now().Add(2 * time.Hour) }
	if _, err := cache.GetNode(ctx, "x", "txt_2_img"); err != nil {
		t.Fatalf("GetNode after expiry: err=%v", err)
	}
	if atomic.LoadInt32(&stub.getCalls) != 2 {
		t.Fatalf("expected 2 upstream calls after expiry, got %d", stub.getCalls)
	}
}

func TestDiscoveryCache_StaleOnError(t *testing.T) {
	node := &DiscoveryNode{AbilityKey: "x", State: "active"}
	stub := &stubFetcher{node: node}
	cache := NewDiscoveryCache(stub, time.Hour)
	ctx := context.Background()

	if _, err := cache.GetNode(ctx, "x", "txt_2_img"); err != nil {
		t.Fatalf("warm: %v", err)
	}

	// Within stale window (< 2*TTL), upstream errors should be hidden.
	cache.clock = func() time.Time { return time.Now().Add(90 * time.Minute) }
	stub.getErr = errors.New("upstream down")

	got, err := cache.GetNode(ctx, "x", "txt_2_img")
	if err != nil {
		t.Fatalf("expected stale entry to be served, got error %v", err)
	}
	if got != node {
		t.Fatalf("expected stale entry, got %v", got)
	}

	// Past 2*TTL the cached value is too old; surface the error.
	cache.clock = func() time.Time { return time.Now().Add(3 * time.Hour) }
	if _, err := cache.GetNode(ctx, "x", "txt_2_img"); err == nil {
		t.Fatalf("expected error past stale window")
	}
}

func TestDiscoveryCache_RefreshIgnoresTTL(t *testing.T) {
	node := &DiscoveryNode{AbilityKey: "x"}
	stub := &stubFetcher{node: node}
	cache := NewDiscoveryCache(stub, time.Hour)
	ctx := context.Background()

	if _, err := cache.GetNode(ctx, "x", "a"); err != nil {
		t.Fatalf("warm: %v", err)
	}
	if err := cache.Refresh(ctx, "x", "a"); err != nil {
		t.Fatalf("refresh: %v", err)
	}
	if atomic.LoadInt32(&stub.getCalls) != 2 {
		t.Fatalf("expected 2 upstream calls after refresh, got %d", stub.getCalls)
	}
}
