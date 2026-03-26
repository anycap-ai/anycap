package modelroute

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type stubRepo struct {
	items []model.ModelRoute
}

func (s *stubRepo) ListModelRoutes(_ context.Context, _ model.ListModelRoutesFilter) ([]model.ModelRoute, error) {
	return s.items, nil
}

func (s *stubRepo) GetModelRoute(_ context.Context, id int64) (*model.ModelRoute, error) {
	for i := range s.items {
		if s.items[i].ID == id {
			return &s.items[i], nil
		}
	}
	return nil, nil
}

func (s *stubRepo) CreateModelRoute(_ context.Context, input model.CreateModelRouteInput) (*model.ModelRoute, error) {
	item := model.ModelRoute{
		ID:          1,
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		DisplayName: input.DisplayName,
		RouteType:   input.RouteType,
		Region:      input.Region,
		Tier:        input.Tier,
		Env:         input.Env,
		Priority:    input.Priority,
		Enabled:     boolValue(input.Enabled),
		Status:      input.Status,
		Extra:       input.Extra,
	}
	return &item, nil
}

func (s *stubRepo) UpdateModelRoute(_ context.Context, id int64, input model.UpdateModelRouteInput) (*model.ModelRoute, error) {
	item := model.ModelRoute{
		ID:          id,
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		DisplayName: input.DisplayName,
		RouteType:   input.RouteType,
		Region:      input.Region,
		Tier:        input.Tier,
		Env:         input.Env,
		Priority:    input.Priority,
		Enabled:     boolValue(input.Enabled),
		Status:      input.Status,
		Extra:       input.Extra,
	}
	return &item, nil
}

func (s *stubRepo) DeleteModelRoute(_ context.Context, _ int64) error {
	return nil
}

func TestServiceCreateDefaults(t *testing.T) {
	service := NewService(&stubRepo{})

	route, err := service.Create(context.Background(), model.CreateModelRouteInput{
		ModelID:    "nano-banana-2",
		Capability: model.CapabilityImage,
		Operation:  model.OperationGenerate,
		AbilityKey: "google_nano_banana_2",
		AlgoType:   "txt_2_img",
	})
	if err != nil {
		t.Fatalf("create route: %v", err)
	}

	if route.Status != model.ModelRouteStatusActive {
		t.Fatalf("expected default status active, got %s", route.Status)
	}
	if route.DisplayName != "nano-banana-2" {
		t.Fatalf("expected display name fallback to model_id, got %s", route.DisplayName)
	}
	if route.RouteType != model.RouteTypeDirect {
		t.Fatalf("expected default route type direct, got %s", route.RouteType)
	}
	if route.Priority != model.DefaultRoutePriority {
		t.Fatalf("expected default priority %d, got %d", model.DefaultRoutePriority, route.Priority)
	}
	if !route.Enabled {
		t.Fatal("expected enabled to default true")
	}
}

func TestServiceCreateRequiresModelID(t *testing.T) {
	service := NewService(&stubRepo{})

	_, err := service.Create(context.Background(), model.CreateModelRouteInput{
		Capability: model.CapabilityImage,
		Operation:  model.OperationGenerate,
		AbilityKey: "google_nano_banana_2",
	})
	if err == nil {
		t.Fatal("expected validation error")
	}
}

func TestServiceCreatePreservesExplicitRouteSettings(t *testing.T) {
	service := NewService(&stubRepo{})
	enabled := false

	route, err := service.Create(context.Background(), model.CreateModelRouteInput{
		ModelID:    "nano-banana-2",
		Capability: model.CapabilityImage,
		Operation:  model.OperationGenerate,
		AbilityKey: "google_nano_banana_2",
		RouteType:  model.RouteTypeScheduler,
		Region:     "us-east-1",
		Tier:       "premium",
		Env:        "prod",
		Priority:   250,
		Enabled:    &enabled,
	})
	if err != nil {
		t.Fatalf("create route: %v", err)
	}

	if route.RouteType != model.RouteTypeScheduler {
		t.Fatalf("expected scheduler route type, got %s", route.RouteType)
	}
	if route.Region != "us-east-1" || route.Tier != "premium" || route.Env != "prod" {
		t.Fatalf("expected route metadata to be preserved, got region=%s tier=%s env=%s", route.Region, route.Tier, route.Env)
	}
	if route.Priority != 250 {
		t.Fatalf("expected priority 250, got %d", route.Priority)
	}
	if route.Enabled {
		t.Fatal("expected route to remain disabled")
	}
}

func boolValue(value *bool) bool {
	if value == nil {
		return false
	}
	return *value
}
