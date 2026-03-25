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
	ops := deriveOperations(capability, node)
	if len(ops) == 0 {
		return nil
	}

	routes := []model.RouteBinding{{
		RouteType:  model.RouteTypeDirect,
		AbilityKey: node.AbilityKey,
		GenType:    string(capability),
		Region:     node.Region,
		Priority:   100,
		Enabled:    true,
	}}

	operationSpecs := make(map[model.Operation]model.OperationSpec, len(ops))
	for _, op := range ops {
		spec := model.OperationSpec{
			Routes: routes,
		}
		if node.OperationSchemas != nil {
			if s, ok := node.OperationSchemas[string(op)]; ok {
				if m, ok := s.(map[string]any); ok {
					spec.RequestHints = m
				}
			}
		}
		operationSpecs[op] = spec
	}

	return &model.ModelSpec{
		ModelID:     modelID,
		Capability:  capability,
		DisplayName: node.Name,
		Status:      node.State,
		Operations:  operationSpecs,
	}
}

func deriveOperations(capability model.Capability, node *atomicNodeDTO) []model.Operation {
	if node.Capabilities == nil {
		return nil
	}

	var ops []model.Operation

	switch capability {
	case model.CapabilityImage:
		if node.Capabilities.Image == nil {
			return nil
		}
		img := node.Capabilities.Image
		if img.SupportsText2Img {
			ops = append(ops, model.OperationGenerate)
		}
		if img.SupportsImg2Img || img.SupportsImageEdit {
			ops = append(ops, model.OperationEdit)
		}
		if img.SupportsUltraImg {
			ops = append(ops, model.OperationUpscale)
		}

	case model.CapabilityVideo:
		if node.Capabilities.Video == nil {
			return nil
		}
		vid := node.Capabilities.Video
		if vid.SupportsText2Video {
			ops = append(ops, model.OperationGenerate)
		}
		if vid.SupportsImg2Video {
			ops = append(ops, model.OperationFromImage)
		}

	case model.CapabilityAudio:
		ops = append(ops, model.OperationSpeak)
	}

	return ops
}
