package cap

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestSearchCmd_GeneralWithQuery(t *testing.T) {
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&gotBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"mode":"general","results":[],"credit_cost":1}}`))
	}))
	defer srv.Close()

	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New(srv.URL) }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{"--query", "Go programming"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}
	if gotBody["query"] != "Go programming" {
		t.Errorf("query = %v, want 'Go programming'", gotBody["query"])
	}
	if gotBody["mode"] != "general" {
		t.Errorf("mode = %v, want 'general'", gotBody["mode"])
	}
}

func TestSearchCmd_GroundingWithPrompt(t *testing.T) {
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&gotBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"mode":"grounding","content":"Go is a language","credit_cost":5}}`))
	}))
	defer srv.Close()

	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New(srv.URL) }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{"--prompt", "What is Go?"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}
	if gotBody["query"] != "What is Go?" {
		t.Errorf("query = %v, want 'What is Go?'", gotBody["query"])
	}
	if gotBody["mode"] != "grounding" {
		t.Errorf("mode = %v, want 'grounding'", gotBody["mode"])
	}
}

func TestSearchCmd_NoFlags_HintsUsage(t *testing.T) {
	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New("http://unused") }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for no flags")
	}
	msg := err.Error()
	if !strings.Contains(msg, "--query") || !strings.Contains(msg, "--prompt") {
		t.Errorf("error should hint --query and --prompt, got: %s", msg)
	}
}

func TestSearchCmd_BothFlags_Error(t *testing.T) {
	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New("http://unused") }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{"--query", "test", "--prompt", "test"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when both --query and --prompt are provided")
	}
	msg := err.Error()
	if !strings.Contains(msg, "not both") {
		t.Errorf("error should say 'not both', got: %s", msg)
	}
}

func TestSearchCmd_OnlySendsQueryAndMode(t *testing.T) {
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&gotBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"mode":"general","results":[],"credit_cost":1}}`))
	}))
	defer srv.Close()

	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New(srv.URL) }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{"--query", "test"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}
	if len(gotBody) != 2 {
		t.Errorf("expected 2 body fields (query, mode), got %d: %v", len(gotBody), gotBody)
	}
}

func TestSearchCmd_GeneralWithFilters(t *testing.T) {
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&gotBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"mode":"general","results":[],"credit_cost":1}}`))
	}))
	defer srv.Close()

	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New(srv.URL) }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{
		"--query", "Go context",
		"--max-results", "3",
		"--time-range", "month",
		"--include", "github.com",
		"--include", "stackoverflow.com",
		"--exclude", "pinterest.com",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}

	if gotBody["mode"] != "general" {
		t.Errorf("mode = %v, want 'general'", gotBody["mode"])
	}
	if v, ok := gotBody["max_results"].(float64); !ok || int(v) != 3 {
		t.Errorf("max_results = %v, want 3", gotBody["max_results"])
	}
	if gotBody["time_range"] != "month" {
		t.Errorf("time_range = %v, want 'month'", gotBody["time_range"])
	}
	includes, _ := gotBody["include_domains"].([]any)
	if len(includes) != 2 {
		t.Errorf("include_domains length = %d, want 2", len(includes))
	}
	excludes, _ := gotBody["exclude_domains"].([]any)
	if len(excludes) != 1 {
		t.Errorf("exclude_domains length = %d, want 1", len(excludes))
	}
}

func TestSearchCmd_GeneralNoCrawl(t *testing.T) {
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&gotBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"mode":"general","results":[],"credit_cost":1}}`))
	}))
	defer srv.Close()

	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New(srv.URL) }
	cmd := NewSearchCmd(factory, &stdout)
	cmd.SetArgs([]string{"--query", "test", "--no-crawl"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}

	if v, ok := gotBody["crawl_results"].(float64); !ok || int(v) != 0 {
		t.Errorf("crawl_results = %v, want 0", gotBody["crawl_results"])
	}
}
