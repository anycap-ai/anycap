package nexushub

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"gitlab.knoffice.tech/open/common-go/logging"
)

// Discovery DTOs map the new NexusHub /v1/atomic_nodes/discovery surface.

// DiscoveryToolDefEntry is one (algo_type)-scoped entry in tool_definition.
type DiscoveryToolDefEntry struct {
	AlgoDescription DiscoveryAlgoDescription `json:"algo_description"`
	Schema          map[string]any           `json:"schema"`
	Annotation      map[string]any           `json:"annotation"`
}

// DiscoveryAlgoDescription is the human-friendly metadata block for an algo.
type DiscoveryAlgoDescription struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// DiscoveryNode is the public projection NexusHub returns under
// /v1/atomic_nodes/discovery and /v1/atomic_nodes/discovery/:ability_key.
type DiscoveryNode struct {
	AbilityKey     string                           `json:"ability_key"`
	Name           string                           `json:"name"`
	Description    string                           `json:"description"`
	Category       string                           `json:"category"`
	Provider       string                           `json:"provider"`
	State          string                           `json:"state"`
	PricingInfo    map[string]any                   `json:"pricing_info"`
	UpdateTime     *time.Time                       `json:"updated_at"`
	ToolDefinition map[string]DiscoveryToolDefEntry `json:"tool_definition"`
}

type discoveryListResponse struct {
	Data       []DiscoveryNode `json:"data"`
	Pagination *struct {
		Page       int   `json:"page"`
		PageSize   int   `json:"page_size"`
		Total      int64 `json:"total"`
		TotalPages int   `json:"total_pages"`
	} `json:"pagination,omitempty"`
}

const (
	discoveryDefaultRequestTimeout = 10 * time.Second
	discoveryDefaultPageSize       = 200
	discoveryActiveState           = "active"
)

// DiscoveryClientConfig configures the Discovery HTTP client.
type DiscoveryClientConfig struct {
	BaseURL        string
	Token          string
	RequestTimeout time.Duration
}

// DiscoveryClient wraps the Discovery API. It is HTTP-only and does no
// caching; wrap it with DiscoveryCache for steady-state traffic.
type DiscoveryClient struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

// NewDiscoveryClient constructs a DiscoveryClient.
func NewDiscoveryClient(cfg DiscoveryClientConfig) *DiscoveryClient {
	timeout := cfg.RequestTimeout
	if timeout == 0 {
		timeout = discoveryDefaultRequestTimeout
	}
	return &DiscoveryClient{
		baseURL:    cfg.BaseURL,
		token:      cfg.Token,
		httpClient: &http.Client{Timeout: timeout},
	}
}

// ListByCategory returns all active discovery nodes under a category, with an
// optional algo filter (algo == "" returns all algos).
func (c *DiscoveryClient) ListByCategory(ctx context.Context, category, algo string) ([]DiscoveryNode, error) {
	if c == nil || c.baseURL == "" {
		return nil, fmt.Errorf("nexushub discovery: base url not configured")
	}

	u, err := url.Parse(c.baseURL + "/v1/atomic_nodes/discovery")
	if err != nil {
		return nil, fmt.Errorf("nexushub discovery: parse url: %w", err)
	}
	q := u.Query()
	if category != "" {
		q.Set("category", category)
	}
	if algo != "" {
		q.Set("algo_type", algo)
	}
	q.Set("state", discoveryActiveState)
	q.Set("page_size", strconv.Itoa(discoveryDefaultPageSize))
	u.RawQuery = q.Encode()

	body, err := c.do(ctx, http.MethodGet, u.String())
	if err != nil {
		return nil, err
	}
	var resp discoveryListResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("nexushub discovery: decode list: %w", err)
	}
	return resp.Data, nil
}

// GetNode returns a single discovery node, optionally scoped to one algo.
// algo == "" returns the full tool_definition map.
func (c *DiscoveryClient) GetNode(ctx context.Context, abilityKey, algo string) (*DiscoveryNode, error) {
	if c == nil || c.baseURL == "" {
		return nil, fmt.Errorf("nexushub discovery: base url not configured")
	}
	if abilityKey == "" {
		return nil, fmt.Errorf("nexushub discovery: ability_key is required")
	}

	endpoint := fmt.Sprintf("%s/v1/atomic_nodes/discovery/%s", c.baseURL, url.PathEscape(abilityKey))
	if algo != "" {
		endpoint = endpoint + "?algo_type=" + url.QueryEscape(algo)
	}
	body, err := c.do(ctx, http.MethodGet, endpoint)
	if err != nil {
		return nil, err
	}
	var node DiscoveryNode
	if err := json.Unmarshal(body, &node); err != nil {
		return nil, fmt.Errorf("nexushub discovery: decode node: %w", err)
	}
	return &node, nil
}

func (c *DiscoveryClient) do(ctx context.Context, method, urlStr string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, method, urlStr, nil)
	if err != nil {
		return nil, fmt.Errorf("nexushub discovery: build request: %w", err)
	}
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("nexushub discovery: http request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider":    "nexushub",
			"stage":       "discovery_unexpected_status",
			"status_code": resp.StatusCode,
			"url":         urlStr,
		}).Error("nexushub discovery returned non-200")
		return nil, fmt.Errorf("nexushub discovery: unexpected status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("nexushub discovery: read body: %w", err)
	}
	return body, nil
}
