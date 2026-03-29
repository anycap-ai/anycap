package page

import (
	"context"
	"fmt"
	"path"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func (s *Service) PublishVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil || s.siteRepo == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, fmt.Errorf("version_id must be greater than zero")
	}

	site, targetVersion, err := s.loadSiteAndVersion(ctx, userID, pageID, versionID)
	if err != nil {
		return nil, err
	}

	currentVersion, err := s.getCurrentVersion(ctx, site)
	if err != nil {
		return nil, err
	}
	if currentVersion != nil && currentVersion.ID != targetVersion.ID && targetVersion.VersionNo <= currentVersion.VersionNo {
		return nil, fmt.Errorf("page version must move forward")
	}
	if targetVersion.Status != model.PageVersionStatusVerified && targetVersion.Status != model.PageVersionStatusPublished {
		return nil, fmt.Errorf("page version must be verified before publish")
	}

	if currentVersion != nil && currentVersion.ID != targetVersion.ID && currentVersion.Status != model.PageVersionStatusArchived {
		if _, err := s.versionRepo.UpdateStatus(ctx, currentVersion.ID, model.PageVersionStatusArchived); err != nil {
			return nil, err
		}
	}

	if targetVersion.Status != model.PageVersionStatusPublished {
		targetVersion, err = s.versionRepo.UpdateStatus(ctx, targetVersion.ID, model.PageVersionStatusPublished)
		if err != nil {
			return nil, err
		}
		if targetVersion == nil {
			return nil, fmt.Errorf("page version not found")
		}
	}

	updatedSite, err := s.siteRepo.SetCurrentVersion(ctx, site.SpaceID, site.ID, &targetVersion.ID)
	if err != nil {
		return nil, err
	}
	if updatedSite == nil {
		return nil, fmt.Errorf("page site not found")
	}

	jobID, err := s.enqueueKVSyncJob(ctx, model.KVSyncJobTypePageHostSync, updatedSite.ID, updatedSite.EdgeVersion, nil)
	if err != nil {
		return nil, err
	}
	if err := s.waitKVSyncJobs(ctx, jobID); err != nil {
		return nil, err
	}

	return targetVersion, nil
}

func (s *Service) Unpublish(ctx context.Context, userID string, pageID int64) (*model.PageSite, error) {
	if s == nil || s.versionRepo == nil || s.siteRepo == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}

	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, err
	}
	if site.CurrentVersionID == nil {
		return site, nil
	}

	currentVersion, err := s.getVersionForPage(ctx, site.ID, *site.CurrentVersionID)
	if err != nil {
		return nil, err
	}
	if currentVersion.Status != model.PageVersionStatusArchived {
		if _, err := s.versionRepo.UpdateStatus(ctx, currentVersion.ID, model.PageVersionStatusArchived); err != nil {
			return nil, err
		}
	}

	updatedSite, err := s.siteRepo.SetCurrentVersion(ctx, site.SpaceID, site.ID, nil)
	if err != nil {
		return nil, err
	}
	if updatedSite == nil {
		return nil, fmt.Errorf("page site not found")
	}

	jobID, err := s.enqueueKVSyncJob(ctx, model.KVSyncJobTypePageHostDelete, updatedSite.ID, updatedSite.EdgeVersion, model.KVSyncPageHostDeletePayload{
		Hostname: model.FormatPageHostname(s.pageHostFormat, updatedSite.PageName),
	})
	if err != nil {
		return nil, err
	}
	if err := s.waitKVSyncJobs(ctx, jobID); err != nil {
		return nil, err
	}

	s.fillPageURL(updatedSite)
	return updatedSite, nil
}

func (s *Service) RollbackCloneVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageVersion, error) {
	if s == nil || s.versionRepo == nil || s.storageObjectRepo == nil || s.objectStore == nil {
		return nil, fmt.Errorf("page version service is not configured")
	}
	if versionID <= 0 {
		return nil, fmt.Errorf("version_id must be greater than zero")
	}

	site, sourceVersion, err := s.loadSiteAndVersion(ctx, userID, pageID, versionID)
	if err != nil {
		return nil, err
	}
	if sourceVersion.Status == model.PageVersionStatusDraft {
		return nil, fmt.Errorf("source version must be finalized")
	}
	if strings.TrimSpace(sourceVersion.AssetPrefix) == "" {
		return nil, fmt.Errorf("source version asset prefix is empty")
	}

	sourcePrefix := ensureTrailingSlash(sourceVersion.AssetPrefix)
	sourceObjects, err := s.storageObjectRepo.ListByPrefix(ctx, site.SpaceID, sourcePrefix)
	if err != nil {
		return nil, err
	}
	if len(sourceObjects) == 0 {
		return nil, fmt.Errorf("source version has no assets")
	}

	assetPrefixBase := fmt.Sprintf("page/spaces/%d/sites/%d/versions", site.SpaceID, site.ID)
	clonedVersion, err := s.versionRepo.CreateDraftFromSource(ctx, site.ID, userID, assetPrefixBase, sourceVersion.ID)
	if err != nil {
		return nil, err
	}

	targetPrefix := ensureTrailingSlash(clonedVersion.AssetPrefix)
	if strings.TrimSpace(targetPrefix) == "/" {
		return nil, fmt.Errorf("cloned version asset prefix is empty")
	}
	if err := s.cloneVersionObjects(ctx, site.SpaceID, sourcePrefix, targetPrefix, sourceObjects); err != nil {
		return nil, err
	}

	clonedVersion, err = s.versionRepo.UpdateStatus(ctx, clonedVersion.ID, model.PageVersionStatusVerified)
	if err != nil {
		return nil, err
	}
	if clonedVersion == nil {
		return nil, fmt.Errorf("page version not found")
	}
	return clonedVersion, nil
}

func (s *Service) loadSiteAndVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageSite, *model.PageVersion, error) {
	site, err := s.GetSite(ctx, userID, pageID)
	if err != nil {
		return nil, nil, err
	}
	version, err := s.getVersionForPage(ctx, site.ID, versionID)
	if err != nil {
		return nil, nil, err
	}
	return site, version, nil
}

func (s *Service) getCurrentVersion(ctx context.Context, site *model.PageSite) (*model.PageVersion, error) {
	if site == nil || site.CurrentVersionID == nil {
		return nil, nil
	}
	return s.getVersionForPage(ctx, site.ID, *site.CurrentVersionID)
}

func (s *Service) cloneVersionObjects(ctx context.Context, spaceID int64, sourcePrefix string, targetPrefix string, sourceObjects []model.StorageObject) error {
	for _, object := range sourceObjects {
		relativePath := strings.TrimPrefix(object.ObjectKey, sourcePrefix)
		if strings.TrimSpace(relativePath) == "" || relativePath == object.ObjectKey {
			continue
		}

		targetKey := path.Join(strings.TrimRight(targetPrefix, "/"), relativePath)
		if err := s.objectStore.CopyObject(ctx, object.ObjectKey, targetKey); err != nil {
			return err
		}

		head, err := s.objectStore.HeadObject(ctx, targetKey)
		if err != nil {
			return fmt.Errorf("head cloned object: %w", err)
		}
		if head == nil {
			return fmt.Errorf("cloned object not found")
		}

		if _, err := s.storageObjectRepo.Create(ctx, model.StorageObject{
			SpaceID:   spaceID,
			Bucket:    s.objectStore.BucketName(),
			ObjectKey: targetKey,
			Size:      head.Size,
			MIME:      fallbackPageMIME(head.MIME),
			ETag:      strings.TrimSpace(head.ETag),
		}); err != nil {
			return err
		}
	}
	return nil
}

func ensureTrailingSlash(prefix string) string {
	trimmed := strings.TrimSpace(prefix)
	if trimmed == "" {
		return "/"
	}
	if strings.HasSuffix(trimmed, "/") {
		return trimmed
	}
	return trimmed + "/"
}
