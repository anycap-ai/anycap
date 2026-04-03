package cap

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestCrawlCmd_Success(t *testing.T) {
	var gotBody map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/web/crawl" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if r.Method != http.MethodPost {
			t.Fatalf("unexpected method: %s", r.Method)
		}
		json.NewDecoder(r.Body).Decode(&gotBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"url":"https://example.com","markdown":"# Example","credit_cost":1}}`))
	}))
	defer srv.Close()

	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New(srv.URL) }
	cmd := NewCrawlCmd(factory, &stdout)
	cmd.SetArgs([]string{"https://example.com"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}

	if gotBody["url"] != "https://example.com" {
		t.Errorf("url = %v, want 'https://example.com'", gotBody["url"])
	}

	if !bytes.Contains(stdout.Bytes(), []byte(`"# Example"`)) {
		t.Errorf("output missing markdown: %s", stdout.String())
	}
}

func TestCrawlCmd_MissingURL(t *testing.T) {
	var stdout bytes.Buffer
	factory := func() *httpclient.Client { return httpclient.New("http://unused") }
	cmd := NewCrawlCmd(factory, &stdout)
	cmd.SetArgs([]string{})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing URL argument")
	}
}
