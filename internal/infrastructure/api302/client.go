// Package api302 provides an HTTP client for 302 AI APIs (Unified Search and Firecrawl scrape).
package api302

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
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const (
	defaultBaseURL        = "https://api.302.ai"
	defaultRequestTimeout = 60 * time.Second

	searchPath = "/302/general/search"
	scrapePath = "/firecrawl/v1/scrape"

	// Default search provider and category (Google via search1).
	defaultSearchProvider = "search1_search"
	defaultSearchCategory = "google"

	// Exa provider for precise date-range searches.
	exaSearchProvider = "exa"
)

// ClientConfig holds configuration for the 302 AI API client.
type ClientConfig struct {
	// BaseURL overrides the default 302 AI API base URL. Leave empty to use default.
	BaseURL string
	// APIKey is the 302 AI API key (required).
	APIKey string
	// RequestTimeout overrides the default HTTP request timeout. Zero uses default (60s).
	RequestTimeout time.Duration
}

// Client is an HTTP client for 302 AI search and scrape APIs.
type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewClient creates a new 302 AI API client.
func NewClient(cfg ClientConfig) *Client {
	baseURL := cfg.BaseURL
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout == 0 {
		timeout = defaultRequestTimeout
	}

	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		apiKey:  cfg.APIKey,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// ---- Search API ----

// SearchParams holds parameters for a web search.
type SearchParams struct {
	// Query is the search query string (required).
	Query string
	// MaxResults is the maximum number of results to return (default: 5, max: 20).
	MaxResults int
	// TimeRange filters results by recency. Values: "day", "week", "month", "year". Empty means no filter.
	// Google provider only; ignored when After/Before are set (exa provider used instead).
	TimeRange string
	// IncludeDomains limits search to these domains. e.g. ["github.com", "stackoverflow.com"]
	IncludeDomains []string
	// ExcludeDomains excludes these domains from search results.
	ExcludeDomains []string
	// CrawlResults controls how many results get full webpage content crawling.
	// Default (nil/unset): crawl all results (= MaxResults). Set to ptr(0) to skip crawling.
	// Note: crawling incurs additional cost.
	CrawlResults *int
	// After filters results published after this date (YYYY-MM-DD). Routes to exa provider.
	After string
	// Before filters results published before this date (YYYY-MM-DD). Routes to exa provider.
	Before string
}

// SearchResult represents a single search result entry.
type SearchResult struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Content     string `json:"content,omitempty"`
	PublishedAt string `json:"published_at,omitempty"`
}

// SearchResponse is the response from the Search method.
type SearchResponse struct {
	Results []SearchResult `json:"results"`
}

// Search performs a web search using 302 AI Unified Search API.
// When After or Before date params are set, it routes to the exa provider for
// precise date filtering. Otherwise it uses Google (search1) as the default.
func (c *Client) Search(ctx context.Context, params SearchParams) (*SearchResponse, error) {
	if params.Query == "" {
		return nil, fmt.Errorf("api302: search query must not be empty")
	}
	if params.MaxResults < 1 {
		params.MaxResults = 5
	}
	if params.MaxResults > 20 {
		params.MaxResults = 20
	}

	// Resolve crawl_results: default = max_results (crawl all).
	crawlResults := params.MaxResults
	if params.CrawlResults != nil {
		crawlResults = *params.CrawlResults
		if crawlResults < 0 {
			crawlResults = 0
		}
	}

	// Route to exa provider when precise date filtering is requested.
	useExa := params.After != "" || params.Before != ""

	provider := defaultSearchProvider
	category := defaultSearchCategory
	if useExa {
		provider = exaSearchProvider
		category = "" // exa has no category
	}

	// Build request payload.
	payload := unifiedSearchRequest{
		Query:        params.Query,
		Provider:     provider,
		Category:     category,
		MaxResults:   params.MaxResults,
		CrawlResults: crawlResults,
	}

	if useExa {
		// Exa uses ISO 8601 date-time for precise date filtering.
		if params.After != "" {
			payload.StartPublishedDate = params.After + "T00:00:00.000Z"
		}
		if params.Before != "" {
			payload.EndPublishedDate = params.Before + "T00:00:00.000Z"
		}
	} else if params.TimeRange != "" {
		payload.TimeRange = params.TimeRange
	}

	if len(params.IncludeDomains) > 0 {
		payload.IncludeDomains = params.IncludeDomains
	}
	if len(params.ExcludeDomains) > 0 {
		payload.ExcludeDomains = params.ExcludeDomains
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("api302: marshal search request: %w", err)
	}

	reqURL := c.baseURL + searchPath
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL, bytes.NewReader(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("api302: build search request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("api302: search request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("api302: read search response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api302: search returned HTTP %d: %s", resp.StatusCode, truncateBody(body, 500))
	}

	// Parse the unified search response.
	var raw unifiedSearchResponse
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("api302: decode search response: %w", err)
	}

	if len(raw.SearchResults) == 0 {
		return &SearchResponse{Results: nil}, nil
	}

	// Normalize to SearchResult.
	results := make([]SearchResult, 0, len(raw.SearchResults))
	for _, r := range raw.SearchResults {
		results = append(results, SearchResult{
			Title:       r.Title,
			URL:         r.URL,
			Description: r.Description,
			Content:     r.Content,
			PublishedAt: r.PublishedAt,
		})
	}

	return &SearchResponse{Results: results}, nil
}

// unifiedSearchRequest is the 302 AI Unified Search API request body.
type unifiedSearchRequest struct {
	Query              string   `json:"query"`
	Provider           string   `json:"provider"`
	Category           string   `json:"category,omitempty"`
	MaxResults         int      `json:"max_results"`
	CrawlResults       int      `json:"crawl_results"`
	TimeRange          string   `json:"time_range,omitempty"`
	IncludeDomains     []string `json:"include_domains,omitempty"`
	ExcludeDomains     []string `json:"exclude_domains,omitempty"`
	StartPublishedDate string   `json:"startPublishedDate,omitempty"` // exa provider: ISO 8601
	EndPublishedDate   string   `json:"endPublishedDate,omitempty"`   // exa provider: ISO 8601
}

// unifiedSearchResponse is the 302 AI Unified Search API response.
type unifiedSearchResponse struct {
	SearchResults []unifiedSearchResultItem `json:"search_results"`
}

type unifiedSearchResultItem struct {
	URL         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
	PublishedAt string `json:"published_at"`
	Summary     string `json:"summary"`
}

// ---- Scrape API ----

// ScrapeResponse is the response from the Scrape method.
type ScrapeResponse struct {
	// Title is the page title extracted from metadata.
	Title string `json:"title"`
	// Markdown is the scraped page content in Markdown format.
	Markdown string `json:"markdown"`
}

// Scrape converts a web page to Markdown using 302 AI Firecrawl.
func (c *Client) Scrape(ctx context.Context, targetURL string) (*ScrapeResponse, error) {
	if targetURL == "" {
		return nil, fmt.Errorf("api302: scrape URL must not be empty")
	}

	payload := firecrawlScrapeRequest{
		URL:             targetURL,
		Formats:         []string{"markdown"},
		OnlyMainContent: true,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("api302: marshal scrape request: %w", err)
	}

	reqURL := c.baseURL + scrapePath
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL, bytes.NewReader(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("api302: build scrape request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("api302: scrape request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("api302: read scrape response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api302: scrape returned HTTP %d: %s", resp.StatusCode, truncateBody(body, 500))
	}

	// Firecrawl v1 response: {"success": true, "data": {"markdown": "..."}}
	var raw firecrawlScrapeResponse
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("api302: decode scrape response: %w", err)
	}

	if !raw.Success {
		return nil, fmt.Errorf("api302: scrape was not successful (success=false)")
	}

	if raw.Data.Markdown == "" {
		return nil, fmt.Errorf("api302: scrape returned empty markdown")
	}

	return &ScrapeResponse{
		Title:    raw.Data.Metadata.Title,
		Markdown: raw.Data.Markdown,
	}, nil
}

// firecrawlScrapeRequest is the Firecrawl v1 scrape request body.
type firecrawlScrapeRequest struct {
	URL             string   `json:"url"`
	Formats         []string `json:"formats"`
	OnlyMainContent bool     `json:"onlyMainContent"`
}

// firecrawlScrapeResponse is the Firecrawl v1 scrape response.
type firecrawlScrapeResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Markdown string `json:"markdown"`
		Metadata struct {
			Title string `json:"title"`
		} `json:"metadata"`
	} `json:"data"`
}

// truncateBody truncates a response body for error messages.
func truncateBody(body []byte, maxLen int) string {
	if len(body) <= maxLen {
		return string(body)
	}
	return string(body[:maxLen]) + "..."
}

// ---- WebCrawler port adapter ----

// Crawl implements port.WebCrawler by delegating to Scrape.
func (c *Client) Crawl(ctx context.Context, url string) (port.CrawlOutput, error) {
	resp, err := c.Scrape(ctx, url)
	if err != nil {
		return port.CrawlOutput{}, err
	}
	return port.CrawlOutput{
		Title:    resp.Title,
		Markdown: resp.Markdown,
	}, nil
}

// ---- WebGeneralSearchProvider port adapter ----

// SearchGeneral implements port.WebGeneralSearchProvider by delegating to Search.
func (c *Client) SearchGeneral(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGeneralResult, error) {
	params := SearchParams{
		Query:          req.Query,
		MaxResults:     req.MaxResults,
		TimeRange:      req.TimeRange,
		IncludeDomains: req.IncludeDomains,
		ExcludeDomains: req.ExcludeDomains,
		CrawlResults:   req.CrawlResults,
		After:          req.After,
		Before:         req.Before,
	}

	resp, err := c.Search(ctx, params)
	if err != nil {
		return model.WebSearchGeneralResult{}, err
	}

	results := make([]model.WebSearchResult, 0, len(resp.Results))
	for _, r := range resp.Results {
		results = append(results, model.WebSearchResult{
			Title:       r.Title,
			URL:         r.URL,
			Description: r.Description,
			Content:     r.Content,
			PublishedAt: r.PublishedAt,
		})
	}

	return model.WebSearchGeneralResult{
		Mode:    "general",
		Results: results,
	}, nil
}
