package drive

import (
	"encoding/json"

	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service  *driveapp.Service
	resolver idresolver.IDResolver
	mapper   presenter.IDMapper
}

func NewHandler(service *driveapp.Service, resolver idresolver.IDResolver, mapper presenter.IDMapper) *Handler {
	return &Handler{service: service, resolver: resolver, mapper: mapper}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	middleware.CapabilityPOST(group, "/drive/folders", "drive.folder.create", h.CreateFolder)
	middleware.CapabilityPOST(group, "/drive/files/presign", "drive.file.upload.prepare", h.PresignFile)
	middleware.CapabilityPOST(group, "/drive/files/complete", "drive.file.upload.complete", h.CompleteFile)
	middleware.CapabilityGET(group, "/drive/nodes", "drive.browse", h.ListNodes)
	middleware.CapabilityPATCH(group, "/drive/nodes/:id", "drive.item.update", h.UpdateNode)
	middleware.CapabilityDELETE(group, "/drive/nodes/:id", "drive.item.delete", h.DeleteNode)
	middleware.CapabilityGET(group, "/drive/nodes/:id/share", "drive.share.get", h.GetShare)
	middleware.CapabilityPUT(group, "/drive/nodes/:id/share", "drive.share.update", h.UpsertShare)
	middleware.CapabilityPOST(group, "/drive/nodes/:id/share/rotate", "drive.share.rotate", h.RotateShare)
	middleware.CapabilityDELETE(group, "/drive/nodes/:id/share", "drive.share.revoke", h.RevokeShare)
	middleware.CapabilityPOST(group, "/drive/nodes/:id/access-links", "drive.file.access", h.CreateAccessLinks)
}

type createFolderRequest struct {
	ParentID json.RawMessage `json:"parent_id"`
	Name     string          `json:"name"`
}

type presignFileRequest struct {
	ParentID      json.RawMessage `json:"parent_id"`
	Name          string          `json:"name"`
	ContentType   string          `json:"content_type"`
	ContentLength int64           `json:"content_length"`
}

type completeFileRequest struct {
	UploadSessionID json.RawMessage `json:"upload_session_id"`
	FileID          json.RawMessage `json:"file_id"`
}

type upsertShareRequest struct {
	ExpiresInSeconds *int64  `json:"expires_in_seconds"`
	NoExpire         bool    `json:"no_expire"`
	Password         *string `json:"password"`
	NoPassword       bool    `json:"no_password"`
}
