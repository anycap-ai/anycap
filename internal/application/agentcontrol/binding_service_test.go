package agentcontrol

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeBindTokenRepo struct {
	created            []model.IMBindToken
	tokensByToken      map[string]model.IMBindToken
	markedUsedIDs      []int64
	createErr          error
	getErr             error
	markUsedErr        error
	lastCreatedPayload model.IMBindToken
}

func (r *fakeBindTokenRepo) CreateIMBindToken(_ context.Context, token model.IMBindToken) (*model.IMBindToken, error) {
	if r.createErr != nil {
		return nil, r.createErr
	}
	r.lastCreatedPayload = token
	r.created = append(r.created, token)
	item := token
	item.ID = int64(len(r.created))
	return &item, nil
}

func (r *fakeBindTokenRepo) GetIMBindTokenByToken(_ context.Context, token string) (*model.IMBindToken, error) {
	if r.getErr != nil {
		return nil, r.getErr
	}
	if item, ok := r.tokensByToken[token]; ok {
		copy := item
		return &copy, nil
	}
	return nil, nil
}

func (r *fakeBindTokenRepo) MarkIMBindTokenUsed(_ context.Context, id int64) error {
	if r.markUsedErr != nil {
		return r.markUsedErr
	}
	r.markedUsedIDs = append(r.markedUsedIDs, id)
	return nil
}

type fakeBindingRepo struct {
	activeBySender map[string]model.IMBinding
	created        []model.IMBinding
	getErr         error
	createErr      error
}

func (r *fakeBindingRepo) CreateBinding(_ context.Context, binding model.IMBinding) (*model.IMBinding, error) {
	if r.createErr != nil {
		return nil, r.createErr
	}
	r.created = append(r.created, binding)
	item := binding
	item.ID = int64(len(r.created))
	return &item, nil
}

func (r *fakeBindingRepo) GetActiveByPlatformSender(_ context.Context, platform string, botID string, senderID string) (*model.IMBinding, error) {
	if r.getErr != nil {
		return nil, r.getErr
	}
	key := platform + "|" + botID + "|" + senderID
	if item, ok := r.activeBySender[key]; ok {
		copy := item
		return &copy, nil
	}
	return nil, nil
}

func (r *fakeBindingRepo) ListBindingsByUser(_ context.Context, _ string) ([]model.IMBinding, error) {
	return nil, errors.New("unexpected ListBindingsByUser call")
}

func (r *fakeBindingRepo) RevokeBinding(_ context.Context, _ int64) error {
	return errors.New("unexpected RevokeBinding call")
}

func TestBindingServiceIssueBindToken(t *testing.T) {
	now := time.Date(2026, 4, 8, 10, 0, 0, 0, time.UTC)
	tokens := &fakeBindTokenRepo{}
	bindings := &fakeBindingRepo{}
	service := NewBindingService(tokens, bindings,
		WithBindingClock(func() time.Time { return now }),
		WithBindTokenTTL(10*time.Minute),
		WithBindTokenGenerator(func() (string, error) { return "bind_abc123", nil }),
	)

	token, err := service.IssueBindToken(context.Background(), &model.Principal{
		UserID:   "2000000001",
		AuthType: "api_key",
	}, model.IMPlatformFeishu)
	if err != nil {
		t.Fatalf("IssueBindToken() error = %v", err)
	}
	if token.Token != "bind_abc123" {
		t.Fatalf("expected fixed token, got %q", token.Token)
	}
	if token.UserID != "2000000001" {
		t.Fatalf("expected user id 2000000001, got %q", token.UserID)
	}
	if token.Platform != model.IMPlatformFeishu {
		t.Fatalf("expected platform %q, got %q", model.IMPlatformFeishu, token.Platform)
	}
	if !token.CreatedAt.Equal(now) {
		t.Fatalf("expected created_at %v, got %v", now, token.CreatedAt)
	}
	if !token.ExpiresAt.Equal(now.Add(10 * time.Minute)) {
		t.Fatalf("expected expires_at %v, got %v", now.Add(10*time.Minute), token.ExpiresAt)
	}
	if len(tokens.created) != 1 {
		t.Fatalf("expected 1 created token, got %d", len(tokens.created))
	}
}

func TestBindingServiceConsumeBindCommandCreatesBindingOnce(t *testing.T) {
	now := time.Date(2026, 4, 8, 10, 30, 0, 0, time.UTC)
	tokens := &fakeBindTokenRepo{
		tokensByToken: map[string]model.IMBindToken{
			"bind_ok": {
				ID:        42,
				UserID:    "2000000001",
				Token:     "bind_ok",
				Platform:  model.IMPlatformFeishu,
				ExpiresAt: now.Add(5 * time.Minute),
				CreatedAt: now.Add(-time.Minute),
			},
		},
	}
	bindings := &fakeBindingRepo{activeBySender: map[string]model.IMBinding{}}
	service := NewBindingService(tokens, bindings, WithBindingClock(func() time.Time { return now }))

	binding, err := service.ConsumeBindCommand(context.Background(), ConsumeBindCommandInput{
		Platform:  model.IMPlatformFeishu,
		BotID:     "bot_123",
		ChannelID: "chat_456",
		SenderID:  "ou_sender",
		Message:   "/bind bind_ok",
	})
	if err != nil {
		t.Fatalf("ConsumeBindCommand() error = %v", err)
	}
	if binding.UserID != "2000000001" {
		t.Fatalf("expected binding user id 2000000001, got %q", binding.UserID)
	}
	if binding.Status != model.IMBindingStatusActive {
		t.Fatalf("expected binding status %q, got %q", model.IMBindingStatusActive, binding.Status)
	}
	if len(bindings.created) != 1 {
		t.Fatalf("expected 1 created binding, got %d", len(bindings.created))
	}
	if len(tokens.markedUsedIDs) != 1 || tokens.markedUsedIDs[0] != 42 {
		t.Fatalf("expected token 42 marked used once, got %#v", tokens.markedUsedIDs)
	}
}

func TestBindingServiceConsumeBindCommandRejectsInvalidOrExpiredToken(t *testing.T) {
	now := time.Date(2026, 4, 8, 11, 0, 0, 0, time.UTC)
	tokens := &fakeBindTokenRepo{
		tokensByToken: map[string]model.IMBindToken{
			"bind_used": {
				ID:        7,
				UserID:    "2000000001",
				Token:     "bind_used",
				Platform:  model.IMPlatformFeishu,
				ExpiresAt: now.Add(5 * time.Minute),
				UsedAt:    ptrTime(now.Add(-time.Minute)),
				CreatedAt: now.Add(-2 * time.Minute),
			},
			"bind_expired": {
				ID:        8,
				UserID:    "2000000001",
				Token:     "bind_expired",
				Platform:  model.IMPlatformFeishu,
				ExpiresAt: now.Add(-time.Minute),
				CreatedAt: now.Add(-10 * time.Minute),
			},
		},
	}
	service := NewBindingService(tokens, &fakeBindingRepo{}, WithBindingClock(func() time.Time { return now }))

	cases := []struct {
		name    string
		message string
	}{
		{name: "missing", message: "/bind bind_missing"},
		{name: "used", message: "/bind bind_used"},
		{name: "expired", message: "/bind bind_expired"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := service.ConsumeBindCommand(context.Background(), ConsumeBindCommandInput{
				Platform: model.IMPlatformFeishu,
				BotID:    "bot_123",
				SenderID: "ou_sender",
				Message:  tc.message,
			})
			if err == nil {
				t.Fatal("expected error")
			}
		})
	}
}

func TestBindingServiceConsumeBindCommandRejectsAlreadyBoundSender(t *testing.T) {
	now := time.Date(2026, 4, 8, 11, 30, 0, 0, time.UTC)
	tokens := &fakeBindTokenRepo{
		tokensByToken: map[string]model.IMBindToken{
			"bind_ok": {
				ID:        9,
				UserID:    "2000000001",
				Token:     "bind_ok",
				Platform:  model.IMPlatformFeishu,
				ExpiresAt: now.Add(5 * time.Minute),
				CreatedAt: now.Add(-time.Minute),
			},
		},
	}
	bindings := &fakeBindingRepo{
		activeBySender: map[string]model.IMBinding{
			"feishu|bot_123|ou_sender": {
				ID:       88,
				UserID:   "2000000002",
				Platform: model.IMPlatformFeishu,
				BotID:    "bot_123",
				SenderID: "ou_sender",
				Status:   model.IMBindingStatusActive,
			},
		},
	}
	service := NewBindingService(tokens, bindings, WithBindingClock(func() time.Time { return now }))

	_, err := service.ConsumeBindCommand(context.Background(), ConsumeBindCommandInput{
		Platform: model.IMPlatformFeishu,
		BotID:    "bot_123",
		SenderID: "ou_sender",
		Message:  "/bind bind_ok",
	})
	if err == nil {
		t.Fatal("expected sender already bound error")
	}
	if len(tokens.markedUsedIDs) != 0 {
		t.Fatalf("expected token to remain unused, got %#v", tokens.markedUsedIDs)
	}
}

func ptrTime(v time.Time) *time.Time {
	return &v
}
