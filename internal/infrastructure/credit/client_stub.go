package credit

import (
	"context"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct {
	mu         sync.Mutex
	balances   map[string]int64
	deductions map[string]struct{}
	events     []model.CreditTransaction
}

func NewStubClient(initialBalances map[string]int64) *StubClient {
	if initialBalances == nil {
		initialBalances = map[string]int64{}
	}

	balances := make(map[string]int64, len(initialBalances))
	for userID, balance := range initialBalances {
		balances[userID] = balance
	}

	return &StubClient{
		balances:   balances,
		deductions: make(map[string]struct{}),
	}
}

func (c *StubClient) GetBalance(_ context.Context, userID string) (model.Balance, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	balance, ok := c.balances[userID]
	if !ok {
		balance = 10
		c.balances[userID] = balance
	}

	return model.Balance{Available: balance, Currency: "credit", CreditCentBalance: balance * creditCentPerCredit}, nil
}

func (c *StubClient) Deduct(_ context.Context, userID string, amount int64, _ string, requestID string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if amount <= 0 {
		return nil
	}

	if _, ok := c.deductions[requestID]; ok {
		return nil
	}

	balance, ok := c.balances[userID]
	if !ok {
		balance = 10
	}
	if balance < amount {
		return model.ErrInsufficientCredit
	}

	c.balances[userID] = balance - amount
	c.deductions[requestID] = struct{}{}
	c.events = append(c.events, model.CreditTransaction{
		ID:               requestID,
		Type:             "CONSUMPTION",
		CreditCentAmount: -amount * creditCentPerCredit,
		SourceID:         requestID,
		Description:      "anycap",
		CreatedAt:        time.Now().UTC(),
	})
	return nil
}

func (c *StubClient) GrantSignupReward(_ context.Context, userID string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.balances[userID]; !ok {
		c.balances[userID] = 10
	}
	c.events = append(c.events, model.CreditTransaction{
		ID:               "signup-" + userID,
		Type:             "REWARD",
		CreditCentAmount: 1000,
		SourceID:         "signup-" + userID,
		Description:      "signup reward",
		CreatedAt:        time.Now().UTC(),
	})
	return nil
}

func (c *StubClient) ListTransactions(_ context.Context, _ string, limit, offset int) ([]model.CreditTransaction, int, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	total := len(c.events)
	if offset > total {
		offset = total
	}
	end := offset + limit
	if limit <= 0 || end > total {
		end = total
	}
	items := append([]model.CreditTransaction(nil), c.events[offset:end]...)
	return items, total, nil
}
