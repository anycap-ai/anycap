package page

import (
	"encoding/json"

	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service  *pageapp.Service
	resolver idresolver.IDResolver
	mapper   presenter.IDMapper
}

func NewHandler(service *pageapp.Service, resolver idresolver.IDResolver, mapper presenter.IDMapper) *Handler {
	return &Handler{service: service, resolver: resolver, mapper: mapper}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	middleware.CapabilityPOST(group, "/pages", "page.create", h.CreateSite)
	middleware.CapabilityGET(group, "/pages", "page.list", h.ListSites)
	middleware.CapabilityGET(group, "/pages/:id", "page.read", h.GetSite)
	middleware.CapabilityPATCH(group, "/pages/:id", "page.update", h.UpdateSite)
	middleware.CapabilityDELETE(group, "/pages/:id", "page.delete", h.DeleteSite)
	middleware.CapabilityPOST(group, "/pages/:id/versions", "page.version.create", h.CreateVersion)
	middleware.CapabilityPOST(group, "/pages/:id/versions/:vid/files/presign", "page.asset.upload.prepare", h.PresignVersionAsset)
	middleware.CapabilityPOST(group, "/pages/:id/versions/:vid/files/complete", "page.asset.upload.complete", h.CompleteVersionAsset)
	middleware.CapabilityPOST(group, "/pages/:id/versions/:vid/finalize", "page.version.finalize", h.FinalizeVersion)
	middleware.CapabilityPOST(group, "/pages/:id/versions/:vid/publish", "page.publish", h.PublishVersion)
	middleware.CapabilityPOST(group, "/pages/:id/versions/:vid/preview-host", "page.preview", h.CreatePreviewHost)
	middleware.CapabilityPOST(group, "/pages/:id/versions/:vid/rollback-clone", "page.rollback", h.RollbackCloneVersion)
	middleware.CapabilityPOST(group, "/pages/:id/unpublish", "page.unpublish", h.Unpublish)
	middleware.CapabilityGET(group, "/pages/:id/versions", "page.version.list", h.ListVersions)
	middleware.CapabilityGET(group, "/pages/:id/versions/by-number/:no", "page.version.read", h.GetVersionByNumber)
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
