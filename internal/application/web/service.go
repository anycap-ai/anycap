// Package web provides application-level orchestration for web search and crawl.
package web

import (
	"context"
	"strconv"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"
)

const (
	crawlCreditCost           int64 = 1
	generalSearchCreditCost   int64 = 1
	groundingSearchCreditCost int64 = 5
)

// Service orchestrates web search and crawl use cases.
type Service struct {
	crawler               port.WebCrawler
	searchProvider        port.WebSearchProvider
	generalSearchProvider port.WebGeneralSearchProvider
	credit                port.CreditClient
	callLogs              port.CallLogRepo
}

// NewService creates a new web service.
func NewService(crawler port.WebCrawler) *Service {
	return &Service{
		crawler: crawler,
	}
}

// SetSearchProvider sets the grounding search provider.
func (s *Service) SetSearchProvider(provider port.WebSearchProvider) {
	s.searchProvider = provider
}

// SetGeneralSearchProvider sets the general web search provider.
func (s *Service) SetGeneralSearchProvider(provider port.WebGeneralSearchProvider) {
	s.generalSearchProvider = provider
}

// SetCreditClient sets the credit client for billing.
func (s *Service) SetCreditClient(credit port.CreditClient) {
	s.credit = credit
}

// SetCallLogRepo sets the call log repository for audit.
func (s *Service) SetCallLogRepo(callLogs port.CallLogRepo) {
	s.callLogs = callLogs
}

// SearchGrounding performs an LLM grounding search.
func (s *Service) SearchGrounding(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGroundingResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", "web.search")
	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("web search validation failed")
		return model.WebSearchGroundingResult{}, err
	}

	if s == nil || s.searchProvider == nil {
		logger.Error("web search grounding provider not configured")
		return model.WebSearchGroundingResult{}, model.ErrWebSearchProviderNotConfigured
	}

	userID := middleware.UserIDFromContext(ctx)
	creditCost := chargeableWebCreditCost(userID, groundingSearchCreditCost)
	if err := s.ensureBalance(ctx, userID, groundingSearchCreditCost, "web.search"); err != nil {
		return model.WebSearchGroundingResult{}, err
	}

	startedAt := time.Now()
	requestID := webRequestID(ctx, "web.search")

	result, err := s.searchProvider.SearchGrounding(ctx, req.Query, req.Instruction, req.Model)
	if err != nil {
		logger.WithError(err).Error("web search grounding upstream call failed")
		return model.WebSearchGroundingResult{}, err
	}

	if err := s.finalizeSuccess(ctx, userID, requestID, "web.search", result.Model, groundingSearchCreditCost, startedAt); err != nil {
		return model.WebSearchGroundingResult{}, err
	}

	result.Query = req.Query
	result.CreditCost = creditCost
	return result, nil
}

// SearchGeneral performs a general web search returning a list of results.
func (s *Service) SearchGeneral(ctx context.Context, req model.WebSearchRequest) (model.WebSearchGeneralResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", "web.search")
	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("web search validation failed")
		return model.WebSearchGeneralResult{}, err
	}

	if s == nil || s.generalSearchProvider == nil {
		logger.Error("web general search provider not configured")
		return model.WebSearchGeneralResult{}, model.ErrWebGeneralSearchProviderNotConfigured
	}

	userID := middleware.UserIDFromContext(ctx)
	creditCost := chargeableWebCreditCost(userID, generalSearchCreditCost)
	if err := s.ensureBalance(ctx, userID, generalSearchCreditCost, "web.search"); err != nil {
		return model.WebSearchGeneralResult{}, err
	}

	startedAt := time.Now()
	requestID := webRequestID(ctx, "web.search")

	result, err := s.generalSearchProvider.SearchGeneral(ctx, req)
	if err != nil {
		logger.WithError(err).Error("web general search upstream call failed")
		return model.WebSearchGeneralResult{}, err
	}

	if err := s.finalizeSuccess(ctx, userID, requestID, "web.search", "", generalSearchCreditCost, startedAt); err != nil {
		return model.WebSearchGeneralResult{}, err
	}

	result.Query = req.Query
	result.CreditCost = creditCost
	return result, nil
}

// Crawl converts a web page to Markdown.
func (s *Service) Crawl(ctx context.Context, req model.WebCrawlRequest) (model.WebCrawlResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", "web.crawl")
	if err := req.Validate(); err != nil {
		logger.WithError(err).Warn("web crawl validation failed")
		return model.WebCrawlResult{}, err
	}
	if s == nil || s.crawler == nil {
		logger.Error("web crawl provider not configured")
		return model.WebCrawlResult{}, model.ErrWebCrawlerNotConfigured
	}

	userID := middleware.UserIDFromContext(ctx)
	creditCost := chargeableWebCreditCost(userID, crawlCreditCost)
	if err := s.ensureBalance(ctx, userID, crawlCreditCost, "web.crawl"); err != nil {
		return model.WebCrawlResult{}, err
	}

	startedAt := time.Now()
	requestID := webRequestID(ctx, "web.crawl")

	markdown, err := s.crawler.Crawl(ctx, req.URL)
	if err != nil {
		logger.WithError(err).Error("web crawl upstream call failed")
		return model.WebCrawlResult{}, err
	}

	if err := s.finalizeSuccess(ctx, userID, requestID, "web.crawl", "", crawlCreditCost, startedAt); err != nil {
		return model.WebCrawlResult{}, err
	}

	return model.WebCrawlResult{
		URL:        req.URL,
		Title:      markdown.Title,
		Markdown:   markdown.Markdown,
		CreditCost: creditCost,
	}, nil
}

func (s *Service) ensureBalance(ctx context.Context, userID string, cost int64, capability string) error {
	logger := logging.WithContext(ctx).WithField("capability", capability)
	if cost <= 0 || s.credit == nil || model.IsAnonymousUserID(userID) {
		return nil
	}
	if userID == "" {
		logger.Warn("missing user id for billed web request")
		return model.ErrAuthInvalid
	}
	balance, err := s.credit.GetBalance(ctx, userID)
	if err != nil {
		logger.WithError(err).Error("web credit balance lookup failed")
		return err
	}
	if balance.Available < cost {
		logger.WithFields(logging.Fields{
			"available_credit": balance.Available,
			"required_credit":  cost,
		}).Warn("insufficient credit for web request")
		return model.ErrInsufficientCredit
	}
	return nil
}

func (s *Service) finalizeSuccess(ctx context.Context, userID, requestID, capability, modelName string, cost int64, startedAt time.Time) error {
	logger := logging.WithContext(ctx).WithField("capability", capability)
	creditCost := chargeableWebCreditCost(userID, cost)
	if s.credit != nil && creditCost > 0 {
		if err := s.credit.Deduct(ctx, userID, cost, capability, requestID); err != nil {
			logger.WithField("credit_cost", cost).WithError(err).Error("web credit deduction failed")
			return model.ErrBillingUncertain
		}
	}
	if s.callLogs != nil {
		if err := s.callLogs.Insert(ctx, model.CallLog{
			RequestID:  requestID,
			UserID:     userID,
			Capability: capability,
			Model:      modelName,
			Status:     "success",
			LatencyMS:  time.Since(startedAt).Milliseconds(),
			CreditCost: creditCost,
		}); err != nil {
			logger.WithFields(logging.Fields{
				"credit_cost": creditCost,
				"latency_ms":  time.Since(startedAt).Milliseconds(),
			}).WithError(err).Warn("web call log persistence failed")
		}
	}
	return nil
}

func chargeableWebCreditCost(userID string, cost int64) int64 {
	if model.IsAnonymousUserID(userID) {
		return 0
	}
	return cost
}

func webRequestID(ctx context.Context, capability string) string {
	if requestID := trace.GetTraceID(ctx); requestID != "" {
		return requestID
	}
	return capability + "-" + strconv.FormatInt(time.Now().UTC().UnixNano(), 10)
}
