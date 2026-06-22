package signupreward

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type Config struct {
	Enabled  bool
	Deadline time.Time
	Now      func() time.Time
}

type Service struct {
	credit   port.CreditClient
	enabled  bool
	deadline time.Time
	now      func() time.Time
}

func NewService(credit port.CreditClient, cfg Config) *Service {
	now := cfg.Now
	if now == nil {
		now = time.Now
	}
	return &Service{
		credit:   credit,
		enabled:  cfg.Enabled,
		deadline: cfg.Deadline.UTC(),
		now:      now,
	}
}

func (s *Service) GrantForNewUser(ctx context.Context, userID string, createdUser bool) {
	if s == nil || !s.enabled || !createdUser || userID == "" || s.credit == nil {
		return
	}
	now := s.now
	if now == nil {
		now = time.Now
	}
	if !s.deadline.IsZero() && now().UTC().After(s.deadline.UTC()) {
		return
	}
	if err := s.credit.GrantSignupReward(ctx, userID); err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":    "signup_reward.grant",
			"user_id": userID,
		}).WithError(err).Warn("grant signup reward failed")
	}
}

var _ port.SignupRewarder = (*Service)(nil)
