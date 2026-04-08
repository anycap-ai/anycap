package agentcontrol

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/security"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const (
	defaultBindTokenTTL    = 10 * time.Minute
	defaultBindTokenPrefix = "bind_"
	defaultBindTokenLength = 24
)

type BindingService struct {
	tokens         port.IMBindTokenRepository
	bindings       port.IMBindingRepository
	now            func() time.Time
	tokenTTL       time.Duration
	tokenGenerator func() (string, error)
}

type BindingServiceOption func(*BindingService)

type ConsumeBindCommandInput struct {
	Platform  string
	BotID     string
	ChannelID string
	SenderID  string
	Message   string
}

func NewBindingService(tokens port.IMBindTokenRepository, bindings port.IMBindingRepository, options ...BindingServiceOption) *BindingService {
	service := &BindingService{
		tokens:   tokens,
		bindings: bindings,
		now: func() time.Time {
			return time.Now().UTC()
		},
		tokenTTL: defaultBindTokenTTL,
		tokenGenerator: func() (string, error) {
			return security.GeneratePrefixedToken(defaultBindTokenPrefix, defaultBindTokenLength)
		},
	}
	for _, option := range options {
		if option != nil {
			option(service)
		}
	}
	return service
}

func WithBindingClock(now func() time.Time) BindingServiceOption {
	return func(s *BindingService) {
		if now != nil {
			s.now = now
		}
	}
}

func WithBindTokenTTL(ttl time.Duration) BindingServiceOption {
	return func(s *BindingService) {
		if ttl > 0 {
			s.tokenTTL = ttl
		}
	}
}

func WithBindTokenGenerator(generator func() (string, error)) BindingServiceOption {
	return func(s *BindingService) {
		if generator != nil {
			s.tokenGenerator = generator
		}
	}
}

func (s *BindingService) IssueBindToken(ctx context.Context, principal *model.Principal, platform string) (*model.IMBindToken, error) {
	if s == nil || s.tokens == nil {
		return nil, model.ErrNotConfigured("binding service is not configured")
	}
	if principal == nil || strings.TrimSpace(principal.UserID) == "" || strings.TrimSpace(principal.AuthType) == "" {
		return nil, model.ErrAuthInvalid
	}
	normalizedPlatform, err := normalizeIMPlatform(platform)
	if err != nil {
		return nil, err
	}
	tokenValue, err := s.tokenGenerator()
	if err != nil {
		return nil, fmt.Errorf("generate bind token: %w", err)
	}

	now := s.now().UTC()
	token := model.IMBindToken{
		UserID:    strings.TrimSpace(principal.UserID),
		Token:     strings.TrimSpace(tokenValue),
		Platform:  normalizedPlatform,
		ExpiresAt: now.Add(s.tokenTTL),
		CreatedAt: now,
	}
	if strings.TrimSpace(token.Token) == "" {
		return nil, model.ErrValidation("bind token is required")
	}
	return s.tokens.CreateIMBindToken(ctx, token)
}

func (s *BindingService) ConsumeBindCommand(ctx context.Context, input ConsumeBindCommandInput) (*model.IMBinding, error) {
	if s == nil || s.tokens == nil || s.bindings == nil {
		return nil, model.ErrNotConfigured("binding service is not configured")
	}
	normalizedPlatform, err := normalizeIMPlatform(input.Platform)
	if err != nil {
		return nil, err
	}
	token, err := parseBindCommand(input.Message)
	if err != nil {
		return nil, err
	}
	item, err := s.tokens.GetIMBindTokenByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if item == nil || item.ID <= 0 {
		return nil, model.ErrValidation("bind token is invalid or expired")
	}
	if item.UsedAt != nil {
		return nil, model.ErrValidation("bind token is invalid or expired")
	}
	if item.ExpiresAt.Before(s.now().UTC()) {
		return nil, model.ErrValidation("bind token is invalid or expired")
	}
	if item.Platform != normalizedPlatform {
		return nil, model.ErrValidation("bind token does not match platform")
	}

	botID := strings.TrimSpace(input.BotID)
	senderID := strings.TrimSpace(input.SenderID)
	if botID == "" || senderID == "" {
		return nil, model.ErrValidation("bot_id and sender_id are required")
	}

	existing, err := s.bindings.GetActiveByPlatformSender(ctx, normalizedPlatform, botID, senderID)
	if err != nil {
		return nil, err
	}
	if existing != nil && existing.ID > 0 {
		return nil, model.ErrConflict("im sender is already bound")
	}

	now := s.now().UTC()
	lastBoundAt := now
	binding := model.IMBinding{
		UserID:      item.UserID,
		Platform:    normalizedPlatform,
		BotID:       botID,
		ChannelID:   strings.TrimSpace(input.ChannelID),
		SenderID:    senderID,
		Status:      model.IMBindingStatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
		LastBoundAt: &lastBoundAt,
	}
	created, err := s.bindings.CreateBinding(ctx, binding)
	if err != nil {
		return nil, err
	}
	if err := s.tokens.MarkIMBindTokenUsed(ctx, item.ID); err != nil {
		return nil, err
	}
	return created, nil
}

func normalizeIMPlatform(platform string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(platform)) {
	case model.IMPlatformFeishu:
		return model.IMPlatformFeishu, nil
	case model.IMPlatformWeChat:
		return model.IMPlatformWeChat, nil
	case model.IMPlatformTelegram:
		return model.IMPlatformTelegram, nil
	default:
		return "", model.ErrValidation("unsupported im platform")
	}
}

func parseBindCommand(message string) (string, error) {
	parts := strings.Fields(strings.TrimSpace(message))
	if len(parts) != 2 || parts[0] != "/bind" || strings.TrimSpace(parts[1]) == "" {
		return "", model.ErrValidation("bind command must use format: /bind <token>")
	}
	return strings.TrimSpace(parts[1]), nil
}
