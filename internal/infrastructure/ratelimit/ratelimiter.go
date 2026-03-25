package ratelimit

import (
	"context"
	"sync"
	"time"
)

type bucket struct {
	count   int
	resetAt time.Time
}

type InMemoryLimiter struct {
	mu      sync.Mutex
	buckets map[string]*bucket
}

func NewInMemoryLimiter() *InMemoryLimiter {
	return &InMemoryLimiter{buckets: make(map[string]*bucket)}
}

func (l *InMemoryLimiter) Allow(_ context.Context, key string, limit int, window time.Duration) (bool, int, time.Time, error) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now().UTC()
	entry, ok := l.buckets[key]
	if !ok || now.After(entry.resetAt) {
		entry = &bucket{resetAt: now.Add(window)}
		l.buckets[key] = entry
	}

	if entry.count >= limit {
		remaining := limit - entry.count
		if remaining < 0 {
			remaining = 0
		}
		return false, remaining, entry.resetAt, nil
	}

	entry.count++
	remaining := limit - entry.count
	if remaining < 0 {
		remaining = 0
	}

	return true, remaining, entry.resetAt, nil
}
