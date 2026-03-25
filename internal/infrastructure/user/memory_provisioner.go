package userstore

import (
	"context"
	"fmt"
	"strconv"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const (
	minUserID = int64(2000000000)
	maxUserID = int64(3000000000)
)

type MemoryProvisioner struct {
	mu         sync.Mutex
	nextID     int64
	identities map[string]string
	users      map[string]model.User
}

func NewMemoryProvisioner() *MemoryProvisioner {
	return &MemoryProvisioner{
		nextID:     minUserID,
		identities: make(map[string]string),
		users:      make(map[string]model.User),
	}
}

func (p *MemoryProvisioner) FindOrCreateByAuthIdentity(_ context.Context, provider string, authUser model.AuthUser, now time.Time) (model.User, bool, error) {
	if provider == "" || authUser.UserID == "" {
		return model.User{}, false, model.ErrInternal
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	key := identityKey(provider, authUser.UserID)
	if userID, ok := p.identities[key]; ok {
		user := p.users[userID]
		user.Email = firstNonEmpty(authUser.Email, user.Email)
		user.Name = firstNonEmpty(authUser.Name, user.Name)
		user.AvatarURL = firstNonEmpty(authUser.Picture, user.AvatarURL)
		user.UpdatedAt = now.UTC()
		p.users[userID] = user
		return user, false, nil
	}

	if p.nextID >= maxUserID {
		return model.User{}, false, model.ErrInternal
	}
	userID := strconv.FormatInt(p.nextID, 10)
	p.nextID++

	user := model.User{
		ID:        userID,
		Email:     authUser.Email,
		Name:      authUser.Name,
		AvatarURL: authUser.Picture,
		Status:    model.UserStatusActive,
		CreatedAt: now.UTC(),
		UpdatedAt: now.UTC(),
	}
	p.identities[key] = userID
	p.users[userID] = user
	return user, true, nil
}

func identityKey(provider, externalSubject string) string {
	return fmt.Sprintf("%s:%s", provider, externalSubject)
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
