package page

import (
	"context"
	"fmt"
	"path"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const maxPageAssetUploadSize int64 = 1024 * 1024 * 1024 // 1GB

func (s *Service) CreateVersion(ctx context.Context, userID int64, pageID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil {
		return nil, model.ErrNotConfigured("page version service is not configured")
	}
	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}

	// Quota check: version count per site
	if s.quotaProvider != nil {
		quota := s.quotaProvider.ResolveQuota(nil)
		versionCount, cErr := s.versionRepo.CountByPageID(ctx, site.ID)
		if cErr != nil {
			return nil, cErr
		}
		if versionCount >= int64(quota.MaxPageVersionsPerSite) {
			return nil, model.ErrLimitReached(fmt.Sprintf("page_version_limit_reached: version limit reached (%d/%d versions). Delete old versions or create a new site",
				versionCount, quota.MaxPageVersionsPerSite))
		}
	}

	assetPrefixBase := fmt.Sprintf("page/spaces/%d/sites/%d/versions", site.SpaceID, site.ID)
	return s.versionRepo.CreateDraft(ctx, site.ID, strconv.FormatInt(userID, 10), assetPrefixBase)
}

func (s *Service) PresignVersionAsset(ctx context.Context, userID int64, pageID int64, versionID int64, assetPath string, contentType string, contentLength int64) (*model.PageVersionPresignResult, error) {
	if s == nil || s.versionRepo == nil || s.uploadSessionRepo == nil || s.objectStore == nil {
		return nil, model.ErrNotConfigured("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, model.ErrValidation("version_id must be greater than zero")
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

	// Quota checks (if quota provider is wired)
	if s.quotaProvider != nil {
		quota := s.quotaProvider.ResolveQuota(nil)
		space, spaceErr := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
		if spaceErr != nil {
			return nil, spaceErr
		}

		// 1. Check asset size limit
		if contentLength > quota.MaxPageAssetSizeBytes {
			return nil, model.ErrPayloadTooLarge(fmt.Sprintf("page_asset_too_large: asset size exceeds %s limit", formatBytes(quota.MaxPageAssetSizeBytes)))
		}

		// 2. Check total storage quota (optimistic fast-fail)
		if space.StorageUsedBytes+contentLength > quota.StorageQuotaBytes {
			return nil, model.ErrQuotaExceeded(fmt.Sprintf("storage_quota_exceeded: storage quota exceeded (%s/%s). Delete files to free up storage",
				formatBytes(space.StorageUsedBytes), formatBytes(quota.StorageQuotaBytes)))
		}

		// 3. Lazy cleanup: expire stale pending page sessions
		_, _ = s.uploadSessionRepo.ExpireStaleBySpace(ctx, space.ID, model.UploadTargetTypePage, s.now())

		// 4. Check files per version (completed + pending)
		fileCount, fcErr := s.uploadSessionRepo.CountByTargetAndStatuses(ctx, model.UploadTargetTypePage, versionID, []model.UploadSessionStatus{
			model.UploadSessionStatusCompleted,
			model.UploadSessionStatusPending,
		})
		if fcErr != nil {
			return nil, fcErr
		}
		if fileCount >= int64(quota.MaxFilesPerPageVersion) {
			return nil, model.ErrLimitReached(fmt.Sprintf("page_version_file_limit_reached: file limit reached (%d/%d files per version)",
				fileCount, quota.MaxFilesPerPageVersion))
		}

		// 5. Check pending session count per space
		pendingCount, pErr := s.uploadSessionRepo.CountPendingBySpaceAndType(ctx, space.ID, model.UploadTargetTypePage)
		if pErr != nil {
			return nil, pErr
		}
		if pendingCount >= int64(quota.MaxPendingPageSessions) {
			return nil, model.ErrTooManyRequests("too_many_pending_uploads: too many pending page uploads, complete existing uploads or wait for expiry")
		}
	}

	version, err := s.getVersionForPage(ctx, site.ID, versionID)
	if err != nil {
		return nil, err
	}
	if !canAcceptVersionUpload(version.Status) {
		return nil, model.ErrValidation("page version is not accepting uploads")
	}

	assetPrefix := strings.TrimRight(strings.TrimSpace(version.AssetPrefix), "/")
	if assetPrefix == "" {
		return nil, model.ErrValidation("page version asset prefix is empty")
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

func (s *Service) CompleteVersionAsset(ctx context.Context, userID int64, pageID int64, versionID int64, uploadSessionID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil || s.uploadSessionRepo == nil || s.storageObjectRepo == nil || s.objectStore == nil {
		return nil, model.ErrNotConfigured("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, model.ErrValidation("version_id must be greater than zero")
	}
	if uploadSessionID <= 0 {
		return nil, model.ErrValidation("upload_session_id must be greater than zero")
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
		return nil, model.ErrValidation("page version is not accepting uploads")
	}

	session, err := s.uploadSessionRepo.GetByID(ctx, uploadSessionID)
	if err != nil {
		return nil, err
	}
	if session == nil || session.SpaceID != site.SpaceID {
		return nil, model.ErrNotFound("upload session not found")
	}
	if session.TargetType != model.UploadTargetTypePage || session.TargetID != versionID {
		return nil, model.ErrValidation("upload session does not match page version")
	}
	if session.ExpiresAt.Before(s.now()) {
		return nil, model.ErrValidation("upload session expired")
	}
	if session.Status == model.UploadSessionStatusCompleted {
		return version, nil
	}
	if session.Status != model.UploadSessionStatusPending {
		return nil, model.ErrValidation("upload session is not pending")
	}

	expectedPrefix := strings.TrimRight(version.AssetPrefix, "/") + "/"
	if !strings.HasPrefix(session.ObjectKey, expectedPrefix) {
		return nil, model.ErrValidation("upload session does not match page version")
	}

	head, err := s.objectStore.HeadObject(ctx, session.ObjectKey)
	if err != nil {
		return nil, fmt.Errorf("head uploaded object: %w", err)
	}
	if head == nil {
		return nil, model.ErrNotFound("uploaded object not found")
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

	// Atomically increment storage + mark session completed
	if s.spaceRepo != nil && s.quotaProvider != nil {
		quota := s.quotaProvider.ResolveQuota(nil)
		ok, qErr := s.spaceRepo.IncrementStorageAndMarkSessionCompleted(ctx, site.SpaceID, session.ID, head.Size, 0, quota.StorageQuotaBytes)
		if qErr != nil {
			return nil, qErr
		}
		if !ok {
			return nil, model.ErrQuotaExceeded("storage_quota_exceeded: storage quota exceeded. Delete files to free up storage")
		}
	} else {
		// Fallback: mark completed without quota tracking (stub mode)
		if err := s.uploadSessionRepo.MarkCompleted(ctx, session.ID); err != nil {
			return nil, err
		}
	}

	return version, nil
}

// Q4: Simplified FinalizeVersion -- skip intermediate "uploaded" state for new versions.
// Go directly from draft -> verified. Keep "uploaded" as a valid input for backward compat.
func (s *Service) FinalizeVersion(ctx context.Context, userID int64, pageID int64, versionID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil || s.uploadSessionRepo == nil {
		return nil, model.ErrNotConfigured("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, model.ErrValidation("version_id must be greater than zero")
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
		// Continue below -- go directly to verified.
	default:
		return nil, model.ErrValidation(fmt.Sprintf("page version cannot be finalized from status %s", version.Status))
	}

	completedCount, err := s.uploadSessionRepo.CountCompletedByTarget(ctx, model.UploadTargetTypePage, version.ID)
	if err != nil {
		return nil, err
	}
	if completedCount <= 0 {
		return nil, model.ErrValidation("page version has no completed uploads")
	}

	version, err = s.versionRepo.UpdateStatus(ctx, version.ID, model.PageVersionStatusVerified)
	if err != nil {
		return nil, err
	}
	if version == nil {
		return nil, model.ErrNotFound("page version not found")
	}

	return version, nil
}

func (s *Service) ListVersions(ctx context.Context, userID int64, pageID int64, filter model.ListPageVersionsFilter) ([]model.PageVersion, int, error) {
	if s == nil || s.versionRepo == nil {
		return nil, 0, model.ErrNotConfigured("page version service is not configured")
	}
	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, 0, err
	}
	filter.PageID = site.ID
	return s.versionRepo.ListByPageID(ctx, filter)
}

func (s *Service) GetVersionByNumber(ctx context.Context, userID int64, pageID, versionNo int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil {
		return nil, model.ErrNotConfigured("page version service is not configured")
	}
	if versionNo <= 0 {
		return nil, model.ErrValidation("version number must be greater than zero")
	}
	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}
	version, err := s.versionRepo.GetByPageIDAndVersionNo(ctx, site.ID, versionNo)
	if err != nil {
		return nil, err
	}
	if version == nil {
		return nil, model.ErrNotFound(fmt.Sprintf("version %d not found", versionNo))
	}
	return version, nil
}

func (s *Service) getVersionForPage(ctx context.Context, pageID int64, versionID int64) (*model.PageVersion, error) {
	version, err := s.versionRepo.GetByID(ctx, versionID)
	if err != nil {
		return nil, err
	}
	if version == nil || version.PageID != pageID {
		return nil, model.ErrNotFound("page version not found")
	}
	return version, nil
}

func validatePageAssetUploadInput(contentLength int64) error {
	if contentLength <= 0 {
		return model.ErrValidation("content_length must be positive")
	}
	if contentLength > maxPageAssetUploadSize {
		return model.ErrValidation("content_length exceeds max upload size")
	}
	return nil
}

func validatePageAssetPath(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", model.ErrValidation("asset_path is required")
	}
	if strings.Contains(value, "\\") {
		return "", model.ErrValidation("asset_path contains invalid characters")
	}
	if strings.HasPrefix(value, "/") {
		return "", model.ErrValidation("asset_path must be relative")
	}

	cleaned := path.Clean(value)
	if cleaned == "." || cleaned == "" {
		return "", model.ErrValidation("asset_path is required")
	}
	if strings.HasPrefix(cleaned, "../") || cleaned == ".." {
		return "", model.ErrValidation("asset_path contains invalid characters")
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

// formatBytes formats bytes as a human-readable string for error messages.
func formatBytes(b int64) string {
	const (
		kb = 1024
		mb = 1024 * kb
		gb = 1024 * mb
	)
	switch {
	case b >= gb:
		val := float64(b) / float64(gb)
		if val == float64(int64(val)) {
			return fmt.Sprintf("%d GB", int64(val))
		}
		return fmt.Sprintf("%.1f GB", val)
	case b >= mb:
		val := float64(b) / float64(mb)
		if val == float64(int64(val)) {
			return fmt.Sprintf("%d MB", int64(val))
		}
		return fmt.Sprintf("%.1f MB", val)
	case b >= kb:
		return fmt.Sprintf("%d KB", b/kb)
	default:
		return fmt.Sprintf("%d bytes", b)
	}
}
