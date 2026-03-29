package handlers

import (
	"encoding/json"

	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"

	"github.com/cloudwego/hertz/pkg/route"
)

type PageHandler struct {
	service *pageapp.Service
	mapper  ExternalIDMapper
}

type PageHandlerOption func(*PageHandler)

func WithPageExternalIDMapper(mapper ExternalIDMapper) PageHandlerOption {
	return func(h *PageHandler) {
		h.mapper = mapper
	}
}

func NewPageHandler(service *pageapp.Service, options ...PageHandlerOption) *PageHandler {
	handler := &PageHandler{service: service}
	for _, option := range options {
		if option != nil {
			option(handler)
		}
	}
	return handler
}

func (h *PageHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/pages", h.CreateSite)
	group.GET("/pages", h.ListSites)
	group.GET("/pages/:id", h.GetSite)
	group.PATCH("/pages/:id", h.UpdateSite)
	group.POST("/pages/:id/versions", h.CreateVersion)
	group.POST("/pages/:id/versions/:vid/files/presign", h.PresignVersionAsset)
	group.POST("/pages/:id/versions/:vid/files/complete", h.CompleteVersionAsset)
	group.POST("/pages/:id/versions/:vid/finalize", h.FinalizeVersion)
	group.POST("/pages/:id/versions/:vid/publish", h.PublishVersion)
	group.POST("/pages/:id/versions/:vid/rollback-clone", h.RollbackCloneVersion)
	group.POST("/pages/:id/unpublish", h.Unpublish)
	group.GET("/pages/:id/versions", h.ListVersions)
}

type createPageSiteRequest struct {
	Name string `json:"name"`
}

type presignPageVersionAssetRequest struct {
	AssetPath     string `json:"asset_path"`
	ContentType   string `json:"content_type"`
	ContentLength int64  `json:"content_length"`
}

type completePageVersionAssetRequest struct {
	UploadSessionID json.RawMessage `json:"upload_session_id"`
}

type pageSiteDTO struct {
	ID               string  `json:"id"`
	SpaceID          string  `json:"space_id"`
	Name             string  `json:"name"`
	PageName         string  `json:"page_name"`
	CurrentVersionID *string `json:"current_version_id,omitempty"`
	AccessMode       string  `json:"access_mode"`
	SPAFallback      bool    `json:"spa_fallback"`
	PageURL          string  `json:"page_url,omitempty"`
	EdgeVersion      int64   `json:"edge_version"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
	DeletedAt        *string `json:"deleted_at,omitempty"`
}

type pageVersionDTO struct {
	ID              string  `json:"id"`
	PageID          string  `json:"page_id"`
	VersionNo       int64   `json:"version_no"`
	SourceVersionID *string `json:"source_version_id,omitempty"`
	Status          string  `json:"status"`
	AssetPrefix     string  `json:"asset_prefix"`
	CreatedBy       string  `json:"created_by"`
	CreatedAt       string  `json:"created_at"`
}

type pageVersionPresignDTO struct {
	UploadSessionID string `json:"upload_session_id"`
	VersionID       string `json:"version_id"`
	AssetPath       string `json:"asset_path"`
	UploadURL       string `json:"upload_url"`
	ObjectURL       string `json:"object_url"`
	ObjectKey       string `json:"object_key"`
	ExpiresIn       int    `json:"expires_in"`
}
