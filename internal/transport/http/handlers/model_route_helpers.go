package handlers

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *ModelRouteHandler) resolveModelRouteID(ctx context.Context, rawID string) (int64, error) {
	if h.mapper == nil {
		return parsePathID(rawID)
	}
	return h.mapper.ResolveModelRouteID(ctx, strings.TrimSpace(rawID))
}

func (h *ModelRouteHandler) presentModelRoute(ctx context.Context, item *model.ModelRoute) (any, error) {
	if h.mapper == nil || item == nil {
		return item, nil
	}
	items, err := h.presentModelRoutes(ctx, []model.ModelRoute{*item})
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("model route not found")
	}
	return items[0], nil
}

func (h *ModelRouteHandler) presentModelRoutes(ctx context.Context, items []model.ModelRoute) ([]modelRouteDTO, error) {
	if h.mapper == nil || len(items) == 0 {
		return nil, nil
	}

	internalIDs := make([]int64, 0, len(items))
	for _, item := range items {
		internalIDs = append(internalIDs, item.ID)
	}
	idMap, err := h.mapper.ResolveModelRouteExternalIDs(ctx, internalIDs)
	if err != nil {
		return nil, err
	}

	result := make([]modelRouteDTO, 0, len(items))
	for _, item := range items {
		externalID := idMap[item.ID]
		if externalID == "" {
			return nil, fmt.Errorf("failed to resolve model route id")
		}
		result = append(result, modelRouteDTO{
			ID:          externalID,
			ModelID:     item.ModelID,
			Capability:  string(item.Capability),
			Operation:   string(item.Operation),
			AbilityKey:  item.AbilityKey,
			AlgoType:    item.AlgoType,
			DisplayName: item.DisplayName,
			RouteType:   string(item.RouteType),
			Region:      item.Region,
			Tier:        item.Tier,
			Env:         item.Env,
			Priority:    item.Priority,
			Enabled:     item.Enabled,
			Status:      item.Status,
			Extra:       item.Extra,
			CreatedAt:   item.CreatedAt.UTC().Format(timeLayoutRFC3339Nano),
			UpdatedAt:   item.UpdatedAt.UTC().Format(timeLayoutRFC3339Nano),
		})
	}
	return result, nil
}

func statusCodeForModelRouteError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case containsAny(err.Error(), "required", "must be"):
		return consts.StatusBadRequest
	case containsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case containsAny(err.Error(), "duplicate"):
		return consts.StatusConflict
	case containsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}
