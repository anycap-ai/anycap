package credit

import (
	"context"
	"sync"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct {
	mu         sync.Mutex
	balances   map[string]int64
	deductions map[string]struct{}
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

	return model.Balance{Available: balance, Currency: "credit"}, nil
}

func (c *StubClient) Deduct(_ context.Context, userID string, amount int64, _ string, requestID string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

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
	return nil
}

func (c *StubClient) GrantSignupReward(_ context.Context, userID string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.balances[userID]; !ok {
		c.balances[userID] = 10
	}
	return nil
}
