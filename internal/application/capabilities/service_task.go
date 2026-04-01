package capabilities

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type understandTaskInput struct {
	SpaceID     int64
	UserID      string
	Capability  string
	RequestMeta map[string]any
	Artifacts   []model.CapsTaskArtifact
}

func (s *Service) runUnderstandTask(
	ctx context.Context,
	input understandTaskInput,
	invoke func(context.Context) (model.UnderstandResult, error),
) (model.UnderstandResult, error) {
	logger := logging.WithContext(ctx).WithField("capability", input.Capability)
	task, err := s.createTask(ctx, input.SpaceID, input.UserID, input.Capability, input.RequestMeta)
	if err != nil {
		logger.WithError(err).Error("create capabilities task failed")
		return model.UnderstandResult{}, err
	}
	if err := s.writeTaskArtifacts(ctx, task.ID, input.Artifacts); err != nil {
		logger.WithFields(logging.Fields{"task_id": task.ID}).WithError(err).Error("write capabilities task artifacts failed")
		return model.UnderstandResult{}, err
	}
	if err := s.startTask(ctx, task.ID); err != nil {
		logger.WithFields(logging.Fields{"task_id": task.ID}).WithError(err).Warn("start capabilities task failed")
	}

	result, err := invoke(ctx)
	if err != nil {
		if finishErr := s.finishTask(ctx, task.ID, model.CapsTaskStatusFailed, map[string]any{"error": err.Error()}); finishErr != nil {
			logger.WithFields(logging.Fields{"task_id": task.ID}).WithError(finishErr).Warn("finish failed capabilities task failed")
		}
		return model.UnderstandResult{}, err
	}

	if err := s.finishTask(ctx, task.ID, model.CapsTaskStatusSucceeded, buildUnderstandResultMeta(result)); err != nil {
		logger.WithFields(logging.Fields{"task_id": task.ID}).WithError(err).Warn("finish successful capabilities task failed")
	}
	return result, nil
}

func (s *Service) createTask(ctx context.Context, spaceID int64, userID, capability string, requestMeta map[string]any) (*model.CapsTask, error) {
	if s.capsTaskRepo == nil {
		return &model.CapsTask{ID: 0}, nil
	}
	return s.capsTaskRepo.Create(ctx, model.CapsTask{
		SpaceID:     spaceID,
		Capability:  capability,
		Status:      model.CapsTaskStatusPending,
		RequestMeta: requestMeta,
		CreatedBy:   userID,
	})
}

func (s *Service) writeTaskArtifacts(ctx context.Context, taskID int64, artifacts []model.CapsTaskArtifact) error {
	if s.capsTaskArtifactRepo == nil || taskID <= 0 || len(artifacts) == 0 {
		return nil
	}
	for i := range artifacts {
		artifact := artifacts[i]
		artifact.TaskID = taskID
		if _, err := s.capsTaskArtifactRepo.Create(ctx, artifact); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) finishTask(ctx context.Context, taskID int64, status model.CapsTaskStatus, resultMeta map[string]any) error {
	if s.capsTaskRepo == nil || taskID <= 0 {
		return nil
	}
	now := s.now()
	return s.capsTaskRepo.UpdateStatus(ctx, taskID, status, resultMeta, &now)
}

func (s *Service) startTask(ctx context.Context, taskID int64) error {
	if s.capsTaskRepo == nil || taskID <= 0 {
		return nil
	}
	return s.capsTaskRepo.UpdateStatus(ctx, taskID, model.CapsTaskStatusRunning, nil, nil)
}
