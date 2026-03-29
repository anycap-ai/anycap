package idresolver

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

var (
	ErrExternalIDInvalid  = fmt.Errorf("external id is invalid")
	ErrExternalIDNotFound = fmt.Errorf("external id is not found")
	ErrInternalIDNotFound = fmt.Errorf("internal id is not found")
)

// IDResolver resolves inbound external IDs to internal IDs.
type IDResolver interface {
	ResolveDriveNodeID(ctx context.Context, externalID string) (int64, error)
	ResolveUploadSessionID(ctx context.Context, externalID string) (int64, error)
	ResolvePageSiteID(ctx context.Context, externalID string) (int64, error)
	ResolvePageVersionID(ctx context.Context, externalID string) (int64, error)
	ResolveModelRouteID(ctx context.Context, externalID string) (int64, error)
}

// PassthroughIDResolver is a no-DB resolver that just parses int64 from strings.
// Used in stub runtime mode and tests.
type PassthroughIDResolver struct{}

func (PassthroughIDResolver) ResolveDriveNodeID(_ context.Context, raw string) (int64, error) {
	return passthroughResolve(raw)
}
func (PassthroughIDResolver) ResolveUploadSessionID(_ context.Context, raw string) (int64, error) {
	return passthroughResolve(raw)
}
func (PassthroughIDResolver) ResolvePageSiteID(_ context.Context, raw string) (int64, error) {
	return passthroughResolve(raw)
}
func (PassthroughIDResolver) ResolvePageVersionID(_ context.Context, raw string) (int64, error) {
	return passthroughResolve(raw)
}
func (PassthroughIDResolver) ResolveModelRouteID(_ context.Context, raw string) (int64, error) {
	return passthroughResolve(raw)
}

func passthroughResolve(raw string) (int64, error) {
	id, err := handlers.ParsePathID(raw)
	if err != nil {
		return 0, fmt.Errorf("%w: %v", ErrExternalIDInvalid, err)
	}
	return id, nil
}

// PostgresExternalIDMapper implements both IDResolver and presenter.IDMapper
// using the database for lookups.
type PostgresExternalIDMapper struct {
	db sqlstore.DBTX
}

func NewPostgresExternalIDMapper(db sqlstore.DBTX) *PostgresExternalIDMapper {
	return &PostgresExternalIDMapper{db: db}
}

// --- IDResolver methods (inbound) ---

func (m *PostgresExternalIDMapper) ResolveDriveNodeID(ctx context.Context, externalID string) (int64, error) {
	return m.resolveInternalIDByExternalID(ctx, "drive_nodes", externalID, externalid.PrefixDriveNode, "deleted_at IS NULL")
}

func (m *PostgresExternalIDMapper) ResolveUploadSessionID(ctx context.Context, externalID string) (int64, error) {
	return m.resolveInternalIDByExternalID(ctx, "upload_sessions", externalID, externalid.PrefixUploadSession, "")
}

func (m *PostgresExternalIDMapper) ResolvePageSiteID(ctx context.Context, externalID string) (int64, error) {
	return m.resolveInternalIDByExternalID(ctx, "page_sites", externalID, externalid.PrefixPageSite, "deleted_at IS NULL")
}

func (m *PostgresExternalIDMapper) ResolvePageVersionID(ctx context.Context, externalID string) (int64, error) {
	return m.resolveInternalIDByExternalID(ctx, "page_versions", externalID, externalid.PrefixPageVersion, "")
}

func (m *PostgresExternalIDMapper) ResolveModelRouteID(ctx context.Context, externalID string) (int64, error) {
	return m.resolveInternalIDByExternalID(ctx, "anycap_model_routes", externalID, externalid.PrefixModelRoute, "")
}

// --- IDMapper methods (outbound) ---

func (m *PostgresExternalIDMapper) ResolveUserExternalID(ctx context.Context, internalUserID string) (string, error) {
	mapping, err := m.ResolveUserExternalIDs(ctx, []string{internalUserID})
	if err != nil {
		return "", err
	}
	value := mapping[internalUserID]
	if value == "" {
		return "", fmt.Errorf("%w: user_id=%s", ErrInternalIDNotFound, internalUserID)
	}
	return value, nil
}

func (m *PostgresExternalIDMapper) ResolveSpaceExternalID(ctx context.Context, internalSpaceID int64) (string, error) {
	mapping, err := m.ResolveSpaceExternalIDs(ctx, []int64{internalSpaceID})
	if err != nil {
		return "", err
	}
	value := mapping[internalSpaceID]
	if value == "" {
		return "", fmt.Errorf("%w: space_id=%d", ErrInternalIDNotFound, internalSpaceID)
	}
	return value, nil
}

func (m *PostgresExternalIDMapper) ResolveDriveNodeExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error) {
	return m.resolveExternalIDsByInt64IDs(ctx, "drive_nodes", "id", "external_id", "deleted_at IS NULL", internalIDs)
}

func (m *PostgresExternalIDMapper) ResolveUploadSessionExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error) {
	return m.resolveExternalIDsByInt64IDs(ctx, "upload_sessions", "id", "external_id", "", internalIDs)
}

func (m *PostgresExternalIDMapper) ResolvePageSiteExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error) {
	return m.resolveExternalIDsByInt64IDs(ctx, "page_sites", "id", "external_id", "deleted_at IS NULL", internalIDs)
}

func (m *PostgresExternalIDMapper) ResolvePageVersionExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error) {
	return m.resolveExternalIDsByInt64IDs(ctx, "page_versions", "id", "external_id", "", internalIDs)
}

func (m *PostgresExternalIDMapper) ResolveModelRouteExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error) {
	return m.resolveExternalIDsByInt64IDs(ctx, "anycap_model_routes", "id", "external_id", "", internalIDs)
}

func (m *PostgresExternalIDMapper) ResolveSpaceExternalIDs(ctx context.Context, internalIDs []int64) (map[int64]string, error) {
	return m.resolveExternalIDsByInt64IDs(ctx, "spaces", "id", "external_id", "", internalIDs)
}

func (m *PostgresExternalIDMapper) ResolveUserExternalIDs(ctx context.Context, internalUserIDs []string) (map[string]string, error) {
	if len(internalUserIDs) == 0 {
		return map[string]string{}, nil
	}

	intIDs := make([]int64, 0, len(internalUserIDs))
	byInt64 := make(map[int64][]string, len(internalUserIDs))
	for _, raw := range internalUserIDs {
		userID := strings.TrimSpace(raw)
		if userID == "" {
			continue
		}
		numericID, err := strconv.ParseInt(userID, 10, 64)
		if err != nil {
			continue
		}
		intIDs = append(intIDs, numericID)
		byInt64[numericID] = append(byInt64[numericID], userID)
	}
	intIDs = uniqueInt64(intIDs)
	if len(intIDs) == 0 {
		return map[string]string{}, nil
	}

	rawMap, err := m.resolveExternalIDsByInt64IDs(ctx, "users", "id", "external_id", "", intIDs)
	if err != nil {
		return nil, err
	}

	result := make(map[string]string, len(internalUserIDs))
	for intID, externalID := range rawMap {
		for _, userID := range byInt64[intID] {
			result[userID] = externalID
		}
	}
	return result, nil
}

// --- internal helpers ---

func (m *PostgresExternalIDMapper) resolveInternalIDByExternalID(ctx context.Context, table string, rawExternalID string, prefix string, whereExpr string) (int64, error) {
	externalID := strings.TrimSpace(rawExternalID)
	if err := externalid.ValidatePrefix(externalID, prefix); err != nil {
		return 0, fmt.Errorf("%w: %v", ErrExternalIDInvalid, err)
	}

	query := fmt.Sprintf("SELECT id FROM %s WHERE external_id = $1", table)
	if whereExpr != "" {
		query += " AND " + whereExpr
	}

	var id int64
	err := m.db.QueryRowContext(ctx, query, externalID).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("%w: %s", ErrExternalIDNotFound, externalID)
		}
		return 0, err
	}
	return id, nil
}

func (m *PostgresExternalIDMapper) resolveExternalIDsByInt64IDs(ctx context.Context, table string, idColumn string, externalIDColumn string, whereExpr string, ids []int64) (map[int64]string, error) {
	if len(ids) == 0 {
		return map[int64]string{}, nil
	}

	uniqueIDs := uniqueInt64(ids)
	placeholders := make([]string, 0, len(uniqueIDs))
	args := make([]any, 0, len(uniqueIDs))
	for idx, id := range uniqueIDs {
		placeholders = append(placeholders, fmt.Sprintf("$%d", idx+1))
		args = append(args, id)
	}

	query := fmt.Sprintf(
		"SELECT %s, %s FROM %s WHERE %s IN (%s)",
		idColumn,
		externalIDColumn,
		table,
		idColumn,
		strings.Join(placeholders, ","),
	)
	if whereExpr != "" {
		query += " AND " + whereExpr
	}

	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[int64]string, len(uniqueIDs))
	for rows.Next() {
		var (
			id         int64
			externalID string
		)
		if err := rows.Scan(&id, &externalID); err != nil {
			return nil, err
		}
		result[id] = externalID
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return result, nil
}

func uniqueInt64(ids []int64) []int64 {
	if len(ids) <= 1 {
		return ids
	}
	seen := make(map[int64]struct{}, len(ids))
	result := make([]int64, 0, len(ids))
	for _, id := range ids {
		if _, exists := seen[id]; exists {
			continue
		}
		seen[id] = struct{}{}
		result = append(result, id)
	}
	return result
}
