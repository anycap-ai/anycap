package httpclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client wraps HTTP communication with the AnyCap Server.
type Client struct {
	baseURL    string
	apiKey     string
	version    string
	httpClient *http.Client
}

// Option configures the Client.
type Option func(*Client)

// WithAPIKey sets the Authorization bearer token.
func WithAPIKey(key string) Option {
	return func(c *Client) { c.apiKey = key }
}

// WithVersion sets the User-Agent version string.
func WithVersion(v string) Option {
	return func(c *Client) { c.version = v }
}

// New creates a Client for the given base URL.
func New(baseURL string, opts ...Option) *Client {
	c := &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		version: "dev",
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
	for _, o := range opts {
		o(c)
	}
	return c
}

func (c *Client) Get(ctx context.Context, path string) ([]byte, error) {
	return c.do(ctx, http.MethodGet, path, nil)
}

func (c *Client) PostJSON(ctx context.Context, path string, payload any) ([]byte, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return c.do(ctx, http.MethodPost, path, bytes.NewReader(body))
}

func (c *Client) do(ctx context.Context, method, path string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "anycap-cli/"+c.version)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, strings.TrimSpace(string(data)))
	}

	return data, nil
}
