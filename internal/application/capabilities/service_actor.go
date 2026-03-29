package capabilities

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

type actorContext struct {
	UserID string
	Space  *model.Space
}

func (s *Service) resolveActor(ctx context.Context) (actorContext, error) {
	userID := strings.TrimSpace(middleware.UserIDFromContext(ctx))
	if userID == "" {
		return actorContext{}, fmt.Errorf("user_id is required")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return actorContext{}, err
	}

	return actorContext{UserID: userID, Space: space}, nil
}
