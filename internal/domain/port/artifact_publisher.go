package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ArtifactPublisher interface {
	Publish(ctx context.Context, req model.ArtifactPublishRequest) (model.ArtifactPublishResult, error)
}
