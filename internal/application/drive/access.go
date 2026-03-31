package drive

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/application/security"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

const driveAccessTokenBodyLength = 27

type driveAccessRecord struct {
	NodeID    int64     `json:"node_id"`
	SpaceID   int64     `json:"space_id"`
	Name      string    `json:"name"`
	ObjectKey string    `json:"object_key"`
	MIME      string    `json:"mime"`
	Size      int64     `json:"size"`
	ExpiresAt time.Time `json:"expires_at"`
}

func (s *Service) CreateAccessLinks(ctx context.Context, userID string, nodeID int64) (*model.DriveAccessLinks, error) {
	if s == nil || s.spaceService == nil || s.nodeRepo == nil || s.storageObjectRepo == nil || s.edgeGrantStore == nil {
		return nil, model.ErrNotConfigured("drive access-links service is not configured")
	}
	if nodeID <= 0 {
		return nil, model.ErrValidation("id must be greater than zero")
	}

	space, err := s.spaceService.GetOrCreatePersonalSpace(ctx, userID)
	if err != nil {
		return nil, err
	}

	node, err := s.nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		return nil, err
	}
	if node == nil || node.SpaceID != space.ID {
		return nil, model.ErrNotFound("drive node not found")
	}
	if node.Kind != model.DriveNodeKindFile {
		return nil, model.ErrValidation("drive node must be a file")
	}
	if node.StorageObjectID == nil || *node.StorageObjectID <= 0 {
		return nil, model.ErrValidation("drive file has no storage object")
	}

	storageObject, err := s.storageObjectRepo.GetByID(ctx, *node.StorageObjectID)
	if err != nil {
		return nil, err
	}
	if storageObject == nil || storageObject.SpaceID != space.ID {
		return nil, model.ErrNotFound("storage object not found")
	}

	token, err := security.GeneratePrefixedToken("drvacc_", driveAccessTokenBodyLength)
	if err != nil {
		return nil, fmt.Errorf("generate drive access token: %w", err)
	}
	expiresAt := s.now().Add(time.Duration(s.accessTTLSeconds) * time.Second)
	payload, err := json.Marshal(driveAccessRecord{
		NodeID:    node.ID,
		SpaceID:   node.SpaceID,
		Name:      node.Name,
		ObjectKey: storageObject.ObjectKey,
		MIME:      storageObject.MIME,
		Size:      storageObject.Size,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		return nil, fmt.Errorf("marshal drive access record: %w", err)
	}

	if err := s.edgeGrantStore.PutJSON(ctx, "drive:access:"+token, payload, s.accessTTLSeconds); err != nil {
		return nil, err
	}

	baseURL := strings.TrimRight(strings.TrimSpace(s.accessBaseURL), "/")
	previewURL := baseURL + "/o/" + url.PathEscape(token)
	return &model.DriveAccessLinks{
		PreviewURL:  previewURL,
		DownloadURL: previewURL + "/raw?download=1",
		ExpiresAt:   expiresAt,
	}, nil
}
