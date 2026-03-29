package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CapsUploadRepository interface {
	Create(ctx context.Context, input model.CapsUpload) (*model.CapsUpload, error)
	GetByID(ctx context.Context, id int64) (*model.CapsUpload, error)
	GetByExternalID(ctx context.Context, externalID string) (*model.CapsUpload, error)
	FindReusable(ctx context.Context, spaceID int64, sha256 string, size int64, mime string) (*model.CapsUpload, error)
	MarkUsed(ctx context.Context, id int64, usedAt time.Time) (*model.CapsUpload, error)
}
