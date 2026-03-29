package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type DriveShareRepo struct {
	db sqlstore.DBTX
}

func NewDriveShareRepo(db sqlstore.DBTX) *DriveShareRepo {
	return &DriveShareRepo{db: db}
}

func (r *DriveShareRepo) GetActiveByNodeID(ctx context.Context, nodeID int64) (*model.DriveShareLink, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive share repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		SELECT id, node_id, token, status, expires_at, password_hash, password_salt, edge_version, created_at, updated_at
		FROM drive_share_links
		WHERE node_id = $1 AND status = 'active'
	`, nodeID)

	link, err := scanDriveShareLink(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get active drive share link by node id: %w", err)
	}
	return link, nil
}

func (r *DriveShareRepo) Create(ctx context.Context, link model.DriveShareLink) (*model.DriveShareLink, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive share repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO drive_share_links (
			node_id,
			token,
			status,
			expires_at,
			password_hash,
			password_salt,
			edge_version
		)
		VALUES ($1, $2, $3, $4, $5, $6, 1)
		RETURNING id, node_id, token, status, expires_at, password_hash, password_salt, edge_version, created_at, updated_at
	`, link.NodeID, link.Token, string(link.Status), link.ExpiresAt, link.PasswordHash, link.PasswordSalt)

	created, err := scanDriveShareLink(row)
	if err != nil {
		return nil, fmt.Errorf("create drive share link: %w", err)
	}
	return created, nil
}

func (r *DriveShareRepo) Update(ctx context.Context, link model.DriveShareLink) (*model.DriveShareLink, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("drive share repo db is not configured")
	}

	row := r.db.QueryRowContext(ctx, `
		UPDATE drive_share_links
		SET token = $2,
			expires_at = $3,
			password_hash = $4,
			password_salt = $5,
			edge_version = edge_version + 1,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, node_id, token, status, expires_at, password_hash, password_salt, edge_version, created_at, updated_at
	`, link.ID, link.Token, link.ExpiresAt, link.PasswordHash, link.PasswordSalt)

	updated, err := scanDriveShareLink(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("update drive share link: %w", err)
	}
	return updated, nil
}

func (r *DriveShareRepo) RevokeActiveByNodeID(ctx context.Context, nodeID int64) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("drive share repo db is not configured")
	}

	_, err := r.db.ExecContext(ctx, `
		UPDATE drive_share_links
		SET status = 'revoked',
			edge_version = edge_version + 1,
			updated_at = NOW()
		WHERE node_id = $1 AND status = 'active'
	`, nodeID)
	if err != nil {
		return fmt.Errorf("revoke active drive share link by node id: %w", err)
	}
	return nil
}

func scanDriveShareLink(row rowScanner) (*model.DriveShareLink, error) {
	var (
		link         model.DriveShareLink
		status       string
		expiresAt    sql.NullTime
		passwordHash sql.NullString
		passwordSalt sql.NullString
	)

	if err := row.Scan(
		&link.ID,
		&link.NodeID,
		&link.Token,
		&status,
		&expiresAt,
		&passwordHash,
		&passwordSalt,
		&link.EdgeVersion,
		&link.CreatedAt,
		&link.UpdatedAt,
	); err != nil {
		return nil, err
	}

	link.Status = model.DriveShareStatus(status)
	if expiresAt.Valid {
		link.ExpiresAt = &expiresAt.Time
	}
	if passwordHash.Valid {
		link.PasswordHash = &passwordHash.String
	}
	if passwordSalt.Valid {
		link.PasswordSalt = &passwordSalt.String
	}
	return &link, nil
}
