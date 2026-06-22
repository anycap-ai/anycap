package port

import "context"

type SignupRewarder interface {
	GrantForNewUser(ctx context.Context, userID string, createdUser bool)
}
