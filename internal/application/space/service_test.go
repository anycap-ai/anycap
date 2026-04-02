package space

import (
	"context"
	"fmt"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeSpaceRepo struct {
	spaces map[int64]*model.Space
	nextID int64
}

func (r *fakeSpaceRepo) GetByOwnerUserID(_ context.Context, ownerUserID int64) (*model.Space, error) {
	if r.spaces == nil {
		return nil, nil
	}
	return r.spaces[ownerUserID], nil
}

func (r *fakeSpaceRepo) CreatePersonalSpace(_ context.Context, ownerUserID int64, name string) (*model.Space, error) {
	if r.spaces == nil {
		r.spaces = map[int64]*model.Space{}
	}
	if _, exists := r.spaces[ownerUserID]; exists {
		return nil, fmt.Errorf("duplicate key")
	}
	r.nextID++
	space := &model.Space{ID: r.nextID, OwnerUserID: ownerUserID, Name: name}
	r.spaces[ownerUserID] = space
	return space, nil
}

func TestGetOrCreatePersonalSpace_Idempotent(t *testing.T) {
	repo := &fakeSpaceRepo{}
	svc := NewService(repo)

	first, err := svc.GetOrCreatePersonalSpace(context.Background(), 1)
	if err != nil {
		t.Fatalf("first call failed: %v", err)
	}
	second, err := svc.GetOrCreatePersonalSpace(context.Background(), 1)
	if err != nil {
		t.Fatalf("second call failed: %v", err)
	}

	if first.ID != second.ID {
		t.Fatalf("expected same space id, got %d and %d", first.ID, second.ID)
	}
}
