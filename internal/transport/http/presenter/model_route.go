package presenter

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ModelRouteDTO struct {
	ID               string         `json:"id"`
	ModelID          string         `json:"model_id"`
	Capability       string         `json:"capability"`
	Operation        string         `json:"operation"`
	AbilityKey       string         `json:"ability_key"`
	AlgoType         string         `json:"algo_type,omitempty"`
	Mode             string         `json:"mode,omitempty"`
	DisplayName      string         `json:"display_name,omitempty"`
	ModeDescription  string         `json:"mode_description,omitempty"`
	ModelDescription string         `json:"model_description,omitempty"`
	RouteType        string         `json:"route_type,omitempty"`
	Region           string         `json:"region,omitempty"`
	Tier             string         `json:"tier,omitempty"`
	Env              string         `json:"env,omitempty"`
	Priority         int            `json:"priority"`
	Enabled          bool           `json:"enabled"`
	Status           string         `json:"status"`
	Extra            map[string]any `json:"extra,omitempty"`
	CreatedAt        string         `json:"created_at"`
	UpdatedAt        string         `json:"updated_at"`
}

func PresentModelRoute(ctx context.Context, mapper IDMapper, item *model.ModelRoute) (ModelRouteDTO, error) {
	items, err := PresentModelRoutes(ctx, mapper, []model.ModelRoute{*item})
	if err != nil {
		return ModelRouteDTO{}, err
	}
	if len(items) == 0 {
		return ModelRouteDTO{}, fmt.Errorf("model route not found")
	}
	return items[0], nil
}

func PresentModelRoutes(ctx context.Context, mapper IDMapper, items []model.ModelRoute) ([]ModelRouteDTO, error) {
	if len(items) == 0 {
		return []ModelRouteDTO{}, nil
	}

	internalIDs := make([]int64, 0, len(items))
	for _, item := range items {
		internalIDs = append(internalIDs, item.ID)
	}
	idMap, err := mapper.ResolveModelRouteExternalIDs(ctx, internalIDs)
	if err != nil {
		return nil, err
	}

	result := make([]ModelRouteDTO, 0, len(items))
	for _, item := range items {
		externalID := idMap[item.ID]
		if externalID == "" {
			return nil, fmt.Errorf("failed to resolve model route id")
		}
		result = append(result, ModelRouteDTO{
			ID:               externalID,
			ModelID:          item.ModelID,
			Capability:       string(item.Capability),
			Operation:        string(item.Operation),
			AbilityKey:       item.AbilityKey,
			AlgoType:         item.AlgoType,
			Mode:             string(item.Mode),
			DisplayName:      item.DisplayName,
			ModeDescription:  item.ModeDescription,
			ModelDescription: item.ModelDescription,
			RouteType:        string(item.RouteType),
			Region:           item.Region,
			Tier:             item.Tier,
			Env:              item.Env,
			Priority:         item.Priority,
			Enabled:          item.Enabled,
			Status:           item.Status,
			Extra:            item.Extra,
			CreatedAt:        item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt:        item.UpdatedAt.UTC().Format(TimeLayout),
		})
	}
	return result, nil
}
