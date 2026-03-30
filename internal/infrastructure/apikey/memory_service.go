package apikey

import (
	"context"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikeycodec"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

type memoryRecord struct {
	apiKey model.APIKey
	rawKey string
}

type MemoryService struct {
	mu         sync.Mutex
	byID       map[string]memoryRecord
	byPrefix   map[string]string
	byUserName map[string]string
}

func NewMemoryService() *MemoryService {
	return &MemoryService{
		byID:       make(map[string]memoryRecord),
		byPrefix:   make(map[string]string),
		byUserName: make(map[string]string),
	}
}

func (s *MemoryService) AuthenticateAPIKey(_ context.Context, rawKey string) (model.Principal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	keyID, ok := s.byPrefix[apikeycodec.PrefixFromRawKey(rawKey)]
	if !ok {
		return model.Principal{}, model.ErrAuthInvalid
	}

	record := s.byID[keyID]
	if record.apiKey.Status != model.APIKeyStatusActive {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if record.apiKey.ExpiresAt != nil && time.Now().After(*record.apiKey.ExpiresAt) {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if record.apiKey.KeyHash != apikeycodec.HashRawKey(rawKey) {
		return model.Principal{}, model.ErrAuthInvalid
	}

	now := time.Now().UTC()
	record.apiKey.LastUsedAt = &now
	s.byID[keyID] = record

	return model.Principal{
		UserID:   record.apiKey.UserID,
		APIKeyID: record.apiKey.ID,
		AuthType: "api_key",
		Scopes:   []string{"image.generate", "image.read", "system.read"},
	}, nil
}

func (s *MemoryService) CreateAPIKey(_ context.Context, userID, name string) (model.CreatedAPIKey, error) {
	return s.createAPIKey(userID, name, 0)
}

func (s *MemoryService) CreateAPIKeyWithTTL(_ context.Context, userID, name string, ttl time.Duration) (model.CreatedAPIKey, error) {
	return s.createAPIKey(userID, name, ttl)
}

func (s *MemoryService) createAPIKey(userID, name string, ttl time.Duration) (model.CreatedAPIKey, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	lookupKey := userID + ":" + name
	if existingID, ok := s.byUserName[lookupKey]; ok {
		record := s.byID[existingID]
		if record.apiKey.Status == model.APIKeyStatusActive && (record.apiKey.ExpiresAt == nil || time.Now().Before(*record.apiKey.ExpiresAt)) {
			return model.CreatedAPIKey{APIKey: record.apiKey, RawKey: record.rawKey}, nil
		}
	}

	rawKey, err := apikeycodec.GenerateRawKey()
	if err != nil {
		return model.CreatedAPIKey{}, err
	}
	prefix := apikeycodec.PrefixFromRawKey(rawKey)
	now := time.Now().UTC()
	apiKey := model.APIKey{
		ID:        externalid.Generate(externalid.PrefixAPIKeyID),
		UserID:    userID,
		Name:      name,
		KeyPrefix: prefix,
		KeyHash:   apikeycodec.HashRawKey(rawKey),
		Status:    model.APIKeyStatusActive,
		CreatedAt: now,
	}
	if ttl > 0 {
		expiresAt := now.Add(ttl)
		apiKey.ExpiresAt = &expiresAt
	}
	record := memoryRecord{apiKey: apiKey, rawKey: rawKey}
	s.byID[apiKey.ID] = record
	s.byPrefix[prefix] = apiKey.ID
	s.byUserName[lookupKey] = apiKey.ID

	return model.CreatedAPIKey{APIKey: apiKey, RawKey: rawKey}, nil
}

func (s *MemoryService) RevokeAPIKey(_ context.Context, keyID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.byID[keyID]
	if !ok {
		return model.ErrAuthInvalid
	}
	record.apiKey.Status = model.APIKeyStatusRevoked
	s.byID[keyID] = record
	return nil
}

func (s *MemoryService) ListAPIKeys(_ context.Context, userID string) ([]model.APIKey, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	items := make([]model.APIKey, 0, len(s.byID))
	for _, record := range s.byID {
		if record.apiKey.UserID != userID || record.apiKey.DeletedAt != nil {
			continue
		}
		items = append(items, record.apiKey)
	}
	return items, nil
}

func (s *MemoryService) DisableAPIKey(ctx context.Context, userID, keyID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.byID[keyID]
	if !ok || record.apiKey.UserID != userID || record.apiKey.DeletedAt != nil {
		return model.ErrAuthInvalid
	}
	record.apiKey.Status = model.APIKeyStatusRevoked
	s.byID[keyID] = record
	return nil
}

func (s *MemoryService) DeleteAPIKey(_ context.Context, userID, keyID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.byID[keyID]
	if !ok || record.apiKey.UserID != userID || record.apiKey.DeletedAt != nil {
		return model.ErrAuthInvalid
	}
	now := time.Now().UTC()
	record.apiKey.DeletedAt = &now
	s.byID[keyID] = record
	return nil
}
