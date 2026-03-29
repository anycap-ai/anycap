package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CapsTaskArtifactRepository interface {
	Create(ctx context.Context, input model.CapsTaskArtifact) (*model.CapsTaskArtifact, error)
}
