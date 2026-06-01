package nexushub

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

func ptr(i int) *int { return &i }

// readSubmitRequest decodes the submit body and the nested req_payload.
func readSubmitRequest(t *testing.T, r *http.Request) (submitAtomicProcessRequest, atomicProcessPayload) {
	t.Helper()
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	var req submitAtomicProcessRequest
	if err := json.Unmarshal(raw, &req); err != nil {
		t.Fatalf("decode submit request: %v", err)
	}
	var payload atomicProcessPayload
	if err := json.Unmarshal([]byte(req.ReqPayload), &payload); err != nil {
		t.Fatalf("decode req_payload: %v", err)
	}
	return req, payload
}

func TestWebClient_SearchGeneral_Search1(t *testing.T) {
	var gotPayload atomicProcessPayload
	var gotReq submitAtomicProcessRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != submitAtomicProcessPath {
			t.Errorf("unexpected path %s", r.URL.Path)
		}
		gotReq, gotPayload = readSubmitRequest(t, r)
		resp := map[string]any{
			"base":    map[string]any{"code": 0, "message": "success"},
			"task_id": "atomic_1",
			"status":  "succeed",
			"resp_payload": `{"resources":[{"meta_data":{"data":{"results":[` +
				`{"title":"Go","link":"https://go.dev","snippet":"desc","content":"full"},` +
				`{"title":"Wiki","link":"https://en.wikipedia.org","snippet":"s2"}` +
				`]}}}]}`,
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := NewWebClient(WebClientConfig{BaseURL: srv.URL, Token: "tok"})
	ctx := middleware.ContextWithUserID(context.Background(), "user-42")

	result, err := client.SearchGeneral(ctx, model.WebSearchRequest{
		Query:      "golang",
		MaxResults: 2,
	})
	if err != nil {
		t.Fatalf("SearchGeneral error: %v", err)
	}

	if gotReq.AbilityKey != DefaultSearchAbilityKey {
		t.Errorf("ability_key = %q, want %q", gotReq.AbilityKey, DefaultSearchAbilityKey)
	}
	if gotReq.UserInfo.UID != 42 {
		t.Errorf("uid = %d, want 42", gotReq.UserInfo.UID)
	}
	if gotPayload.GenType != webGenType {
		t.Errorf("gen_type = %q, want %q", gotPayload.GenType, webGenType)
	}
	if gotPayload.SearchOption == nil {
		t.Fatal("search_option missing")
	}
	if gotPayload.SearchOption.Type != searchOptionTypeWebSearch {
		t.Errorf("type = %q, want %q", gotPayload.SearchOption.Type, searchOptionTypeWebSearch)
	}
	if gotPayload.SearchOption.Provider != defaultWebSearchProvider {
		t.Errorf("provider = %q, want %q", gotPayload.SearchOption.Provider, defaultWebSearchProvider)
	}
	if gotPayload.SearchOption.Category != defaultWebSearchCategory {
		t.Errorf("category = %q, want %q", gotPayload.SearchOption.Category, defaultWebSearchCategory)
	}
	if gotPayload.SearchOption.MaxResults != 2 {
		t.Errorf("max_results = %d, want 2", gotPayload.SearchOption.MaxResults)
	}
	if gotPayload.SearchOption.CrawlResults == nil || *gotPayload.SearchOption.CrawlResults != 2 {
		t.Errorf("crawl_results = %v, want 2", gotPayload.SearchOption.CrawlResults)
	}

	if result.Mode != "general" {
		t.Errorf("mode = %q, want general", result.Mode)
	}
	if len(result.Results) != 2 {
		t.Fatalf("results len = %d, want 2", len(result.Results))
	}
	if result.Results[0].URL != "https://go.dev" {
		t.Errorf("result0 url = %q", result.Results[0].URL)
	}
	if result.Results[0].Description != "desc" {
		t.Errorf("result0 description = %q", result.Results[0].Description)
	}
	if result.Results[0].Content != "full" {
		t.Errorf("result0 content = %q", result.Results[0].Content)
	}
}

func TestWebClient_SearchGeneral_ExaDateRange(t *testing.T) {
	var gotPayload atomicProcessPayload
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, gotPayload = readSubmitRequest(t, r)
		resp := map[string]any{
			"base":    map[string]any{"code": 0, "message": "success"},
			"task_id": "atomic_2",
			"status":  "succeed",
			"resp_payload": `{"resources":[{"meta_data":{"data":{"results":[` +
				`{"title":"News","url":"https://news.example","summary":"sum","text":"body","publishedDate":"2025-02-01T00:00:00.000Z"}` +
				`]}}}]}`,
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := NewWebClient(WebClientConfig{BaseURL: srv.URL, Token: "tok"})
	result, err := client.SearchGeneral(context.Background(), model.WebSearchRequest{
		Query:        "ai",
		MaxResults:   3,
		CrawlResults: ptr(0),
		After:        "2025-01-01",
	})
	if err != nil {
		t.Fatalf("SearchGeneral error: %v", err)
	}

	if gotPayload.SearchOption.Provider != exaWebSearchProvider {
		t.Errorf("provider = %q, want exa", gotPayload.SearchOption.Provider)
	}
	if gotPayload.SearchOption.Category != "" {
		t.Errorf("category = %q, want empty for exa", gotPayload.SearchOption.Category)
	}
	if gotPayload.SearchOption.StartPublishedDate != "2025-01-01T00:00:00.000Z" {
		t.Errorf("startPublishedDate = %q", gotPayload.SearchOption.StartPublishedDate)
	}
	if gotPayload.SearchOption.CrawlResults == nil || *gotPayload.SearchOption.CrawlResults != 0 {
		t.Errorf("crawl_results = %v, want 0", gotPayload.SearchOption.CrawlResults)
	}

	if len(result.Results) != 1 {
		t.Fatalf("results len = %d, want 1", len(result.Results))
	}
	r0 := result.Results[0]
	if r0.URL != "https://news.example" {
		t.Errorf("url = %q", r0.URL)
	}
	if r0.Description != "sum" {
		t.Errorf("description = %q, want sum", r0.Description)
	}
	if r0.Content != "body" {
		t.Errorf("content = %q, want body", r0.Content)
	}
	if r0.PublishedAt != "2025-02-01T00:00:00.000Z" {
		t.Errorf("published_at = %q", r0.PublishedAt)
	}
}

func TestWebClient_Crawl(t *testing.T) {
	var gotPayload atomicProcessPayload
	var gotReq submitAtomicProcessRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotReq, gotPayload = readSubmitRequest(t, r)
		resp := map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"task_id":      "atomic_3",
			"status":       "succeed",
			"resp_payload": `{"resources":[{"meta_data":{"data":{"markdown":"# Hello","metadata":{"title":"Hello"}}}}]}`,
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := NewWebClient(WebClientConfig{BaseURL: srv.URL, Token: "tok"})
	out, err := client.Crawl(context.Background(), "https://example.com")
	if err != nil {
		t.Fatalf("Crawl error: %v", err)
	}

	if gotReq.AbilityKey != DefaultScrapeAbilityKey {
		t.Errorf("ability_key = %q, want %q", gotReq.AbilityKey, DefaultScrapeAbilityKey)
	}
	if gotPayload.SearchOption == nil || gotPayload.SearchOption.Type != searchOptionTypeWebScrape {
		t.Fatalf("scrape search_option missing or wrong type: %+v", gotPayload.SearchOption)
	}
	if gotPayload.SearchOption.URL != "https://example.com" {
		t.Errorf("url = %q", gotPayload.SearchOption.URL)
	}
	if len(gotPayload.SearchOption.Formats) != 1 || gotPayload.SearchOption.Formats[0] != "markdown" {
		t.Errorf("formats = %v", gotPayload.SearchOption.Formats)
	}
	if !gotPayload.SearchOption.OnlyMainContent {
		t.Error("onlyMainContent = false, want true")
	}

	if out.Title != "Hello" {
		t.Errorf("title = %q, want Hello", out.Title)
	}
	if out.Markdown != "# Hello" {
		t.Errorf("markdown = %q", out.Markdown)
	}
}

func TestWebClient_Crawl_EmptyMarkdown(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"task_id":      "atomic_4",
			"status":       "succeed",
			"resp_payload": `{"resources":[{"meta_data":{"data":{"markdown":"","metadata":{"title":"x"}}}}]}`,
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := NewWebClient(WebClientConfig{BaseURL: srv.URL, Token: "tok"})
	_, err := client.Crawl(context.Background(), "https://example.com")
	if err == nil {
		t.Fatal("expected error for empty markdown")
	}
	if !strings.Contains(err.Error(), "empty markdown") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestWebClient_Submit_BaseCodeError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := map[string]any{
			"base":    map[string]any{"code": 422, "message": "validation failed: bad provider"},
			"task_id": "",
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := NewWebClient(WebClientConfig{BaseURL: srv.URL, Token: "tok"})
	_, err := client.SearchGeneral(context.Background(), model.WebSearchRequest{Query: "x"})
	if err == nil {
		t.Fatal("expected error for base.code != 0")
	}
	if !strings.Contains(err.Error(), "validation failed") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestWebClient_NotConfigured(t *testing.T) {
	client := NewWebClient(WebClientConfig{})
	if _, err := client.SearchGeneral(context.Background(), model.WebSearchRequest{Query: "x"}); err != model.ErrWebGeneralSearchProviderNotConfigured {
		t.Errorf("SearchGeneral err = %v, want ErrWebGeneralSearchProviderNotConfigured", err)
	}
	if _, err := client.Crawl(context.Background(), "https://example.com"); err != model.ErrWebCrawlerNotConfigured {
		t.Errorf("Crawl err = %v, want ErrWebCrawlerNotConfigured", err)
	}
}

func TestWebClient_CustomAbilityKeys(t *testing.T) {
	client := NewWebClient(WebClientConfig{
		BaseURL:          "http://x",
		Token:            "t",
		SearchAbilityKey: "custom-search",
		ScrapeAbilityKey: "custom-scrape",
	})
	if client.searchAbilityKey != "custom-search" {
		t.Errorf("searchAbilityKey = %q", client.searchAbilityKey)
	}
	if client.scrapeAbilityKey != "custom-scrape" {
		t.Errorf("scrapeAbilityKey = %q", client.scrapeAbilityKey)
	}
}

// TestWebClient_SearchGeneral_AsyncPoll covers the case where the submit
// response carries an empty resp_payload (e.g. crawl_results >= 2) and the
// result must be fetched via get_submit_result.
func TestWebClient_SearchGeneral_AsyncPoll(t *testing.T) {
	var pollCount int
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == submitAtomicProcessPath:
			// Submit succeeds but returns empty resp_payload.
			_ = json.NewEncoder(w).Encode(map[string]any{
				"base":         map[string]any{"code": 0, "message": "success"},
				"task_id":      "atomic_async",
				"status":       "succeed",
				"resp_payload": "",
			})
		case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, getSubmitResultPath):
			if r.Header.Get("X-Token") != "tok" {
				t.Errorf("expected X-Token tok, got %q", r.Header.Get("X-Token"))
			}
			pollCount++
			if pollCount < 2 {
				// First poll: still empty.
				_ = json.NewEncoder(w).Encode(map[string]any{
					"base":         map[string]any{"code": 0, "message": "success"},
					"task_id":      "atomic_async",
					"status":       "succeed",
					"resp_payload": "",
				})
				return
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"base":    map[string]any{"code": 0, "message": "success"},
				"task_id": "atomic_async",
				"status":  "succeed",
				"resp_payload": `{"resources":[{"meta_data":{"data":{"results":[` +
					`{"title":"Go","link":"https://go.dev","snippet":"d","content":"c"}` +
					`]}}}]}`,
			})
		default:
			t.Errorf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer srv.Close()

	client := NewWebClient(WebClientConfig{BaseURL: srv.URL, Token: "tok"})
	client.pollInterval = time.Millisecond

	result, err := client.SearchGeneral(context.Background(), model.WebSearchRequest{Query: "go", MaxResults: 3})
	if err != nil {
		t.Fatalf("SearchGeneral error: %v", err)
	}
	if pollCount < 2 {
		t.Errorf("expected at least 2 polls, got %d", pollCount)
	}
	if len(result.Results) != 1 || result.Results[0].URL != "https://go.dev" {
		t.Fatalf("unexpected results: %+v", result.Results)
	}
}
