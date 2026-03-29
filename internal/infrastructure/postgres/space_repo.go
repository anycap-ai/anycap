package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type SpaceRepo struct {
	db sqlstore.DBTX
}

func NewSpaceRepo(db sqlstore.DBTX) *SpaceRepo {
	return &SpaceRepo{db: db}
}

func (r *SpaceRepo) GetByOwnerUserID(ctx context.Context, ownerUserID string) (*model.Space, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("space repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, owner_user_id, name, created_at
		FROM spaces
		WHERE owner_user_id = $1
	`, ownerUserID)

	space, err := scanSpace(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get space by owner user id: %w", err)
	}
	return space, nil
}

func (r *SpaceRepo) CreatePersonalSpace(ctx context.Context, ownerUserID, name string) (*model.Space, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("space repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO spaces (owner_user_id, name)
		VALUES ($1, $2)
		RETURNING id, owner_user_id, name, created_at
	`, ownerUserID, name)

	space, err := scanSpace(row)
	if err != nil {
		return nil, fmt.Errorf("create personal space: %w", err)
	}
	return space, nil
}

func scanSpace(row rowScanner) (*model.Space, error) {
	var space model.Space
	if err := row.Scan(&space.ID, &space.OwnerUserID, &space.Name, &space.CreatedAt); err != nil {
		return nil, err
	}
	return &space, nil
}
