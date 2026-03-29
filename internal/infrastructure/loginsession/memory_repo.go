package loginsession

import (
	"context"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type MemoryLoginSessionRepo struct {
	mu       sync.RWMutex
	sessions map[string]model.LoginSession
}

func NewMemoryLoginSessionRepo() *MemoryLoginSessionRepo {
	return &MemoryLoginSessionRepo{
		sessions: make(map[string]model.LoginSession),
	}
}

func (r *MemoryLoginSessionRepo) CreateSession(_ context.Context, session model.LoginSession) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.sessions[session.ID] = session
	return nil
}

func (r *MemoryLoginSessionRepo) GetByID(_ context.Context, sessionID string) (model.LoginSession, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.sessions[sessionID], nil
}

func (r *MemoryLoginSessionRepo) GetByState(_ context.Context, state string) (model.LoginSession, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, session := range r.sessions {
		if session.State == state {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *MemoryLoginSessionRepo) GetByUserCode(_ context.Context, userCode string) (model.LoginSession, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, session := range r.sessions {
		if session.UserCode == userCode {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *MemoryLoginSessionRepo) GetByBrowserToken(_ context.Context, browserToken string) (model.LoginSession, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, session := range r.sessions {
		if session.BrowserToken == browserToken {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *MemoryLoginSessionRepo) MarkAuthorized(_ context.Context, sessionID string, authUser model.AuthUser, _ time.Time) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	session := r.sessions[sessionID]
	session.Auth0Subject = authUser.UserID
	session.AuthUserEmail = authUser.Email
	session.AuthUserName = authUser.Name
	session.AuthUserPicture = authUser.Picture
	session.Status = model.LoginSessionStatusAuthorized
	r.sessions[sessionID] = session
	return nil
}

func (r *MemoryLoginSessionRepo) MarkCompleted(_ context.Context, sessionID, apiKeyID string, _ time.Time) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	session := r.sessions[sessionID]
	session.APIKeyID = apiKeyID
	session.Status = model.LoginSessionStatusCompleted
	r.sessions[sessionID] = session
	return nil
}

func (r *MemoryLoginSessionRepo) MarkVerified(_ context.Context, sessionID string, authUser model.AuthUser, _ time.Time) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	session := r.sessions[sessionID]
	session.AuthorizedUserID = authUser.UserID
	session.AuthUserEmail = authUser.Email
	session.AuthUserName = authUser.Name
	session.AuthUserPicture = authUser.Picture
	session.Status = model.LoginSessionStatusCompleted
	r.sessions[sessionID] = session
	return nil
}

func (r *MemoryLoginSessionRepo) MarkPolled(_ context.Context, sessionID string, polledAt time.Time) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	session := r.sessions[sessionID]
	session.LastPolledAt = polledAt
	r.sessions[sessionID] = session
	return nil
}
