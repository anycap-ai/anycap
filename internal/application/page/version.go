package page

import (
	"context"
	"fmt"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const maxPageAssetUploadSize int64 = 1024 * 1024 * 1024 // 1GB

func (s *Service) CreateVersion(ctx context.Context, userID string, pageID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}

	assetPrefixBase := fmt.Sprintf("page/spaces/%d/sites/%d/versions", site.SpaceID, site.ID)
	return s.versionRepo.CreateDraft(ctx, site.ID, userID, assetPrefixBase)
}

func (s *Service) PresignVersionAsset(ctx context.Context, userID string, pageID int64, versionID int64, assetPath string, contentType string, contentLength int64) (*model.PageVersionPresignResult, error) {
	if s == nil || s.versionRepo == nil || s.uploadSessionRepo == nil || s.objectStore == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, fmt.Errorf("version_id must be greater than zero")
	}

	assetPath, err := validatePageAssetPath(assetPath)
	if err != nil {
		return nil, err
	}
	if err := validatePageAssetUploadInput(contentLength); err != nil {
		return nil, err
	}

	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}
	version, err := s.getVersionForPage(ctx, site.ID, versionID)
	if err != nil {
		return nil, err
	}
	if !canAcceptVersionUpload(version.Status) {
		return nil, fmt.Errorf("page version is not accepting uploads")
	}

	assetPrefix := strings.TrimRight(strings.TrimSpace(version.AssetPrefix), "/")
	if assetPrefix == "" {
		return nil, fmt.Errorf("page version asset prefix is empty")
	}

	trimmedContentType := strings.TrimSpace(contentType)
	if trimmedContentType == "" {
		trimmedContentType = "application/octet-stream"
	}
	objectKey := path.Join(assetPrefix, assetPath)

	presignResult, err := s.objectStore.PresignPutObject(ctx, objectKey, trimmedContentType, contentLength)
	if err != nil {
		return nil, err
	}

	expiresAt := s.now().Add(time.Duration(presignResult.ExpiresIn) * time.Second)
	session, err := s.uploadSessionRepo.Create(ctx, model.UploadSession{
		SpaceID:    site.SpaceID,
		TargetType: model.UploadTargetTypePage,
		TargetID:   version.ID,
		ObjectKey:  objectKey,
		Status:     model.UploadSessionStatusPending,
		ExpiresAt:  expiresAt,
	})
	if err != nil {
		return nil, err
	}

	return &model.PageVersionPresignResult{
		UploadSessionID: session.ID,
		VersionID:       version.ID,
		AssetPath:       assetPath,
		UploadURL:       presignResult.UploadURL,
		ObjectURL:       presignResult.ObjectURL,
		ObjectKey:       presignResult.ObjectKey,
		ExpiresIn:       presignResult.ExpiresIn,
	}, nil
}

func (s *Service) CompleteVersionAsset(ctx context.Context, userID string, pageID int64, versionID int64, uploadSessionID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil || s.uploadSessionRepo == nil || s.storageObjectRepo == nil || s.objectStore == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, fmt.Errorf("version_id must be greater than zero")
	}
	if uploadSessionID <= 0 {
		return nil, fmt.Errorf("upload_session_id must be greater than zero")
	}

	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}
	version, err := s.getVersionForPage(ctx, site.ID, versionID)
	if err != nil {
		return nil, err
	}
	if !canAcceptVersionUpload(version.Status) {
		return nil, fmt.Errorf("page version is not accepting uploads")
	}

	session, err := s.uploadSessionRepo.GetByID(ctx, uploadSessionID)
	if err != nil {
		return nil, err
	}
	if session == nil || session.SpaceID != site.SpaceID {
		return nil, fmt.Errorf("upload session not found")
	}
	if session.TargetType != model.UploadTargetTypePage || session.TargetID != versionID {
		return nil, fmt.Errorf("upload session does not match page version")
	}
	if session.ExpiresAt.Before(s.now()) {
		return nil, fmt.Errorf("upload session expired")
	}
	if session.Status == model.UploadSessionStatusCompleted {
		return version, nil
	}
	if session.Status != model.UploadSessionStatusPending {
		return nil, fmt.Errorf("upload session is not pending")
	}

	expectedPrefix := strings.TrimRight(version.AssetPrefix, "/") + "/"
	if !strings.HasPrefix(session.ObjectKey, expectedPrefix) {
		return nil, fmt.Errorf("upload session does not match page version")
	}

	head, err := s.objectStore.HeadObject(ctx, session.ObjectKey)
	if err != nil {
		return nil, fmt.Errorf("head uploaded object: %w", err)
	}
	if head == nil {
		return nil, fmt.Errorf("uploaded object not found")
	}

	_, err = s.storageObjectRepo.Create(ctx, model.StorageObject{
		SpaceID:   site.SpaceID,
		Bucket:    s.objectStore.BucketName(),
		ObjectKey: session.ObjectKey,
		Size:      head.Size,
		MIME:      fallbackPageMIME(head.MIME),
		ETag:      strings.TrimSpace(head.ETag),
	})
	if err != nil {
		return nil, err
	}

	if err := s.uploadSessionRepo.MarkCompleted(ctx, session.ID); err != nil {
		return nil, err
	}

	return version, nil
}

func (s *Service) FinalizeVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil || s.uploadSessionRepo == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, fmt.Errorf("version_id must be greater than zero")
	}

	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}
	version, err := s.getVersionForPage(ctx, site.ID, versionID)
	if err != nil {
		return nil, err
	}

	switch version.Status {
	case model.PageVersionStatusVerified:
		return version, nil
	case model.PageVersionStatusDraft, model.PageVersionStatusUploaded:
		// Continue below.
	default:
		return nil, fmt.Errorf("page version cannot be finalized from status %s", version.Status)
	}

	completedCount, err := s.uploadSessionRepo.CountCompletedByTarget(ctx, model.UploadTargetTypePage, version.ID)
	if err != nil {
		return nil, err
	}
	if completedCount <= 0 {
		return nil, fmt.Errorf("page version has no completed uploads")
	}

	if version.Status == model.PageVersionStatusDraft {
		version, err = s.versionRepo.UpdateStatus(ctx, version.ID, model.PageVersionStatusUploaded)
		if err != nil {
			return nil, err
		}
		if version == nil {
			return nil, fmt.Errorf("page version not found")
		}
	}

	version, err = s.versionRepo.UpdateStatus(ctx, version.ID, model.PageVersionStatusVerified)
	if err != nil {
		return nil, err
	}
	if version == nil {
		return nil, fmt.Errorf("page version not found")
	}

	return version, nil
}

func (s *Service) ListVersions(ctx context.Context, userID string, pageID int64) ([]model.PageVersion, error) {
	if s == nil || s.versionRepo == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}
	return s.versionRepo.ListByPageID(ctx, site.ID)
}

func (s *Service) getVersionForPage(ctx context.Context, pageID int64, versionID int64) (*model.PageVersion, error) {
	version, err := s.versionRepo.GetByID(ctx, versionID)
	if err != nil {
		return nil, err
	}
	if version == nil || version.PageID != pageID {
		return nil, fmt.Errorf("page version not found")
	}
	return version, nil
}

func validatePageAssetUploadInput(contentLength int64) error {
	if contentLength <= 0 {
		return fmt.Errorf("content_length must be positive")
	}
	if contentLength > maxPageAssetUploadSize {
		return fmt.Errorf("content_length exceeds max upload size")
	}
	return nil
}

func validatePageAssetPath(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", fmt.Errorf("asset_path is required")
	}
	if strings.Contains(value, "\\") {
		return "", fmt.Errorf("asset_path contains invalid characters")
	}
	if strings.HasPrefix(value, "/") {
		return "", fmt.Errorf("asset_path must be relative")
	}

	cleaned := path.Clean(value)
	if cleaned == "." || cleaned == "" {
		return "", fmt.Errorf("asset_path is required")
	}
	if strings.HasPrefix(cleaned, "../") || cleaned == ".." {
		return "", fmt.Errorf("asset_path contains invalid characters")
	}
	return cleaned, nil
}

func canAcceptVersionUpload(status model.PageVersionStatus) bool {
	switch status {
	case model.PageVersionStatusDraft, model.PageVersionStatusUploaded:
		return true
	default:
		return false
	}
}

func fallbackPageMIME(mime string) string {
	mime = strings.TrimSpace(mime)
	if mime == "" {
		return "application/octet-stream"
	}
	return mime
}
