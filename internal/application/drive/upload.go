package drive

import (
	"context"
	"fmt"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/google/uuid"
)

const maxDriveUploadSize int64 = 1024 * 1024 * 1024 // 1GB

func (s *Service) PresignFileUpload(ctx context.Context, userID string, parentID *int64, name, contentType string, contentLength int64) (*model.DriveFilePresignResult, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil || s.uploadSessionRepo == nil || s.objectStore == nil {
		return nil, fmt.Errorf("drive upload service is not configured")
	}
	if err := validateUploadInput(name, contentLength); err != nil {
		return nil, err
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	if err := s.ensureValidParent(ctx, space.ID, parentID, false); err != nil {
		return nil, err
	}

	trimmedName := strings.TrimSpace(name)
	trimmedContentType := strings.TrimSpace(contentType)
	if trimmedContentType == "" {
		trimmedContentType = "application/octet-stream"
	}

	fileNode, err := s.nodeRepo.CreateFile(ctx, model.CreateDriveFileInput{
		SpaceID:   space.ID,
		ParentID:  parentID,
		Name:      trimmedName,
		CreatedBy: userID,
	})
	if err != nil {
		return nil, err
	}

	objectKey := fmt.Sprintf("drive/spaces/%d/nodes/%d/%s", space.ID, fileNode.ID, uuid.NewString())
	presignResult, err := s.objectStore.PresignPutObject(ctx, objectKey, trimmedContentType, contentLength)
	if err != nil {
		_, _ = s.nodeRepo.SoftDeleteSubtree(ctx, space.ID, fileNode.ID)
		return nil, err
	}

	expiresAt := s.now().Add(time.Duration(presignResult.ExpiresIn) * time.Second)
	session, err := s.uploadSessionRepo.Create(ctx, model.UploadSession{
		SpaceID:    space.ID,
		TargetType: model.UploadTargetTypeDrive,
		TargetID:   fileNode.ID,
		ObjectKey:  objectKey,
		Status:     model.UploadSessionStatusPending,
		ExpiresAt:  expiresAt,
	})
	if err != nil {
		_, _ = s.nodeRepo.SoftDeleteSubtree(ctx, space.ID, fileNode.ID)
		return nil, err
	}

	return &model.DriveFilePresignResult{
		UploadSessionID: session.ID,
		FileID:          fileNode.ID,
		UploadURL:       presignResult.UploadURL,
		ObjectURL:       presignResult.ObjectURL,
		ObjectKey:       presignResult.ObjectKey,
		ExpiresIn:       presignResult.ExpiresIn,
	}, nil
}

func (s *Service) CompleteFileUpload(ctx context.Context, userID string, uploadSessionID int64, fileID int64) (*model.DriveNode, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil || s.uploadSessionRepo == nil || s.storageObjectRepo == nil || s.objectStore == nil {
		return nil, fmt.Errorf("drive upload service is not configured")
	}
	if uploadSessionID <= 0 {
		return nil, fmt.Errorf("upload_session_id must be greater than zero")
	}
	if fileID <= 0 {
		return nil, fmt.Errorf("file_id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	fileNode, err := s.nodeRepo.GetByID(ctx, fileID)
	if err != nil {
		return nil, err
	}
	if fileNode == nil || fileNode.SpaceID != space.ID {
		return nil, fmt.Errorf("drive file not found")
	}
	if fileNode.Kind != model.DriveNodeKindFile {
		return nil, fmt.Errorf("target node must be a file")
	}

	session, err := s.uploadSessionRepo.GetByID(ctx, uploadSessionID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, fmt.Errorf("upload session not found")
	}
	if session.SpaceID != space.ID {
		return nil, fmt.Errorf("upload session not found")
	}
	if session.TargetType != model.UploadTargetTypeDrive || session.TargetID != fileID {
		return nil, fmt.Errorf("upload session does not match target file")
	}

	now := s.now()
	if session.ExpiresAt.Before(now) {
		return nil, fmt.Errorf("upload session expired")
	}

	if session.Status == model.UploadSessionStatusCompleted {
		return fileNode, nil
	}
	if session.Status != model.UploadSessionStatusPending {
		return nil, fmt.Errorf("upload session is not pending")
	}

	head, err := s.objectStore.HeadObject(ctx, session.ObjectKey)
	if err != nil {
		return nil, fmt.Errorf("head uploaded object: %w", err)
	}
	if head == nil {
		return nil, fmt.Errorf("uploaded object not found")
	}

	storageObject, err := s.storageObjectRepo.Create(ctx, model.StorageObject{
		SpaceID:   space.ID,
		Bucket:    s.objectStore.BucketName(),
		ObjectKey: session.ObjectKey,
		Size:      head.Size,
		MIME:      fallbackMIME(head.MIME),
		ETag:      strings.TrimSpace(head.ETag),
	})
	if err != nil {
		return nil, err
	}

	updatedNode, err := s.nodeRepo.AttachStorageObject(ctx, model.AttachDriveNodeStorageInput{
		NodeID:          fileID,
		SpaceID:         space.ID,
		StorageObjectID: storageObject.ID,
		Size:            storageObject.Size,
		MIME:            storageObject.MIME,
	})
	if err != nil {
		return nil, err
	}
	if updatedNode == nil {
		return nil, fmt.Errorf("drive file not found")
	}

	if err := s.uploadSessionRepo.MarkCompleted(ctx, session.ID); err != nil {
		return nil, err
	}

	jobIDs := make([]int64, 0, 2)
	fileJobID, err := s.enqueueDriveFileMetaSync(ctx, updatedNode, storageObject)
	if err != nil {
		return nil, err
	}
	if fileJobID > 0 {
		jobIDs = append(jobIDs, fileJobID)
	}
	if updatedNode.ParentID != nil {
		childrenJobID, syncErr := s.enqueueDriveDirChildrenSync(ctx, *updatedNode.ParentID)
		if syncErr != nil {
			return nil, syncErr
		}
		if childrenJobID > 0 {
			jobIDs = append(jobIDs, childrenJobID)
		}
	}
	if err := s.waitKVSyncJobs(ctx, jobIDs...); err != nil {
		return nil, err
	}

	return updatedNode, nil
}

func validateUploadInput(name string, contentLength int64) error {
	if strings.TrimSpace(name) == "" {
		return fmt.Errorf("name is required")
	}
	base := path.Base(name)
	if base != name || strings.Contains(name, "..") || strings.ContainsAny(name, "\\/") {
		return fmt.Errorf("name contains invalid characters")
	}
	if contentLength <= 0 {
		return fmt.Errorf("content_length must be positive")
	}
	if contentLength > maxDriveUploadSize {
		return fmt.Errorf("content_length exceeds max upload size")
	}
	return nil
}

func fallbackMIME(mime string) string {
	mime = strings.TrimSpace(mime)
	if mime == "" {
		return "application/octet-stream"
	}
	return mime
}
