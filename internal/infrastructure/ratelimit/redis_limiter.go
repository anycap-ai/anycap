package ratelimit

import (
	"context"
	"fmt"
	"time"

	redis "github.com/redis/go-redis/v9"
)

type RedisLimiter struct {
	client redis.Cmdable
	prefix string
}

func NewRedisClient(addr, username, password string, db int) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Username: username,
		Password: password,
		DB:       db,
	})
}

func NewRedisLimiter(client redis.Cmdable) *RedisLimiter {
	return &RedisLimiter{
		client: client,
		prefix: "rl",
	}
}

func (l *RedisLimiter) Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, int, time.Time, error) {
	now := time.Now().UTC()
	bucketStart := now.Truncate(window)
	resetAt := bucketStart.Add(window)
	bucketKey := fmt.Sprintf("%s:%s:%d", l.prefix, key, bucketStart.Unix())

	pipe := l.client.TxPipeline()
	countCmd := pipe.Incr(ctx, bucketKey)
	pipe.ExpireAt(ctx, bucketKey, resetAt)
	if _, err := pipe.Exec(ctx); err != nil {
		return false, 0, time.Time{}, err
	}

	count := int(countCmd.Val())
	remaining := limit - count
	if remaining < 0 {
		remaining = 0
	}

	return count <= limit, remaining, resetAt, nil
}
