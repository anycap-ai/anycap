package apikey

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const activeStatus = "active"

func ActiveStatus() string {
	return activeStatus
}

type memoryRecord struct {
	apiKey model.APIKey
	rawKey string
}

type MemoryService struct {
	mu         sync.Mutex
	seq        int
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

	keyID, ok := s.byPrefix[PrefixFromRawKey(rawKey)]
	if !ok {
		return model.Principal{}, model.ErrAuthInvalid
	}

	record := s.byID[keyID]
	if record.apiKey.Status != activeStatus {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if record.apiKey.ExpiresAt != nil && time.Now().After(*record.apiKey.ExpiresAt) {
		return model.Principal{}, model.ErrAuthInvalid
	}
	if record.apiKey.KeyHash != HashRawKey(rawKey) {
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
	s.mu.Lock()
	defer s.mu.Unlock()

	lookupKey := userID + ":" + name
	if existingID, ok := s.byUserName[lookupKey]; ok {
		record := s.byID[existingID]
		return model.CreatedAPIKey{APIKey: record.apiKey, RawKey: record.rawKey}, nil
	}

	s.seq++
	rawKey, err := GenerateRawKey()
	if err != nil {
		return model.CreatedAPIKey{}, err
	}
	prefix := PrefixFromRawKey(rawKey)
	now := time.Now().UTC()
	apiKey := model.APIKey{
		ID:        fmt.Sprintf("key_%06d", s.seq),
		UserID:    userID,
		Name:      name,
		KeyPrefix: prefix,
		KeyHash:   HashRawKey(rawKey),
		Status:    activeStatus,
		CreatedAt: now,
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
	record.apiKey.Status = "revoked"
	s.byID[keyID] = record
	return nil
}

func GenerateRawKey() (string, error) {
	buf := make([]byte, 12)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}

	return "ak_" + hex.EncodeToString(buf), nil
}

func PrefixFromRawKey(rawKey string) string {
	if len(rawKey) <= 12 {
		return rawKey
	}
	return rawKey[:12]
}

func HashRawKey(rawKey string) string {
	sum := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(sum[:])
}
