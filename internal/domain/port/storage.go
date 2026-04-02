package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type UploadSessionRepository interface {
	Create(ctx context.Context, input model.UploadSession) (*model.UploadSession, error)
	GetByID(ctx context.Context, id int64) (*model.UploadSession, error)
	MarkCompleted(ctx context.Context, id int64) error
	CountCompletedByTarget(ctx context.Context, targetType model.UploadTargetType, targetID int64) (int64, error)

	// ExpireStaleBySpace marks pending sessions as expired and returns their target IDs for orphan cleanup.
	ExpireStaleBySpace(ctx context.Context, spaceID int64, targetType model.UploadTargetType, now time.Time) ([]model.ExpiredSessionInfo, error)

	// CountPendingBySpaceAndType counts pending (non-expired) upload sessions for quota enforcement.
	CountPendingBySpaceAndType(ctx context.Context, spaceID int64, targetType model.UploadTargetType) (int64, error)

	// CountByTargetAndStatuses counts sessions matching any of the given statuses for a target.
	// Used by PresignVersionAsset to count completed + pending sessions for file-count enforcement.
	CountByTargetAndStatuses(ctx context.Context, targetType model.UploadTargetType, targetID int64, statuses []model.UploadSessionStatus) (int64, error)
}

type StorageObjectRepository interface {
	Create(ctx context.Context, input model.StorageObject) (*model.StorageObject, error)
	GetByID(ctx context.Context, id int64) (*model.StorageObject, error)
	ListByPrefix(ctx context.Context, spaceID int64, objectKeyPrefix string) ([]model.StorageObject, error)
}

type CloudObjectStore interface {
	PresignPutObject(ctx context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error)
	PresignGetObject(ctx context.Context, objectKey string, expiry time.Duration) (string, error)
	HeadObject(ctx context.Context, objectKey string) (*model.StorageObjectHead, error)
	CopyObject(ctx context.Context, sourceObjectKey, targetObjectKey string) error
	DeleteObject(ctx context.Context, objectKey string) error
	BucketName() string
}
