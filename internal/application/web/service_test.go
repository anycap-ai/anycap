package web

import (
	"context"
	"errors"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type fakeGeneralSearchProvider struct {
	result model.InvocationResult[model.WebSearchGeneralResult]
	err    error
}

func (f fakeGeneralSearchProvider) SearchGeneral(_ context.Context, _ model.WebSearchRequest) (model.InvocationResult[model.WebSearchGeneralResult], error) {
	return f.result, f.err
}

type fakeCrawler struct {
	result model.InvocationResult[port.CrawlOutput]
	err    error
}

type fakeGroundingProvider struct {
	result model.InvocationResult[model.WebSearchGroundingResult]
	err    error
}

func (f fakeGroundingProvider) SearchGrounding(_ context.Context, _, _, _ string) (model.InvocationResult[model.WebSearchGroundingResult], error) {
	return f.result, f.err
}

func (f fakeCrawler) Crawl(_ context.Context, _ string) (model.InvocationResult[port.CrawlOutput], error) {
	return f.result, f.err
}

func TestSearchGeneralAllowsZeroResultsAndPreservesMetadata(t *testing.T) {
	service := NewService(nil)
	service.SetGeneralSearchProvider(fakeGeneralSearchProvider{result: model.InvocationResult[model.WebSearchGeneralResult]{
		Value: model.WebSearchGeneralResult{Mode: "general", Results: []model.WebSearchResult{}},
		Meta:  model.InvocationMeta{TaskID: "search_task_1", ProviderStatus: "success"},
	}})

	result, err := service.SearchGeneral(t.Context(), model.WebSearchRequest{Query: "no matches", Mode: "general"})
	if err != nil {
		t.Fatalf("SearchGeneral() error = %v", err)
	}
	if result.Meta.TaskID != "search_task_1" {
		t.Fatalf("metadata = %+v", result.Meta)
	}
	if result.Value.Query != "no matches" || len(result.Value.Results) != 0 {
		t.Fatalf("result = %+v", result.Value)
	}
}

func TestCrawlRejectsBlankMarkdownAndPreservesMetadata(t *testing.T) {
	service := NewService(fakeCrawler{result: model.InvocationResult[port.CrawlOutput]{
		Value: port.CrawlOutput{Title: "Empty", Markdown: "  \n"},
		Meta:  model.InvocationMeta{TaskID: "crawl_task_1", ProviderStatus: "success"},
	}})

	_, err := service.Crawl(t.Context(), model.WebCrawlRequest{URL: "https://example.com"})
	if err == nil {
		t.Fatal("expected empty-result error")
	}
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) {
		t.Fatal("expected typed invocation error")
	}
	if invocationErr.Code != model.InvocationErrorCodeUpstreamEmptyResult || invocationErr.Meta.TaskID != "crawl_task_1" || invocationErr.Meta.Stage != model.InvocationStageValidateResult {
		t.Fatalf("invocation error = %+v", invocationErr)
	}
}

func TestSearchGroundingRejectsBlankContentAndPreservesMetadata(t *testing.T) {
	service := NewService(nil)
	service.SetSearchProvider(fakeGroundingProvider{result: model.InvocationResult[model.WebSearchGroundingResult]{
		Value: model.WebSearchGroundingResult{Content: " \n", Model: "gemini"},
		Meta:  model.InvocationMeta{UpstreamRequestID: "grounding_req_1", ProviderStatus: "success"},
	}})

	_, err := service.SearchGrounding(t.Context(), model.WebSearchRequest{Query: "latest", Mode: "grounding"})
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) {
		t.Fatalf("expected invocation error, got %v", err)
	}
	if invocationErr.Code != model.InvocationErrorCodeUpstreamEmptyResult || invocationErr.Meta.UpstreamRequestID != "grounding_req_1" || invocationErr.Meta.Stage != model.InvocationStageValidateResult {
		t.Fatalf("invocation error = %+v", invocationErr)
	}
}
