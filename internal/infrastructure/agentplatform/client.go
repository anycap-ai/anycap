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
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
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
	Content    string        `json:"content"`
	Model      string        `json:"model"`
	Usage      upstreamUsage `json:"usage"`
	DurationMs int64         `json:"duration_ms"`
}

type upstreamUsage struct {
	InputTokens      int `json:"input_tokens"`
	OutputTokens     int `json:"output_tokens"`
	TotalTokens      int `json:"total_tokens"`
	CacheReadTokens  int `json:"cache_read_tokens"`
	CacheWriteTokens int `json:"cache_write_tokens"`
}

// upstreamError is the JSON error shape returned by agent-platform.
type upstreamError struct {
	Detail struct {
		Error   string `json:"error"`
		Message string `json:"message"`
	} `json:"detail"`
}

// ImageRead calls POST /api/v1/capabilities/image/read.
func (c *Client) ImageRead(ctx context.Context, req model.ImageReadRequest) (model.UnderstandResult, error) {
	body := map[string]any{}

	if len(req.Images) > 0 {
		// Multi-image mode.
		images := make([]map[string]any, len(req.Images))
		for i, img := range req.Images {
			m := map[string]any{}
			if img.URL != "" {
				m["url"] = img.URL
			}
			if img.Data != "" {
				m["data"] = img.Data
			}
			if img.MIMEType != "" {
				m["mime_type"] = img.MIMEType
			}
			images[i] = m
		}
		body["images"] = images
	} else {
		// Single-image shorthand.
		if req.URL != "" {
			body["url"] = req.URL
		}
		if req.Data != "" {
			body["data"] = req.Data
		}
		if req.MIMEType != "" {
			body["mime_type"] = req.MIMEType
		}
	}
	if req.Instruction != "" {
		body["instruction"] = req.Instruction
	}
	if req.Model != "" {
		body["model"] = req.Model
	}

	return c.doCapabilitiesRequest(ctx, "/api/v1/capabilities/image/read", body)
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

// AudioRead calls POST /api/v1/capabilities/audio/read.
func (c *Client) AudioRead(ctx context.Context, req model.AudioReadRequest) (model.UnderstandResult, error) {
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

	return c.doCapabilitiesRequest(ctx, "/api/v1/capabilities/audio/read", body)
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
	if userID := middleware.UserIDFromContext(ctx); userID != "" {
		httpReq.Header.Set("X-User-ID", userID)
	}
	if requestID := middleware.RequestIDFromContext(ctx); requestID != "" {
		httpReq.Header.Set("X-Request-ID", requestID)
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
		Content: result.Content,
		Model:   result.Model,
		Usage: model.Usage{
			InputTokens:      result.Usage.InputTokens,
			OutputTokens:     result.Usage.OutputTokens,
			TotalTokens:      result.Usage.TotalTokens,
			CacheReadTokens:  result.Usage.CacheReadTokens,
			CacheWriteTokens: result.Usage.CacheWriteTokens,
		},
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
