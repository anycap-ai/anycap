package edgegrant

import (
	"context"
	"testing"
)

type fakeKVClient struct {
	key        string
	value      []byte
	ttlSeconds int64
	err        error
}

func (c *fakeKVClient) PutWithTTL(_ context.Context, key string, value []byte, ttlSeconds int64) error {
	c.key = key
	c.value = append([]byte(nil), value...)
	c.ttlSeconds = ttlSeconds
	return c.err
}

func TestKVStore_PutJSON(t *testing.T) {
	client := &fakeKVClient{}
	store := NewKVStore(client)

	if err := store.PutJSON(context.Background(), "drive:access:tkn", []byte(`{"ok":true}`), 300); err != nil {
		t.Fatalf("PutJSON() error = %v", err)
	}
	if client.key != "drive:access:tkn" {
		t.Fatalf("expected key drive:access:tkn, got %q", client.key)
	}
	if client.ttlSeconds != 300 {
		t.Fatalf("expected ttl 300, got %d", client.ttlSeconds)
	}
}

func TestUnavailableStore_PutJSON(t *testing.T) {
	store := NewUnavailableStore()
	if err := store.PutJSON(context.Background(), "x", []byte(`{}`), 60); err == nil {
		t.Fatal("expected unavailable error")
	}
}
