package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CreditClient interface {
	GetBalance(ctx context.Context, userID string) (model.Balance, error)
	Deduct(ctx context.Context, userID string, amount int64, reason, requestID string) error
	GrantSignupReward(ctx context.Context, userID string) error
	ListTransactions(ctx context.Context, userID string, limit, offset int) ([]model.CreditTransaction, int, error)
}
