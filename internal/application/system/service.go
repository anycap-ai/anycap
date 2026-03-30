package system

import (
	"context"
	"sort"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type Service struct {
	name      string
	env       string
	runtime   string
	buildInfo buildinfo.Info
	apiKeys   port.APIKeyService
	usage     port.UsageReader
	users     port.UserReader
	credit    port.CreditClient
	callLogs  port.CallLogRepo
	features  map[string]bool
}

func NewService(name, env, runtime string, info buildinfo.Info, apiKeys port.APIKeyService) *Service {
	return &Service{
		name:      name,
		env:       env,
		runtime:   runtime,
		buildInfo: info,
		apiKeys:   apiKeys,
	}
}

// SetFeatures configures the feature flags reported in status.
func (s *Service) SetFeatures(features map[string]bool) {
	s.features = features
}

// Features returns the current feature flags.
func (s *Service) Features() map[string]bool {
	return s.features
}

func (s *Service) SetUserReader(users port.UserReader) {
	s.users = users
}

func (s *Service) SetUsageReader(usage port.UsageReader) {
	s.usage = usage
}

func (s *Service) SetCreditClient(credit port.CreditClient) {
	s.credit = credit
}

func (s *Service) SetCallLogRepo(callLogs port.CallLogRepo) {
	s.callLogs = callLogs
}

func (s *Service) Status(principal *model.Principal) model.StatusResult {
	return model.StatusResult{
		Service: model.ServiceStatus{
			Name:     s.name,
			Env:      s.env,
			Version:  s.buildInfo.Version,
			Commit:   s.buildInfo.Commit,
			BuildAt:  s.buildInfo.Date,
			Status:   "ok",
			Features: s.features,
		},
		RuntimeMode: s.runtime,
		User:        principal,
	}
}

func (s *Service) Logout(ctx context.Context, principal *model.Principal) error {
	if principal == nil || principal.APIKeyID == "" {
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		return model.ErrInternal
	}
	return s.apiKeys.RevokeAPIKey(ctx, principal.APIKeyID)
}

func (s *Service) CurrentUser(ctx context.Context, principal *model.Principal) (model.User, error) {
	if principal == nil || principal.UserID == "" {
		return model.User{}, model.ErrAuthInvalid
	}
	if s.users == nil {
		return model.User{}, model.ErrInternal
	}
	return s.users.GetUserByID(ctx, principal.UserID)
}

func (s *Service) CreditBalance(ctx context.Context, principal *model.Principal) (model.Balance, error) {
	if principal == nil || principal.UserID == "" {
		return model.Balance{}, model.ErrAuthInvalid
	}
	if s.credit == nil {
		return model.Balance{}, model.ErrInternal
	}
	return s.credit.GetBalance(ctx, principal.UserID)
}

func (s *Service) ListAPIKeys(ctx context.Context, principal *model.Principal) (model.APIKeyListResult, error) {
	if principal == nil || principal.UserID == "" {
		return model.APIKeyListResult{}, model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		return model.APIKeyListResult{}, model.ErrInternal
	}

	keys, err := s.apiKeys.ListAPIKeys(ctx, principal.UserID)
	if err != nil {
		return model.APIKeyListResult{}, err
	}

	summaries := map[string]model.APIKeyUsageSummary{}
	if s.usage != nil {
		summaries, err = s.usage.SummarizeUsageByAPIKey(ctx, principal.UserID, model.UsageQuery{})
		if err != nil {
			return model.APIKeyListResult{}, err
		}
	}

	items := make([]model.ManagedAPIKey, 0, len(keys))
	for _, key := range keys {
		items = append(items, model.ManagedAPIKey{
			ID:           key.ID,
			Name:         key.Name,
			Status:       key.Status,
			LastUsedAt:   key.LastUsedAt,
			CreatedAt:    key.CreatedAt,
			UsageSummary: summaries[key.ID],
		})
	}
	return model.APIKeyListResult{Items: items}, nil
}

func (s *Service) DisableAPIKey(ctx context.Context, principal *model.Principal, keyID string) error {
	if principal == nil || principal.UserID == "" || keyID == "" {
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		return model.ErrInternal
	}
	return s.apiKeys.DisableAPIKey(ctx, principal.UserID, keyID)
}

func (s *Service) DeleteAPIKey(ctx context.Context, principal *model.Principal, keyID string) error {
	if principal == nil || principal.UserID == "" || keyID == "" {
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		return model.ErrInternal
	}
	return s.apiKeys.DeleteAPIKey(ctx, principal.UserID, keyID)
}

func (s *Service) UsageSummary(ctx context.Context, principal *model.Principal, query model.UsageQuery) (model.UsageSummaryResult, error) {
	if principal == nil || principal.UserID == "" {
		return model.UsageSummaryResult{}, model.ErrAuthInvalid
	}
	if s.usage == nil {
		return model.UsageSummaryResult{}, model.ErrInternal
	}
	return s.usage.SummarizeUsageByUser(ctx, principal.UserID, query)
}

func (s *Service) UsageEvents(ctx context.Context, principal *model.Principal, query model.UsageQuery) (model.UsageEventListResult, error) {
	if principal == nil || principal.UserID == "" {
		return model.UsageEventListResult{}, model.ErrAuthInvalid
	}
	if s.usage == nil {
		return model.UsageEventListResult{}, model.ErrInternal
	}
	return s.usage.ListUsageEventsByUser(ctx, principal.UserID, query)
}

func (s *Service) Logs(ctx context.Context, principal *model.Principal, limit int) (model.LogsResult, error) {
	if principal == nil || principal.UserID == "" {
		return model.LogsResult{}, model.ErrAuthInvalid
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if s.callLogs == nil || s.credit == nil {
		return model.LogsResult{}, model.ErrInternal
	}

	callLogs, err := s.callLogs.ListByUserID(ctx, principal.UserID, limit)
	if err != nil {
		return model.LogsResult{}, err
	}
	transactions, _, err := s.credit.ListTransactions(ctx, principal.UserID, limit, 0)
	if err != nil {
		return model.LogsResult{}, err
	}

	items := make([]model.TimelineItem, 0, len(callLogs)+len(transactions))
	for _, entry := range callLogs {
		items = append(items, model.TimelineItem{
			Type:       "capability_call",
			OccurredAt: entry.CreatedAt,
			RequestID:  entry.RequestID,
			Capability: entry.Capability,
			Model:      entry.Model,
			Status:     entry.Status,
			CreditCost: entry.CreditCost,
			ErrorCode:  entry.ErrorCode,
		})
	}
	for _, txn := range transactions {
		items = append(items, model.TimelineItem{
			Type:             "credit_transaction",
			OccurredAt:       txn.CreatedAt,
			TransactionID:    txn.ID,
			TransactionType:  txn.Type,
			CreditCentAmount: txn.CreditCentAmount,
			Description:      txn.Description,
			SourceID:         txn.SourceID,
			CreditBatchType:  txn.CreditBatchType,
		})
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].OccurredAt.After(items[j].OccurredAt)
	})
	if len(items) > limit {
		items = items[:limit]
	}

	return model.LogsResult{Items: items}, nil
}

func (s *Service) DashboardSummary(ctx context.Context, principal *model.Principal) (model.DashboardSummaryResult, error) {
	user, err := s.CurrentUser(ctx, principal)
	if err != nil {
		return model.DashboardSummaryResult{}, err
	}
	balance, err := s.CreditBalance(ctx, principal)
	if err != nil {
		return model.DashboardSummaryResult{}, err
	}
	logs, err := s.Logs(ctx, principal, 5)
	if err != nil {
		return model.DashboardSummaryResult{}, err
	}

	result := model.DashboardSummaryResult{
		User:           user,
		Balance:        balance,
		RecentActivity: logs.Items,
	}

	for _, item := range logs.Items {
		if result.UsageSummary == nil && item.Type == "capability_call" {
			occurredAt := item.OccurredAt
			result.UsageSummary = &model.DashboardUsageSummary{
				LastCapability: item.Capability,
				LastModel:      item.Model,
				LastOccurredAt: &occurredAt,
			}
		}
		if result.ErrorSummary == nil && item.Type == "capability_call" && item.Status != "success" {
			occurredAt := item.OccurredAt
			result.ErrorSummary = &model.DashboardErrorSummary{
				LastErrorCapability: item.Capability,
				LastErrorCode:       item.ErrorCode,
				LastErrorOccurredAt: &occurredAt,
			}
		}
		if result.UsageSummary != nil && result.ErrorSummary != nil {
			break
		}
	}

	return result, nil
}
