package model

import "errors"

var (
	ErrWebCrawlerNotConfigured               = errors.New("web crawl provider is not configured")
	ErrWebSearchProviderNotConfigured        = errors.New("web search grounding provider is not configured")
	ErrWebGeneralSearchProviderNotConfigured = errors.New("web general search provider is not configured")
	ErrCrawlURLRequired                      = errors.New("url is required")
	ErrSearchQueryRequired                   = errors.New("query is required")
	ErrSearchModeInvalid                     = errors.New("mode must be 'general' or 'grounding'")
)

// WebCrawlRequest is the request to crawl a web page.
type WebCrawlRequest struct {
	URL string `json:"url"`
}

func (r WebCrawlRequest) Validate() error {
	if r.URL == "" {
		return ErrCrawlURLRequired
	}
	return nil
}

// WebCrawlResult is the response from crawling a web page.
type WebCrawlResult struct {
	URL        string `json:"url"`
	Title      string `json:"title"`
	Markdown   string `json:"markdown"`
	CreditCost int64  `json:"credit_cost"`
}

// WebSearchRequest is the request to search the web.
type WebSearchRequest struct {
	Query          string   `json:"query"`
	Mode           string   `json:"mode"`                      // "general" or "grounding"
	MaxResults     int      `json:"max_results,omitempty"`     // general mode (1-20, default 5)
	CrawlResults   *int     `json:"crawl_results,omitempty"`   // general mode (nil = max_results, 0 = skip)
	TimeRange      string   `json:"time_range,omitempty"`      // general mode: "day", "week", "month", "year"
	IncludeDomains []string `json:"include_domains,omitempty"` // general mode
	ExcludeDomains []string `json:"exclude_domains,omitempty"` // general mode
	After          string   `json:"after,omitempty"`           // general mode: precise date filter (YYYY-MM-DD), routes to exa
	Before         string   `json:"before,omitempty"`          // general mode: precise date filter (YYYY-MM-DD), routes to exa
	Instruction    string   `json:"instruction,omitempty"`     // grounding mode
	Model          string   `json:"model,omitempty"`           // grounding mode
}

func (r WebSearchRequest) Validate() error {
	if r.Query == "" {
		return ErrSearchQueryRequired
	}
	m := r.ResolvedMode()
	if m != "general" && m != "grounding" {
		return ErrSearchModeInvalid
	}
	return nil
}

// ResolvedMode returns the search mode, defaulting to "general".
func (r WebSearchRequest) ResolvedMode() string {
	if r.Mode == "" {
		return "general"
	}
	return r.Mode
}

// WebSearchGroundingResult is the response from LLM grounding search.
type WebSearchGroundingResult struct {
	Mode           string          `json:"mode"`
	Query          string          `json:"query"`
	Content        string          `json:"content"`
	SearchMetadata *SearchMetadata `json:"search_metadata,omitempty"`
	Model          string          `json:"model"`
	Usage          Usage           `json:"usage"`
	DurationMs     int64           `json:"duration_ms"`
	CreditCost     int64           `json:"credit_cost"`
}

// WebSearchGeneralResult is the response from general web search.
type WebSearchGeneralResult struct {
	Mode       string            `json:"mode"`
	Query      string            `json:"query"`
	Results    []WebSearchResult `json:"results"`
	CreditCost int64             `json:"credit_cost"`
}

// WebSearchResult is a single search result entry.
type WebSearchResult struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Content     string `json:"content,omitempty"`
	PublishedAt string `json:"published_at,omitempty"`
}

// SearchMetadata contains structured grounding data from the search.
type SearchMetadata struct {
	Queries   []string         `json:"queries"`
	Sources   []SearchSource   `json:"sources"`
	Citations []SearchCitation `json:"citations"`
}

// SearchSource is a web source used for grounding.
type SearchSource struct {
	Index int    `json:"index"`
	Title string `json:"title"`
	URI   string `json:"uri"`
}

// SearchCitation maps a text range in the content to source indices.
type SearchCitation struct {
	StartIndex    int    `json:"start_index"`
	EndIndex      int    `json:"end_index"`
	Text          string `json:"text"`
	SourceIndices []int  `json:"source_indices"`
}
