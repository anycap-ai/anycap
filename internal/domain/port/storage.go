package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type UploadSessionRepository interface {
	Create(ctx context.Context, input model.UploadSession) (*model.UploadSession, error)
	GetByID(ctx context.Context, id int64) (*model.UploadSession, error)
	MarkCompleted(ctx context.Context, id int64) error
	CountCompletedByTarget(ctx context.Context, targetType model.UploadTargetType, targetID int64) (int64, error)
}

type StorageObjectRepository interface {
	Create(ctx context.Context, input model.StorageObject) (*model.StorageObject, error)
	GetByID(ctx context.Context, id int64) (*model.StorageObject, error)
	ListByPrefix(ctx context.Context, spaceID int64, objectKeyPrefix string) ([]model.StorageObject, error)
}

type CloudObjectStore interface {
	PresignPutObject(ctx context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error)
	HeadObject(ctx context.Context, objectKey string) (*model.StorageObjectHead, error)
	CopyObject(ctx context.Context, sourceObjectKey, targetObjectKey string) error
	DeleteObject(ctx context.Context, objectKey string) error
	BucketName() string
}
