package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ArtifactIngestClient interface {
	Ingest(ctx context.Context, req model.ArtifactIngestRequest) (model.ArtifactIngestResult, error)
}
