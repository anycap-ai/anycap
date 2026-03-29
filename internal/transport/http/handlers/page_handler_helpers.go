package handlers

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *PageHandler) resolvePageSiteID(ctx context.Context, rawID string) (int64, error) {
	if h.mapper == nil {
		return parsePathID(rawID)
	}
	return h.mapper.ResolvePageSiteID(ctx, rawID)
}

func (h *PageHandler) resolvePageVersionID(ctx context.Context, rawID string) (int64, error) {
	if h.mapper == nil {
		return parsePathID(rawID)
	}
	return h.mapper.ResolvePageVersionID(ctx, rawID)
}

func (h *PageHandler) resolveUploadSessionID(ctx context.Context, rawID string) (int64, error) {
	if h.mapper == nil {
		return parsePathID(rawID)
	}
	return h.mapper.ResolveUploadSessionID(ctx, rawID)
}

func (h *PageHandler) presentPageSite(ctx context.Context, site *model.PageSite) (any, error) {
	if h.mapper == nil || site == nil {
		return site, nil
	}
	items, err := h.presentPageSites(ctx, []model.PageSite{*site})
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("page site not found")
	}
	return items[0], nil
}

func (h *PageHandler) presentPageSites(ctx context.Context, sites []model.PageSite) ([]pageSiteDTO, error) {
	if h.mapper == nil || len(sites) == 0 {
		return nil, nil
	}

	siteIDs := make([]int64, 0, len(sites))
	spaceIDs := make([]int64, 0, len(sites))
	versionIDs := make([]int64, 0, len(sites))
	for _, site := range sites {
		siteIDs = append(siteIDs, site.ID)
		spaceIDs = append(spaceIDs, site.SpaceID)
		if site.CurrentVersionID != nil {
			versionIDs = append(versionIDs, *site.CurrentVersionID)
		}
	}

	siteMap, err := h.mapper.ResolvePageSiteExternalIDs(ctx, siteIDs)
	if err != nil {
		return nil, err
	}
	spaceMap, err := h.mapper.ResolveSpaceExternalIDs(ctx, spaceIDs)
	if err != nil {
		return nil, err
	}
	versionMap, err := h.mapper.ResolvePageVersionExternalIDs(ctx, versionIDs)
	if err != nil {
		return nil, err
	}

	result := make([]pageSiteDTO, 0, len(sites))
	for _, site := range sites {
		externalID := siteMap[site.ID]
		spaceExternalID := spaceMap[site.SpaceID]
		if externalID == "" || spaceExternalID == "" {
			return nil, fmt.Errorf("failed to resolve page site external ids")
		}

		var currentVersionExternalID *string
		if site.CurrentVersionID != nil {
			value := versionMap[*site.CurrentVersionID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve page current version id")
			}
			currentVersionExternalID = &value
		}

		dto := pageSiteDTO{
			ID:               externalID,
			SpaceID:          spaceExternalID,
			Name:             site.Name,
			PageName:         site.PageName,
			CurrentVersionID: currentVersionExternalID,
			AccessMode:       string(site.AccessMode),
			SPAFallback:      site.SPAFallback,
			PageURL:          site.PageURL,
			EdgeVersion:      site.EdgeVersion,
			CreatedAt:        site.CreatedAt.UTC().Format(timeLayoutRFC3339Nano),
			UpdatedAt:        site.UpdatedAt.UTC().Format(timeLayoutRFC3339Nano),
		}
		if site.DeletedAt != nil {
			value := site.DeletedAt.UTC().Format(timeLayoutRFC3339Nano)
			dto.DeletedAt = &value
		}
		result = append(result, dto)
	}

	return result, nil
}

func (h *PageHandler) presentPageVersion(ctx context.Context, version *model.PageVersion) (any, error) {
	if h.mapper == nil || version == nil {
		return version, nil
	}
	items, err := h.presentPageVersions(ctx, []model.PageVersion{*version})
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("page version not found")
	}
	return items[0], nil
}

func (h *PageHandler) presentPageVersions(ctx context.Context, versions []model.PageVersion) ([]pageVersionDTO, error) {
	if h.mapper == nil || len(versions) == 0 {
		return nil, nil
	}

	versionIDs := make([]int64, 0, len(versions)*2)
	pageIDs := make([]int64, 0, len(versions))
	userIDs := make([]string, 0, len(versions))
	for _, version := range versions {
		versionIDs = append(versionIDs, version.ID)
		if version.SourceVersionID != nil {
			versionIDs = append(versionIDs, *version.SourceVersionID)
		}
		pageIDs = append(pageIDs, version.PageID)
		userIDs = append(userIDs, version.CreatedBy)
	}

	versionMap, err := h.mapper.ResolvePageVersionExternalIDs(ctx, versionIDs)
	if err != nil {
		return nil, err
	}
	pageMap, err := h.mapper.ResolvePageSiteExternalIDs(ctx, pageIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := h.mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	result := make([]pageVersionDTO, 0, len(versions))
	for _, version := range versions {
		externalID := versionMap[version.ID]
		pageID := pageMap[version.PageID]
		createdBy := userMap[version.CreatedBy]
		if externalID == "" || pageID == "" || createdBy == "" {
			return nil, fmt.Errorf("failed to resolve page version external ids")
		}

		var sourceVersionExternalID *string
		if version.SourceVersionID != nil {
			value := versionMap[*version.SourceVersionID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve source page version id")
			}
			sourceVersionExternalID = &value
		}

		result = append(result, pageVersionDTO{
			ID:              externalID,
			PageID:          pageID,
			VersionNo:       version.VersionNo,
			SourceVersionID: sourceVersionExternalID,
			Status:          string(version.Status),
			AssetPrefix:     version.AssetPrefix,
			CreatedBy:       createdBy,
			CreatedAt:       version.CreatedAt.UTC().Format(timeLayoutRFC3339Nano),
		})
	}
	return result, nil
}

func (h *PageHandler) presentPageVersionPresign(ctx context.Context, input *model.PageVersionPresignResult) (any, error) {
	if h.mapper == nil || input == nil {
		return input, nil
	}
	uploadMap, err := h.mapper.ResolveUploadSessionExternalIDs(ctx, []int64{input.UploadSessionID})
	if err != nil {
		return nil, err
	}
	versionMap, err := h.mapper.ResolvePageVersionExternalIDs(ctx, []int64{input.VersionID})
	if err != nil {
		return nil, err
	}
	uploadID := uploadMap[input.UploadSessionID]
	versionID := versionMap[input.VersionID]
	if uploadID == "" || versionID == "" {
		return nil, fmt.Errorf("failed to resolve page presign external ids")
	}
	return pageVersionPresignDTO{
		UploadSessionID: uploadID,
		VersionID:       versionID,
		AssetPath:       input.AssetPath,
		UploadURL:       input.UploadURL,
		ObjectURL:       input.ObjectURL,
		ObjectKey:       input.ObjectKey,
		ExpiresIn:       input.ExpiresIn,
	}, nil
}

func statusCodeForPageError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case containsAny(err.Error(), "required", "must be", "invalid", "at least one", "empty"):
		return consts.StatusBadRequest
	case containsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case containsAny(err.Error(), "duplicate", "unique"):
		return consts.StatusConflict
	case containsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}
