package feedbackstore

import (
	"context"
	"encoding/json"
	"sync"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

// FeedbackDBRepo persists feedback entries to PostgreSQL.
type FeedbackDBRepo struct {
	db sqlstore.DBTX
}

// NewFeedbackDBRepo creates a postgres-backed feedback repository.
func NewFeedbackDBRepo(db sqlstore.DBTX) *FeedbackDBRepo {
	return &FeedbackDBRepo{db: db}
}

func (r *FeedbackDBRepo) Insert(ctx context.Context, fb model.Feedback) error {
	contextJSON, err := marshalJSONB(fb.Context)
	if err != nil {
		return err
	}
	metadataJSON, err := marshalJSONB(fb.Metadata)
	if err != nil {
		return err
	}

	numericUserID, err := userid.Parse(fb.UserID)
	if err != nil {
		return err
	}

	var requestID *string
	if fb.RequestID != "" {
		requestID = &fb.RequestID
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO feedback (id, user_id, type, message, context, request_id, metadata, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, fb.ID, numericUserID, fb.Type, fb.Message, contextJSON, requestID, metadataJSON, fb.CreatedAt)
	return err
}

func marshalJSONB(v any) ([]byte, error) {
	if v == nil {
		return nil, nil
	}
	return json.Marshal(v)
}

// MemoryFeedbackRepo is an in-memory feedback repository for stub/test use.
type MemoryFeedbackRepo struct {
	mu    sync.Mutex
	items []model.Feedback
}

func NewMemoryFeedbackRepo() *MemoryFeedbackRepo {
	return &MemoryFeedbackRepo{}
}

func (r *MemoryFeedbackRepo) Insert(_ context.Context, fb model.Feedback) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.items = append(r.items, fb)
	return nil
}

// Count returns the number of stored feedback entries (test helper).
func (r *MemoryFeedbackRepo) Count() int {
	r.mu.Lock()
	defer r.mu.Unlock()
	return len(r.items)
}
