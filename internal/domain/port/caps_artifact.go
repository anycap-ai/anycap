package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CapsArtifactRepository interface {
	Create(ctx context.Context, input model.CapsArtifact) (*model.CapsArtifact, error)
	MarkReady(ctx context.Context, id int64, storageObjectID int64, sourceMIME string, sourceSize int64, readyAt time.Time) (*model.CapsArtifact, error)
	MarkFailed(ctx context.Context, id int64, errorCode string, errorMessage string) (*model.CapsArtifact, error)
}
