package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type DriveNodeRepository interface {
	CreateFolder(ctx context.Context, input model.CreateDriveFolderInput) (*model.DriveNode, error)
	CreateFile(ctx context.Context, input model.CreateDriveFileInput) (*model.DriveNode, error)
	GetByID(ctx context.Context, id int64) (*model.DriveNode, error)
	ListByParent(ctx context.Context, filter model.ListDriveNodesFilter) ([]model.DriveNode, error)
	Update(ctx context.Context, input model.UpdateDriveNodeInput) (*model.DriveNode, error)
	AttachStorageObject(ctx context.Context, input model.AttachDriveNodeStorageInput) (*model.DriveNode, error)
	ExistsInSubtree(ctx context.Context, spaceID, rootID, targetID int64) (bool, error)
	SoftDeleteSubtree(ctx context.Context, spaceID, rootID int64) (int64, error)
}

type DriveShareRepository interface {
	GetActiveByNodeID(ctx context.Context, nodeID int64) (*model.DriveShareLink, error)
	Create(ctx context.Context, link model.DriveShareLink) (*model.DriveShareLink, error)
	Update(ctx context.Context, link model.DriveShareLink) (*model.DriveShareLink, error)
	RevokeActiveByNodeID(ctx context.Context, nodeID int64) error
}

type DriveService interface {
	CreateFolder(ctx context.Context, userID string, parentID *int64, name string) (*model.DriveNode, error)
	PresignFileUpload(ctx context.Context, userID string, parentID *int64, name, contentType string, contentLength int64) (*model.DriveFilePresignResult, error)
	CompleteFileUpload(ctx context.Context, userID string, uploadSessionID int64, fileID int64) (*model.DriveNode, error)
	ListNodes(ctx context.Context, userID string, parentID *int64) ([]model.DriveNode, error)
	UpdateNode(ctx context.Context, userID string, nodeID int64, name *string, parentID *int64, updateParent bool) (*model.DriveNode, error)
	DeleteNode(ctx context.Context, userID string, nodeID int64) (int64, error)
	UpsertShare(ctx context.Context, userID string, nodeID int64, expiresInSeconds *int64, noExpire bool, password *string, noPassword bool) (*model.DriveShareView, error)
	RotateShare(ctx context.Context, userID string, nodeID int64) (*model.DriveShareView, error)
	RevokeShare(ctx context.Context, userID string, nodeID int64) error
}
