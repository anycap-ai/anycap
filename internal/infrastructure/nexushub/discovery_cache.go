package nexushub

import (
	"context"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"

	"gitlab.knoffice.tech/open/common-go/logging"
)

// DiscoveryFetcher abstracts the network calls so DiscoveryCache can be
// tested without HTTP.
type DiscoveryFetcher interface {
	ListByCategory(ctx context.Context, category, algo string) ([]DiscoveryNode, error)
	GetNode(ctx context.Context, abilityKey, algo string) (*DiscoveryNode, error)
}

// DiscoveryCache adds an in-memory cache layer on top of DiscoveryFetcher.
//
// Behavior:
//   - Cache key for nodes is "ability_key|algo".
//   - Cache key for lists is "category|algo".
//   - Entries served while age < TTL.
//   - On upstream failure, return previously cached entry (stale) up to
//     2 * TTL old, log a warning, do not surface the error.
//   - singleflight coalesces concurrent misses for the same key.
type DiscoveryCache struct {
	fetcher DiscoveryFetcher
	ttl     time.Duration
	clock   func() time.Time

	mu    sync.RWMutex
	nodes map[string]*nodeEntry
	lists map[string]*listEntry

	sf singleflight.Group
}

type nodeEntry struct {
	node      *DiscoveryNode
	fetchedAt time.Time
}

type listEntry struct {
	nodes     []DiscoveryNode
	fetchedAt time.Time
}

// NewDiscoveryCache constructs a DiscoveryCache. ttl <= 0 falls back to 5m.
func NewDiscoveryCache(fetcher DiscoveryFetcher, ttl time.Duration) *DiscoveryCache {
	if ttl <= 0 {
		ttl = 5 * time.Minute
	}
	return &DiscoveryCache{
		fetcher: fetcher,
		ttl:     ttl,
		clock:   time.Now,
		nodes:   make(map[string]*nodeEntry),
		lists:   make(map[string]*listEntry),
	}
}

// TTL exposes the configured cache TTL.
func (c *DiscoveryCache) TTL() time.Duration {
	if c == nil {
		return 0
	}
	return c.ttl
}

// GetNode returns a single DiscoveryNode, hitting cache first.
func (c *DiscoveryCache) GetNode(ctx context.Context, abilityKey, algo string) (*DiscoveryNode, error) {
	if c == nil {
		return nil, nil
	}
	key := nodeCacheKey(abilityKey, algo)
	if entry, ok := c.lookupNode(key); ok && c.fresh(entry.fetchedAt) {
		return entry.node, nil
	}

	v, err, _ := c.sf.Do("node:"+key, func() (any, error) {
		// re-check after taking the singleflight slot
		if entry, ok := c.lookupNode(key); ok && c.fresh(entry.fetchedAt) {
			return entry.node, nil
		}
		node, err := c.fetcher.GetNode(ctx, abilityKey, algo)
		if err != nil {
			if entry, ok := c.lookupNode(key); ok && c.staleAcceptable(entry.fetchedAt) {
				logging.WithContext(ctx).WithError(err).WithFields(logging.Fields{
					"ability_key": abilityKey,
					"algo_type":   algo,
				}).Warn("nexushub discovery node fetch failed; serving stale entry")
				return entry.node, nil
			}
			return nil, err
		}
		c.storeNode(key, node)
		return node, nil
	})
	if err != nil {
		return nil, err
	}
	if v == nil {
		return nil, nil
	}
	return v.(*DiscoveryNode), nil
}

// ListByCategory returns all nodes in a category, hitting cache first.
func (c *DiscoveryCache) ListByCategory(ctx context.Context, category, algo string) ([]DiscoveryNode, error) {
	if c == nil {
		return nil, nil
	}
	key := listCacheKey(category, algo)
	if entry, ok := c.lookupList(key); ok && c.fresh(entry.fetchedAt) {
		return entry.nodes, nil
	}

	v, err, _ := c.sf.Do("list:"+key, func() (any, error) {
		if entry, ok := c.lookupList(key); ok && c.fresh(entry.fetchedAt) {
			return entry.nodes, nil
		}
		nodes, err := c.fetcher.ListByCategory(ctx, category, algo)
		if err != nil {
			if entry, ok := c.lookupList(key); ok && c.staleAcceptable(entry.fetchedAt) {
				logging.WithContext(ctx).WithError(err).WithFields(logging.Fields{
					"category":  category,
					"algo_type": algo,
				}).Warn("nexushub discovery list fetch failed; serving stale entries")
				return entry.nodes, nil
			}
			return nil, err
		}
		c.storeList(key, nodes)
		return nodes, nil
	})
	if err != nil {
		return nil, err
	}
	if v == nil {
		return nil, nil
	}
	return v.([]DiscoveryNode), nil
}

// Refresh forces an upstream fetch for the given node entry, ignoring TTL.
// Used by the background refresher.
func (c *DiscoveryCache) Refresh(ctx context.Context, abilityKey, algo string) error {
	if c == nil {
		return nil
	}
	node, err := c.fetcher.GetNode(ctx, abilityKey, algo)
	if err != nil {
		return err
	}
	c.storeNode(nodeCacheKey(abilityKey, algo), node)
	return nil
}

// Invalidate clears all cached entries.
func (c *DiscoveryCache) Invalidate() {
	if c == nil {
		return
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.nodes = make(map[string]*nodeEntry)
	c.lists = make(map[string]*listEntry)
}

func (c *DiscoveryCache) lookupNode(key string) (*nodeEntry, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	entry, ok := c.nodes[key]
	return entry, ok
}

func (c *DiscoveryCache) lookupList(key string) (*listEntry, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	entry, ok := c.lists[key]
	return entry, ok
}

func (c *DiscoveryCache) storeNode(key string, node *DiscoveryNode) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.nodes[key] = &nodeEntry{node: node, fetchedAt: c.clock()}
}

func (c *DiscoveryCache) storeList(key string, nodes []DiscoveryNode) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.lists[key] = &listEntry{nodes: nodes, fetchedAt: c.clock()}
}

func (c *DiscoveryCache) fresh(at time.Time) bool {
	return c.clock().Sub(at) < c.ttl
}

func (c *DiscoveryCache) staleAcceptable(at time.Time) bool {
	return c.clock().Sub(at) < 2*c.ttl
}

func nodeCacheKey(abilityKey, algo string) string {
	return abilityKey + "|" + algo
}

func listCacheKey(category, algo string) string {
	return category + "|" + algo
}
