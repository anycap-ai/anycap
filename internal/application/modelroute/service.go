package modelroute

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	repo port.ModelRouteRepository
}

func NewService(repo port.ModelRouteRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, filter model.ListModelRoutesFilter) ([]model.ModelRoute, error) {
	if s.repo == nil {
		return nil, fmt.Errorf("model route repository is not configured")
	}
	return s.repo.ListModelRoutes(ctx, filter)
}

func (s *Service) Get(ctx context.Context, id int64) (*model.ModelRoute, error) {
	if s.repo == nil {
		return nil, fmt.Errorf("model route repository is not configured")
	}
	if id <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}
	return s.repo.GetModelRoute(ctx, id)
}

func (s *Service) Create(ctx context.Context, input model.CreateModelRouteInput) (*model.ModelRoute, error) {
	if s.repo == nil {
		return nil, fmt.Errorf("model route repository is not configured")
	}
	normalized, err := normalizeCreateInput(input)
	if err != nil {
		return nil, err
	}
	if err := validateCreateInput(normalized); err != nil {
		return nil, err
	}
	return s.repo.CreateModelRoute(ctx, normalized)
}

func (s *Service) Update(ctx context.Context, id int64, input model.UpdateModelRouteInput) (*model.ModelRoute, error) {
	if s.repo == nil {
		return nil, fmt.Errorf("model route repository is not configured")
	}
	if id <= 0 {
		return nil, fmt.Errorf("id must be greater than zero")
	}
	normalized, err := normalizeUpdateInput(input)
	if err != nil {
		return nil, err
	}
	if err := validateUpdateInput(normalized); err != nil {
		return nil, err
	}
	return s.repo.UpdateModelRoute(ctx, id, normalized)
}

func (s *Service) Delete(ctx context.Context, id int64) error {
	if s.repo == nil {
		return fmt.Errorf("model route repository is not configured")
	}
	if id <= 0 {
		return fmt.Errorf("id must be greater than zero")
	}
	return s.repo.DeleteModelRoute(ctx, id)
}

func validateCreateInput(input model.CreateModelRouteInput) error {
	if strings.TrimSpace(input.ModelID) == "" {
		return fmt.Errorf("model_id is required")
	}
	if strings.TrimSpace(string(input.Capability)) == "" {
		return fmt.Errorf("capability is required")
	}
	if strings.TrimSpace(string(input.Operation)) == "" {
		return fmt.Errorf("operation is required")
	}
	if strings.TrimSpace(input.AbilityKey) == "" {
		return fmt.Errorf("ability_key is required")
	}
	if input.Status != "" && !isValidStatus(input.Status) {
		return fmt.Errorf("status must be active or inactive")
	}
	if input.RouteType != "" && !isValidRouteType(input.RouteType) {
		return fmt.Errorf("route_type must be direct or scheduler")
	}
	return nil
}

func validateUpdateInput(input model.UpdateModelRouteInput) error {
	return validateCreateInput(model.CreateModelRouteInput{
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		Mode:        input.Mode,
		DisplayName: input.DisplayName,
		RouteType:   input.RouteType,
		Region:      input.Region,
		Tier:        input.Tier,
		Env:         input.Env,
		Priority:    input.Priority,
		Enabled:     input.Enabled,
		Status:      input.Status,
		Extra:       input.Extra,
	})
}

func normalizeCreateInput(input model.CreateModelRouteInput) (model.CreateModelRouteInput, error) {
	normalizedMode, normalizedAlgoType, err := model.NormalizeModeAlgoTypePair(input.Mode, input.AlgoType)
	if err != nil {
		return model.CreateModelRouteInput{}, err
	}
	input.Mode = normalizedMode
	input.AlgoType = normalizedAlgoType

	if input.Status == "" {
		input.Status = model.ModelRouteStatusActive
	}
	if input.DisplayName == "" {
		input.DisplayName = input.ModelID
	}
	if input.Extra == nil {
		input.Extra = map[string]any{}
	}
	if input.RouteType == "" {
		input.RouteType = model.RouteTypeDirect
	}
	if input.Priority == 0 {
		input.Priority = model.DefaultRoutePriority
	}
	if input.Enabled == nil {
		enabled := true
		input.Enabled = &enabled
	}
	return input, nil
}

func normalizeUpdateInput(input model.UpdateModelRouteInput) (model.UpdateModelRouteInput, error) {
	normalizedMode, normalizedAlgoType, err := model.NormalizeModeAlgoTypePair(input.Mode, input.AlgoType)
	if err != nil {
		return model.UpdateModelRouteInput{}, err
	}
	input.Mode = normalizedMode
	input.AlgoType = normalizedAlgoType

	if input.Status == "" {
		input.Status = model.ModelRouteStatusActive
	}
	if input.DisplayName == "" {
		input.DisplayName = input.ModelID
	}
	if input.Extra == nil {
		input.Extra = map[string]any{}
	}
	if input.RouteType == "" {
		input.RouteType = model.RouteTypeDirect
	}
	if input.Priority == 0 {
		input.Priority = model.DefaultRoutePriority
	}
	if input.Enabled == nil {
		enabled := true
		input.Enabled = &enabled
	}
	return input, nil
}

func isValidStatus(status string) bool {
	switch status {
	case model.ModelRouteStatusActive, model.ModelRouteStatusInactive:
		return true
	default:
		return false
	}
}

func isValidRouteType(routeType model.RouteType) bool {
	switch routeType {
	case model.RouteTypeDirect, model.RouteTypeScheduler:
		return true
	default:
		return false
	}
}
