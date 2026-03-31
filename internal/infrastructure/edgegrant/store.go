package edgegrant

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type kvClient interface {
	PutWithTTL(ctx context.Context, key string, value []byte, ttlSeconds int64) error
}

type UnavailableStore struct{}

func NewUnavailableStore() *UnavailableStore {
	return &UnavailableStore{}
}

func (s *UnavailableStore) PutJSON(_ context.Context, _ string, _ []byte, _ int64) error {
	return model.ErrNotConfigured("edge grant store is not configured")
}

type KVStore struct {
	client kvClient
}

func NewKVStore(client kvClient) *KVStore {
	return &KVStore{client: client}
}

func (s *KVStore) PutJSON(ctx context.Context, key string, value []byte, ttlSeconds int64) error {
	if s == nil || s.client == nil {
		return model.ErrNotConfigured("edge grant store is not configured")
	}
	trimmedKey := strings.TrimSpace(key)
	if trimmedKey == "" {
		return fmt.Errorf("edge grant key is required")
	}
	if ttlSeconds <= 0 {
		return fmt.Errorf("edge grant ttl_seconds must be greater than zero")
	}
	return s.client.PutWithTTL(ctx, trimmedKey, value, ttlSeconds)
}

var _ port.EdgeGrantStore = (*UnavailableStore)(nil)
var _ port.EdgeGrantStore = (*KVStore)(nil)
