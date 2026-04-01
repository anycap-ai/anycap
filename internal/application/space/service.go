package space

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	repo port.SpaceRepository
}

func NewService(repo port.SpaceRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetOrCreatePersonalSpace(ctx context.Context, userID int64) (*model.Space, error) {
	if s == nil || s.repo == nil {
		return nil, fmt.Errorf("space repository is not configured")
	}
	if userID == 0 {
		return nil, fmt.Errorf("user_id is required")
	}

	existing, err := s.repo.GetByOwnerUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return existing, nil
	}

	created, err := s.repo.CreatePersonalSpace(ctx, userID, model.DefaultPersonalSpaceName)
	if err == nil {
		return created, nil
	}

	// Handle concurrent first-request creation by re-reading on conflict.
	if strings.Contains(strings.ToLower(err.Error()), "duplicate") || strings.Contains(strings.ToLower(err.Error()), "unique") {
		existing, getErr := s.repo.GetByOwnerUserID(ctx, userID)
		if getErr == nil && existing != nil {
			return existing, nil
		}
	}

	return nil, err
}
