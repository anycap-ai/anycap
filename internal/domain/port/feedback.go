package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// FeedbackRepository persists feedback entries.
type FeedbackRepository interface {
	Insert(ctx context.Context, fb model.Feedback) error
}

// FeedbackNotifier sends feedback notifications to external channels (e.g. Lark).
type FeedbackNotifier interface {
	Notify(ctx context.Context, fb model.Feedback) error
}
