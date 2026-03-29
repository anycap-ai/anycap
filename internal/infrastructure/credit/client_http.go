package credit

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

const creditCentPerCredit int64 = 100

type HTTPClient struct {
	baseURL    string
	bizToken   string
	httpClient *http.Client
	config     config.CreditConfig
}

func NewHTTPClient(cfg config.CreditConfig, httpClient *http.Client) *HTTPClient {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: cfg.Timeout}
	}
	return &HTTPClient{
		baseURL:    strings.TrimRight(cfg.BaseURL, "/"),
		bizToken:   cfg.BizToken,
		httpClient: httpClient,
		config:     cfg,
	}
}

func (c *HTTPClient) GetBalance(ctx context.Context, userID string) (model.Balance, error) {
	numericUserID, err := parseUserID(userID)
	if err != nil {
		return model.Balance{}, model.ErrInternal
	}

	var resp envelope[balanceData]
	if err := c.post(ctx, "/api/v1/credit/balance/get", map[string]any{
		"user_id": numericUserID,
	}, &resp); err != nil {
		return model.Balance{}, err
	}

	switch resp.Code {
	case 0:
		return model.Balance{
			Available:         resp.Data.CreditCentBalance / creditCentPerCredit,
			Currency:          "credit",
			CreditCentBalance: resp.Data.CreditCentBalance,
		}, nil
	case 2001, 2002:
		return model.Balance{}, model.ErrInsufficientCredit
	default:
		return model.Balance{}, model.ErrBillingUncertain
	}
}

func (c *HTTPClient) Deduct(ctx context.Context, userID string, amount int64, reason, requestID string) error {
	numericUserID, err := parseUserID(userID)
	if err != nil {
		return model.ErrInternal
	}
	if amount <= 0 {
		return nil
	}

	var resp envelope[map[string]any]
	if err := c.post(ctx, "/api/v1/credit/consume", map[string]any{
		"user_id":            numericUserID,
		"credit_cent_amount": amount * creditCentPerCredit,
		"source_id":          buildSourceID(reason, requestID),
		"description":        buildDescription(reason),
	}, &resp); err != nil {
		return err
	}

	switch resp.Code {
	case 0:
		return nil
	case 2001, 2002:
		return model.ErrInsufficientCredit
	default:
		return model.ErrBillingUncertain
	}
}

func (c *HTTPClient) GrantSignupReward(ctx context.Context, userID string) error {
	numericUserID, err := parseUserID(userID)
	if err != nil {
		return model.ErrInternal
	}
	if c.config.SignupRewardPackageID <= 0 && (c.config.SignupRewardPackageType == "" || c.config.SignupRewardPackageSubtype == "") {
		return nil
	}

	payload := map[string]any{
		"user_id":   numericUserID,
		"source_id": fmt.Sprintf("anycap-signup-bonus-%d", numericUserID),
	}
	if c.config.SignupRewardPackageID > 0 {
		payload["package_id"] = c.config.SignupRewardPackageID
	} else {
		payload["package_type"] = c.config.SignupRewardPackageType
		payload["package_subtype"] = c.config.SignupRewardPackageSubtype
	}

	var resp envelope[map[string]any]
	if err := c.post(ctx, "/api/v1/credit/grant/by-package", payload, &resp); err != nil {
		return err
	}

	switch resp.Code {
	case 0, 2007:
		return nil
	default:
		return model.ErrBillingUncertain
	}
}

func (c *HTTPClient) ListTransactions(ctx context.Context, userID string, limit, offset int) ([]model.CreditTransaction, int, error) {
	numericUserID, err := parseUserID(userID)
	if err != nil {
		return nil, 0, model.ErrInternal
	}
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	var resp envelope[transactionsData]
	if err := c.post(ctx, "/api/v1/credit/transaction/list", map[string]any{
		"user_id": numericUserID,
		"limit":   limit,
		"offset":  offset,
	}, &resp); err != nil {
		return nil, 0, err
	}

	if resp.Code != 0 {
		return nil, 0, model.ErrBillingUncertain
	}

	items := make([]model.CreditTransaction, 0, len(resp.Data.Transactions))
	for _, txn := range resp.Data.Transactions {
		items = append(items, model.CreditTransaction{
			ID:               strconv.FormatInt(txn.ID, 10),
			Type:             txn.Type,
			CreditCentAmount: txn.CreditCentAmount,
			SourceID:         txn.SourceID,
			Description:      txn.Description,
			Metadata:         txn.Metadata,
			CreatedAt:        txn.CreatedAt,
		})
	}
	return items, resp.Data.Total, nil
}

type envelope[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type balanceData struct {
	CreditCentBalance int64 `json:"credit_cent_balance"`
}

type transactionsData struct {
	Transactions []transactionData `json:"transactions"`
	Total        int               `json:"total"`
}

type transactionData struct {
	ID               int64          `json:"id"`
	Type             string         `json:"type"`
	CreditCentAmount int64          `json:"credit_cent_amount"`
	SourceID         string         `json:"source_id"`
	Description      string         `json:"description"`
	Metadata         map[string]any `json:"metadata"`
	CreatedAt        time.Time      `json:"created_at"`
}

func (c *HTTPClient) post(ctx context.Context, path string, payload any, dest any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return model.ErrInternal
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return model.ErrInternal
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Biz-Token", c.bizToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return model.ErrBillingUncertain
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(dest); err != nil {
		return model.ErrBillingUncertain
	}
	return nil
}

func parseUserID(userID string) (int64, error) {
	return userid.Parse(userID)
}

func buildSourceID(reason, requestID string) string {
	if requestID != "" {
		return fmt.Sprintf("anycap-%s-%s", sanitize(reason), requestID)
	}
	return fmt.Sprintf("anycap-%s-%d", sanitize(reason), time.Now().UTC().UnixNano())
}

func buildDescription(reason string) string {
	if reason == "" {
		return "anycap"
	}
	return reason
}

func sanitize(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	value = strings.ReplaceAll(value, " ", "-")
	value = strings.ReplaceAll(value, ".", "-")
	value = strings.ReplaceAll(value, "/", "-")
	if value == "" {
		return "credit"
	}
	return value
}
