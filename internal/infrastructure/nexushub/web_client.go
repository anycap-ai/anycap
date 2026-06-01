package nexushub

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/open/common-go/logging"
)

const (
	defaultWebRequestTimeout = 60 * time.Second

	// Default ability keys for the 302 AI web capabilities exposed by NexusHub.
	DefaultSearchAbilityKey = "302ai-general-search"
	DefaultScrapeAbilityKey = "302ai-firecrawl-scrape"

	// gen_type for both search and scrape atomic processes.
	webGenType = "search"

	// search_option.type values.
	searchOptionTypeWebSearch = "web_search"
	searchOptionTypeWebScrape = "web_scrape"

	// Default search provider and category (Google via search1).
	defaultWebSearchProvider = "search1_search"
	defaultWebSearchCategory = "google"

	// Exa provider for precise date-range searches.
	exaWebSearchProvider = "exa"

	// defaultWebUID is used when no authenticated user id is present in the
	// context (e.g. local bypass mode). NexusHub requires a numeric uid.
	defaultWebUID int64 = 0
)

// WebClientConfig configures the NexusHub web client.
type WebClientConfig struct {
	BaseURL          string
	Token            string
	SearchAbilityKey string
	ScrapeAbilityKey string
	RequestTimeout   time.Duration
}

// WebClient calls NexusHub Core submit_atomic_process for the 302 AI
// general-search and firecrawl-scrape abilities. It implements both
// port.WebGeneralSearchProvider and port.WebCrawler.
type WebClient struct {
	baseURL          string
	token            string
	searchAbilityKey string
	scrapeAbilityKey string
	httpClient       *http.Client
	// pollInterval is the delay between get_submit_result polls. Defaults to
	// 2s; overridable in tests.
	pollInterval time.Duration
}

// NewWebClient constructs a NexusHub web client.
func NewWebClient(cfg WebClientConfig) *WebClient {
	timeout := cfg.RequestTimeout
	if timeout == 0 {
		timeout = defaultWebRequestTimeout
	}
	searchKey := cfg.SearchAbilityKey
	if searchKey == "" {
		searchKey = DefaultSearchAbilityKey
	}
	scrapeKey := cfg.ScrapeAbilityKey
	if scrapeKey == "" {
		scrapeKey = DefaultScrapeAbilityKey
	}
	return &WebClient{
		baseURL:          strings.TrimRight(cfg.BaseURL, "/"),
		token:            cfg.Token,
		searchAbilityKey: searchKey,
		scrapeAbilityKey: scrapeKey,
		httpClient:       &http.Client{Timeout: timeout},
		pollInterval:     2 * time.Second,
	}
}

// ---- WebGeneralSearchProvider ----

// SearchGeneral performs a general web search via NexusHub (302 AI general-search).
// When After or Before is set, it routes to the exa provider for precise date
// filtering; otherwise it uses Google (search1) as the default.
func (c *WebClient) SearchGeneral(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGeneralResult, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		return model.WebSearchGeneralResult{}, model.ErrWebGeneralSearchProviderNotConfigured
	}
	if strings.TrimSpace(req.Query) == "" {
		return model.WebSearchGeneralResult{}, model.ErrSearchQueryRequired
	}

	maxResults := req.MaxResults
	if maxResults < 1 {
		maxResults = 5
	}
	if maxResults > 20 {
		maxResults = 20
	}

	// Resolve crawl_results: default = max_results (crawl all).
	crawlResults := maxResults
	if req.CrawlResults != nil {
		crawlResults = *req.CrawlResults
		if crawlResults < 0 {
			crawlResults = 0
		}
	}

	useExa := req.After != "" || req.Before != ""

	provider := defaultWebSearchProvider
	category := defaultWebSearchCategory
	if useExa {
		provider = exaWebSearchProvider
		category = ""
	}

	opt := &atomicSearchOption{
		Type:         searchOptionTypeWebSearch,
		Provider:     provider,
		Category:     category,
		Query:        req.Query,
		MaxResults:   maxResults,
		CrawlResults: &crawlResults,
	}
	if useExa {
		if req.After != "" {
			opt.StartPublishedDate = req.After + "T00:00:00.000Z"
		}
		if req.Before != "" {
			opt.EndPublishedDate = req.Before + "T00:00:00.000Z"
		}
	} else if req.TimeRange != "" {
		opt.TimeRange = req.TimeRange
	}
	if len(req.IncludeDomains) > 0 {
		opt.IncludeDomains = req.IncludeDomains
	}
	if len(req.ExcludeDomains) > 0 {
		opt.ExcludeDomains = req.ExcludeDomains
	}

	payload := atomicProcessPayload{
		GenType:      webGenType,
		SearchOption: opt,
	}

	parsed, err := c.submit(ctx, "web.search", c.searchAbilityKey, payload)
	if err != nil {
		return model.WebSearchGeneralResult{}, err
	}

	results, err := decodeSearchResults(parsed.RespPayload)
	if err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider":    "nexushub",
			"capability":  "web.search",
			"ability_key": c.searchAbilityKey,
			"stage":       "decode_resp_payload",
		}).WithError(err).Error("decode nexushub search response payload failed")
		return model.WebSearchGeneralResult{}, err
	}

	return model.WebSearchGeneralResult{
		Mode:    "general",
		Results: results,
	}, nil
}

// ---- WebCrawler ----

// Crawl converts a URL to Markdown via NexusHub (302 AI firecrawl-scrape).
func (c *WebClient) Crawl(ctx context.Context, url string) (port.CrawlOutput, error) {
	if c == nil || c.baseURL == "" || c.token == "" {
		return port.CrawlOutput{}, model.ErrWebCrawlerNotConfigured
	}
	if strings.TrimSpace(url) == "" {
		return port.CrawlOutput{}, model.ErrCrawlURLRequired
	}

	payload := atomicProcessPayload{
		GenType: webGenType,
		SearchOption: &atomicSearchOption{
			Type:            searchOptionTypeWebScrape,
			URL:             url,
			Formats:         []string{"markdown"},
			OnlyMainContent: true,
			Timeout:         30000,
		},
	}

	parsed, err := c.submit(ctx, "web.crawl", c.scrapeAbilityKey, payload)
	if err != nil {
		return port.CrawlOutput{}, err
	}

	out, err := decodeScrapeResult(parsed.RespPayload)
	if err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"provider":    "nexushub",
			"capability":  "web.crawl",
			"ability_key": c.scrapeAbilityKey,
			"stage":       "decode_resp_payload",
		}).WithError(err).Error("decode nexushub scrape response payload failed")
		return port.CrawlOutput{}, err
	}
	return out, nil
}

// submit posts an atomic process request and returns the parsed envelope.
func (c *WebClient) submit(ctx context.Context, capability, abilityKey string, payload atomicProcessPayload) (submitAtomicProcessResponse, error) {
	uid := webUIDFromContext(ctx)

	reqPayload, err := json.Marshal(payload)
	if err != nil {
		logNexusHubCapabilityError(ctx, capability, "", abilityKey, "marshal_req_payload", err, "marshal nexushub web req_payload failed")
		return submitAtomicProcessResponse{}, fmt.Errorf("marshal req_payload: %w", err)
	}

	body := submitAtomicProcessRequest{
		AbilityKey: abilityKey,
		ReqPayload: string(reqPayload),
		Token:      c.token,
		BizInfo: submitBizInfo{
			BizID:     defaultNexusHubBizID,
			EnterFrom: defaultNexusHubEnterFrom,
		},
		UserInfo: submitUserInfo{UID: uid},
		Extra: map[string]any{
			"capability": capability,
		},
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		logNexusHubCapabilityError(ctx, capability, "", abilityKey, "marshal_submit_request", err, "marshal nexushub web submit request failed")
		return submitAtomicProcessResponse{}, fmt.Errorf("marshal submit request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+submitAtomicProcessPath, bytes.NewReader(bodyBytes))
	if err != nil {
		logNexusHubCapabilityError(ctx, capability, "", abilityKey, "build_request", err, "build nexushub web request failed")
		return submitAtomicProcessResponse{}, fmt.Errorf("build request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	setNexusExtraHeader(ctx, httpReq)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logNexusHubCapabilityError(ctx, capability, "", abilityKey, "http_request", err, "submit nexushub web request failed")
		return submitAtomicProcessResponse{}, fmt.Errorf("submit atomic process: %w", err)
	}
	defer resp.Body.Close()

	var parsed submitAtomicProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		logNexusHubCapabilityError(ctx, capability, "", abilityKey, "decode_submit_response", err, "decode nexushub web submit response failed")
		return submitAtomicProcessResponse{}, fmt.Errorf("decode submit response: %w", err)
	}

	if resp.StatusCode != http.StatusOK || parsed.Base.Code != 0 {
		mapped := mapSubmitError(resp.StatusCode, parsed.Base.Code, parsed.Base.Message)
		logNexusHubCapabilityError(ctx, capability, "", abilityKey, "submit_status", mapped, "nexushub web submit returned error", logging.Fields{
			"status_code": resp.StatusCode,
			"base_code":   parsed.Base.Code,
		})
		return submitAtomicProcessResponse{}, mapped
	}

	// Some abilities (e.g. general-search with crawl_results >= 2) complete the
	// task but return the payload out-of-band: the submit response carries an
	// empty resp_payload and the result must be fetched via get_submit_result.
	// The shared resultPoller handles both the inline and out-of-band cases.
	poller := newResultPoller(c.httpClient, c.baseURL, c.token, c.pollInterval, 0)
	return poller.resolve(ctx, capability, abilityKey, parsed)
}

// webUIDFromContext extracts a numeric NexusHub uid from the request context,
// falling back to defaultWebUID when no usable user id is present.
func webUIDFromContext(ctx context.Context) int64 {
	userID := middleware.UserIDFromContext(ctx)
	if userID == "" {
		return defaultWebUID
	}
	uid, err := parseNexusHubUID(userID)
	if err != nil {
		return defaultWebUID
	}
	return uid
}

// ---- request payload ----

// atomicSearchOption is the search_option block for the search/scrape abilities.
type atomicSearchOption struct {
	Type     string `json:"type"`
	Provider string `json:"provider,omitempty"`
	Category string `json:"category,omitempty"`
	Query    string `json:"query,omitempty"`
	// MaxResults and CrawlResults apply to web_search. CrawlResults is a
	// pointer so that an explicit 0 (skip crawling) is preserved.
	MaxResults         int      `json:"max_results,omitempty"`
	CrawlResults       *int     `json:"crawl_results,omitempty"`
	TimeRange          string   `json:"time_range,omitempty"`
	IncludeDomains     []string `json:"include_domains,omitempty"`
	ExcludeDomains     []string `json:"exclude_domains,omitempty"`
	StartPublishedDate string   `json:"startPublishedDate,omitempty"` // exa provider: ISO 8601
	EndPublishedDate   string   `json:"endPublishedDate,omitempty"`   // exa provider: ISO 8601

	// web_scrape fields.
	URL             string   `json:"url,omitempty"`
	Formats         []string `json:"formats,omitempty"`
	OnlyMainContent bool     `json:"onlyMainContent,omitempty"`
	Timeout         int      `json:"timeout,omitempty"`
}

// ---- response parsing ----

// webRespPayload mirrors the atomic resp_payload for web abilities. The actual
// search/scrape data is nested under resources[0].meta_data.data.
type webRespPayload struct {
	Resources []webResource `json:"resources"`
}

type webResource struct {
	MetaData webMetaData `json:"meta_data"`
}

type webMetaData struct {
	Data json.RawMessage `json:"data"`
}

// nexusSearchData is the web_search data block. Result field names vary by
// upstream provider (search1 vs exa), so all known aliases are captured.
type nexusSearchData struct {
	Results []nexusSearchResultItem `json:"results"`
}

type nexusSearchResultItem struct {
	Title string `json:"title"`

	URL  string `json:"url"`
	Link string `json:"link"`

	Description string `json:"description"`
	Snippet     string `json:"snippet"`
	Summary     string `json:"summary"`

	Content string `json:"content"`
	Text    string `json:"text"`

	PublishedAt   string `json:"published_at"`
	PublishedDate string `json:"publishedDate"`
}

func (r nexusSearchResultItem) normalize() model.WebSearchResult {
	url := firstNonEmpty(r.URL, r.Link)
	desc := firstNonEmpty(r.Description, r.Snippet, r.Summary)
	content := firstNonEmpty(r.Content, r.Text)
	publishedAt := firstNonEmpty(r.PublishedAt, r.PublishedDate)
	return model.WebSearchResult{
		Title:       r.Title,
		URL:         url,
		Description: desc,
		Content:     content,
		PublishedAt: publishedAt,
	}
}

func decodeSearchResults(respPayload string) ([]model.WebSearchResult, error) {
	data, err := firstResourceData(respPayload)
	if err != nil {
		return nil, err
	}
	if len(data) == 0 {
		return nil, nil
	}
	var sd nexusSearchData
	if err := json.Unmarshal(data, &sd); err != nil {
		return nil, fmt.Errorf("decode search data: %w", err)
	}
	results := make([]model.WebSearchResult, 0, len(sd.Results))
	for _, item := range sd.Results {
		results = append(results, item.normalize())
	}
	return results, nil
}

// nexusScrapeData is the web_scrape data block.
type nexusScrapeData struct {
	Markdown string `json:"markdown"`
	Metadata struct {
		Title string `json:"title"`
	} `json:"metadata"`
}

func decodeScrapeResult(respPayload string) (port.CrawlOutput, error) {
	data, err := firstResourceData(respPayload)
	if err != nil {
		return port.CrawlOutput{}, err
	}
	if len(data) == 0 {
		return port.CrawlOutput{}, fmt.Errorf("nexushub scrape returned empty data")
	}
	var sd nexusScrapeData
	if err := json.Unmarshal(data, &sd); err != nil {
		return port.CrawlOutput{}, fmt.Errorf("decode scrape data: %w", err)
	}
	if sd.Markdown == "" {
		return port.CrawlOutput{}, fmt.Errorf("nexushub scrape returned empty markdown")
	}
	return port.CrawlOutput{
		Title:    sd.Metadata.Title,
		Markdown: sd.Markdown,
	}, nil
}

// firstResourceData extracts resources[0].meta_data.data from a resp_payload.
func firstResourceData(respPayload string) (json.RawMessage, error) {
	if strings.TrimSpace(respPayload) == "" {
		return nil, nil
	}
	var rp webRespPayload
	if err := json.Unmarshal([]byte(respPayload), &rp); err != nil {
		return nil, fmt.Errorf("decode resp_payload: %w", err)
	}
	if len(rp.Resources) == 0 {
		return nil, nil
	}
	return rp.Resources[0].MetaData.Data, nil
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
