package presenter

import (
	"context"
	"strconv"
)

const TimeLayout = "2006-01-02T15:04:05.999999999Z07:00"

// IDMapper resolves internal IDs to external IDs for outbound presentation.
type IDMapper interface {
	ResolveDriveNodeExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveUploadSessionExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolvePageSiteExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolvePageVersionExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveModelRouteExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveIMBindingExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveRunnerExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveAgentConversationExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveAgentTaskExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveAgentSessionExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveAgentMailboxMessageExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveSpaceExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error)
	ResolveUserExternalIDs(ctx context.Context, internalUserIDs []string) (map[string]string, error)
	ResolveUserExternalID(ctx context.Context, internalUserID string) (string, error)
	ResolveSpaceExternalID(ctx context.Context, internalSpaceID int64) (string, error)
}

// PassthroughIDMapper is a no-DB mapper that converts int64 ↔ string for testing
// and stub runtime modes. It ensures all code paths go through DTOs.
type PassthroughIDMapper struct{}

func (PassthroughIDMapper) ResolveDriveNodeExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveUploadSessionExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolvePageSiteExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolvePageVersionExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveModelRouteExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveIMBindingExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveRunnerExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveAgentConversationExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveAgentTaskExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveAgentSessionExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveAgentMailboxMessageExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveSpaceExternalIDs(_ context.Context, ids []int64) (map[int64]string, error) {
	return int64ToStringMap(ids), nil
}
func (PassthroughIDMapper) ResolveUserExternalIDs(_ context.Context, ids []string) (map[string]string, error) {
	m := make(map[string]string, len(ids))
	for _, id := range ids {
		m[id] = id
	}
	return m, nil
}
func (PassthroughIDMapper) ResolveUserExternalID(_ context.Context, id string) (string, error) {
	return id, nil
}
func (PassthroughIDMapper) ResolveSpaceExternalID(_ context.Context, id int64) (string, error) {
	return strconv.FormatInt(id, 10), nil
}

func int64ToStringMap(ids []int64) map[int64]string {
	m := make(map[int64]string, len(ids))
	for _, id := range ids {
		m[id] = strconv.FormatInt(id, 10)
	}
	return m
}
