package feedback

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
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
	fb.Diagnostics = normalizeFeedbackDiagnostics(fb)
	if fb.Diagnostics.Stage != "" && !validFeedbackStage(fb.Diagnostics.Stage) {
		return "", fmt.Errorf("%w: invalid diagnostics stage", model.ErrInvalidParam)
	}
	if diagnosticsJSON, err := diagnosticsMap(fb.Diagnostics); err == nil && len(diagnosticsJSON) > 0 {
		if fb.Metadata == nil {
			fb.Metadata = make(map[string]any)
		}
		fb.Metadata["diagnostics"] = diagnosticsJSON
	}

	// Inject server environment into metadata for notification context.
	if s.env != "" {
		if fb.Metadata == nil {
			fb.Metadata = make(map[string]any)
		}
		fb.Metadata["env"] = s.env
	}

	if err := s.repo.Insert(ctx, fb); err != nil {
		logging.WithError(err).WithField("feedback_id", fb.ID).Error("feedback failed to persist")
		return "", model.ErrInternal
	}

	// Fire-and-forget notification.
	if s.notifier != nil {
		go func() {
			if err := s.notifier.Notify(context.Background(), fb); err != nil {
				logging.WithError(err).WithField("feedback_id", fb.ID).Warn("feedback notification failed")
			}
		}()
	}

	return fb.ID, nil
}

func normalizeFeedbackDiagnostics(fb model.Feedback) model.FeedbackDiagnostics {
	diagnostics := fb.Diagnostics
	if diagnostics.RequestID == "" {
		diagnostics.RequestID = fb.RequestID
	}
	if diagnostics.TraceID == "" && fb.Metadata != nil {
		if value, ok := fb.Metadata["trace_id"].(string); ok {
			diagnostics.TraceID = value
		}
	}
	if diagnostics.TaskID == "" && fb.Context != nil {
		if value, ok := fb.Context["task_id"].(string); ok {
			diagnostics.TaskID = value
		}
	}
	return diagnostics
}

func validFeedbackStage(stage string) bool {
	switch stage {
	case "prepare", "submit", "poll", "decode_result", "validate_result", "publish", "billing":
		return true
	default:
		return false
	}
}

func diagnosticsMap(diagnostics model.FeedbackDiagnostics) (map[string]any, error) {
	data, err := json.Marshal(diagnostics)
	if err != nil {
		return nil, err
	}
	var out map[string]any
	if err := json.Unmarshal(data, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func generateID() string {
	return externalid.Generate(externalid.PrefixFeedback)
}
