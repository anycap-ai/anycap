package kvsync

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const defaultPageHostSuffix = ".page.anycap.cloud"

type PageProjector struct {
	kvClient    KVClient
	siteRepo    port.PageSiteRepository
	versionRepo port.PageVersionRepository
	hostSuffix  string
}

func NewPageProjector(kvClient KVClient, siteRepo port.PageSiteRepository, versionRepo port.PageVersionRepository, hostSuffix string) *PageProjector {
	suffix := strings.TrimSpace(hostSuffix)
	if suffix == "" {
		suffix = defaultPageHostSuffix
	}
	if !strings.HasPrefix(suffix, ".") {
		suffix = "." + suffix
	}
	return &PageProjector{
		kvClient:    kvClient,
		siteRepo:    siteRepo,
		versionRepo: versionRepo,
		hostSuffix:  strings.ToLower(suffix),
	}
}

func (p *PageProjector) Project(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	if p == nil || p.kvClient == nil || p.siteRepo == nil || p.versionRepo == nil {
		return ProjectResultDone, fmt.Errorf("page projector is not configured")
	}

	switch job.JobType {
	case model.KVSyncJobTypePageHostSync:
		return p.projectHostSync(ctx, job)
	case model.KVSyncJobTypePageHostDelete:
		return p.projectHostDelete(ctx, job)
	default:
		return ProjectResultDone, fmt.Errorf("unsupported page job type: %s", job.JobType)
	}
}

func (p *PageProjector) projectHostSync(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	pageID, err := strconv.ParseInt(job.TargetID, 10, 64)
	if err != nil || pageID <= 0 {
		return ProjectResultDone, fmt.Errorf("invalid page target id")
	}

	site, err := p.siteRepo.GetByID(ctx, pageID)
	if err != nil {
		return ProjectResultDone, err
	}
	if site == nil {
		return ProjectResultObsolete, nil
	}
	if job.EdgeVersion < site.EdgeVersion {
		return ProjectResultObsolete, nil
	}

	hostname := p.hostnameForPage(site.PageName)
	if site.CurrentVersionID == nil {
		if err := p.kvClient.Delete(ctx, "page:host:"+hostname); err != nil {
			return ProjectResultDone, err
		}
		return ProjectResultDone, nil
	}

	version, err := p.versionRepo.GetByID(ctx, *site.CurrentVersionID)
	if err != nil {
		return ProjectResultDone, err
	}
	if version == nil || version.PageID != site.ID {
		return ProjectResultObsolete, nil
	}

	payload, err := json.Marshal(map[string]any{
		"page_id":            site.ID,
		"space_id":           site.SpaceID,
		"current_version_id": *site.CurrentVersionID,
		"asset_prefix":       version.AssetPrefix,
		"spa_fallback":       site.SPAFallback,
		"access_mode":        site.AccessMode,
		"password_hash":      site.PasswordHash,
		"password_salt":      site.PasswordSalt,
		"edge_version":       site.EdgeVersion,
		"updated_at":         site.UpdatedAt,
	})
	if err != nil {
		return ProjectResultDone, fmt.Errorf("marshal page host payload: %w", err)
	}

	if err := p.kvClient.Put(ctx, "page:host:"+hostname, payload); err != nil {
		return ProjectResultDone, err
	}
	return ProjectResultDone, nil
}

func (p *PageProjector) projectHostDelete(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	var deletePayload model.KVSyncPageHostDeletePayload
	if len(job.Payload) > 0 {
		if err := json.Unmarshal(job.Payload, &deletePayload); err != nil {
			return ProjectResultDone, fmt.Errorf("decode page host delete payload: %w", err)
		}
	}

	var hostname string
	pageID, parseErr := strconv.ParseInt(job.TargetID, 10, 64)
	if parseErr == nil && pageID > 0 {
		site, err := p.siteRepo.GetByID(ctx, pageID)
		if err != nil {
			return ProjectResultDone, err
		}
		if site != nil {
			if job.EdgeVersion < site.EdgeVersion {
				return ProjectResultObsolete, nil
			}
			hostname = p.hostnameForPage(site.PageName)
		}
	}
	if hostname == "" {
		hostname = strings.ToLower(strings.TrimSpace(deletePayload.Hostname))
	}
	if hostname == "" {
		return ProjectResultDone, nil
	}

	if err := p.kvClient.Delete(ctx, "page:host:"+hostname); err != nil {
		return ProjectResultDone, err
	}
	return ProjectResultDone, nil
}

func (p *PageProjector) hostnameForPage(pageName string) string {
	return strings.ToLower(strings.TrimSpace(pageName)) + p.hostSuffix
}
