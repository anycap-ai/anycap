package model

import (
	"fmt"
	"strings"
	"time"
)

const DefaultPageHostFormat = "page-%s.anycap.cloud"

// NormalizePageHostFormat normalizes a page host format string (lowercase, trimmed, ensures %s placeholder).
func NormalizePageHostFormat(format string) string {
	normalized := strings.ToLower(strings.TrimSpace(format))
	if normalized == "" {
		normalized = DefaultPageHostFormat
	}
	if !strings.Contains(normalized, "%s") {
		normalized = normalized + "%s"
	}
	return normalized
}

// FormatPageHostname returns the full hostname for a page name using the given format.
func FormatPageHostname(format, pageName string) string {
	return fmt.Sprintf(format, strings.ToLower(strings.TrimSpace(pageName)))
}

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
	ID               int64
	SpaceID          int64
	Name             string
	PageName         string
	CurrentVersionID *int64
	AccessMode       PageAccessMode
	PasswordHash     *string
	PasswordSalt     *string
	SPAFallback      bool
	ShowBadge        bool
	PageURL          string
	EdgeVersion      int64
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        *time.Time
}

type PageVersion struct {
	ID              int64
	PageID          int64
	VersionNo       int64
	SourceVersionID *int64
	Status          PageVersionStatus
	AssetPrefix     string
	CreatedBy       string
	CreatedAt       time.Time
}

type PageVersionPresignResult struct {
	UploadSessionID int64
	VersionID       int64
	AssetPath       string
	UploadURL       string
	ObjectURL       string
	ObjectKey       string
	ExpiresIn       int
}

type PageSlugRegistry struct {
	Slug      string
	Status    PageSlugStatus
	PageID    int64
	CreatedAt time.Time
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
	ShowBadge      *bool
}

// ListPageSitesFilter controls pagination and filtering for page site listing.
type ListPageSitesFilter struct {
	SpaceID int64
	Name    *string // exact match filter (nil = no filter)
	Limit   int
	Offset  int
}

// ListPageVersionsFilter controls pagination for page version listing.
type ListPageVersionsFilter struct {
	PageID int64
	Limit  int
	Offset int
}
