package drive

import (
	"context"
	"crypto/rand"
	"encoding/binary"
	"fmt"
	"math/big"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/security"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func (s *Service) UpsertShare(ctx context.Context, userID string, nodeID int64, expiresInSeconds *int64, noExpire bool, password *string, noPassword bool) (*model.DriveShareView, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil || s.shareRepo == nil {
		return nil, fmt.Errorf("drive share service is not configured")
	}
	if nodeID <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}
	if password != nil && noPassword {
		return nil, fmt.Errorf("password and no_password cannot be set together")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	node, err := s.nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		return nil, err
	}
	if node == nil || node.SpaceID != space.ID {
		return nil, fmt.Errorf("drive node not found")
	}

	existing, err := s.shareRepo.GetActiveByNodeID(ctx, nodeID)
	if err != nil {
		return nil, err
	}

	expiresAt, err := mergeExpiresAt(s.now(), expiresInSeconds, noExpire, existing)
	if err != nil {
		return nil, err
	}

	passwordHash, passwordSalt, err := mergePassword(password, noPassword, existing, s.passwordPepper)
	if err != nil {
		return nil, err
	}

	if existing == nil {
		token, tokenErr := generateShareToken()
		if tokenErr != nil {
			return nil, tokenErr
		}
		created, createErr := s.shareRepo.Create(ctx, model.DriveShareLink{
			NodeID:       nodeID,
			Token:        token,
			Status:       model.DriveShareStatusActive,
			ExpiresAt:    expiresAt,
			PasswordHash: passwordHash,
			PasswordSalt: passwordSalt,
		})
		if createErr != nil {
			return nil, createErr
		}
		jobID, syncErr := s.enqueueDriveShareSync(ctx, node, created, model.KVSyncDriveShareActionUpsert)
		if syncErr != nil {
			return nil, syncErr
		}
		if err := s.waitKVSyncJobs(ctx, jobID); err != nil {
			return nil, err
		}
		return s.toShareView(created), nil
	}

	existing.ExpiresAt = expiresAt
	existing.PasswordHash = passwordHash
	existing.PasswordSalt = passwordSalt
	updated, err := s.shareRepo.Update(ctx, *existing)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, fmt.Errorf("drive share not found")
	}
	jobID, syncErr := s.enqueueDriveShareSync(ctx, node, updated, model.KVSyncDriveShareActionUpsert)
	if syncErr != nil {
		return nil, syncErr
	}
	if err := s.waitKVSyncJobs(ctx, jobID); err != nil {
		return nil, err
	}
	return s.toShareView(updated), nil
}

func (s *Service) RotateShare(ctx context.Context, userID string, nodeID int64) (*model.DriveShareView, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil || s.shareRepo == nil {
		return nil, fmt.Errorf("drive share service is not configured")
	}
	if nodeID <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	node, err := s.nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		return nil, err
	}
	if node == nil || node.SpaceID != space.ID {
		return nil, fmt.Errorf("drive node not found")
	}

	existing, err := s.shareRepo.GetActiveByNodeID(ctx, nodeID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, fmt.Errorf("drive share not found")
	}

	if err := s.shareRepo.RevokeActiveByNodeID(ctx, nodeID); err != nil {
		return nil, err
	}

	token, err := generateShareToken()
	if err != nil {
		return nil, err
	}
	created, err := s.shareRepo.Create(ctx, model.DriveShareLink{
		NodeID:       nodeID,
		Token:        token,
		Status:       model.DriveShareStatusActive,
		ExpiresAt:    existing.ExpiresAt,
		PasswordHash: existing.PasswordHash,
		PasswordSalt: existing.PasswordSalt,
	})
	if err != nil {
		return nil, err
	}
	deleteJobID, syncErr := s.enqueueDriveShareSync(ctx, node, &model.DriveShareLink{
		NodeID:      node.ID,
		Token:       existing.Token,
		EdgeVersion: existing.EdgeVersion + 1,
	}, model.KVSyncDriveShareActionDelete)
	if syncErr != nil {
		return nil, syncErr
	}
	upsertJobID, syncErr := s.enqueueDriveShareSync(ctx, node, created, model.KVSyncDriveShareActionUpsert)
	if syncErr != nil {
		return nil, syncErr
	}
	if err := s.waitKVSyncJobs(ctx, deleteJobID, upsertJobID); err != nil {
		return nil, err
	}
	return s.toShareView(created), nil
}

func (s *Service) RevokeShare(ctx context.Context, userID string, nodeID int64) error {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil || s.shareRepo == nil {
		return fmt.Errorf("drive share service is not configured")
	}
	if nodeID <= 0 {
		return fmt.Errorf("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return err
	}

	node, err := s.nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		return err
	}
	if node == nil || node.SpaceID != space.ID {
		return fmt.Errorf("drive node not found")
	}

	existing, err := s.shareRepo.GetActiveByNodeID(ctx, nodeID)
	if err != nil {
		return err
	}
	if existing == nil {
		return nil
	}

	if err := s.shareRepo.RevokeActiveByNodeID(ctx, nodeID); err != nil {
		return err
	}
	jobID, err := s.enqueueDriveShareSync(ctx, node, &model.DriveShareLink{
		NodeID:      node.ID,
		Token:       existing.Token,
		EdgeVersion: existing.EdgeVersion + 1,
	}, model.KVSyncDriveShareActionDelete)
	if err != nil {
		return err
	}
	return s.waitKVSyncJobs(ctx, jobID)
}

func (s *Service) toShareView(link *model.DriveShareLink) *model.DriveShareView {
	if link == nil {
		return nil
	}
	return &model.DriveShareView{
		NodeID:      link.NodeID,
		Token:       link.Token,
		URL:         s.shareBaseURL + "/" + link.Token,
		ExpiresAt:   link.ExpiresAt,
		HasPassword: link.PasswordHash != nil && link.PasswordSalt != nil,
		Status:      string(link.Status),
	}
}

func mergeExpiresAt(now time.Time, expiresInSeconds *int64, noExpire bool, existing *model.DriveShareLink) (*time.Time, error) {
	if noExpire {
		return nil, nil
	}
	if expiresInSeconds != nil {
		if *expiresInSeconds <= 0 {
			return nil, fmt.Errorf("expires_in_seconds must be greater than zero")
		}
		expiresAt := now.Add(time.Duration(*expiresInSeconds) * time.Second)
		return &expiresAt, nil
	}
	if existing != nil {
		return existing.ExpiresAt, nil
	}
	return nil, nil
}

func mergePassword(password *string, noPassword bool, existing *model.DriveShareLink, pepper string) (hash *string, salt *string, err error) {
	if noPassword {
		return nil, nil, nil
	}
	if password != nil {
		trimmed := strings.TrimSpace(*password)
		if trimmed == "" {
			return nil, nil, fmt.Errorf("password is required")
		}
		h, s, hashErr := security.HashPasswordPBKDF2SHA256(trimmed, pepper)
		if hashErr != nil {
			return nil, nil, hashErr
		}
		return &h, &s, nil
	}
	if existing != nil {
		return existing.PasswordHash, existing.PasswordSalt, nil
	}
	return nil, nil, nil
}

const base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

func generateShareToken() (string, error) {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate share token: %w", err)
	}
	n := new(big.Int).SetUint64(binary.BigEndian.Uint64(b))
	base := big.NewInt(62)
	var digits []byte
	for n.Sign() > 0 {
		mod := new(big.Int)
		n.DivMod(n, base, mod)
		digits = append(digits, base62Chars[mod.Int64()])
	}
	// pad to 11 chars (ceil(log62(2^64)) = 11)
	for len(digits) < 11 {
		digits = append(digits, base62Chars[0])
	}
	// reverse
	for i, j := 0, len(digits)-1; i < j; i, j = i+1, j-1 {
		digits[i], digits[j] = digits[j], digits[i]
	}
	return string(digits), nil
}
