package page

import (
	"encoding/json"

	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
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
	group.POST("/pages", h.CreateSite)
	group.GET("/pages", h.ListSites)
	group.GET("/pages/:id", h.GetSite)
	group.PATCH("/pages/:id", h.UpdateSite)
	group.DELETE("/pages/:id", h.DeleteSite)
	group.POST("/pages/:id/versions", h.CreateVersion)
	group.POST("/pages/:id/versions/:vid/files/presign", h.PresignVersionAsset)
	group.POST("/pages/:id/versions/:vid/files/complete", h.CompleteVersionAsset)
	group.POST("/pages/:id/versions/:vid/finalize", h.FinalizeVersion)
	group.POST("/pages/:id/versions/:vid/publish", h.PublishVersion)
	group.POST("/pages/:id/versions/:vid/rollback-clone", h.RollbackCloneVersion)
	group.POST("/pages/:id/unpublish", h.Unpublish)
	group.GET("/pages/:id/versions", h.ListVersions)
	group.GET("/pages/:id/versions/by-number/:no", h.GetVersionByNumber)
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
