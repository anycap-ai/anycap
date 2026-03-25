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
