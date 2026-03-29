package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type DriveNodeRepo struct {
	db sqlstore.DBTX
}

func NewDriveNodeRepo(db sqlstore.DBTX) *DriveNodeRepo {
	return &DriveNodeRepo{db: db}
}

func (r *DriveNodeRepo) CreateFolder(ctx context.Context, input model.CreateDriveFolderInput) (*model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO drive_nodes (space_id, parent_id, kind, name, created_by)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
	`, input.SpaceID, input.ParentID, string(model.DriveNodeKindFolder), strings.TrimSpace(input.Name), input.CreatedBy)

	node, err := scanDriveNode(row)
	if err != nil {
		return nil, fmt.Errorf("create drive folder: %w", err)
	}
	return node, nil
}

func (r *DriveNodeRepo) CreateFile(ctx context.Context, input model.CreateDriveFileInput) (*model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO drive_nodes (space_id, parent_id, kind, name, size, mime, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
	`, input.SpaceID, input.ParentID, string(model.DriveNodeKindFile), strings.TrimSpace(input.Name), input.Size, input.MIME, input.CreatedBy)

	node, err := scanDriveNode(row)
	if err != nil {
		return nil, fmt.Errorf("create drive file: %w", err)
	}
	return node, nil
}

func (r *DriveNodeRepo) GetByID(ctx context.Context, id int64) (*model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
		FROM drive_nodes
		WHERE id = $1 AND deleted_at IS NULL
	`, id)

	node, err := scanDriveNode(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get drive node: %w", err)
	}
	return node, nil
}

func (r *DriveNodeRepo) ListByParent(ctx context.Context, filter model.ListDriveNodesFilter) ([]model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
		FROM drive_nodes
		WHERE space_id = $1
		  AND (($2::bigint IS NULL AND parent_id IS NULL) OR parent_id = $2)
		  AND deleted_at IS NULL
		ORDER BY kind DESC, name ASC, id ASC
	`, filter.SpaceID, filter.ParentID)
	if err != nil {
		return nil, fmt.Errorf("list drive nodes by parent: %w", err)
	}
	defer rows.Close()

	items := make([]model.DriveNode, 0)
	for rows.Next() {
		node, scanErr := scanDriveNode(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan drive node: %w", scanErr)
		}
		items = append(items, *node)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate drive nodes: %w", err)
	}
	return items, nil
}

func (r *DriveNodeRepo) Update(ctx context.Context, input model.UpdateDriveNodeInput) (*model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	existing, err := r.getByIDInSpace(ctx, input.ID, input.SpaceID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, nil
	}

	name := existing.Name
	if input.Name != nil {
		name = strings.TrimSpace(*input.Name)
	}

	parentID := existing.ParentID
	if input.UpdateParent {
		parentID = input.ParentID
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE drive_nodes
		SET name = $3,
			parent_id = $4,
			edge_version = edge_version + 1,
			updated_at = NOW()
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
		RETURNING id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
	`, input.ID, input.SpaceID, name, parentID)

	node, err := scanDriveNode(row)
	if err != nil {
		return nil, fmt.Errorf("update drive node: %w", err)
	}
	return node, nil
}

func (r *DriveNodeRepo) AttachStorageObject(ctx context.Context, input model.AttachDriveNodeStorageInput) (*model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE drive_nodes
		SET storage_object_id = $3,
			size = $4,
			mime = $5,
			edge_version = edge_version + 1,
			updated_at = NOW()
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
		RETURNING id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
	`, input.NodeID, input.SpaceID, input.StorageObjectID, input.Size, input.MIME)

	node, err := scanDriveNode(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("attach storage object to drive node: %w", err)
	}
	return node, nil
}

func (r *DriveNodeRepo) ExistsInSubtree(ctx context.Context, spaceID, rootID, targetID int64) (bool, error) {
	if r == nil || r.db == nil {
		return false, fmt.Errorf("drive node repo db is not configured")
	}

	var exists bool
	err := r.db.QueryRowContext(ctx, `
		WITH RECURSIVE subtree AS (
			SELECT id
			FROM drive_nodes
			WHERE space_id = $1 AND id = $2 AND deleted_at IS NULL
			UNION ALL
			SELECT n.id
			FROM drive_nodes n
			INNER JOIN subtree s ON n.parent_id = s.id
			WHERE n.space_id = $1 AND n.deleted_at IS NULL
		)
		SELECT EXISTS(SELECT 1 FROM subtree WHERE id = $3)
	`, spaceID, rootID, targetID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check subtree membership: %w", err)
	}
	return exists, nil
}

func (r *DriveNodeRepo) SoftDeleteSubtree(ctx context.Context, spaceID, rootID int64) (int64, error) {
	if r == nil || r.db == nil {
		return 0, fmt.Errorf("drive node repo db is not configured")
	}

	result, err := r.db.ExecContext(ctx, `
		WITH RECURSIVE subtree AS (
			SELECT id
			FROM drive_nodes
			WHERE space_id = $1 AND id = $2 AND deleted_at IS NULL
			UNION ALL
			SELECT n.id
			FROM drive_nodes n
			INNER JOIN subtree s ON n.parent_id = s.id
			WHERE n.space_id = $1 AND n.deleted_at IS NULL
		)
		UPDATE drive_nodes
		SET deleted_at = NOW(),
			updated_at = NOW(),
			edge_version = edge_version + 1
		WHERE id IN (SELECT id FROM subtree)
		  AND deleted_at IS NULL
	`, spaceID, rootID)
	if err != nil {
		return 0, fmt.Errorf("soft delete drive subtree: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("rows affected for soft delete drive subtree: %w", err)
	}
	return affected, nil
}

func (r *DriveNodeRepo) getByIDInSpace(ctx context.Context, id, spaceID int64) (*model.DriveNode, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at
		FROM drive_nodes
		WHERE id = $1 AND space_id = $2 AND deleted_at IS NULL
	`, id, spaceID)

	node, err := scanDriveNode(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get drive node in space: %w", err)
	}
	return node, nil
}

func scanDriveNode(row rowScanner) (*model.DriveNode, error) {
	var (
		node            model.DriveNode
		parentID        sql.NullInt64
		storageObjectID sql.NullInt64
		size            sql.NullInt64
		mime            sql.NullString
		deletedAt       sql.NullTime
		kind            string
	)

	if err := row.Scan(
		&node.ID,
		&node.SpaceID,
		&parentID,
		&kind,
		&node.Name,
		&storageObjectID,
		&size,
		&mime,
		&node.EdgeVersion,
		&node.CreatedBy,
		&node.CreatedAt,
		&node.UpdatedAt,
		&deletedAt,
	); err != nil {
		return nil, err
	}

	node.Kind = model.DriveNodeKind(kind)
	if parentID.Valid {
		node.ParentID = &parentID.Int64
	}
	if storageObjectID.Valid {
		node.StorageObjectID = &storageObjectID.Int64
	}
	if size.Valid {
		node.Size = &size.Int64
	}
	if mime.Valid {
		node.MIME = &mime.String
	}
	if deletedAt.Valid {
		node.DeletedAt = &deletedAt.Time
	}

	return &node, nil
}
