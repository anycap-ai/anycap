package artifactingest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"
)

const (
	defaultRequestTimeout = 2 * time.Minute
	ingestPath            = "/v1/internal/artifacts/ingest"
)

type ClientConfig struct {
	BaseURL        string
	Token          string
	RequestTimeout time.Duration
	HTTPClient     *http.Client
}

type Client struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

func NewClient(cfg ClientConfig) (*Client, error) {
	baseURL := strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/")
	token := strings.TrimSpace(cfg.Token)
	if baseURL == "" || token == "" {
		return nil, fmt.Errorf("artifact ingest client config is invalid")
	}

	httpClient := cfg.HTTPClient
	if httpClient == nil {
		timeout := cfg.RequestTimeout
		if timeout <= 0 {
			timeout = defaultRequestTimeout
		}
		httpClient = &http.Client{Timeout: timeout}
	}

	return &Client{
		baseURL:    baseURL,
		token:      token,
		httpClient: httpClient,
	}, nil
}

func (c *Client) Ingest(ctx context.Context, req model.ArtifactIngestRequest) (model.ArtifactIngestResult, error) {
	if c == nil || c.httpClient == nil || c.baseURL == "" || c.token == "" {
		return model.ArtifactIngestResult{}, model.ErrNotConfigured("artifact ingest client is not configured")
	}

	payloadBytes, err := json.Marshal(map[string]any{
		"source_url":        strings.TrimSpace(req.SourceURL),
		"object_key":        strings.TrimSpace(req.ObjectKey),
		"media_type":        string(req.MediaType),
		"filename_hint":     strings.TrimSpace(req.FilenameHint),
		"content_type_hint": strings.TrimSpace(req.ContentTypeHint),
		"max_bytes":         req.MaxBytes,
	})
	if err != nil {
		return model.ArtifactIngestResult{}, fmt.Errorf("marshal artifact ingest request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+ingestPath, bytes.NewReader(payloadBytes))
	if err != nil {
		return model.ArtifactIngestResult{}, fmt.Errorf("build artifact ingest request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.token)
	if traceID := trace.GetTraceID(ctx); traceID != "" {
		httpReq.Header.Set("X-Request-Id", traceID)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":       "artifact.ingest",
			"endpoint":   c.baseURL + ingestPath,
			"source_url": sanitizeURLForLog(req.SourceURL),
			"object_key": strings.TrimSpace(req.ObjectKey),
			"media_type": string(req.MediaType),
		}).WithError(err).Error("call failed")
		return model.ArtifactIngestResult{}, fmt.Errorf("call artifact ingest: %w", err)
	}
	defer resp.Body.Close()

	body, readErr := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if readErr != nil {
		return model.ArtifactIngestResult{}, fmt.Errorf("read artifact ingest response: %w", readErr)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		msg := strings.TrimSpace(string(body))
		if msg == "" {
			msg = "artifact ingest upstream error"
		}
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":          "artifact.ingest",
			"endpoint":      c.baseURL + ingestPath,
			"status":        resp.StatusCode,
			"source_url":    sanitizeURLForLog(req.SourceURL),
			"object_key":    strings.TrimSpace(req.ObjectKey),
			"media_type":    string(req.MediaType),
			"response_body": limitForLog(msg, 1024),
		}).Error("upstream rejected request")
		return model.ArtifactIngestResult{}, fmt.Errorf("%w: %s", model.ErrUpstreamUnavailable, msg)
	}

	var parsed struct {
		ETag string `json:"etag"`
		MIME string `json:"mime"`
		Size int64  `json:"size"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return model.ArtifactIngestResult{}, fmt.Errorf("decode artifact ingest response: %w", err)
	}

	if parsed.Size <= 0 {
		return model.ArtifactIngestResult{}, fmt.Errorf("%w: invalid artifact size", model.ErrUpstreamUnavailable)
	}

	return model.ArtifactIngestResult{
		ETag: strings.TrimSpace(parsed.ETag),
		MIME: strings.TrimSpace(parsed.MIME),
		Size: parsed.Size,
	}, nil
}

func sanitizeURLForLog(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	parsed, err := url.Parse(trimmed)
	if err != nil {
		return trimmed
	}
	if parsed.Scheme == "" || parsed.Host == "" {
		return trimmed
	}
	return parsed.Scheme + "://" + parsed.Host + parsed.Path
}

func limitForLog(raw string, limit int) string {
	if limit <= 0 {
		return ""
	}
	trimmed := strings.TrimSpace(raw)
	if len(trimmed) <= limit {
		return trimmed
	}
	return trimmed[:limit] + "...(truncated)"
}
