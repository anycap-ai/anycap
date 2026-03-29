package handlers

import (
	"encoding/json"

	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"

	"github.com/cloudwego/hertz/pkg/route"
)

type DriveHandler struct {
	service *driveapp.Service
	mapper  ExternalIDMapper
}

type DriveHandlerOption func(*DriveHandler)

func WithDriveExternalIDMapper(mapper ExternalIDMapper) DriveHandlerOption {
	return func(h *DriveHandler) {
		h.mapper = mapper
	}
}

func NewDriveHandler(service *driveapp.Service, options ...DriveHandlerOption) *DriveHandler {
	handler := &DriveHandler{service: service}
	for _, option := range options {
		if option != nil {
			option(handler)
		}
	}
	return handler
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

type driveNodeDTO struct {
	ID          string  `json:"id"`
	SpaceID     string  `json:"space_id"`
	ParentID    *string `json:"parent_id,omitempty"`
	Kind        string  `json:"kind"`
	Name        string  `json:"name"`
	Size        *int64  `json:"size,omitempty"`
	MIME        *string `json:"mime,omitempty"`
	EdgeVersion int64   `json:"edge_version"`
	CreatedBy   string  `json:"created_by"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
	DeletedAt   *string `json:"deleted_at,omitempty"`
}

type driveFilePresignDTO struct {
	UploadSessionID string `json:"upload_session_id"`
	FileID          string `json:"file_id"`
	UploadURL       string `json:"upload_url"`
	ObjectURL       string `json:"object_url"`
	ObjectKey       string `json:"object_key"`
	ExpiresIn       int    `json:"expires_in"`
}

type driveShareViewDTO struct {
	NodeID      string  `json:"node_id"`
	Token       string  `json:"token"`
	URL         string  `json:"url"`
	ExpiresAt   *string `json:"expires_at,omitempty"`
	HasPassword bool    `json:"has_password"`
	Status      string  `json:"status"`
}
