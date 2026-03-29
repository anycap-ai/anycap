package capabilities

import (
	"context"
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func (s *Service) resolveImageInputs(ctx context.Context, spaceID int64, userID string, req model.ImageUnderstandRequest) (model.ImageUnderstandRequest, []model.CapsTaskArtifact, error) {
	resolvedReq := req
	artifacts := make([]model.CapsTaskArtifact, 0)

	if len(req.Images) > 0 {
		resolvedReq.Images = make([]model.MediaInput, len(req.Images))
		for idx, item := range req.Images {
			resolvedReq.Images[idx] = item
			if strings.TrimSpace(item.URL) == "" {
				continue
			}
			resolvedURL, artifact, err := s.resolveInputURL(ctx, spaceID, userID, item.URL)
			if err != nil {
				return model.ImageUnderstandRequest{}, nil, err
			}
			resolvedReq.Images[idx].URL = resolvedURL
			artifact.Role = model.CapsTaskArtifactRoleInput
			artifact.Position = idx
			artifacts = append(artifacts, artifact)
		}
		return resolvedReq, artifacts, nil
	}

	if strings.TrimSpace(req.URL) != "" {
		resolvedURL, artifact, err := s.resolveInputURL(ctx, spaceID, userID, req.URL)
		if err != nil {
			return model.ImageUnderstandRequest{}, nil, err
		}
		resolvedReq.URL = resolvedURL
		artifact.Role = model.CapsTaskArtifactRoleInput
		artifact.Position = 0
		artifacts = append(artifacts, artifact)
	}

	return resolvedReq, artifacts, nil
}

func (s *Service) resolveVideoInput(ctx context.Context, spaceID int64, userID string, req model.VideoReadRequest) (model.VideoReadRequest, []model.CapsTaskArtifact, error) {
	resolvedReq := req
	artifacts := make([]model.CapsTaskArtifact, 0, 1)
	if strings.TrimSpace(req.URL) == "" {
		return resolvedReq, artifacts, nil
	}

	resolvedURL, artifact, err := s.resolveInputURL(ctx, spaceID, userID, req.URL)
	if err != nil {
		return model.VideoReadRequest{}, nil, err
	}
	resolvedReq.URL = resolvedURL
	artifact.Role = model.CapsTaskArtifactRoleInput
	artifact.Position = 0
	artifacts = append(artifacts, artifact)
	return resolvedReq, artifacts, nil
}

func (s *Service) resolveInputURL(ctx context.Context, spaceID int64, userID, rawURL string) (string, model.CapsTaskArtifact, error) {
	trimmedURL := strings.TrimSpace(rawURL)
	artifact := model.CapsTaskArtifact{
		SourceKind: model.CapsTaskArtifactSourceKindExternalURL,
	}
	if trimmedURL == "" {
		return "", artifact, model.ErrMissingInput
	}

	uploadExternalID, isUploadRef := parseUploadRefExternalID(trimmedURL)
	if !isUploadRef {
		if looksLikeAnyCapRef(trimmedURL) {
			return "", artifact, model.ErrUploadReferenceInvalid
		}
		artifactURL := trimmedURL
		artifact.SourceURL = &artifactURL
		return trimmedURL, artifact, nil
	}

	upload, err := s.capsUploadRepo.GetByExternalID(ctx, uploadExternalID)
	if err != nil {
		return "", artifact, err
	}
	if upload == nil {
		return "", artifact, model.ErrUploadReferenceNotFound
	}
	if upload.SpaceID != spaceID || strings.TrimSpace(upload.CreatedBy) != strings.TrimSpace(userID) {
		return "", artifact, model.ErrUploadReferenceForbidden
	}
	if upload.Status == model.CapsUploadStatusExpired || upload.ExpiresAt.Before(s.now()) {
		return "", artifact, model.ErrUploadReferenceNotFound
	}

	head, err := s.objectStore.HeadObject(ctx, upload.ObjectKey)
	if err != nil {
		return "", artifact, fmt.Errorf("head uploaded object: %w", err)
	}
	if head == nil {
		return "", artifact, model.ErrUploadObjectNotFound
	}

	stored, err := s.storageObjectRepo.Create(ctx, model.StorageObject{
		SpaceID:   spaceID,
		Bucket:    s.objectStore.BucketName(),
		ObjectKey: upload.ObjectKey,
		Size:      head.Size,
		MIME:      fallbackMIME(head.MIME),
		ETag:      strings.TrimSpace(head.ETag),
		SHA256:    upload.SHA256,
	})
	if err != nil {
		return "", artifact, err
	}

	if _, err := s.capsUploadRepo.MarkUsed(ctx, upload.ID, s.now()); err != nil {
		return "", artifact, err
	}

	presignedURL, err := s.objectStore.PresignGetObject(ctx, upload.ObjectKey, s.presignGetExpiry)
	if err != nil {
		return "", artifact, err
	}

	uploadRef := uploadRefURL(upload.ExternalID)
	artifact.SourceKind = model.CapsTaskArtifactSourceKindAnyCapUpload
	artifact.SourceURL = &uploadRef
	if stored != nil {
		artifact.StorageObjectID = &stored.ID
	}
	return presignedURL, artifact, nil
}
