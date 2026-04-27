package system

import (
	"context"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Service struct {
	name                       string
	env                        string
	runtime                    string
	buildInfo                  buildinfo.Info
	apiKeys                    port.APIKeyService
	usage                      port.UsageReader
	users                      port.UserReader
	credit                     port.CreditClient
	payment                    port.PaymentClient
	callLogs                   port.CallLogRepo
	packs                      []model.CreditPackSpec
	features                   map[string]bool
	provider                   featureProvider
	checkoutReturnOriginAllow  map[string]struct{}
	checkoutIdempotencyClaimer checkoutIdempotencyClaimer
	signupRewardDeadline       time.Time
}

type featureProvider interface {
	GlobalFeatures() map[string]bool
	UserFeatures(principal *model.Principal) map[string]bool
}

type checkoutIdempotencyClaimer interface {
	Claim(ctx context.Context, scope, key string) (bool, error)
	Release(ctx context.Context, scope, key string) error
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

func (s *Service) SetFeatureProvider(provider featureProvider) {
	s.provider = provider
}

// Features returns the current feature flags.
func (s *Service) Features() map[string]bool {
	if s.provider != nil {
		return s.provider.GlobalFeatures()
	}
	return s.features
}

func (s *Service) UserFeatures(principal *model.Principal) map[string]bool {
	if s.provider != nil {
		return s.provider.UserFeatures(principal)
	}
	return s.Features()
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

func (s *Service) SetSignupRewardDeadline(deadline time.Time) {
	s.signupRewardDeadline = deadline.UTC()
}

func (s *Service) SetPaymentClient(payment port.PaymentClient) {
	s.payment = payment
}

func (s *Service) SetCallLogRepo(callLogs port.CallLogRepo) {
	s.callLogs = callLogs
}

func (s *Service) SetCreditPacks(packs []model.CreditPackSpec) {
	s.packs = append([]model.CreditPackSpec(nil), packs...)
}

func (s *Service) SetAllowedCheckoutReturnOrigins(origins []string) {
	if len(origins) == 0 {
		s.checkoutReturnOriginAllow = nil
		return
	}
	allowed := make(map[string]struct{}, len(origins))
	for _, origin := range origins {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			continue
		}
		allowed[origin] = struct{}{}
	}
	if len(allowed) == 0 {
		s.checkoutReturnOriginAllow = nil
		return
	}
	s.checkoutReturnOriginAllow = allowed
}

func (s *Service) SetCheckoutIdempotencyClaimer(claimer checkoutIdempotencyClaimer) {
	s.checkoutIdempotencyClaimer = claimer
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
			Features: s.Features(),
		},
		RuntimeMode: s.runtime,
		User:        principal,
	}
}

func (s *Service) Logout(ctx context.Context, principal *model.Principal) error {
	logger := logging.WithContext(ctx).WithField("flow", "system.logout")
	if principal == nil || principal.APIKeyID == "" {
		logger.Warn("invalid principal for logout")
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		logger.Error("api key service not configured for logout")
		return model.ErrInternal
	}
	if err := s.apiKeys.RevokeAPIKey(ctx, principal.APIKeyID); err != nil {
		logger.WithError(err).Error("revoke api key failed")
		return err
	}
	return nil
}

func (s *Service) CurrentUser(ctx context.Context, principal *model.Principal) (model.User, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.current_user")
	if principal == nil || principal.UserID == "" {
		logger.Warn("invalid principal for current user")
		return model.User{}, model.ErrAuthInvalid
	}
	s.ensureSignupReward(ctx, principal)
	if s.users == nil {
		logger.Error("user reader not configured")
		return model.User{}, model.ErrInternal
	}
	user, err := s.users.GetUserByID(ctx, principal.UserID)
	if err != nil {
		logger.WithError(err).Error("load current user failed")
		return model.User{}, err
	}
	return user, nil
}

func (s *Service) ensureSignupReward(ctx context.Context, principal *model.Principal) {
	if s == nil || principal == nil || !principal.CreatedUser || principal.UserID == "" || s.credit == nil {
		return
	}
	if !s.signupRewardDeadline.IsZero() && time.Now().UTC().After(s.signupRewardDeadline.UTC()) {
		return
	}
	if err := s.credit.GrantSignupReward(ctx, principal.UserID); err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":    "system.grant_signup_reward",
			"user_id": principal.UserID,
		}).WithError(err).Warn("grant signup reward failed")
	}
}

func (s *Service) CreditBalance(ctx context.Context, principal *model.Principal) (model.Balance, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.credit_balance")
	if principal == nil || principal.UserID == "" {
		logger.Warn("invalid principal for credit balance")
		return model.Balance{}, model.ErrAuthInvalid
	}
	if s.credit == nil {
		logger.Error("credit client not configured")
		return model.Balance{}, model.ErrInternal
	}
	balance, err := s.credit.GetBalance(ctx, principal.UserID)
	if err != nil {
		logger.WithError(err).Error("load credit balance failed")
		return model.Balance{}, err
	}
	return balance, nil
}

func (s *Service) CreditPacks(_ context.Context, principal *model.Principal) (model.CreditPackListResult, error) {
	if principal == nil || principal.UserID == "" {
		return model.CreditPackListResult{}, model.ErrAuthInvalid
	}
	result := make([]model.CreditPack, 0, len(s.packs))
	for _, pack := range s.packs {
		result = append(result, pack.CreditPack)
	}
	return model.CreditPackListResult{Packs: result}, nil
}

func (s *Service) CreateCheckout(ctx context.Context, principal *model.Principal, input model.CreateCheckoutInput) (model.CreateCheckoutResult, error) {
	if principal == nil || principal.UserID == "" {
		return model.CreateCheckoutResult{}, model.ErrAuthInvalid
	}
	if input.PackID == "" {
		return model.CreateCheckoutResult{}, model.ErrValidation("pack_id is required")
	}
	if s.payment == nil {
		return model.CreateCheckoutResult{}, model.ErrNotConfigured("payment service is not configured")
	}

	pack, ok := s.findCreditPack(input.PackID)
	if !ok {
		return model.CreateCheckoutResult{}, model.ErrValidation("invalid_pack_id")
	}
	if err := s.validateCheckoutReturnURL("success_url", input.SuccessURL); err != nil {
		return model.CreateCheckoutResult{}, err
	}
	if err := s.validateCheckoutReturnURL("cancel_url", input.CancelURL); err != nil {
		return model.CreateCheckoutResult{}, err
	}

	quantity := input.Quantity
	if quantity <= 0 {
		quantity = 1
	}
	idempotencyKey := strings.TrimSpace(input.IdempotencyKey)
	if key := idempotencyKey; key != "" && s.checkoutIdempotencyClaimer != nil {
		claimed, err := s.checkoutIdempotencyClaimer.Claim(ctx, "billing.checkout", key)
		if err != nil {
			return model.CreateCheckoutResult{}, model.ErrInternal
		}
		if !claimed {
			return model.CreateCheckoutResult{}, model.ErrConflict("duplicate checkout request")
		}
	}

	session, err := s.payment.CreateOrderCheckout(ctx, model.OrderCheckoutInput{
		UserID:         principal.UserID,
		PriceID:        pack.PriceID,
		Quantity:       quantity,
		SuccessURL:     input.SuccessURL,
		CancelURL:      input.CancelURL,
		IdempotencyKey: fmt.Sprintf("checkout-%s-%d", principal.UserID, time.Now().UTC().UnixNano()),
	})
	if err != nil {
		if idempotencyKey != "" && s.checkoutIdempotencyClaimer != nil {
			if releaseErr := s.checkoutIdempotencyClaimer.Release(ctx, "billing.checkout", idempotencyKey); releaseErr != nil {
				logging.WithContext(ctx).WithField("flow", "system.create_checkout").WithError(releaseErr).Warn("release checkout idempotency key failed")
			}
		}
		return model.CreateCheckoutResult{}, err
	}

	return model.CreateCheckoutResult{
		CheckoutURL: session.URL,
		SessionType: "order",
	}, nil
}

func (s *Service) validateCheckoutReturnURL(fieldName, raw string) error {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return model.ErrValidation(fieldName + " must be an absolute http(s) URL")
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return model.ErrValidation(fieldName + " must use http or https")
	}
	if len(s.checkoutReturnOriginAllow) == 0 {
		return nil
	}
	origin := parsed.Scheme + "://" + parsed.Host
	if _, ok := s.checkoutReturnOriginAllow[origin]; !ok {
		return model.ErrValidation(fieldName + " origin is not allowed")
	}
	return nil
}

func (s *Service) ListAPIKeys(ctx context.Context, principal *model.Principal) (model.APIKeyListResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.list_api_keys")
	if principal == nil || principal.UserID == "" {
		logger.Warn("invalid principal for list api keys")
		return model.APIKeyListResult{}, model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		logger.Error("api key service not configured")
		return model.APIKeyListResult{}, model.ErrInternal
	}

	keys, err := s.apiKeys.ListAPIKeys(ctx, principal.UserID)
	if err != nil {
		logger.WithError(err).Error("list api keys failed")
		return model.APIKeyListResult{}, err
	}

	summaries := map[string]model.APIKeyUsageSummary{}
	if s.usage != nil {
		summaries, err = s.usage.SummarizeUsageByAPIKey(ctx, principal.UserID, model.UsageQuery{})
		if err != nil {
			logger.WithError(err).Error("summarize api key usage failed")
			return model.APIKeyListResult{}, err
		}
	}

	items := make([]model.ManagedAPIKey, 0, len(keys))
	for _, key := range keys {
		items = append(items, toManagedAPIKey(key, summaries[key.ID]))
	}
	return model.APIKeyListResult{Items: items}, nil
}

const (
	apiKeyMaxNameLen      = 64
	apiKeyMaxTTLDays      = 3650
	apiKeyReservedNameCLI = "cli"
)

var apiKeyNamePattern = regexp.MustCompile(`^[a-zA-Z0-9._-]{1,64}$`)

// CreateAPIKeyInput captures dashboard create-key input.
type CreateAPIKeyInput struct {
	Name          string
	ExpiresInDays int
}

// UpdateAPIKeyInput captures dashboard update-key input. At least one of
// Name / ExpiresInDays / NeverExpires must be set.
type UpdateAPIKeyInput struct {
	Name          *string
	ExpiresInDays *int
	NeverExpires  bool
}

// CreateAPIKeyResult is returned by Service.CreateAPIKey.
type CreateAPIKeyResult struct {
	APIKey model.ManagedAPIKey
	RawKey string
}

func (s *Service) CreateAPIKey(ctx context.Context, principal *model.Principal, input CreateAPIKeyInput) (CreateAPIKeyResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.create_api_key")
	if principal == nil || principal.UserID == "" {
		return CreateAPIKeyResult{}, model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		logger.Error("api key service not configured")
		return CreateAPIKeyResult{}, model.ErrInternal
	}
	name := strings.TrimSpace(input.Name)
	if !apiKeyNamePattern.MatchString(name) {
		return CreateAPIKeyResult{}, model.ErrValidation("name must match ^[a-zA-Z0-9._-]{1,64}$")
	}
	if strings.EqualFold(name, apiKeyReservedNameCLI) {
		return CreateAPIKeyResult{}, model.ErrValidation("name 'cli' is reserved for the CLI login flow")
	}
	if input.ExpiresInDays < 0 || input.ExpiresInDays > apiKeyMaxTTLDays {
		return CreateAPIKeyResult{}, model.ErrValidation(fmt.Sprintf("expires_in_days must be between 0 and %d", apiKeyMaxTTLDays))
	}

	existing, err := s.apiKeys.ListAPIKeys(ctx, principal.UserID)
	if err != nil {
		logger.WithError(err).Error("list api keys for conflict check failed")
		return CreateAPIKeyResult{}, err
	}
	for _, key := range existing {
		if key.DeletedAt != nil {
			continue
		}
		if key.Status != model.APIKeyStatusActive {
			continue
		}
		if strings.EqualFold(key.Name, name) {
			return CreateAPIKeyResult{}, model.ErrConflict("an active api key with this name already exists")
		}
	}

	var created model.CreatedAPIKey
	if input.ExpiresInDays > 0 {
		ttl := time.Duration(input.ExpiresInDays) * 24 * time.Hour
		created, err = s.apiKeys.CreateAPIKeyWithTTL(ctx, principal.UserID, name, ttl)
	} else {
		created, err = s.apiKeys.CreateAPIKey(ctx, principal.UserID, name)
	}
	if err != nil {
		logger.WithError(err).Error("create api key failed")
		return CreateAPIKeyResult{}, err
	}
	return CreateAPIKeyResult{
		APIKey: toManagedAPIKey(created.APIKey, model.APIKeyUsageSummary{}),
		RawKey: created.RawKey,
	}, nil
}

func (s *Service) UpdateAPIKey(ctx context.Context, principal *model.Principal, keyID string, input UpdateAPIKeyInput) (model.ManagedAPIKey, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.update_api_key")
	if principal == nil || principal.UserID == "" || keyID == "" {
		return model.ManagedAPIKey{}, model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		logger.Error("api key service not configured")
		return model.ManagedAPIKey{}, model.ErrInternal
	}
	if input.NeverExpires && input.ExpiresInDays != nil {
		return model.ManagedAPIKey{}, model.ErrValidation("expires_in_days and never_expires are mutually exclusive")
	}
	if input.Name == nil && input.ExpiresInDays == nil && !input.NeverExpires {
		return model.ManagedAPIKey{}, model.ErrValidation("at least one of name / expires_in_days / never_expires must be set")
	}

	var patch model.APIKeyUpdate

	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if !apiKeyNamePattern.MatchString(name) {
			return model.ManagedAPIKey{}, model.ErrValidation("name must match ^[a-zA-Z0-9._-]{1,64}$")
		}
		if strings.EqualFold(name, apiKeyReservedNameCLI) {
			return model.ManagedAPIKey{}, model.ErrValidation("name 'cli' is reserved")
		}
		// Reject duplicate name conflicts within same user (excluding self).
		existing, err := s.apiKeys.ListAPIKeys(ctx, principal.UserID)
		if err != nil {
			logger.WithError(err).Error("list api keys for rename conflict check failed")
			return model.ManagedAPIKey{}, err
		}
		for _, key := range existing {
			if key.ID == keyID || key.DeletedAt != nil || key.Status != model.APIKeyStatusActive {
				continue
			}
			if strings.EqualFold(key.Name, name) {
				return model.ManagedAPIKey{}, model.ErrConflict("an active api key with this name already exists")
			}
		}
		patch.Name = &name
	}

	if input.NeverExpires {
		patch.ClearExpiry = true
	} else if input.ExpiresInDays != nil {
		days := *input.ExpiresInDays
		if days < 0 || days > apiKeyMaxTTLDays {
			return model.ManagedAPIKey{}, model.ErrValidation(fmt.Sprintf("expires_in_days must be between 0 and %d", apiKeyMaxTTLDays))
		}
		if days == 0 {
			patch.ClearExpiry = true
		} else {
			expiresAt := time.Now().UTC().Add(time.Duration(days) * 24 * time.Hour)
			patch.ExpiresAt = &expiresAt
		}
	}

	updated, err := s.apiKeys.UpdateAPIKey(ctx, principal.UserID, keyID, patch)
	if err != nil {
		logger.WithField("key_id", keyID).WithError(err).Error("update api key failed")
		return model.ManagedAPIKey{}, err
	}

	summary := model.APIKeyUsageSummary{}
	if s.usage != nil {
		summaries, sumErr := s.usage.SummarizeUsageByAPIKey(ctx, principal.UserID, model.UsageQuery{})
		if sumErr == nil {
			summary = summaries[updated.ID]
		}
	}
	return toManagedAPIKey(updated, summary), nil
}

func toManagedAPIKey(key model.APIKey, summary model.APIKeyUsageSummary) model.ManagedAPIKey {
	return model.ManagedAPIKey{
		ID:           key.ID,
		Name:         key.Name,
		KeyPrefix:    key.KeyPrefix,
		Status:       key.Status,
		ExpiresAt:    key.ExpiresAt,
		LastUsedAt:   key.LastUsedAt,
		CreatedAt:    key.CreatedAt,
		UsageSummary: summary,
	}
}

func (s *Service) DisableAPIKey(ctx context.Context, principal *model.Principal, keyID string) error {
	logger := logging.WithContext(ctx).WithField("flow", "system.disable_api_key")
	if principal == nil || principal.UserID == "" || keyID == "" {
		logger.Warn("invalid input for disable api key")
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		logger.Error("api key service not configured")
		return model.ErrInternal
	}
	if err := s.apiKeys.DisableAPIKey(ctx, principal.UserID, keyID); err != nil {
		logger.WithField("key_id", keyID).WithError(err).Error("disable api key failed")
		return err
	}
	return nil
}

func (s *Service) DeleteAPIKey(ctx context.Context, principal *model.Principal, keyID string) error {
	logger := logging.WithContext(ctx).WithField("flow", "system.delete_api_key")
	if principal == nil || principal.UserID == "" || keyID == "" {
		logger.Warn("invalid input for delete api key")
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		logger.Error("api key service not configured")
		return model.ErrInternal
	}
	if err := s.apiKeys.DeleteAPIKey(ctx, principal.UserID, keyID); err != nil {
		logger.WithField("key_id", keyID).WithError(err).Error("delete api key failed")
		return err
	}
	return nil
}

func (s *Service) UsageSummary(ctx context.Context, principal *model.Principal, query model.UsageQuery) (model.UsageSummaryResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.usage_summary")
	if principal == nil || principal.UserID == "" {
		logger.Warn("invalid principal for usage summary")
		return model.UsageSummaryResult{}, model.ErrAuthInvalid
	}
	if s.usage == nil {
		logger.Error("usage reader not configured")
		return model.UsageSummaryResult{}, model.ErrInternal
	}
	result, err := s.usage.SummarizeUsageByUser(ctx, principal.UserID, query)
	if err != nil {
		logger.WithError(err).Error("load usage summary failed")
		return model.UsageSummaryResult{}, err
	}
	return result, nil
}

func (s *Service) UsageEvents(ctx context.Context, principal *model.Principal, query model.UsageQuery) (model.UsageEventListResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.usage_events")
	if principal == nil || principal.UserID == "" {
		logger.Warn("invalid principal for usage events")
		return model.UsageEventListResult{}, model.ErrAuthInvalid
	}
	if s.usage == nil {
		logger.Error("usage reader not configured")
		return model.UsageEventListResult{}, model.ErrInternal
	}
	result, err := s.usage.ListUsageEventsByUser(ctx, principal.UserID, query)
	if err != nil {
		logger.WithError(err).Error("load usage events failed")
		return model.UsageEventListResult{}, err
	}
	return result, nil
}

func (s *Service) Logs(ctx context.Context, principal *model.Principal, limit, offset int) (model.LogsResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.logs")
	if principal == nil || principal.UserID == "" {
		logger.Warn("invalid principal for logs")
		return model.LogsResult{}, model.ErrAuthInvalid
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}
	if s.callLogs == nil || s.credit == nil {
		logger.Error("logs dependencies not configured")
		return model.LogsResult{}, model.ErrInternal
	}

	// Over-fetch from both sources so the merge produces enough items for offset+limit.
	fetchLimit := offset + limit
	if fetchLimit < 200 {
		fetchLimit = 200
	}

	callLogs, err := s.callLogs.ListByUserID(ctx, principal.UserID, fetchLimit)
	if err != nil {
		logger.WithError(err).Error("list call logs failed")
		return model.LogsResult{}, err
	}
	transactions, _, err := s.credit.ListTransactions(ctx, principal.UserID, fetchLimit, 0)
	if err != nil {
		logger.WithError(err).Error("list credit transactions failed")
		return model.LogsResult{}, err
	}

	matchedTransactions := make(map[string]model.CreditTransaction, len(callLogs))
	consumedTransactionIDs := make(map[string]struct{}, len(transactions))
	for _, entry := range callLogs {
		for _, txn := range transactions {
			if !matchesCapabilityConsumption(entry, txn) {
				continue
			}
			matchedTransactions[entry.RequestID] = txn
			consumedTransactionIDs[txn.ID] = struct{}{}
			break
		}
	}

	items := make([]model.TimelineItem, 0, len(callLogs)+len(transactions))
	for _, entry := range callLogs {
		occurredAt := entry.CreatedAt
		creditCost := entry.CreditCost
		if txn, ok := matchedTransactions[entry.RequestID]; ok {
			if cost := creditCostFromTransaction(txn); cost > 0 {
				creditCost = cost
			}
			if txn.CreatedAt.After(occurredAt) {
				occurredAt = txn.CreatedAt
			}
		}
		items = append(items, model.TimelineItem{
			Type:       "capability_call",
			OccurredAt: occurredAt,
			RequestID:  entry.RequestID,
			Capability: entry.Capability,
			Model:      sanitizeModelForDisplay(entry.Capability, entry.Model),
			Status:     entry.Status,
			CreditCost: creditCost,
			ErrorCode:  entry.ErrorCode,
		})
	}
	for _, txn := range transactions {
		if _, ok := consumedTransactionIDs[txn.ID]; ok {
			continue
		}
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

	total := len(items)
	if offset >= len(items) {
		return model.LogsResult{Items: []model.TimelineItem{}, Total: total}, nil
	}
	end := offset + limit
	if end > len(items) {
		end = len(items)
	}
	items = items[offset:end]

	return model.LogsResult{Items: items, Total: total}, nil
}

// sanitizeModelForDisplay replaces internal upstream model names with
// user-friendly labels. Internal model identifiers (e.g. provider-specific
// model keys) must never be exposed to external interfaces.
func sanitizeModelForDisplay(capability, rawModel string) string {
	switch {
	case strings.HasPrefix(capability, "web.search"):
		if rawModel != "" {
			return "AI Grounded"
		}
		return "General"
	case strings.HasPrefix(capability, "web.crawl"):
		return "-"
	default:
		return rawModel
	}
}

const creditCentPerCredit int64 = 100

func matchesCapabilityConsumption(entry model.CallLog, txn model.CreditTransaction) bool {
	if entry.RequestID == "" || entry.Capability == "" {
		return false
	}
	if txn.Type != "CONSUMPTION" || txn.CreditCentAmount >= 0 {
		return false
	}
	prefix := "anycap-" + sanitizeSourceToken(entry.Capability) + "-"
	return strings.HasPrefix(txn.SourceID, prefix) && strings.HasSuffix(txn.SourceID, entry.RequestID)
}

func creditCostFromTransaction(txn model.CreditTransaction) int64 {
	amount := txn.CreditCentAmount
	if amount < 0 {
		amount = -amount
	}
	if amount <= 0 {
		return 0
	}
	return amount / creditCentPerCredit
}

func sanitizeSourceToken(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	value = strings.ReplaceAll(value, " ", "-")
	value = strings.ReplaceAll(value, ".", "-")
	value = strings.ReplaceAll(value, "/", "-")
	if value == "" {
		return "credit"
	}
	return value
}

func (s *Service) findCreditPack(packID string) (model.CreditPackSpec, bool) {
	for _, pack := range s.packs {
		if pack.ID == packID {
			return pack, true
		}
	}
	return model.CreditPackSpec{}, false
}

func (s *Service) DashboardSummary(ctx context.Context, principal *model.Principal) (model.DashboardSummaryResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "system.dashboard_summary")
	user, err := s.CurrentUser(ctx, principal)
	if err != nil {
		logger.WithError(err).Error("load dashboard user failed")
		return model.DashboardSummaryResult{}, err
	}
	balance, err := s.CreditBalance(ctx, principal)
	if err != nil {
		logger.WithError(err).Error("load dashboard balance failed")
		return model.DashboardSummaryResult{}, err
	}
	logs, err := s.Logs(ctx, principal, 5, 0)
	if err != nil {
		logger.WithError(err).Error("load dashboard logs failed")
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
