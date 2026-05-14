package curatedcatalog

import (
	"context"
	"time"

	"gitlab.knoffice.tech/open/common-go/logging"
)

// RefreshTarget exposes the methods on Catalog the Refresher needs.
type RefreshTarget interface {
	CuratedAbilityKeys() []AbilityKey
}

// CacheRefresher refreshes a single Discovery cache entry.
type CacheRefresher interface {
	Refresh(ctx context.Context, abilityKey, algo string) error
}

// Refresher periodically warms the Discovery cache for every curated
// (ability_key, algo_type) pair so user-facing requests stay cache-hit.
//
// It satisfies internal/app.backgroundRunner via its Run method.
type Refresher struct {
	target   RefreshTarget
	cache    CacheRefresher
	interval time.Duration
}

// NewRefresher constructs a Refresher. interval <= 0 falls back to 2m.
func NewRefresher(target RefreshTarget, cache CacheRefresher, interval time.Duration) *Refresher {
	if interval <= 0 {
		interval = 2 * time.Minute
	}
	return &Refresher{target: target, cache: cache, interval: interval}
}

// Run drives the refresh loop until ctx is cancelled. It returns nil on a
// clean shutdown so the runtime supervisor does not log it as a failure.
func (r *Refresher) Run(ctx context.Context) error {
	if r == nil || r.target == nil || r.cache == nil {
		return nil
	}

	// Warm immediately so the first user request is a cache hit.
	r.refreshOnce(ctx)

	ticker := time.NewTicker(r.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			r.refreshOnce(ctx)
		}
	}
}

func (r *Refresher) refreshOnce(ctx context.Context) {
	keys := r.target.CuratedAbilityKeys()
	for _, k := range keys {
		select {
		case <-ctx.Done():
			return
		default:
		}
		if err := r.cache.Refresh(ctx, k.AbilityKey, k.AlgoType); err != nil {
			logging.WithContext(ctx).WithError(err).WithFields(logging.Fields{
				"ability_key": k.AbilityKey,
				"algo_type":   k.AlgoType,
			}).Warn("curated catalog refresher: discovery refresh failed")
		}
	}
}
