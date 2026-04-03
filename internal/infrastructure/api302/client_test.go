package api302

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

// ---- Unit tests with mock server ----

func TestSearch_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != searchPath {
			t.Errorf("expected path %s, got %s", searchPath, r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("expected Bearer test-key, got %s", r.Header.Get("Authorization"))
		}
		if r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("expected Content-Type application/json, got %s", r.Header.Get("Content-Type"))
		}

		var body unifiedSearchRequest
		json.NewDecoder(r.Body).Decode(&body)
		if body.Query != "hello world" {
			t.Errorf("expected query 'hello world', got %q", body.Query)
		}
		if body.Provider != defaultSearchProvider {
			t.Errorf("expected provider %q, got %q", defaultSearchProvider, body.Provider)
		}
		if body.Category != defaultSearchCategory {
			t.Errorf("expected category %q, got %q", defaultSearchCategory, body.Category)
		}
		if body.MaxResults != 2 {
			t.Errorf("expected max_results 2, got %d", body.MaxResults)
		}

		resp := unifiedSearchResponse{
			SearchResults: []unifiedSearchResultItem{
				{Title: "Result 1", URL: "https://example.com/1", Description: "Desc 1", Content: "Full content 1"},
				{Title: "Result 2", URL: "https://example.com/2", Description: "Desc 2", Content: "Full content 2"},
				{Title: "Result 3", URL: "https://example.com/3", Description: "Desc 3", Content: "Full content 3"},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	res, err := c.Search(context.Background(), SearchParams{Query: "hello world", MaxResults: 2})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// API returns 3 results (server-side), client returns all of them
	if len(res.Results) != 3 {
		t.Fatalf("expected 3 results, got %d", len(res.Results))
	}
	if res.Results[0].Title != "Result 1" {
		t.Errorf("expected title 'Result 1', got %q", res.Results[0].Title)
	}
	if res.Results[0].Content != "Full content 1" {
		t.Errorf("expected content 'Full content 1', got %q", res.Results[0].Content)
	}
}

func TestSearch_WithFilters(t *testing.T) {
	var captured unifiedSearchRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&captured)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(unifiedSearchResponse{})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	c.Search(context.Background(), SearchParams{
		Query:          "test",
		MaxResults:     3,
		TimeRange:      "week",
		IncludeDomains: []string{"github.com", "stackoverflow.com"},
		ExcludeDomains: []string{"pinterest.com"},
	})

	if captured.TimeRange != "week" {
		t.Errorf("expected time_range 'week', got %q", captured.TimeRange)
	}
	if len(captured.IncludeDomains) != 2 || captured.IncludeDomains[0] != "github.com" {
		t.Errorf("expected include_domains [github.com, stackoverflow.com], got %v", captured.IncludeDomains)
	}
	if len(captured.ExcludeDomains) != 1 || captured.ExcludeDomains[0] != "pinterest.com" {
		t.Errorf("expected exclude_domains [pinterest.com], got %v", captured.ExcludeDomains)
	}
}

func TestSearch_ExaProviderRouting(t *testing.T) {
	var captured unifiedSearchRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&captured)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(unifiedSearchResponse{
			SearchResults: []unifiedSearchResultItem{
				{Title: "Exa Result", URL: "https://example.com/exa", Description: "From exa"},
			},
		})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})

	// With After set, should route to exa provider.
	res, err := c.Search(context.Background(), SearchParams{
		Query:      "AI agent news",
		MaxResults: 5,
		After:      "2025-06-01",
		TimeRange:  "week", // should be ignored when exa is used
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if captured.Provider != exaSearchProvider {
		t.Errorf("expected provider %q, got %q", exaSearchProvider, captured.Provider)
	}
	if captured.Category != "" {
		t.Errorf("expected empty category for exa, got %q", captured.Category)
	}
	if captured.StartPublishedDate != "2025-06-01T00:00:00.000Z" {
		t.Errorf("expected startPublishedDate '2025-06-01T00:00:00.000Z', got %q", captured.StartPublishedDate)
	}
	if captured.EndPublishedDate != "" {
		t.Errorf("expected empty endPublishedDate, got %q", captured.EndPublishedDate)
	}
	if captured.TimeRange != "" {
		t.Errorf("expected empty time_range for exa, got %q", captured.TimeRange)
	}
	if len(res.Results) != 1 || res.Results[0].Title != "Exa Result" {
		t.Errorf("unexpected results: %+v", res.Results)
	}

	// With both After and Before set.
	c.Search(context.Background(), SearchParams{
		Query:  "AI papers",
		After:  "2025-01-01",
		Before: "2025-06-30",
	})
	if captured.Provider != exaSearchProvider {
		t.Errorf("expected exa provider, got %q", captured.Provider)
	}
	if captured.StartPublishedDate != "2025-01-01T00:00:00.000Z" {
		t.Errorf("expected startPublishedDate '2025-01-01T00:00:00.000Z', got %q", captured.StartPublishedDate)
	}
	if captured.EndPublishedDate != "2025-06-30T00:00:00.000Z" {
		t.Errorf("expected endPublishedDate '2025-06-30T00:00:00.000Z', got %q", captured.EndPublishedDate)
	}
}

func TestSearch_DefaultGoogleWithoutDates(t *testing.T) {
	var captured unifiedSearchRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&captured)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(unifiedSearchResponse{})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})

	// Without date params, should use Google.
	c.Search(context.Background(), SearchParams{
		Query:     "test query",
		TimeRange: "month",
	})
	if captured.Provider != defaultSearchProvider {
		t.Errorf("expected provider %q, got %q", defaultSearchProvider, captured.Provider)
	}
	if captured.Category != defaultSearchCategory {
		t.Errorf("expected category %q, got %q", defaultSearchCategory, captured.Category)
	}
	if captured.TimeRange != "month" {
		t.Errorf("expected time_range 'month', got %q", captured.TimeRange)
	}
	if captured.StartPublishedDate != "" {
		t.Errorf("expected empty startPublishedDate, got %q", captured.StartPublishedDate)
	}
}

func TestSearch_EmptyResults(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(unifiedSearchResponse{})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	res, err := c.Search(context.Background(), SearchParams{Query: "no results query"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(res.Results) != 0 {
		t.Fatalf("expected 0 results, got %d", len(res.Results))
	}
}

func TestSearch_HTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"error": "rate limited"}`))
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	_, err := c.Search(context.Background(), SearchParams{Query: "test"})
	if err == nil {
		t.Fatal("expected error for HTTP 429")
	}
}

func TestSearch_EmptyQuery(t *testing.T) {
	c := NewClient(ClientConfig{BaseURL: "http://localhost", APIKey: "test-key"})
	_, err := c.Search(context.Background(), SearchParams{Query: ""})
	if err == nil {
		t.Fatal("expected error for empty query")
	}
}

func TestSearch_MaxResultsClamping(t *testing.T) {
	var captured unifiedSearchRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&captured)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(unifiedSearchResponse{})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})

	// MaxResults < 1 should clamp to 5 (default)
	c.Search(context.Background(), SearchParams{Query: "test", MaxResults: -5})
	if captured.MaxResults != 5 {
		t.Errorf("expected max_results=5 for negative input, got %d", captured.MaxResults)
	}

	// MaxResults > 20 should clamp to 20
	c.Search(context.Background(), SearchParams{Query: "test", MaxResults: 50})
	if captured.MaxResults != 20 {
		t.Errorf("expected max_results=20 for 50 input, got %d", captured.MaxResults)
	}
}

func TestScrape_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != scrapePath {
			t.Errorf("expected path %s, got %s", scrapePath, r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("expected Bearer test-key, got %s", r.Header.Get("Authorization"))
		}

		var body firecrawlScrapeRequest
		json.NewDecoder(r.Body).Decode(&body)
		if body.URL != "https://example.com" {
			t.Errorf("expected url https://example.com, got %s", body.URL)
		}
		if !body.OnlyMainContent {
			t.Error("expected onlyMainContent=true")
		}

		resp := firecrawlScrapeResponse{Success: true}
		resp.Data.Markdown = "# Hello World\n\nSome content."
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	res, err := c.Scrape(context.Background(), "https://example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.Markdown != "# Hello World\n\nSome content." {
		t.Errorf("unexpected markdown: %q", res.Markdown)
	}
}

func TestScrape_SuccessFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(firecrawlScrapeResponse{Success: false})
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	_, err := c.Scrape(context.Background(), "https://example.com")
	if err == nil {
		t.Fatal("expected error for success=false")
	}
}

func TestScrape_EmptyMarkdown(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := firecrawlScrapeResponse{Success: true}
		resp.Data.Markdown = ""
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	_, err := c.Scrape(context.Background(), "https://example.com")
	if err == nil {
		t.Fatal("expected error for empty markdown")
	}
}

func TestScrape_HTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`internal server error`))
	}))
	defer srv.Close()

	c := NewClient(ClientConfig{BaseURL: srv.URL, APIKey: "test-key"})
	_, err := c.Scrape(context.Background(), "https://example.com")
	if err == nil {
		t.Fatal("expected error for HTTP 500")
	}
}

func TestScrape_EmptyURL(t *testing.T) {
	c := NewClient(ClientConfig{BaseURL: "http://localhost", APIKey: "test-key"})
	_, err := c.Scrape(context.Background(), "")
	if err == nil {
		t.Fatal("expected error for empty URL")
	}
}

// ---- Integration tests (require API_302_API_KEY env var) ----

func TestIntegration_Search(t *testing.T) {
	apiKey := os.Getenv("API_302_API_KEY")
	if apiKey == "" {
		t.Skip("API_302_API_KEY not set, skipping integration test")
	}

	c := NewClient(ClientConfig{APIKey: apiKey})
	res, err := c.Search(context.Background(), SearchParams{
		Query:      "Go programming language",
		MaxResults: 3,
	})
	if err != nil {
		t.Fatalf("search failed: %v", err)
	}
	if len(res.Results) == 0 {
		t.Fatal("expected at least one result")
	}
	for i, r := range res.Results {
		t.Logf("Result %d: title=%q url=%q desc=%q content_len=%d",
			i+1, r.Title, r.URL, r.Description, len(r.Content))
	}
}

func TestIntegration_SearchWithTimeRange(t *testing.T) {
	apiKey := os.Getenv("API_302_API_KEY")
	if apiKey == "" {
		t.Skip("API_302_API_KEY not set, skipping integration test")
	}

	c := NewClient(ClientConfig{APIKey: apiKey})
	res, err := c.Search(context.Background(), SearchParams{
		Query:      "AI agent framework",
		MaxResults: 3,
		TimeRange:  "month",
	})
	if err != nil {
		t.Fatalf("search with time_range failed: %v", err)
	}
	t.Logf("Got %d results with time_range=month", len(res.Results))
	for i, r := range res.Results {
		t.Logf("Result %d: title=%q url=%q", i+1, r.Title, r.URL)
	}
}

func TestIntegration_SearchWithDomainFilter(t *testing.T) {
	apiKey := os.Getenv("API_302_API_KEY")
	if apiKey == "" {
		t.Skip("API_302_API_KEY not set, skipping integration test")
	}

	c := NewClient(ClientConfig{APIKey: apiKey})
	res, err := c.Search(context.Background(), SearchParams{
		Query:          "Go context package",
		MaxResults:     3,
		IncludeDomains: []string{"github.com"},
	})
	if err != nil {
		t.Fatalf("search with include_domains failed: %v", err)
	}
	t.Logf("Got %d results from github.com only", len(res.Results))
	for i, r := range res.Results {
		t.Logf("Result %d: title=%q url=%q", i+1, r.Title, r.URL)
	}
}

func TestIntegration_Scrape(t *testing.T) {
	apiKey := os.Getenv("API_302_API_KEY")
	if apiKey == "" {
		t.Skip("API_302_API_KEY not set, skipping integration test")
	}

	c := NewClient(ClientConfig{APIKey: apiKey})
	res, err := c.Scrape(context.Background(), "https://example.com")
	if err != nil {
		t.Fatalf("scrape failed: %v", err)
	}
	if res.Markdown == "" {
		t.Fatal("expected non-empty markdown")
	}
	preview := res.Markdown
	if len(preview) > 500 {
		preview = preview[:500] + "..."
	}
	t.Logf("Scraped markdown (%d chars):\n%s", len(res.Markdown), preview)
}
