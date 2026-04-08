package runner

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ClientConfig struct {
	BaseURL    string
	Token      string
	HTTPClient *http.Client
}

type Client struct {
	baseURL string
	token   string
	client  *http.Client
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Platform string `json:"platform"`
}

type HeartbeatRequest struct {
	State string `json:"state,omitempty"`
}

type TaskUpdateRequest struct {
	Status       string `json:"status"`
	ErrorMessage string `json:"error_message,omitempty"`
}

type SessionUpdateRequest struct {
	Status       string `json:"status"`
	FinalMessage string `json:"final_message,omitempty"`
	ExecutorRef  string `json:"executor_ref,omitempty"`
}

type TaskResponse struct {
	ID             string  `json:"id"`
	UserID         string  `json:"user_id"`
	RunnerID       string  `json:"runner_id"`
	SessionID      *string `json:"session_id,omitempty"`
	Platform       string  `json:"platform"`
	Intent         string  `json:"intent"`
	TaskText       string  `json:"task_text"`
	WorkspaceHint  *string `json:"workspace_hint,omitempty"`
	RunnerSelector *string `json:"runner_selector,omitempty"`
	Status         string  `json:"status"`
	ErrorMessage   *string `json:"error_message,omitempty"`
	DispatchedAt   *string `json:"dispatched_at,omitempty"`
	StartedAt      *string `json:"started_at,omitempty"`
	CompletedAt    *string `json:"completed_at,omitempty"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type SessionResponse struct {
	ID              string  `json:"id"`
	UserID          string  `json:"user_id"`
	ConversationID  string  `json:"conversation_id"`
	ParentSessionID *string `json:"parent_session_id,omitempty"`
	RunnerID        string  `json:"runner_id"`
	Agent           string  `json:"agent"`
	Mode            string  `json:"mode"`
	UserMessage     *string `json:"user_message,omitempty"`
	FinalMessage    *string `json:"final_message,omitempty"`
	Status          string  `json:"status"`
	ExecutorRef     *string `json:"executor_ref,omitempty"`
	StartedAt       *string `json:"started_at,omitempty"`
	CompletedAt     *string `json:"completed_at,omitempty"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
}

func NewClient(cfg ClientConfig) *Client {
	client := cfg.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}
	return &Client{
		baseURL: strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/"),
		token:   strings.TrimSpace(cfg.Token),
		client:  client,
	}
}

func (c *Client) Register(ctx context.Context, input RegisterRequest) error {
	return c.doJSON(ctx, http.MethodPost, "/v1/agent/runners/register", input, "")
}

func (c *Client) Heartbeat(ctx context.Context, runnerID string, input HeartbeatRequest) error {
	path := fmt.Sprintf("/v1/agent/runners/%s/heartbeat", strings.TrimSpace(runnerID))
	return c.doJSON(ctx, http.MethodPost, path, input, "")
}

func (c *Client) UpdateTask(ctx context.Context, runnerID string, taskID string, input TaskUpdateRequest, idempotencyKey string) error {
	path := fmt.Sprintf("/v1/agent/runners/%s/tasks/%s", strings.TrimSpace(runnerID), strings.TrimSpace(taskID))
	return c.doJSON(ctx, http.MethodPost, path, input, idempotencyKey)
}

func (c *Client) UpdateSession(ctx context.Context, runnerID string, sessionID string, input SessionUpdateRequest, idempotencyKey string) error {
	path := fmt.Sprintf("/v1/agent/runners/%s/sessions/%s", strings.TrimSpace(runnerID), strings.TrimSpace(sessionID))
	return c.doJSON(ctx, http.MethodPost, path, input, idempotencyKey)
}

func (c *Client) NextTask(ctx context.Context, runnerID string) (*TaskResponse, error) {
	if c == nil || c.client == nil {
		return nil, model.ErrNotConfigured("runner client is not configured")
	}
	if c.baseURL == "" || c.token == "" {
		return nil, model.ErrNotConfigured("runner client credentials are not configured")
	}

	path := fmt.Sprintf("/v1/agent/runners/%s/tasks/next", strings.TrimSpace(runnerID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("build runner request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send runner request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNoContent {
		return nil, nil
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("runner request failed with status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read runner response: %w", err)
	}
	var envelope struct {
		Status string       `json:"status"`
		Data   TaskResponse `json:"data"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, fmt.Errorf("decode runner response: %w", err)
	}
	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, nil
	}
	return &envelope.Data, nil
}

func (c *Client) NextSession(ctx context.Context, runnerID string) (*SessionResponse, error) {
	if c == nil || c.client == nil {
		return nil, model.ErrNotConfigured("runner client is not configured")
	}
	if c.baseURL == "" || c.token == "" {
		return nil, model.ErrNotConfigured("runner client credentials are not configured")
	}

	path := fmt.Sprintf("/v1/agent/runners/%s/sessions/next", strings.TrimSpace(runnerID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("build runner request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send runner request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNoContent {
		return nil, nil
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("runner request failed with status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read runner response: %w", err)
	}
	var envelope struct {
		Status string          `json:"status"`
		Data   SessionResponse `json:"data"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, fmt.Errorf("decode runner response: %w", err)
	}
	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, nil
	}
	return &envelope.Data, nil
}

func (c *Client) GetSession(ctx context.Context, runnerID string, sessionID string) (*SessionResponse, error) {
	if c == nil || c.client == nil {
		return nil, model.ErrNotConfigured("runner client is not configured")
	}
	if c.baseURL == "" || c.token == "" {
		return nil, model.ErrNotConfigured("runner client credentials are not configured")
	}

	path := fmt.Sprintf("/v1/agent/runners/%s/sessions/%s", strings.TrimSpace(runnerID), strings.TrimSpace(sessionID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("build runner request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send runner request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("runner request failed with status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read runner response: %w", err)
	}
	var envelope struct {
		Status string          `json:"status"`
		Data   SessionResponse `json:"data"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, fmt.Errorf("decode runner response: %w", err)
	}
	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, nil
	}
	return &envelope.Data, nil
}

func (c *Client) doJSON(ctx context.Context, method string, path string, payload any, idempotencyKey string) error {
	if c == nil || c.client == nil {
		return model.ErrNotConfigured("runner client is not configured")
	}
	if c.baseURL == "" || c.token == "" {
		return model.ErrNotConfigured("runner client credentials are not configured")
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal runner request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build runner request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.token)
	if strings.TrimSpace(idempotencyKey) != "" {
		req.Header.Set("X-Idempotency-Key", strings.TrimSpace(idempotencyKey))
	}
	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("send runner request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("runner request failed with status %d", resp.StatusCode)
	}
	return nil
}
