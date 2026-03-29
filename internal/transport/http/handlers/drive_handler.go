package handlers

import (
	"encoding/json"

	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/route"
)

type DriveHandler struct {
	service  *driveapp.Service
	resolver IDResolver
	mapper   presenter.IDMapper
}

func NewDriveHandler(service *driveapp.Service, resolver IDResolver, mapper presenter.IDMapper) *DriveHandler {
	return &DriveHandler{service: service, resolver: resolver, mapper: mapper}
}

func (h *DriveHandler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/drive/folders", h.CreateFolder)
	group.POST("/drive/files/presign", h.PresignFile)
	group.POST("/drive/files/complete", h.CompleteFile)
	group.GET("/drive/nodes", h.ListNodes)
	group.PATCH("/drive/nodes/:id", h.UpdateNode)
	group.DELETE("/drive/nodes/:id", h.DeleteNode)
	group.PUT("/drive/nodes/:id/share", h.UpsertShare)
	group.POST("/drive/nodes/:id/share/rotate", h.RotateShare)
	group.DELETE("/drive/nodes/:id/share", h.RevokeShare)
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
