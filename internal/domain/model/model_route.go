package model

import "time"

const (
	ModelRouteStatusActive   = "active"
	ModelRouteStatusInactive = "inactive"
)

// ModelRoute 表示 AnyCap 路由管理表中的一条记录。
// 每一行都是 model_id + operation + mode 到 ability_key 的具体绑定。
// mode 是用户可见的模态标识，algo_type 是 NexusHub 内部调度标识。
type ModelRoute struct {
	ID               int64
	ModelID          string
	Capability       Capability
	Operation        Operation
	AbilityKey       string
	AlgoType         string
	Mode             Mode
	DisplayName      string
	ModeDescription  string
	ModelDescription string
	RouteType        RouteType
	Region           string
	Tier             string
	Env              string
	Priority         int
	Enabled          bool
	Status           string
	Extra            map[string]any
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type ListModelRoutesFilter struct {
	Capability string
	Status     string
	Search     string
}

type CreateModelRouteInput struct {
	ModelID          string         `json:"model_id"`
	Capability       Capability     `json:"capability"`
	Operation        Operation      `json:"operation"`
	AbilityKey       string         `json:"ability_key"`
	AlgoType         string         `json:"algo_type,omitempty"`
	Mode             Mode           `json:"mode,omitempty"`
	DisplayName      string         `json:"display_name,omitempty"`
	ModeDescription  string         `json:"mode_description,omitempty"`
	ModelDescription string         `json:"model_description,omitempty"`
	RouteType        RouteType      `json:"route_type,omitempty"`
	Region           string         `json:"region,omitempty"`
	Tier             string         `json:"tier,omitempty"`
	Env              string         `json:"env,omitempty"`
	Priority         int            `json:"priority,omitempty"`
	Enabled          *bool          `json:"enabled,omitempty"`
	Status           string         `json:"status,omitempty"`
	Extra            map[string]any `json:"extra,omitempty"`
}

type UpdateModelRouteInput struct {
	ModelID          string         `json:"model_id"`
	Capability       Capability     `json:"capability"`
	Operation        Operation      `json:"operation"`
	AbilityKey       string         `json:"ability_key"`
	AlgoType         string         `json:"algo_type,omitempty"`
	Mode             Mode           `json:"mode,omitempty"`
	DisplayName      string         `json:"display_name,omitempty"`
	ModeDescription  string         `json:"mode_description,omitempty"`
	ModelDescription string         `json:"model_description,omitempty"`
	RouteType        RouteType      `json:"route_type,omitempty"`
	Region           string         `json:"region,omitempty"`
	Tier             string         `json:"tier,omitempty"`
	Env              string         `json:"env,omitempty"`
	Priority         int            `json:"priority,omitempty"`
	Enabled          *bool          `json:"enabled,omitempty"`
	Status           string         `json:"status,omitempty"`
	Extra            map[string]any `json:"extra,omitempty"`
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
		Mode:       r.Mode,
		Region:     r.Region,
		Tier:       r.Tier,
		Env:        r.Env,
		Priority:   priority,
		Enabled:    r.Enabled,
	}
}
