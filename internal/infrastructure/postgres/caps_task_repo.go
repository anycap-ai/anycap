package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type CapsTaskRepo struct {
	db sqlstore.DBTX
}

func NewCapsTaskRepo(db sqlstore.DBTX) *CapsTaskRepo {
	return &CapsTaskRepo{db: db}
}

func (r *CapsTaskRepo) Create(ctx context.Context, input model.CapsTask) (*model.CapsTask, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("caps task repo db is not configured")
	}

	requestMeta, err := marshalJSONMap(input.RequestMeta)
	if err != nil {
		return nil, err
	}
	resultMeta, err := marshalJSONMap(input.ResultMeta)
	if err != nil {
		return nil, err
	}

	row := r.db.QueryRowContext(ctx, `
		INSERT INTO caps_tasks (space_id, capability, status, request_meta, result_meta, created_by, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, space_id, capability, status, request_meta, result_meta, created_by, created_at, completed_at
	`, input.SpaceID, strings.TrimSpace(input.Capability), string(input.Status), requestMeta, resultMeta, strings.TrimSpace(input.CreatedBy), input.CompletedAt)

	item, scanErr := scanCapsTask(row)
	if scanErr != nil {
		return nil, fmt.Errorf("create caps task: %w", scanErr)
	}
	return item, nil
}

func (r *CapsTaskRepo) UpdateStatus(ctx context.Context, id int64, status model.CapsTaskStatus, resultMeta map[string]any, completedAt *time.Time) error {
	if r == nil || r.db == nil {
		return fmt.Errorf("caps task repo db is not configured")
	}

	resultMetaJSON, err := marshalJSONMap(resultMeta)
	if err != nil {
		return err
	}

	result, err := r.db.ExecContext(ctx, `
		UPDATE caps_tasks
		SET status = $2,
			result_meta = $3,
			completed_at = $4
		WHERE id = $1
	`, id, string(status), resultMetaJSON, completedAt)
	if err != nil {
		return fmt.Errorf("update caps task status: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected for update caps task status: %w", err)
	}
	if affected == 0 {
		return fmt.Errorf("caps task not found")
	}
	return nil
}

func scanCapsTask(row rowScanner) (*model.CapsTask, error) {
	var (
		item          model.CapsTask
		status        string
		requestMeta   []byte
		resultMeta    []byte
		completedAt   sql.NullTime
		requestMap    map[string]any
		resultMetaMap map[string]any
	)

	if err := row.Scan(
		&item.ID,
		&item.SpaceID,
		&item.Capability,
		&status,
		&requestMeta,
		&resultMeta,
		&item.CreatedBy,
		&item.CreatedAt,
		&completedAt,
	); err != nil {
		return nil, err
	}

	item.Status = model.CapsTaskStatus(status)
	if len(requestMeta) > 0 {
		if err := json.Unmarshal(requestMeta, &requestMap); err != nil {
			return nil, fmt.Errorf("unmarshal request_meta: %w", err)
		}
		item.RequestMeta = requestMap
	}
	if len(resultMeta) > 0 {
		if err := json.Unmarshal(resultMeta, &resultMetaMap); err != nil {
			return nil, fmt.Errorf("unmarshal result_meta: %w", err)
		}
		item.ResultMeta = resultMetaMap
	}
	if completedAt.Valid {
		item.CompletedAt = &completedAt.Time
	}

	return &item, nil
}

func marshalJSONMap(data map[string]any) ([]byte, error) {
	if data == nil {
		return nil, nil
	}
	encoded, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("marshal json map: %w", err)
	}
	return encoded, nil
}
