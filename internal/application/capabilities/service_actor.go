package capabilities

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
)

type actorContext struct {
	UserID int64
	Space  *model.Space
}

func (s *Service) resolveActor(ctx context.Context) (actorContext, error) {
	raw := strings.TrimSpace(middleware.UserIDFromContext(ctx))
	if raw == "" {
		return actorContext{}, fmt.Errorf("user_id is required")
	}

	userID, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || userID <= 0 {
		return actorContext{}, fmt.Errorf("invalid user_id")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return actorContext{}, err
	}

	return actorContext{UserID: userID, Space: space}, nil
}
