package kvsync

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultCloudflareAPIBaseURL = "https://api.cloudflare.com/client/v4"

type CloudflareKVClientConfig struct {
	AccountID   string
	NamespaceID string
	APIToken    string
	APIBaseURL  string
	HTTPClient  *http.Client
}

type CloudflareKVClient struct {
	accountID   string
	namespaceID string
	apiToken    string
	apiBaseURL  string
	httpClient  *http.Client
}

func NewCloudflareKVClient(cfg CloudflareKVClientConfig) (*CloudflareKVClient, error) {
	accountID := strings.TrimSpace(cfg.AccountID)
	namespaceID := strings.TrimSpace(cfg.NamespaceID)
	apiToken := strings.TrimSpace(cfg.APIToken)
	if accountID == "" || namespaceID == "" || apiToken == "" {
		return nil, fmt.Errorf("cloudflare kv client config is invalid")
	}

	apiBaseURL := strings.TrimRight(strings.TrimSpace(cfg.APIBaseURL), "/")
	if apiBaseURL == "" {
		apiBaseURL = defaultCloudflareAPIBaseURL
	}

	httpClient := cfg.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 10 * time.Second}
	}

	return &CloudflareKVClient{
		accountID:   accountID,
		namespaceID: namespaceID,
		apiToken:    apiToken,
		apiBaseURL:  apiBaseURL,
		httpClient:  httpClient,
	}, nil
}

func (c *CloudflareKVClient) Put(ctx context.Context, key string, value []byte) error {
	return c.request(ctx, http.MethodPut, key, value)
}

func (c *CloudflareKVClient) Delete(ctx context.Context, key string) error {
	return c.request(ctx, http.MethodDelete, key, nil)
}

func (c *CloudflareKVClient) request(ctx context.Context, method string, key string, value []byte) error {
	if c == nil || c.httpClient == nil {
		return fmt.Errorf("cloudflare kv client is not configured")
	}
	if strings.TrimSpace(key) == "" {
		return fmt.Errorf("kv key is required")
	}

	endpoint := fmt.Sprintf(
		"%s/accounts/%s/storage/kv/namespaces/%s/values/%s",
		c.apiBaseURL,
		url.PathEscape(c.accountID),
		url.PathEscape(c.namespaceID),
		url.PathEscape(key),
	)
	endpoint = strings.ReplaceAll(endpoint, "%2F", "/")

	var body io.Reader
	if method == http.MethodPut {
		body = bytes.NewReader(value)
	}

	req, err := http.NewRequestWithContext(ctx, method, endpoint, body)
	if err != nil {
		return fmt.Errorf("build cloudflare kv request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	if method == http.MethodPut {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("cloudflare kv request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	data, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	return fmt.Errorf("cloudflare kv request failed: status=%d body=%s", resp.StatusCode, strings.TrimSpace(string(data)))
}
