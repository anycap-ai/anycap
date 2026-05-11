package web

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

type fakeCrawler struct{}

type fakeGeneralSearchProvider struct{}

func (fakeCrawler) Crawl(_ context.Context, url string) (port.CrawlOutput, error) {
	return port.CrawlOutput{Title: "Example", Markdown: "# Example\n\n" + url}, nil
}

func (fakeGeneralSearchProvider) SearchGeneral(_ context.Context, req model.WebSearchRequest) (model.WebSearchGeneralResult, error) {
	return model.WebSearchGeneralResult{
		Mode:  "general",
		Query: req.Query,
		Results: []model.WebSearchResult{{
			Title:       "Example",
			URL:         "https://example.com",
			Description: "Example result",
		}},
	}, nil
}

func TestSearchGeneral_AnonymousSkipsCreditClient(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(fakeCrawler{})
	service.SetGeneralSearchProvider(fakeGeneralSearchProvider{})
	service.SetCallLogRepo(logs)

	userID := model.AnonymousUserIDPrefix + "install-1"
	ctx := middleware.ContextWithUserID(context.Background(), userID)
	result, err := service.SearchGeneral(ctx, model.WebSearchRequest{Query: "agent capability runtime"})
	if err != nil {
		t.Fatalf("SearchGeneral() error = %v", err)
	}
	if result.CreditCost != 0 {
		t.Fatalf("expected anonymous result credit cost 0, got %d", result.CreditCost)
	}

	items, err := logs.ListByUserID(context.Background(), userID, 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].CreditCost != 0 {
		t.Fatalf("expected one zero-cost anonymous call log, got %#v", items)
	}
}

func TestCrawl_AnonymousSkipsCreditClient(t *testing.T) {
	service := NewService(fakeCrawler{})

	ctx := middleware.ContextWithUserID(context.Background(), model.AnonymousUserIDPrefix+"install-1")
	result, err := service.Crawl(ctx, model.WebCrawlRequest{URL: "https://example.com/article"})
	if err != nil {
		t.Fatalf("Crawl() error = %v", err)
	}
	if result.CreditCost != 0 {
		t.Fatalf("expected anonymous crawl credit cost 0, got %d", result.CreditCost)
	}
}
