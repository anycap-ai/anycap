package model

import "time"

const (
	ModelRouteStatusActive   = "active"
	ModelRouteStatusInactive = "inactive"
)

// ModelRoute 表示 AnyCap 路由管理表中的一条记录。
// 每一行都是 model_id + operation + algo_type 到 ability_key 的具体绑定。
type ModelRoute struct {
	ID          int64          `json:"id"`
	ModelID     string         `json:"model_id"`
	Capability  Capability     `json:"capability"`
	Operation   Operation      `json:"operation"`
	AbilityKey  string         `json:"ability_key"`
	AlgoType    string         `json:"algo_type,omitempty"`
	DisplayName string         `json:"display_name,omitempty"`
	RouteType   RouteType      `json:"route_type,omitempty"`
	Region      string         `json:"region,omitempty"`
	Tier        string         `json:"tier,omitempty"`
	Env         string         `json:"env,omitempty"`
	Priority    int            `json:"priority"`
	Enabled     bool           `json:"enabled"`
	Status      string         `json:"status"`
	Extra       map[string]any `json:"extra,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type ListModelRoutesFilter struct {
	Capability string
	Status     string
	Search     string
}

type CreateModelRouteInput struct {
	ModelID     string         `json:"model_id"`
	Capability  Capability     `json:"capability"`
	Operation   Operation      `json:"operation"`
	AbilityKey  string         `json:"ability_key"`
	AlgoType    string         `json:"algo_type,omitempty"`
	DisplayName string         `json:"display_name,omitempty"`
	RouteType   RouteType      `json:"route_type,omitempty"`
	Region      string         `json:"region,omitempty"`
	Tier        string         `json:"tier,omitempty"`
	Env         string         `json:"env,omitempty"`
	Priority    int            `json:"priority,omitempty"`
	Enabled     *bool          `json:"enabled,omitempty"`
	Status      string         `json:"status,omitempty"`
	Extra       map[string]any `json:"extra,omitempty"`
}

type UpdateModelRouteInput struct {
	ModelID     string         `json:"model_id"`
	Capability  Capability     `json:"capability"`
	Operation   Operation      `json:"operation"`
	AbilityKey  string         `json:"ability_key"`
	AlgoType    string         `json:"algo_type,omitempty"`
	DisplayName string         `json:"display_name,omitempty"`
	RouteType   RouteType      `json:"route_type,omitempty"`
	Region      string         `json:"region,omitempty"`
	Tier        string         `json:"tier,omitempty"`
	Env         string         `json:"env,omitempty"`
	Priority    int            `json:"priority,omitempty"`
	Enabled     *bool          `json:"enabled,omitempty"`
	Status      string         `json:"status,omitempty"`
	Extra       map[string]any `json:"extra,omitempty"`
}

func (r ModelRoute) ToRouteBinding() RouteBinding {
	routeType := r.RouteType
	if routeType == "" {
		routeType = RouteTypeDirect
	}

	priority := r.Priority
	if priority == 0 {
		priority = DefaultRoutePriority
	}

	return RouteBinding{
		RouteType:  routeType,
		AbilityKey: r.AbilityKey,
		GenType:    string(r.Capability),
		AlgoType:   r.AlgoType,
		Region:     r.Region,
		Tier:       r.Tier,
		Env:        r.Env,
		Priority:   priority,
		Enabled:    r.Enabled,
	}
}
