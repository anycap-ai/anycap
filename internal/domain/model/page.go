package model

import "time"

type PageAccessMode string

const (
	PageAccessModePublic          PageAccessMode = "public"
	PageAccessModePassword        PageAccessMode = "password"
	PageAccessModePrivateReserved PageAccessMode = "private_reserved"
)

type PageVersionStatus string

const (
	PageVersionStatusDraft     PageVersionStatus = "draft"
	PageVersionStatusUploaded  PageVersionStatus = "uploaded"
	PageVersionStatusVerified  PageVersionStatus = "verified"
	PageVersionStatusPublished PageVersionStatus = "published"
	PageVersionStatusArchived  PageVersionStatus = "archived"
)

type PageSlugStatus string

const (
	PageSlugStatusActive    PageSlugStatus = "active"
	PageSlugStatusTombstone PageSlugStatus = "tombstone"
)

type PageSite struct {
	ID               int64          `json:"id"`
	SpaceID          int64          `json:"space_id"`
	Name             string         `json:"name"`
	PageName         string         `json:"page_name"`
	CurrentVersionID *int64         `json:"current_version_id,omitempty"`
	AccessMode       PageAccessMode `json:"access_mode"`
	PasswordHash     *string        `json:"password_hash,omitempty"`
	PasswordSalt     *string        `json:"password_salt,omitempty"`
	SPAFallback      bool           `json:"spa_fallback"`
	EdgeVersion      int64          `json:"edge_version"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        *time.Time     `json:"deleted_at,omitempty"`
}

type PageVersion struct {
	ID              int64             `json:"id"`
	PageID          int64             `json:"page_id"`
	VersionNo       int64             `json:"version_no"`
	SourceVersionID *int64            `json:"source_version_id,omitempty"`
	Status          PageVersionStatus `json:"status"`
	AssetPrefix     string            `json:"asset_prefix"`
	CreatedBy       string            `json:"created_by"`
	CreatedAt       time.Time         `json:"created_at"`
}

type PageVersionPresignResult struct {
	UploadSessionID int64  `json:"upload_session_id"`
	VersionID       int64  `json:"version_id"`
	AssetPath       string `json:"asset_path"`
	UploadURL       string `json:"upload_url"`
	ObjectURL       string `json:"object_url"`
	ObjectKey       string `json:"object_key"`
	ExpiresIn       int    `json:"expires_in"`
}

type PageSlugRegistry struct {
	Slug      string         `json:"slug"`
	Status    PageSlugStatus `json:"status"`
	PageID    int64          `json:"page_id"`
	CreatedAt time.Time      `json:"created_at"`
}

type CreatePageSiteInput struct {
	SpaceID      int64
	Name         string
	PageName     string
	AccessMode   PageAccessMode
	PasswordHash *string
	PasswordSalt *string
	SPAFallback  bool
}

type UpdatePageSiteInput struct {
	ID             int64
	SpaceID        int64
	Name           *string
	AccessMode     *PageAccessMode
	PasswordHash   *string
	PasswordSalt   *string
	UpdatePassword bool
	SPAFallback    *bool
}
