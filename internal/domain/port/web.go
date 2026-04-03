package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// CrawlOutput is the raw output from a web crawler (title + markdown).
type CrawlOutput struct {
	Title    string
	Markdown string
}

// WebCrawler converts a URL to Markdown content.
type WebCrawler interface {
	Crawl(ctx context.Context, url string) (CrawlOutput, error)
}

// WebSearchProvider performs LLM grounding search via an upstream provider.
type WebSearchProvider interface {
	SearchGrounding(ctx context.Context, query, instruction, modelName string) (model.WebSearchGroundingResult, error)
}

// WebGeneralSearchProvider performs general web search via an upstream provider.
type WebGeneralSearchProvider interface {
	SearchGeneral(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGeneralResult, error)
}

// WebService is the application-level interface for web search and crawl.
type WebService interface {
	Crawl(ctx context.Context, req model.WebCrawlRequest) (model.WebCrawlResult, error)
	SearchGrounding(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGroundingResult, error)
	SearchGeneral(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGeneralResult, error)
}
