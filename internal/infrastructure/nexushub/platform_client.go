package nexushub

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

const (
	defaultRequestTimeout = 10 * time.Second
	defaultPageSize       = 100
	atomicNodeStateActive = "active"
)

// PlatformClientConfig 配置 NexusHub Platform 客户端。
type PlatformClientConfig struct {
	BaseURL        string
	Token          string
	RequestTimeout time.Duration
}

// PlatformClient 通过 NexusHub Platform API 获取 atomic node 配置
// 并将其转换为 AnyCap 领域模型 (ModelSpec)。
type PlatformClient struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

func NewPlatformClient(cfg PlatformClientConfig) *PlatformClient {
	timeout := cfg.RequestTimeout
	if timeout == 0 {
		timeout = defaultRequestTimeout
	}
	return &PlatformClient{
		baseURL: cfg.BaseURL,
		token:   cfg.Token,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// --- CatalogRepository implementation ---

func (c *PlatformClient) ListModels(ctx context.Context, capability model.Capability) ([]model.ModelSpec, error) {
	nodes, err := c.fetchAtomicNodes(ctx, string(capability))
	if err != nil {
		return nil, fmt.Errorf("fetch atomic nodes for %s: %w", capability, err)
	}

	specs := make([]model.ModelSpec, 0, len(nodes))
	for i := range nodes {
		spec := nodeToModelSpec(&nodes[i], capability)
		if spec != nil {
			specs = append(specs, *spec)
		}
	}
	return specs, nil
}

func (c *PlatformClient) GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	nodes, err := c.fetchAtomicNodes(ctx, string(capability))
	if err != nil {
		return nil, fmt.Errorf("fetch atomic nodes for %s: %w", capability, err)
	}

	for i := range nodes {
		id := resolveModelID(&nodes[i])
		if id == modelID {
			return nodeToModelSpec(&nodes[i], capability), nil
		}
	}

	return nil, fmt.Errorf("model %q not found in capability %s", modelID, capability)
}

// --- NexusHub HTTP transport ---

type atomicNodeResponse struct {
	Data       []atomicNodeDTO `json:"data"`
	Pagination *paginationDTO  `json:"pagination,omitempty"`
}

type paginationDTO struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type atomicNodeDTO struct {
	ID               int64                `json:"id"`
	AbilityKey       string               `json:"ability_key"`
	Name             string               `json:"name"`
	State            string               `json:"state"`
	Description      string               `json:"description"`
	Owner            string               `json:"owner"`
	Category         string               `json:"category"`
	Tags             string               `json:"tags"`
	Region           string               `json:"region"`
	Provider         string               `json:"provider"`
	AtomicType       string               `json:"atomic_type"`
	BaseModel        string               `json:"base_model"`
	ExtraInfo        map[string]any       `json:"extra_info"`
	OperationSchemas map[string]any       `json:"operation_schemas"`
	PricingInfo      map[string]any       `json:"pricing_info"`
	Capabilities     *nodeCapabilitiesDTO `json:"capabilities"`
}

type nodeCapabilitiesDTO struct {
	Image *imageCapabilitiesDTO `json:"image,omitempty"`
	Video *videoCapabilitiesDTO `json:"video,omitempty"`
	Music *musicCapabilitiesDTO `json:"music,omitempty"`
}

type imageCapabilitiesDTO struct {
	SupportsText2Img      bool     `json:"supports_text_2_img"`
	SupportsImg2Img       bool     `json:"supports_img_2_img"`
	SupportsUltraImg      bool     `json:"supports_ultra_img"`
	SupportsImageEdit     bool     `json:"supports_image_edit"`
	SupportsMultiRef2Img  bool     `json:"supports_multi_ref_2_img"`
	SupportsGroupImgGen   bool     `json:"supports_group_img_gen"`
	SupportedResolutions  []string `json:"supported_resolutions"`
	SupportedAspectRatios []string `json:"supported_aspect_ratios"`
}

type videoCapabilitiesDTO struct {
	SupportsText2Video         bool     `json:"supports_text_2_video"`
	SupportsImg2Video          bool     `json:"supports_img_2_video"`
	SupportsRef2Video          bool     `json:"supports_ref_2_video"`
	SupportsFirstLast2Video    bool     `json:"supports_first_last_2_video"`
	SupportsEditVideo          bool     `json:"supports_edit_video"`
	SupportsReferVideo         bool     `json:"supports_refer_video"`
	SupportsUltraVideo         bool     `json:"supports_ultra_video"`
	SupportsDigitalAvatarVideo bool     `json:"supports_digital_avatar_video"`
	SupportsMotionControl      bool     `json:"supports_motion_control"`
	SupportsMultiShotVideo     bool     `json:"supports_multi_shot_video"`
	SupportsSound              bool     `json:"supports_sound"`
	SupportedResolutions       []string `json:"supported_resolutions"`
	SupportedAspectRatios      []string `json:"supported_aspect_ratios"`
	SupportedDurations         []int    `json:"supported_durations"`
}

type musicCapabilitiesDTO struct {
	SupportsText2Music    bool     `json:"supports_text_2_music"`
	SupportsCustomMusic   bool     `json:"supports_custom_music"`
	SupportsContinueMusic bool     `json:"supports_continue_music"`
	SupportedDurations    []int    `json:"supported_durations"`
	SupportedFormats      []string `json:"supported_formats"`
}

func (c *PlatformClient) fetchAtomicNodes(ctx context.Context, category string) ([]atomicNodeDTO, error) {
	u, err := url.Parse(c.baseURL + "/v1/atomic_nodes")
	if err != nil {
		return nil, fmt.Errorf("parse url: %w", err)
	}

	q := u.Query()
	q.Set("category", category)
	q.Set("state", atomicNodeStateActive)
	q.Set("page_size", fmt.Sprintf("%d", defaultPageSize))
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		req.Header.Set("X-Request-Id", requestID)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status %d from NexusHub", resp.StatusCode)
	}

	var result atomicNodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	return result.Data, nil
}

func (c *PlatformClient) GetOperationSchemas(ctx context.Context, abilityKey string) (map[string]any, error) {
	node, err := c.getAtomicNode(ctx, abilityKey)
	if err != nil {
		return nil, err
	}
	return node.OperationSchemas, nil
}

func (c *PlatformClient) getAtomicNode(ctx context.Context, abilityKey string) (*atomicNodeDTO, error) {
	endpoint := fmt.Sprintf("%s/v1/atomic_node/%s", c.baseURL, url.PathEscape(abilityKey))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		req.Header.Set("X-Request-Id", requestID)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status %d from NexusHub", resp.StatusCode)
	}

	var node atomicNodeDTO
	if err := json.NewDecoder(resp.Body).Decode(&node); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	return &node, nil
}

// --- AtomicNode → ModelSpec 转换 ---

func resolveModelID(node *atomicNodeDTO) string {
	if node.ExtraInfo != nil {
		if mid, ok := node.ExtraInfo["anycap_model_id"].(string); ok && mid != "" {
			return mid
		}
	}
	if node.BaseModel != "" {
		return node.BaseModel
	}
	return node.AbilityKey
}

func nodeToModelSpec(node *atomicNodeDTO, capability model.Capability) *model.ModelSpec {
	if node.State != atomicNodeStateActive {
		return nil
	}

	modelID := resolveModelID(node)
	operationSpecs := deriveOperationSpecs(capability, node)
	if len(operationSpecs) == 0 {
		return nil
	}

	displayName := node.Name
	if displayName == "" {
		displayName = modelID
	}

	return &model.ModelSpec{
		ModelID:          modelID,
		Capability:       capability,
		DisplayName:      displayName,
		ModelDescription: node.Description,
		Status:           node.State,
		Operations:       operationSpecs,
	}
}

// enrichHintsFromCapabilities merges capability-level constraints (supported
// durations, ratios, resolutions) into the operation's RequestHints so they
// are visible to CLI users via `models <model> schema`.
// It only fills in fields that are not already present in RequestHints.
func enrichHintsFromCapabilities(spec *model.OperationSpec, capability model.Capability, node *atomicNodeDTO) {
	if node.Capabilities == nil {
		return
	}
	if spec.RequestHints == nil {
		spec.RequestHints = make(map[string]any)
	}

	switch capability {
	case model.CapabilityImage:
		img := node.Capabilities.Image
		if img == nil {
			return
		}
		if _, exists := spec.RequestHints["ratio"]; !exists && len(img.SupportedAspectRatios) > 0 {
			spec.RequestHints["ratio"] = map[string]any{"type": "string", "enum": img.SupportedAspectRatios}
		}
		if _, exists := spec.RequestHints["resolution"]; !exists && len(img.SupportedResolutions) > 0 {
			spec.RequestHints["resolution"] = map[string]any{"type": "string", "enum": img.SupportedResolutions}
		}

	case model.CapabilityVideo:
		vid := node.Capabilities.Video
		if vid == nil {
			return
		}
		if _, exists := spec.RequestHints["duration"]; !exists && len(vid.SupportedDurations) > 0 {
			spec.RequestHints["duration"] = map[string]any{"type": "integer", "enum": vid.SupportedDurations}
		}
		if _, exists := spec.RequestHints["ratio"]; !exists && len(vid.SupportedAspectRatios) > 0 {
			spec.RequestHints["ratio"] = map[string]any{"type": "string", "enum": vid.SupportedAspectRatios}
		}
		if _, exists := spec.RequestHints["resolution"]; !exists && len(vid.SupportedResolutions) > 0 {
			spec.RequestHints["resolution"] = map[string]any{"type": "string", "enum": vid.SupportedResolutions}
		}

	case model.CapabilityMusic:
		mus := node.Capabilities.Music
		if mus == nil {
			return
		}
		if _, exists := spec.RequestHints["duration"]; !exists && len(mus.SupportedDurations) > 0 {
			spec.RequestHints["duration"] = map[string]any{"type": "integer", "enum": mus.SupportedDurations}
		}

	}
}

func deriveOperationSpecs(capability model.Capability, node *atomicNodeDTO) map[model.Operation]model.OperationSpec {
	if node.Capabilities == nil {
		return nil
	}

	operationSpecs := make(map[model.Operation]model.OperationSpec)

	switch capability {
	case model.CapabilityImage:
		if node.Capabilities.Image == nil {
			return nil
		}
		img := node.Capabilities.Image
		generateSpec := newOperationSpec(node, model.OperationGenerate)
		if img.SupportsText2Img {
			addModeRoute(&generateSpec, node, capability, model.ModeTextToImage, "Text to Image", "txt_2_img")
		}
		if algoType := preferredImageToImageAlgoType(img); algoType != "" {
			addModeRoute(&generateSpec, node, capability, model.ModeImageToImage, "Image to Image", algoType)
		}
		if len(generateSpec.Routes) > 0 {
			enrichHintsFromCapabilities(&generateSpec, capability, node)
			operationSpecs[model.OperationGenerate] = generateSpec
		}

		if img.SupportsUltraImg {
			upscaleSpec := newOperationSpec(node, model.OperationUpscale)
			addRoute(&upscaleSpec, node, capability, "", "ultra_img")
			enrichHintsFromCapabilities(&upscaleSpec, capability, node)
			operationSpecs[model.OperationUpscale] = upscaleSpec
		}

	case model.CapabilityVideo:
		if node.Capabilities.Video == nil {
			return nil
		}
		vid := node.Capabilities.Video
		generateSpec := newOperationSpec(node, model.OperationGenerate)
		if vid.SupportsText2Video {
			addModeRoute(&generateSpec, node, capability, model.ModeTextToVideo, "Text to Video", "txt_2_video")
		}
		if algoType := preferredImageToVideoAlgoType(vid); algoType != "" {
			addModeRoute(&generateSpec, node, capability, model.ModeImageToVideo, "Image to Video", algoType)
		}
		if len(generateSpec.Routes) > 0 {
			enrichHintsFromCapabilities(&generateSpec, capability, node)
			operationSpecs[model.OperationGenerate] = generateSpec
		}

		if vid.SupportsUltraVideo {
			upscaleSpec := newOperationSpec(node, model.OperationUpscale)
			addRoute(&upscaleSpec, node, capability, "", "ultra_video")
			enrichHintsFromCapabilities(&upscaleSpec, capability, node)
			operationSpecs[model.OperationUpscale] = upscaleSpec
		}

	case model.CapabilityAudio:
		speakSpec := newOperationSpec(node, model.OperationSpeak)
		addRoute(&speakSpec, node, capability, "", "speak")
		operationSpecs[model.OperationSpeak] = speakSpec

	case model.CapabilityMusic:
		if node.Capabilities.Music == nil {
			return nil
		}
		music := node.Capabilities.Music
		generateSpec := newOperationSpec(node, model.OperationGenerate)
		enrichHintsFromCapabilities(&generateSpec, capability, node)
		if music.SupportsText2Music || music.SupportsCustomMusic || music.SupportsContinueMusic {
			addModeRoute(&generateSpec, node, capability, model.ModeTextToMusic, "Text to Music", "text_2_music")
		}
		if len(generateSpec.Routes) > 0 {
			operationSpecs[model.OperationGenerate] = generateSpec
		}
	}

	if len(operationSpecs) == 0 {
		return nil
	}
	return operationSpecs
}

func newOperationSpec(node *atomicNodeDTO, operation model.Operation) model.OperationSpec {
	spec := model.OperationSpec{}
	if node == nil || node.OperationSchemas == nil {
		return spec
	}
	if schema, ok := node.OperationSchemas[string(operation)]; ok {
		if hints, ok := schema.(map[string]any); ok {
			spec.RequestHints = hints
		}
	}
	return spec
}

func addModeRoute(spec *model.OperationSpec, node *atomicNodeDTO, capability model.Capability, mode model.Mode, description, algoType string) {
	if spec == nil {
		return
	}
	addRoute(spec, node, capability, mode, algoType)
	for _, existing := range spec.Modes {
		if existing.Mode == mode {
			return
		}
	}
	spec.Modes = append(spec.Modes, model.ModeSpec{
		Mode:        mode,
		Description: description,
	})
}

func addRoute(spec *model.OperationSpec, node *atomicNodeDTO, capability model.Capability, mode model.Mode, algoType string) {
	if spec == nil || node == nil {
		return
	}
	spec.Routes = append(spec.Routes, model.RouteBinding{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: node.AbilityKey,
		GenType:    string(capability),
		AlgoType:   algoType,
		Mode:       mode,
		Region:     node.Region,
		Priority:   100,
		Enabled:    true,
	})
}

func preferredImageToImageAlgoType(img *imageCapabilitiesDTO) string {
	switch {
	case img == nil:
		return ""
	case img.SupportsImg2Img:
		return "img_2_img"
	case img.SupportsImageEdit:
		return "img_edit"
	case img.SupportsMultiRef2Img:
		return "multi_ref_2_img"
	case img.SupportsGroupImgGen:
		return "group_img_gen"
	default:
		return ""
	}
}

func preferredImageToVideoAlgoType(vid *videoCapabilitiesDTO) string {
	switch {
	case vid == nil:
		return ""
	case vid.SupportsImg2Video:
		return "img_2_video"
	case vid.SupportsRef2Video:
		return "ref_2_video"
	case vid.SupportsFirstLast2Video:
		return "first_last_2_video"
	default:
		return ""
	}
}
