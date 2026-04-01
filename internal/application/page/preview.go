package page

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/security"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const pagePreviewTokenBodyLength = 27

type pagePreviewHostRecord struct {
	PageID           int64                `json:"page_id"`
	SpaceID          int64                `json:"space_id"`
	CurrentVersionID int64                `json:"current_version_id"`
	AssetPrefix      string               `json:"asset_prefix"`
	SPAFallback      bool                 `json:"spa_fallback"`
	ShowBadge        bool                 `json:"show_badge"`
	AccessMode       model.PageAccessMode `json:"access_mode"`
	Preview          bool                 `json:"preview"`
	ExpiresAt        time.Time            `json:"expires_at"`
}

func (s *Service) CreatePreviewHost(ctx context.Context, userID int64, pageID int64, versionID int64) (*model.PagePreviewHost, error) {
	if s == nil || s.spaceService == nil || s.siteRepo == nil || s.versionRepo == nil || s.edgeGrantStore == nil {
		return nil, model.ErrNotConfigured("page preview-host service is not configured")
	}
	if pageID <= 0 || versionID <= 0 {
		return nil, model.ErrValidation("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	site, err := s.siteRepo.GetByID(ctx, pageID)
	if err != nil {
		return nil, err
	}
	if site == nil || site.SpaceID != space.ID {
		return nil, model.ErrNotFound("page site not found")
	}

	version, err := s.versionRepo.GetByID(ctx, versionID)
	if err != nil {
		return nil, err
	}
	if version == nil || version.PageID != site.ID {
		return nil, model.ErrNotFound("page version not found")
	}
	if version.Status != model.PageVersionStatusVerified && version.Status != model.PageVersionStatusPublished && version.Status != model.PageVersionStatusArchived {
		return nil, model.ErrValidation("page version must be verified, published, or archived for preview")
	}

	token, err := security.GeneratePrefixedToken("pprv_", pagePreviewTokenBodyLength)
	if err != nil {
		return nil, fmt.Errorf("generate page preview token: %w", err)
	}
	hostname := s.previewHostnameForToken(token)
	expiresAt := s.now().Add(time.Duration(s.previewTTLSeconds) * time.Second)
	record, err := json.Marshal(pagePreviewHostRecord{
		PageID:           site.ID,
		SpaceID:          site.SpaceID,
		CurrentVersionID: version.ID,
		AssetPrefix:      version.AssetPrefix,
		SPAFallback:      site.SPAFallback,
		ShowBadge:        site.ShowBadge,
		AccessMode:       model.PageAccessModePublic,
		Preview:          true,
		ExpiresAt:        expiresAt,
	})
	if err != nil {
		return nil, fmt.Errorf("marshal page preview host record: %w", err)
	}

	if err := s.edgeGrantStore.PutJSON(ctx, "page:host:"+hostname, record, s.previewTTLSeconds); err != nil {
		return nil, err
	}

	return &model.PagePreviewHost{
		PreviewURL: "https://" + hostname + "/",
		ExpiresAt:  expiresAt,
	}, nil
}

func (s *Service) previewHostnameForToken(token string) string {
	label := strings.ToLower(strings.TrimSpace(token))
	// Hostname labels cannot contain "_". Use "-" while keeping the token prefix shape.
	label = strings.Replace(label, "_", "-", 1)
	return model.FormatPageHostname(s.previewHostFormat, label)
}
