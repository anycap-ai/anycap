package presenter

import (
	"context"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type UserDTO struct {
	ID        string `json:"id"`
	Email     string `json:"email,omitempty"`
	Name      string `json:"name,omitempty"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at,omitempty"`
	UpdatedAt string `json:"updated_at,omitempty"`
}

type StatusUserDTO struct {
	UserID   string   `json:"user_id"`
	APIKeyID string   `json:"api_key_id,omitempty"`
	AuthType string   `json:"auth_type"`
	Scopes   []string `json:"scopes,omitempty"`
	Email    string   `json:"email,omitempty"`
	Name     string   `json:"name,omitempty"`
}

func PresentUser(ctx context.Context, mapper IDMapper, user model.User) (UserDTO, error) {
	externalID, err := mapper.ResolveUserExternalID(ctx, strings.TrimSpace(user.ID))
	if err != nil {
		return UserDTO{}, err
	}
	dto := UserDTO{
		ID:        externalID,
		Email:     user.Email,
		Name:      user.Name,
		AvatarURL: user.AvatarURL,
		Status:    user.Status,
	}
	if !user.CreatedAt.IsZero() {
		dto.CreatedAt = user.CreatedAt.UTC().Format(TimeLayout)
	}
	if !user.UpdatedAt.IsZero() {
		dto.UpdatedAt = user.UpdatedAt.UTC().Format(TimeLayout)
	}
	return dto, nil
}

func PresentStatusUser(ctx context.Context, mapper IDMapper, principal *model.Principal, scopes []string) (*StatusUserDTO, error) {
	if principal == nil {
		return nil, nil
	}
	externalUserID, err := mapper.ResolveUserExternalID(ctx, strings.TrimSpace(principal.UserID))
	if err != nil {
		return nil, err
	}
	return &StatusUserDTO{
		UserID:   externalUserID,
		APIKeyID: principal.APIKeyID,
		AuthType: principal.AuthType,
		Scopes:   scopes,
		Email:    principal.Email,
		Name:     principal.Name,
	}, nil
}

func PresentLoginUser(ctx context.Context, mapper IDMapper, user *model.LoginUser) (*model.LoginUser, error) {
	if user == nil {
		return nil, nil
	}
	trimmed := strings.TrimSpace(user.ID)
	if trimmed == "" || strings.HasPrefix(trimmed, "u_") {
		return user, nil
	}
	externalUserID, err := mapper.ResolveUserExternalID(ctx, trimmed)
	if err != nil {
		return nil, err
	}
	return &model.LoginUser{
		ID:    externalUserID,
		Email: user.Email,
		Name:  user.Name,
	}, nil
}

func PresentDashboardUser(ctx context.Context, mapper IDMapper, user model.User) (UserDTO, error) {
	return PresentUser(ctx, mapper, user)
}
