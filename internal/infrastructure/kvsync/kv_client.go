package kvsync

import "context"

type KVClient interface {
	Put(ctx context.Context, key string, value []byte) error
	Delete(ctx context.Context, key string) error
}

type NoopKVClient struct{}

func NewNoopKVClient() *NoopKVClient {
	return &NoopKVClient{}
}

func (c *NoopKVClient) Put(_ context.Context, _ string, _ []byte) error {
	return nil
}

func (c *NoopKVClient) Delete(_ context.Context, _ string) error {
	return nil
}
