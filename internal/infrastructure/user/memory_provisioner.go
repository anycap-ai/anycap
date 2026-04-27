package userstore

import (
	"context"
	"fmt"
	"strconv"
	"strings"
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

	if migratedKey, userID := p.migratablePasswordIdentityByEmail(provider, authUser); migratedKey != "" {
		delete(p.identities, migratedKey)
		p.identities[key] = userID
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

func (p *MemoryProvisioner) GetUserByID(_ context.Context, userID string) (model.User, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	user, ok := p.users[userID]
	if !ok {
		return model.User{}, model.ErrAuthInvalid
	}
	return user, nil
}

func identityKey(provider, externalSubject string) string {
	return fmt.Sprintf("%s:%s", provider, externalSubject)
}

func (p *MemoryProvisioner) migratablePasswordIdentityByEmail(provider string, authUser model.AuthUser) (string, string) {
	if !isMigratableAuth0PasswordIdentity(provider, authUser) {
		return "", ""
	}

	var (
		matchedKey    string
		matchedUserID string
		count         int
	)
	for key, userID := range p.identities {
		if !strings.HasPrefix(key, "auth0:auth0|") {
			continue
		}
		user := p.users[userID]
		if !strings.EqualFold(strings.TrimSpace(user.Email), strings.TrimSpace(authUser.Email)) {
			continue
		}
		count++
		matchedKey = key
		matchedUserID = userID
	}
	if count != 1 {
		return "", ""
	}
	return matchedKey, matchedUserID
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
