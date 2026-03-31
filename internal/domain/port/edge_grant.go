package port

import "context"

// EdgeGrantStore stores short-lived edge grants (preview/access) with TTL.
type EdgeGrantStore interface {
	PutJSON(ctx context.Context, key string, value []byte, ttlSeconds int64) error
}
