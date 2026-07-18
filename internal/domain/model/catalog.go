package model

// Capability 表示对外暴露的能力分类。
type Capability string

const (
	CapabilityImage Capability = "image"
	CapabilityVideo Capability = "video"
	CapabilityAudio Capability = "audio"
	CapabilityMusic Capability = "music"
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

// Mode 表示用户可见的生成模式（输入 -> 输出的模态）。
// mode 是公开标识，algo_type 是 NexusHub 内部调度标识，二者共存于同一行。
type Mode string

const (
	ModeTextToImage         Mode = "text-to-image"
	ModeImageToImage        Mode = "image-to-image"
	ModeTextToVideo         Mode = "text-to-video"
	ModeImageToVideo        Mode = "image-to-video"
	ModeFirstLastFrameVideo Mode = "first-last-frame-to-video"
	ModeMultiShotVideo      Mode = "multi-shot-video"
	ModeMultiModalRef       Mode = "multi-modal-reference"
	ModeEditVideo           Mode = "edit-video"
	ModeTextToMusic         Mode = "text-to-music"
	ModeTextToAudio         Mode = "text-to-audio"
	ModeAudioToAudio        Mode = "audio-to-audio"
	ModeImageToAudio        Mode = "image-to-audio"
)

// RouteType 表示路由方式。
type RouteType string

const (
	RouteTypeDirect    RouteType = "direct"
	RouteTypeScheduler RouteType = "scheduler"
)

const DefaultRoutePriority = 100

// ModelSpec 描述一个公开模型支持哪些 operation 及其路由绑定。
// model_id 是对外稳定标识，ability_key 是对内执行标识，两者解耦。
type ModelSpec struct {
	ModelID          string                      `json:"model"`
	Capability       Capability                  `json:"capability"`
	DisplayName      string                      `json:"display_name"`
	ModelDescription string                      `json:"description,omitempty"`
	Status           string                      `json:"status"`
	Operations       map[Operation]OperationSpec `json:"operations,omitempty"`
}

// OperationSpec 描述单个 operation 的 schema、提示和路由绑定。
type OperationSpec struct {
	SchemaRef    string         `json:"schema_ref,omitempty"`
	RequestHints map[string]any `json:"request_hints,omitempty"`
	Modes        []ModeSpec     `json:"modes,omitempty"`
	Routes       []RouteBinding `json:"routes,omitempty"`
	// ModeSchemas holds per-mode schemas resolved from the schema provider.
	// Key is the mode (e.g., ModeTextToVideo), value is the schema map.
	// Falls back to RequestHints if a mode has no entry here.
	ModeSchemas map[Mode]map[string]any `json:"mode_schemas,omitempty"`
}

// ModeSpec 描述单个 mode 的元信息。
type ModeSpec struct {
	Mode        Mode   `json:"mode"`
	Description string `json:"description,omitempty"`
}

// RouteBinding 描述 model_id + operation + mode 应如何路由到底层 ability_key。
type RouteBinding struct {
	RouteType  RouteType `json:"route_type"`
	AbilityKey string    `json:"ability_key"`
	GenType    string    `json:"gen_type"`
	AlgoType   string    `json:"algo_type,omitempty"`
	Mode       Mode      `json:"mode,omitempty"`
	Region     string    `json:"region,omitempty"`
	Tier       string    `json:"tier,omitempty"`
	Env        string    `json:"env,omitempty"`
	Priority   int       `json:"priority"`
	Enabled    bool      `json:"enabled"`
	// ResourceTargets enumerates the upstream slots that may carry
	// reference media for this binding. Treated as alternatives (oneOf):
	// the adapter picks the first target whose Kind matches the data
	// shape it has. Empty means the route does not consume reference
	// media; AnyCap will not synthesize an "images" parameter and any
	// caller-supplied references are dropped with a warning.
	ResourceTargets []ResourceTarget `json:"resource_targets,omitempty"`
}

// ResourceKind enumerates the shapes a reference resource can take in
// the upstream payload. The strings mirror NexusHub's Discovery
// annotation vocabulary verbatim, and any new value introduced upstream
// should be added here before wiring it through adapters.
type ResourceKind string

const (
	ResourceKindURL          ResourceKind = "url"
	ResourceKindURLArray     ResourceKind = "url_array"
	ResourceKindStorage      ResourceKind = "storage"
	ResourceKindStorageArray ResourceKind = "storage_array"
)

// ResourceMedia enumerates the media modality a reference slot carries.
// It is populated when the Discovery annotation declares the modality
// explicitly (image_resource / video_resource / audio_resource blocks);
// empty means unknown and adapters fall back to key-name heuristics.
type ResourceMedia string

const (
	ResourceMediaImage ResourceMedia = "image"
	ResourceMediaVideo ResourceMedia = "video"
	ResourceMediaAudio ResourceMedia = "audio"
)

// ResourceRole identifies a named role for a resource target. Empty means the
// target accepts generic reference media of the declared type.
type ResourceRole string

const (
	ResourceRoleFirstFrame ResourceRole = "first_frame"
	ResourceRoleLastFrame  ResourceRole = "last_frame"
)

// ResourceTarget describes one upstream slot a reference resource can
// fill. Key is a dot-path interpreted by the destination adapter
// (e.g. "image_option.refer_image_urls" for the NexusHub adapter).
type ResourceTarget struct {
	Key   string        `json:"key"`
	Kind  ResourceKind  `json:"kind"`
	Media ResourceMedia `json:"media,omitempty"`
	Role  ResourceRole  `json:"role,omitempty"`
}

// HasReferenceMedia reports whether the binding accepts at least one
// reference target.
func (r RouteBinding) HasReferenceMedia() bool {
	return len(r.ResourceTargets) > 0
}

// OperationSummary is the public view of an operation with its modes.
type OperationSummary struct {
	Operation string     `json:"operation"`
	Modes     []ModeSpec `json:"modes,omitempty"`
}

// ModelSummary 是 ModelSpec 的公共只读视图，不暴露 RouteBinding 等内部细节。
type ModelSummary struct {
	ModelID     string             `json:"model"`
	Capability  Capability         `json:"capability"`
	DisplayName string             `json:"display_name"`
	Description string             `json:"description,omitempty"`
	Status      string             `json:"status"`
	Operations  []OperationSummary `json:"operations"`
}

// ToSummary 将完整 ModelSpec 转换为对外安全的 ModelSummary。
func (m *ModelSpec) ToSummary() ModelSummary {
	ops := make([]OperationSummary, 0, len(m.Operations))
	for op, opSpec := range m.Operations {
		ops = append(ops, OperationSummary{
			Operation: string(op),
			Modes:     opSpec.Modes,
		})
	}
	return ModelSummary{
		ModelID:     m.ModelID,
		Capability:  m.Capability,
		DisplayName: m.DisplayName,
		Description: m.ModelDescription,
		Status:      m.Status,
		Operations:  ops,
	}
}

// ModelSchema 是 schema discovery 的返回结构。
type ModelSchema struct {
	Capability   Capability     `json:"capability"`
	ModelID      string         `json:"model"`
	Operation    string         `json:"operation"`
	Mode         string         `json:"mode,omitempty"`
	Schema       map[string]any `json:"schema,omitempty"`
	RequestHints map[string]any `json:"request_hints,omitempty"`
	Capabilities map[string]any `json:"capabilities,omitempty"`
}
