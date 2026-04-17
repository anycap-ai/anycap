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

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
)

// AuthError is returned when the server responds with 401 Unauthorized.
type AuthError struct {
	Body string
}

func (e *AuthError) Error() string {
	return "not authenticated or credential expired, run 'anycap login' to authenticate (use 'anycap login --headless' in environments without a browser)"
}

// APIError is returned when the server responds with a 4xx/5xx error.
// It preserves the structured error code and message from the server JSON envelope.
type APIError struct {
	StatusCode int
	Code       string
	Message    string
	RequestID  string
}

func (e *APIError) Error() string {
	if e.RequestID != "" {
		return fmt.Sprintf("%s (request_id: %s)", e.Message, e.RequestID)
	}
	return e.Message
}

// Client wraps HTTP communication with the AnyCap Server.
type Client struct {
	baseURL         string
	credential      *cliconfig.Credential
	credentialSaver func(*cliconfig.Credential) error
	version         string
	traceID         string
	httpClient      *http.Client
}

// Option configures the Client.
type Option func(*Client)

// WithCredential sets the credential used for authentication.
func WithCredential(cred *cliconfig.Credential) Option {
	return func(c *Client) { c.credential = cred }
}

// WithCredentialSaver sets a callback to persist updated credentials.
func WithCredentialSaver(fn func(*cliconfig.Credential) error) Option {
	return func(c *Client) { c.credentialSaver = fn }
}

// WithVersion sets the User-Agent version string.
func WithVersion(v string) Option {
	return func(c *Client) { c.version = v }
}

// WithTraceID sets the trace ID sent as X-Trace-ID header on every request.
func WithTraceID(id string) Option {
	return func(c *Client) { c.traceID = id }
}

// New creates a Client for the given base URL.
func New(baseURL string, opts ...Option) *Client {
	c := &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		version: "dev",
		httpClient: &http.Client{
			Timeout: 600 * time.Second,
		},
	}
	for _, o := range opts {
		o(c)
	}
	return c
}

// Response wraps the server HTTP response body and metadata.
type Response struct {
	Body      []byte // Raw JSON response body
	RequestID string // X-Trace-ID from server, falling back to legacy X-Request-Id
}

func (c *Client) Get(ctx context.Context, path string) (*Response, error) {
	return c.do(ctx, http.MethodGet, path, nil)
}

func (c *Client) Delete(ctx context.Context, path string) (*Response, error) {
	return c.do(ctx, http.MethodDelete, path, nil)
}

func (c *Client) PostJSON(ctx context.Context, path string, payload any) (*Response, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return c.do(ctx, http.MethodPost, path, body)
}

func (c *Client) PutJSON(ctx context.Context, path string, payload any) (*Response, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return c.do(ctx, http.MethodPut, path, body)
}

func (c *Client) PatchJSON(ctx context.Context, path string, payload any) (*Response, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return c.do(ctx, http.MethodPatch, path, body)
}

func (c *Client) do(ctx context.Context, method, path string, body []byte) (*Response, error) {
	return c.doRaw(ctx, method, path, body)
}

func (c *Client) doRaw(ctx context.Context, method, path string, body []byte) (*Response, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "anycap-cli/"+c.version)
	if c.traceID != "" {
		req.Header.Set("X-Trace-ID", c.traceID)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token := c.credential.Token(); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	httpResp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer httpResp.Body.Close()

	data, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return nil, err
	}

	requestID := httpResp.Header.Get("X-Trace-ID")
	if requestID == "" {
		requestID = httpResp.Header.Get("X-Request-Id")
	}

	if httpResp.StatusCode == http.StatusUnauthorized {
		return nil, &AuthError{Body: strings.TrimSpace(string(data))}
	}

	if httpResp.StatusCode >= http.StatusBadRequest {
		// Try to parse server JSON error envelope: {"error":{"code":"...","message":"..."}}
		var env struct {
			Error struct {
				Code    string `json:"code"`
				Message string `json:"message"`
			} `json:"error"`
		}
		if json.Unmarshal(data, &env) == nil && env.Error.Code != "" {
			return nil, &APIError{
				StatusCode: httpResp.StatusCode,
				Code:       env.Error.Code,
				Message:    env.Error.Message,
				RequestID:  requestID,
			}
		}
		return nil, &APIError{
			StatusCode: httpResp.StatusCode,
			Code:       fmt.Sprintf("http_%d", httpResp.StatusCode),
			Message:    strings.TrimSpace(string(data)),
			RequestID:  requestID,
		}
	}

	return &Response{Body: data, RequestID: requestID}, nil
}
