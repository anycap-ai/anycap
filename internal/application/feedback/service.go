package feedback

import (
	"context"
	"fmt"
	"log"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

// Service orchestrates feedback submission: persist then notify.
type Service struct {
	repo     port.FeedbackRepository
	notifier port.FeedbackNotifier
	env      string
}

// NewService creates a feedback service.
// notifier may be nil (notifications will be skipped).
func NewService(repo port.FeedbackRepository, notifier port.FeedbackNotifier, env string) *Service {
	return &Service{repo: repo, notifier: notifier, env: env}
}

// Submit validates, persists, and asynchronously notifies about a feedback entry.
func (s *Service) Submit(ctx context.Context, fb model.Feedback) (string, error) {
	if fb.Type != "bug" && fb.Type != "feature" && fb.Type != "other" {
		return "", fmt.Errorf("%w: type must be one of: bug, feature, other", model.ErrInvalidParam)
	}
	if fb.Message == "" {
		return "", fmt.Errorf("%w: message is required", model.ErrInvalidParam)
	}

	fb.ID = generateID()
	fb.CreatedAt = time.Now().UTC()

	// Inject server environment into metadata for notification context.
	if s.env != "" {
		if fb.Metadata == nil {
			fb.Metadata = make(map[string]any)
		}
		fb.Metadata["env"] = s.env
	}

	if err := s.repo.Insert(ctx, fb); err != nil {
		log.Printf("feedback: failed to persist fb=%s: %v", fb.ID, err)
		return "", model.ErrInternal
	}

	// Fire-and-forget notification.
	if s.notifier != nil {
		go func() {
			if err := s.notifier.Notify(context.Background(), fb); err != nil {
				log.Printf("feedback: notification failed for fb=%s: %v", fb.ID, err)
			}
		}()
	}

	return fb.ID, nil
}

// generateID produces a feedback ID like "fb_20260325_<unix_nano_hex>".
func generateID() string {
	now := time.Now().UTC()
	return fmt.Sprintf("fb_%s_%x", now.Format("20060102"), now.UnixNano())
}
