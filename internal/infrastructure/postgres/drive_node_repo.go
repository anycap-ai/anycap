package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"path"
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

func (r *DriveNodeRepo) ResolveByPath(ctx context.Context, spaceID int64, nodePath string) (*model.DriveNode, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	cleaned := path.Clean(strings.TrimSpace(nodePath))
	if cleaned == "." || cleaned == "/" || !strings.HasPrefix(cleaned, "/") {
		return nil, fmt.Errorf("drive path must be absolute and target a node")
	}

	segments := strings.Split(strings.TrimPrefix(cleaned, "/"), "/")
	rows, err := r.db.QueryContext(ctx, `
		WITH RECURSIVE segments AS (
			SELECT seg, ord::INT AS ord
			FROM unnest($2::TEXT[]) WITH ORDINALITY AS u(seg, ord)
		),
		walk AS (
			SELECT
				dn.id,
				dn.space_id,
				dn.parent_id,
				dn.kind,
				dn.name,
				dn.storage_object_id,
				dn.size,
				dn.mime,
				dn.edge_version,
				dn.created_by,
				dn.created_at,
				dn.updated_at,
				dn.deleted_at,
				s.ord
			FROM segments s
			JOIN drive_nodes dn
				ON s.ord = 1
				AND dn.space_id = $1
				AND dn.parent_id IS NULL
				AND dn.name = s.seg
				AND dn.deleted_at IS NULL

			UNION ALL

			SELECT
				child.id,
				child.space_id,
				child.parent_id,
				child.kind,
				child.name,
				child.storage_object_id,
				child.size,
				child.mime,
				child.edge_version,
				child.created_by,
				child.created_at,
				child.updated_at,
				child.deleted_at,
				s.ord
			FROM walk w
			JOIN segments s
				ON s.ord = w.ord + 1
			JOIN drive_nodes child
				ON child.space_id = $1
				AND child.parent_id = w.id
				AND child.name = s.seg
				AND child.deleted_at IS NULL
		)
		SELECT
			id,
			space_id,
			parent_id,
			kind,
			name,
			storage_object_id,
			size,
			mime,
			edge_version,
			created_by,
			created_at,
			updated_at,
			deleted_at
		FROM walk
		WHERE ord = array_length($2::TEXT[], 1)
	`, spaceID, segments)
	if err != nil {
		return nil, fmt.Errorf("resolve drive node by path: %w", err)
	}
	defer rows.Close()

	var matches []*model.DriveNode
	for rows.Next() {
		node, scanErr := scanDriveNode(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan drive node: %w", scanErr)
		}
		matches = append(matches, node)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate resolved drive nodes: %w", err)
	}
	if len(matches) == 0 {
		return nil, nil
	}
	if len(matches) > 1 {
		return nil, model.ErrConflict(fmt.Sprintf("drive path %q is ambiguous", cleaned))
	}
	return matches[0], nil
}

func (r *DriveNodeRepo) ListByParent(ctx context.Context, filter model.ListDriveNodesFilter) ([]model.DriveNode, int, error) {
	if r == nil || r.db == nil {
		return nil, 0, fmt.Errorf("drive node repo db is not configured")
	}

	baseWhere := `space_id = $1
		  AND (($2::bigint IS NULL AND parent_id IS NULL) OR parent_id = $2)
		  AND deleted_at IS NULL`
	args := []any{filter.SpaceID, filter.ParentID}
	if filter.Name != nil {
		baseWhere += " AND name = $3"
		args = append(args, strings.TrimSpace(*filter.Name))
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM drive_nodes WHERE " + baseWhere
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count drive nodes: %w", err)
	}

	limitPos := len(args) + 1
	offsetPos := len(args) + 2
	query := fmt.Sprintf(`
		SELECT id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at,
			EXISTS(SELECT 1 FROM drive_share_links dsl WHERE dsl.node_id = drive_nodes.id AND dsl.status = 'active') AS has_share
		FROM drive_nodes
		WHERE %s
		ORDER BY kind DESC, name ASC, id ASC
		LIMIT $%d OFFSET $%d
	`, baseWhere, limitPos, offsetPos)

	args = append(args, filter.Limit, filter.Offset)
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list drive nodes by parent: %w", err)
	}
	defer rows.Close()

	items := make([]model.DriveNode, 0)
	for rows.Next() {
		node, scanErr := scanDriveNodeWithShare(rows)
		if scanErr != nil {
			return nil, 0, fmt.Errorf("scan drive node: %w", scanErr)
		}
		items = append(items, *node)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate drive nodes: %w", err)
	}
	return items, total, nil
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

func (r *DriveNodeRepo) SoftDeleteSubtree(ctx context.Context, spaceID, rootID int64) (*model.SoftDeleteResult, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		WITH RECURSIVE subtree AS (
			SELECT id
			FROM drive_nodes
			WHERE space_id = $1 AND id = $2 AND deleted_at IS NULL
			UNION ALL
			SELECT n.id
			FROM drive_nodes n
			INNER JOIN subtree s ON n.parent_id = s.id
			WHERE n.space_id = $1 AND n.deleted_at IS NULL
		),
		deleted AS (
			UPDATE drive_nodes
			SET deleted_at = NOW(),
				updated_at = NOW(),
				edge_version = edge_version + 1
			WHERE id IN (SELECT id FROM subtree)
			  AND deleted_at IS NULL
			RETURNING id, kind, storage_object_id, COALESCE(size, 0) AS size
		)
		SELECT id, kind, storage_object_id IS NOT NULL AS has_storage, size
		FROM deleted
	`, spaceID, rootID)
	if err != nil {
		return nil, fmt.Errorf("soft delete drive subtree: %w", err)
	}
	defer rows.Close()

	result := &model.SoftDeleteResult{}
	for rows.Next() {
		var (
			id         int64
			kind       string
			hasStorage bool
			size       int64
		)
		if err := rows.Scan(&id, &kind, &hasStorage, &size); err != nil {
			return nil, fmt.Errorf("scan soft delete result row: %w", err)
		}
		result.DeletedCount++
		if kind == string(model.DriveNodeKindFolder) {
			result.DirIDs = append(result.DirIDs, id)
			result.RealNodeCount++ // folders are always "real"
		} else {
			result.FileIDs = append(result.FileIDs, id)
			if hasStorage {
				result.TotalBytes += size
				result.RealNodeCount++
			}
		}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate soft delete result rows: %w", err)
	}

	return result, nil
}

// SoftDeleteSubtreeWithStorageDecrement atomically soft-deletes a drive subtree,
// decrements the space's storage counters, and returns R2 object keys for cleanup.
// This replaces the non-atomic sequence of SoftDeleteSubtree + DecrementDriveStorage.
func (r *DriveNodeRepo) SoftDeleteSubtreeWithStorageDecrement(ctx context.Context, spaceID, rootID int64) (*model.SoftDeleteResult, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive node repo db is not configured")
	}

	rows, err := r.db.QueryContext(ctx, `
		WITH RECURSIVE subtree AS (
			SELECT id
			FROM drive_nodes
			WHERE space_id = $1 AND id = $2 AND deleted_at IS NULL
			UNION ALL
			SELECT n.id
			FROM drive_nodes n
			INNER JOIN subtree s ON n.parent_id = s.id
			WHERE n.space_id = $1 AND n.deleted_at IS NULL
		),
		deleted AS (
			UPDATE drive_nodes
			SET deleted_at = NOW(),
				updated_at = NOW(),
				edge_version = edge_version + 1
			WHERE id IN (SELECT id FROM subtree)
			  AND deleted_at IS NULL
			RETURNING id, kind, storage_object_id, COALESCE(size, 0) AS size
		),
		deleted_with_keys AS (
			SELECT d.id, d.kind,
				d.storage_object_id IS NOT NULL AS has_storage,
				d.size,
				so.object_key
			FROM deleted d
			LEFT JOIN storage_objects so ON d.storage_object_id = so.id
		),
		aggregated AS (
			SELECT
				COALESCE(SUM(CASE WHEN has_storage THEN size ELSE 0 END), 0) AS total_bytes,
				COALESCE(COUNT(*) FILTER (WHERE kind = 'folder' OR has_storage), 0) AS real_node_count
			FROM deleted_with_keys
		),
		space_decrement AS (
			UPDATE spaces
			SET storage_used_bytes = GREATEST(0, storage_used_bytes - (SELECT total_bytes FROM aggregated)),
				drive_node_count = GREATEST(0, drive_node_count - (SELECT real_node_count FROM aggregated))
			WHERE id = $1
			RETURNING id
		)
		SELECT dwk.id, dwk.kind, dwk.has_storage, dwk.size, dwk.object_key
		FROM deleted_with_keys dwk
	`, spaceID, rootID)
	if err != nil {
		return nil, fmt.Errorf("soft delete drive subtree with storage decrement: %w", err)
	}
	defer rows.Close()

	result := &model.SoftDeleteResult{}
	for rows.Next() {
		var (
			id         int64
			kind       string
			hasStorage bool
			size       int64
			objectKey  *string
		)
		if err := rows.Scan(&id, &kind, &hasStorage, &size, &objectKey); err != nil {
			return nil, fmt.Errorf("scan soft delete with decrement result row: %w", err)
		}
		result.DeletedCount++
		if kind == string(model.DriveNodeKindFolder) {
			result.DirIDs = append(result.DirIDs, id)
			result.RealNodeCount++
		} else {
			result.FileIDs = append(result.FileIDs, id)
			if hasStorage {
				result.TotalBytes += size
				result.RealNodeCount++
			}
		}
		if objectKey != nil {
			result.ObjectKeys = append(result.ObjectKeys, *objectKey)
		}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate soft delete with decrement result rows: %w", err)
	}

	return result, nil
}

// SoftDeleteOrphanFileNodes soft-deletes file nodes that never completed upload.
// These are identified by storage_object_id IS NULL. No counter decrement needed.
func (r *DriveNodeRepo) SoftDeleteOrphanFileNodes(ctx context.Context, spaceID int64, nodeIDs []int64) (int64, error) {
	if r == nil || r.db == nil {
		return 0, fmt.Errorf("drive node repo db is not configured")
	}
	if len(nodeIDs) == 0 {
		return 0, nil
	}

	// Build IN clause with positional args ($2, $3, ...)
	placeholders := make([]string, len(nodeIDs))
	args := make([]any, 0, len(nodeIDs)+1)
	args = append(args, spaceID)
	for i, id := range nodeIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE drive_nodes
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE space_id = $1
		  AND id IN (%s)
		  AND storage_object_id IS NULL
		  AND deleted_at IS NULL
	`, strings.Join(placeholders, ", "))

	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return 0, fmt.Errorf("soft delete orphan file nodes: %w", err)
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("rows affected for soft delete orphan file nodes: %w", err)
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

func scanDriveNodeWithShare(row rowScanner) (*model.DriveNode, error) {
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
		&node.HasShare,
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
