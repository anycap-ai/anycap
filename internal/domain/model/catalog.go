package model

// Capability 表示对外暴露的能力分类。
type Capability string

const (
	CapabilityImage Capability = "image"
	CapabilityVideo Capability = "video"
	CapabilityAudio Capability = "audio"
)

// Operation 表示对外暴露的能力动作。
type Operation string

const (
	OperationGenerate  Operation = "generate"
	OperationEdit      Operation = "edit"
	OperationUpscale   Operation = "upscale"
	OperationFromImage Operation = "from_image"
	OperationSpeak     Operation = "speak"
)

// RouteType 表示路由方式。
type RouteType string

const (
	RouteTypeDirect    RouteType = "direct"
	RouteTypeScheduler RouteType = "scheduler"
)

// ModelSpec 描述一个公开模型支持哪些 operation 及其路由绑定。
// model_id 是对外稳定标识，ability_key 是对内执行标识，两者解耦。
type ModelSpec struct {
	ModelID     string                      `json:"model"`
	Capability  Capability                  `json:"capability"`
	DisplayName string                      `json:"display_name"`
	Status      string                      `json:"status"`
	Operations  map[Operation]OperationSpec `json:"operations,omitempty"`
}

// OperationSpec 描述单个 operation 的 schema、提示和路由绑定。
type OperationSpec struct {
	SchemaRef    string         `json:"schema_ref,omitempty"`
	RequestHints map[string]any `json:"request_hints,omitempty"`
	Routes       []RouteBinding `json:"routes,omitempty"`
}

// RouteBinding 描述 model_id + operation 应如何路由到底层 ability_key。
type RouteBinding struct {
	RouteType  RouteType `json:"route_type"`
	AbilityKey string    `json:"ability_key"`
	GenType    string    `json:"gen_type"`
	AlgoType   string    `json:"algo_type,omitempty"`
	Region     string    `json:"region,omitempty"`
	Tier       string    `json:"tier,omitempty"`
	Env        string    `json:"env,omitempty"`
	Priority   int       `json:"priority"`
	Enabled    bool      `json:"enabled"`
}

// ModelSummary 是 ModelSpec 的公共只读视图，不暴露 RouteBinding 等内部细节。
type ModelSummary struct {
	ModelID     string     `json:"model"`
	Capability  Capability `json:"capability"`
	DisplayName string     `json:"display_name"`
	Status      string     `json:"status"`
	Operations  []string   `json:"operations"`
}

// ToSummary 将完整 ModelSpec 转换为对外安全的 ModelSummary。
func (m *ModelSpec) ToSummary() ModelSummary {
	ops := make([]string, 0, len(m.Operations))
	for op := range m.Operations {
		ops = append(ops, string(op))
	}
	return ModelSummary{
		ModelID:     m.ModelID,
		Capability:  m.Capability,
		DisplayName: m.DisplayName,
		Status:      m.Status,
		Operations:  ops,
	}
}

// ModelSchema 是 schema discovery 的返回结构。
type ModelSchema struct {
	Capability   Capability     `json:"capability"`
	ModelID      string         `json:"model"`
	Operation    string         `json:"operation"`
	Schema       map[string]any `json:"schema,omitempty"`
	RequestHints map[string]any `json:"request_hints,omitempty"`
	Capabilities map[string]any `json:"capabilities,omitempty"`
}
