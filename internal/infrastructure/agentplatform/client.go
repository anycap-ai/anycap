package agentplatform

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// Client calls Agent Platform's capabilities API for image/video understanding.
type Client struct {
	baseURL  string
	apiKey   string
	tenantID string
	http     *http.Client
}

// NewClient creates a capabilities client from config.
func NewClient(cfg config.AgentPlatformConfig) *Client {
	return &Client{
		baseURL:  cfg.BaseURL,
		apiKey:   cfg.APIKey,
		tenantID: cfg.TenantID,
		http: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

// upstreamResponse is the JSON shape returned by agent-platform capabilities endpoints.
type upstreamResponse struct {
	Content    string `json:"content"`
	Model      string `json:"model"`
	DurationMs int64  `json:"duration_ms"`
}

// upstreamError is the JSON error shape returned by agent-platform.
type upstreamError struct {
	Detail struct {
		Error   string `json:"error"`
		Message string `json:"message"`
	} `json:"detail"`
}

// ImageUnderstand calls POST /api/v1/capabilities/image/understand.
func (c *Client) ImageUnderstand(ctx context.Context, req model.ImageUnderstandRequest) (model.UnderstandResult, error) {
	body := map[string]any{}
	if req.URL != "" {
		body["url"] = req.URL
	}
	if req.Data != "" {
		body["data"] = req.Data
	}
	if req.MIMEType != "" {
		body["mime_type"] = req.MIMEType
	}
	if req.Instruction != "" {
		body["instruction"] = req.Instruction
	}
	if req.Model != "" {
		body["model"] = req.Model
	}

	return c.doCapabilitiesRequest(ctx, "/api/v1/capabilities/image/understand", body)
}

// VideoRead calls POST /api/v1/capabilities/video/read.
func (c *Client) VideoRead(ctx context.Context, req model.VideoReadRequest) (model.UnderstandResult, error) {
	body := map[string]any{}
	if req.URL != "" {
		body["url"] = req.URL
	}
	if req.Instruction != "" {
		body["instruction"] = req.Instruction
	}
	if req.Model != "" {
		body["model"] = req.Model
	}

	return c.doCapabilitiesRequest(ctx, "/api/v1/capabilities/video/read", body)
}

func (c *Client) doCapabilitiesRequest(ctx context.Context, path string, body map[string]any) (model.UnderstandResult, error) {
	payload, err := json.Marshal(body)
	if err != nil {
		return model.UnderstandResult{}, fmt.Errorf("marshal request: %w", err)
	}

	url := c.baseURL + path
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return model.UnderstandResult{}, fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
	if c.tenantID != "" {
		httpReq.Header.Set("X-Tenant-ID", c.tenantID)
	}

	start := time.Now()
	resp, err := c.http.Do(httpReq)
	if err != nil {
		return model.UnderstandResult{}, fmt.Errorf("capabilities request to %s failed: %w", path, err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return model.UnderstandResult{}, fmt.Errorf("read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var ue upstreamError
		if json.Unmarshal(respBody, &ue) == nil && ue.Detail.Error != "" {
			return model.UnderstandResult{}, &UpstreamError{
				StatusCode: resp.StatusCode,
				Code:       ue.Detail.Error,
				Message:    ue.Detail.Message,
			}
		}

		return model.UnderstandResult{}, &UpstreamError{
			StatusCode: resp.StatusCode,
			Code:       "upstream_error",
			Message:    string(respBody),
		}
	}

	var result upstreamResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return model.UnderstandResult{}, fmt.Errorf("decode response: %w", err)
	}

	// If upstream didn't report duration, calculate it ourselves.
	durationMs := result.DurationMs
	if durationMs == 0 {
		durationMs = time.Since(start).Milliseconds()
	}

	return model.UnderstandResult{
		Content:    result.Content,
		Model:      result.Model,
		DurationMs: durationMs,
	}, nil
}

// UpstreamError represents a non-200 response from agent-platform.
type UpstreamError struct {
	StatusCode int
	Code       string
	Message    string
}

func (e *UpstreamError) Error() string {
	return fmt.Sprintf("agent-platform %d: %s: %s", e.StatusCode, e.Code, e.Message)
}
