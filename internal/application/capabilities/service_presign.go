package capabilities

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func (s *Service) Presign(ctx context.Context, req model.PresignRequest) (model.PresignResult, error) {
	if err := req.Validate(); err != nil {
		return model.PresignResult{}, err
	}

	if s == nil || s.objectStore == nil {
		return model.PresignResult{}, model.ErrStorageNotConfigured
	}

	if !s.auditEnabled() {
		objectKey := buildCapsInputObjectKey(0, req.Filename, s.now().UTC())
		return s.objectStore.PresignPutObject(ctx, objectKey, req.ContentType, req.ContentLength)
	}

	actor, err := s.resolveActor(ctx)
	if err != nil {
		return model.PresignResult{}, err
	}

	normalizedSHA := normalizeSHA256(req.SHA256)
	if normalizedSHA != "" {
		existing, findErr := s.capsUploadRepo.FindReusable(ctx, actor.Space.ID, normalizedSHA, req.ContentLength, req.ContentType)
		if findErr != nil {
			return model.PresignResult{}, findErr
		}
		if existing != nil {
			return model.PresignResult{
				UploadURL: "",
				ObjectURL: uploadRefURL(existing.ExternalID),
				ExpiresIn: secondsUntil(existing.ExpiresAt, s.now()),
				Reused:    true,
			}, nil
		}
	}

	objectKey := buildCapsInputObjectKey(actor.Space.ID, req.Filename, s.now().UTC())
	presignResult, err := s.objectStore.PresignPutObject(ctx, objectKey, req.ContentType, req.ContentLength)
	if err != nil {
		return model.PresignResult{}, err
	}

	var sha256Ptr *string
	if normalizedSHA != "" {
		sha256Ptr = &normalizedSHA
	}
	upload, err := s.capsUploadRepo.Create(ctx, model.CapsUpload{
		SpaceID:   actor.Space.ID,
		ObjectKey: objectKey,
		Filename:  req.Filename,
		MIME:      req.ContentType,
		Size:      req.ContentLength,
		SHA256:    sha256Ptr,
		Status:    model.CapsUploadStatusPending,
		ExpiresAt: s.now().Add(time.Duration(presignResult.ExpiresIn) * time.Second),
		CreatedBy: actor.UserID,
	})
	if err != nil {
		return model.PresignResult{}, err
	}

	return model.PresignResult{
		UploadURL: presignResult.UploadURL,
		ObjectURL: uploadRefURL(upload.ExternalID),
		ObjectKey: presignResult.ObjectKey,
		ExpiresIn: presignResult.ExpiresIn,
		Reused:    false,
	}, nil
}
