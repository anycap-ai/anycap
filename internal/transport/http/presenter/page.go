package presenter

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type PageSiteDTO struct {
	ID               string  `json:"id"`
	SpaceID          string  `json:"space_id"`
	Name             string  `json:"name"`
	PageName         string  `json:"page_name"`
	CurrentVersionID *string `json:"current_version_id,omitempty"`
	AccessMode       string  `json:"access_mode"`
	SPAFallback      bool    `json:"spa_fallback"`
	ShowBadge        bool    `json:"show_badge"`
	PageURL          string  `json:"page_url,omitempty"`
	EdgeVersion      int64   `json:"edge_version"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
	DeletedAt        *string `json:"deleted_at,omitempty"`
}

type PageVersionDTO struct {
	ID              string  `json:"id"`
	PageID          string  `json:"page_id"`
	VersionNo       int64   `json:"version_no"`
	SourceVersionID *string `json:"source_version_id,omitempty"`
	Status          string  `json:"status"`
	CreatedBy       string  `json:"created_by"`
	CreatedAt       string  `json:"created_at"`
}

type PageVersionPresignDTO struct {
	UploadSessionID string `json:"upload_session_id"`
	VersionID       string `json:"version_id"`
	AssetPath       string `json:"asset_path"`
	UploadURL       string `json:"upload_url"`
	ObjectURL       string `json:"object_url"`
	ExpiresIn       int    `json:"expires_in"`
}

func PresentPageSite(ctx context.Context, mapper IDMapper, site *model.PageSite) (PageSiteDTO, error) {
	items, err := PresentPageSites(ctx, mapper, []model.PageSite{*site})
	if err != nil {
		return PageSiteDTO{}, err
	}
	if len(items) == 0 {
		return PageSiteDTO{}, fmt.Errorf("page site not found")
	}
	return items[0], nil
}

func PresentPageSites(ctx context.Context, mapper IDMapper, sites []model.PageSite) ([]PageSiteDTO, error) {
	if len(sites) == 0 {
		return []PageSiteDTO{}, nil
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

	siteMap, err := mapper.ResolvePageSiteExternalIDs(ctx, siteIDs)
	if err != nil {
		return nil, err
	}
	spaceMap, err := mapper.ResolveSpaceExternalIDs(ctx, spaceIDs)
	if err != nil {
		return nil, err
	}
	versionMap, err := mapper.ResolvePageVersionExternalIDs(ctx, versionIDs)
	if err != nil {
		return nil, err
	}

	result := make([]PageSiteDTO, 0, len(sites))
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

		dto := PageSiteDTO{
			ID:               externalID,
			SpaceID:          spaceExternalID,
			Name:             site.Name,
			PageName:         site.PageName,
			CurrentVersionID: currentVersionExternalID,
			AccessMode:       string(site.AccessMode),
			SPAFallback:      site.SPAFallback,
			ShowBadge:        site.ShowBadge,
			PageURL:          site.PageURL,
			EdgeVersion:      site.EdgeVersion,
			CreatedAt:        site.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt:        site.UpdatedAt.UTC().Format(TimeLayout),
		}
		if site.DeletedAt != nil {
			value := site.DeletedAt.UTC().Format(TimeLayout)
			dto.DeletedAt = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentPageVersion(ctx context.Context, mapper IDMapper, version *model.PageVersion) (PageVersionDTO, error) {
	items, err := PresentPageVersions(ctx, mapper, []model.PageVersion{*version})
	if err != nil {
		return PageVersionDTO{}, err
	}
	if len(items) == 0 {
		return PageVersionDTO{}, fmt.Errorf("page version not found")
	}
	return items[0], nil
}

func PresentPageVersions(ctx context.Context, mapper IDMapper, versions []model.PageVersion) ([]PageVersionDTO, error) {
	if len(versions) == 0 {
		return []PageVersionDTO{}, nil
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

	versionMap, err := mapper.ResolvePageVersionExternalIDs(ctx, versionIDs)
	if err != nil {
		return nil, err
	}
	pageMap, err := mapper.ResolvePageSiteExternalIDs(ctx, pageIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	result := make([]PageVersionDTO, 0, len(versions))
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

		result = append(result, PageVersionDTO{
			ID:              externalID,
			PageID:          pageID,
			VersionNo:       version.VersionNo,
			SourceVersionID: sourceVersionExternalID,
			Status:          string(version.Status),
			CreatedBy:       createdBy,
			CreatedAt:       version.CreatedAt.UTC().Format(TimeLayout),
		})
	}
	return result, nil
}

func PresentPageVersionPresign(ctx context.Context, mapper IDMapper, input *model.PageVersionPresignResult) (PageVersionPresignDTO, error) {
	uploadMap, err := mapper.ResolveUploadSessionExternalIDs(ctx, []int64{input.UploadSessionID})
	if err != nil {
		return PageVersionPresignDTO{}, err
	}
	versionMap, err := mapper.ResolvePageVersionExternalIDs(ctx, []int64{input.VersionID})
	if err != nil {
		return PageVersionPresignDTO{}, err
	}
	uploadID := uploadMap[input.UploadSessionID]
	versionID := versionMap[input.VersionID]
	if uploadID == "" || versionID == "" {
		return PageVersionPresignDTO{}, fmt.Errorf("failed to resolve page presign external ids")
	}
	return PageVersionPresignDTO{
		UploadSessionID: uploadID,
		VersionID:       versionID,
		AssetPath:       input.AssetPath,
		UploadURL:       input.UploadURL,
		ObjectURL:       input.ObjectURL,
		ExpiresIn:       input.ExpiresIn,
	}, nil
}
