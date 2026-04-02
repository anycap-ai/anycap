package artifact

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
)

const (
	linkTokenPrefix       = "art_"
	linkKeyPrefix         = "artifact:link:"
	defaultLinkTTLSeconds = int64(600)
	defaultIngestMaxBytes = int64(100 * 1024 * 1024)
)

type PublisherConfig struct {
	PublicBaseURL  string
	LinkTTLSeconds int64
	IngestMaxBytes int64
}

type Publisher struct {
	publicBaseURL  string
	linkTTL        int64
	ingestMaxBytes int64

	ingestClient      port.ArtifactIngestClient
	capsArtifactRepo  port.CapsArtifactRepository
	storageObjectRepo port.StorageObjectRepository
	linkStore         port.EdgeGrantStore
	spaceService      port.SpaceService
	objectStore       port.CloudObjectStore
	now               func() time.Time
}

func NewPublisher(
	cfg PublisherConfig,
	ingestClient port.ArtifactIngestClient,
	capsArtifactRepo port.CapsArtifactRepository,
	storageObjectRepo port.StorageObjectRepository,
	linkStore port.EdgeGrantStore,
	spaceService port.SpaceService,
	objectStore port.CloudObjectStore,
) (*Publisher, error) {
	publicBaseURL := strings.TrimRight(strings.TrimSpace(cfg.PublicBaseURL), "/")
	if publicBaseURL == "" {
		return nil, fmt.Errorf("artifact public base url is required")
	}
	parsed, err := url.Parse(publicBaseURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return nil, fmt.Errorf("artifact public base url is invalid")
	}
	if ingestClient == nil || capsArtifactRepo == nil || storageObjectRepo == nil || linkStore == nil || spaceService == nil || objectStore == nil {
		return nil, fmt.Errorf("artifact publisher dependencies are incomplete")
	}

	linkTTL := cfg.LinkTTLSeconds
	if linkTTL <= 0 {
		linkTTL = defaultLinkTTLSeconds
	}
	ingestMaxBytes := cfg.IngestMaxBytes
	if ingestMaxBytes <= 0 {
		ingestMaxBytes = defaultIngestMaxBytes
	}

	return &Publisher{
		publicBaseURL:     publicBaseURL,
		linkTTL:           linkTTL,
		ingestMaxBytes:    ingestMaxBytes,
		ingestClient:      ingestClient,
		capsArtifactRepo:  capsArtifactRepo,
		storageObjectRepo: storageObjectRepo,
		linkStore:         linkStore,
		spaceService:      spaceService,
		objectStore:       objectStore,
		now:               time.Now,
	}, nil
}

func (p *Publisher) Publish(ctx context.Context, req model.ArtifactPublishRequest) (model.ArtifactPublishResult, error) {
	if p == nil {
		return model.ArtifactPublishResult{}, model.ErrNotConfigured("artifact publisher is not configured")
	}
	if strings.TrimSpace(req.UserID) == "" {
		return model.ArtifactPublishResult{}, model.ErrAuthInvalid
	}
	if len(req.Outputs) == 0 {
		return model.ArtifactPublishResult{Outputs: nil}, nil
	}

	spaceID, err := p.resolveSpaceID(ctx, req.UserID)
	if err != nil {
		return model.ArtifactPublishResult{}, err
	}

	published := make([]model.Artifact, len(req.Outputs))
	now := p.now().UTC()
	for idx := range req.Outputs {
		published[idx], err = p.publishOne(ctx, req, spaceID, idx, now)
		if err != nil {
			return model.ArtifactPublishResult{}, err
		}
	}

	return model.ArtifactPublishResult{Outputs: published}, nil
}

func (p *Publisher) publishOne(ctx context.Context, req model.ArtifactPublishRequest, spaceID int64, position int, now time.Time) (model.Artifact, error) {
	output := req.Outputs[position]
	sourceURL := strings.TrimSpace(output.URL)
	if sourceURL == "" {
		return model.Artifact{}, p.failUpstream("output url is empty")
	}

	sourceMIME := trimToPtr(output.MIMEType)
	artifactRecord, err := p.capsArtifactRepo.Create(ctx, model.CapsArtifact{
		SpaceID:        spaceID,
		Provider:       strings.TrimSpace(req.Provider),
		ProviderTaskID: strings.TrimSpace(req.ProviderTaskID),
		Capability:     strings.TrimSpace(req.Capability),
		MediaType:      req.MediaType,
		Position:       position,
		Status:         model.CapsArtifactStatusPending,
		SourceURL:      sourceURL,
		SourceMIME:     sourceMIME,
		CreatedBy:      strings.TrimSpace(req.UserID),
	})
	if err != nil {
		return model.Artifact{}, fmt.Errorf("create caps artifact: %w", err)
	}

	objectKey := buildArtifactObjectKey(artifactRecord.ExternalID)
	filenameHint := inferFilenameHint(sourceURL, req.MediaType)
	ingestResult, err := p.ingestClient.Ingest(ctx, model.ArtifactIngestRequest{
		SourceURL:       sourceURL,
		ObjectKey:       objectKey,
		MediaType:       req.MediaType,
		FilenameHint:    filenameHint,
		ContentTypeHint: strings.TrimSpace(output.MIMEType),
		MaxBytes:        p.ingestMaxBytes,
	})
	if err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":                 "artifact.publish",
			"capability":           strings.TrimSpace(req.Capability),
			"media_type":           string(req.MediaType),
			"provider":             strings.TrimSpace(req.Provider),
			"provider_task_id":     strings.TrimSpace(req.ProviderTaskID),
			"user_id":              strings.TrimSpace(req.UserID),
			"artifact_id":          artifactRecord.ID,
			"artifact_external_id": strings.TrimSpace(artifactRecord.ExternalID),
			"output_position":      position,
			"object_key":           objectKey,
			"source_url":           sanitizeURLForLog(sourceURL),
			"source_mime":          strings.TrimSpace(output.MIMEType),
			"max_bytes":            p.ingestMaxBytes,
		}).WithError(err).Error("ingest failed")
		p.markArtifactFailed(ctx, artifactRecord.ID, "INGEST_FAILED", "artifact ingest failed")
		return model.Artifact{}, p.failUpstream("artifact ingest failed")
	}

	storedObject, err := p.storageObjectRepo.Create(ctx, model.StorageObject{
		SpaceID:   spaceID,
		Bucket:    p.objectStore.BucketName(),
		ObjectKey: objectKey,
		Size:      ingestResult.Size,
		MIME:      fallbackMIME(ingestResult.MIME, req.MediaType),
		ETag:      strings.TrimSpace(ingestResult.ETag),
	})
	if err != nil {
		p.markArtifactFailed(ctx, artifactRecord.ID, "STORAGE_PERSIST_FAILED", "persist storage object failed")
		return model.Artifact{}, fmt.Errorf("create storage object: %w", err)
	}

	readyRecord, err := p.capsArtifactRepo.MarkReady(
		ctx,
		artifactRecord.ID,
		storedObject.ID,
		storedObject.MIME,
		storedObject.Size,
		now,
	)
	if err != nil {
		p.markArtifactFailed(ctx, artifactRecord.ID, "ARTIFACT_READY_FAILED", "update artifact ready failed")
		return model.Artifact{}, fmt.Errorf("mark artifact ready: %w", err)
	}
	if readyRecord == nil {
		p.markArtifactFailed(ctx, artifactRecord.ID, "ARTIFACT_NOT_FOUND", "artifact record is missing")
		return model.Artifact{}, p.failUpstream("artifact record is missing")
	}

	token := externalid.GenerateWithLen(linkTokenPrefix, 20)
	expiresAt := now.Add(time.Duration(p.linkTTL) * time.Second)
	record := model.ArtifactLinkRecord{
		ObjectKey:          objectKey,
		MIME:               storedObject.MIME,
		Size:               storedObject.Size,
		ETag:               storedObject.ETag,
		ArtifactExternalID: readyRecord.ExternalID,
		ExpiresAt:          expiresAt.Format(time.RFC3339),
	}
	recordBytes, err := json.Marshal(record)
	if err != nil {
		p.markArtifactFailed(ctx, artifactRecord.ID, "LINK_SERIALIZE_FAILED", "serialize artifact link failed")
		return model.Artifact{}, fmt.Errorf("marshal artifact link record: %w", err)
	}
	if err := p.linkStore.PutJSON(ctx, linkKeyPrefix+token, recordBytes, p.linkTTL); err != nil {
		p.markArtifactFailed(ctx, artifactRecord.ID, "LINK_STORE_FAILED", "store artifact link failed")
		return model.Artifact{}, p.failUpstream("artifact link store failed")
	}

	output.URL = p.publicBaseURL + "/a/" + token
	output.MIMEType = storedObject.MIME
	return output, nil
}

func (p *Publisher) resolveSpaceID(ctx context.Context, userID string) (int64, error) {
	userID = strings.TrimSpace(userID)
	numericUserID, err := strconv.ParseInt(userID, 10, 64)
	if err != nil || numericUserID <= 0 {
		return 0, model.ErrInternal
	}
	space, err := p.spaceService.GetOrCreatePersonalSpace(ctx, numericUserID)
	if err != nil {
		return 0, err
	}
	if space == nil || space.ID <= 0 {
		return 0, model.ErrInternal
	}
	return space.ID, nil
}

func buildArtifactObjectKey(capsArtifactExternalID string) string {
	return "caps/outputs/o/" + strings.TrimSpace(capsArtifactExternalID)
}

func inferFilenameHint(rawURL string, mediaType model.CapsArtifactMediaType) string {
	parsed, err := url.Parse(strings.TrimSpace(rawURL))
	if err == nil {
		base := strings.TrimSpace(path.Base(parsed.Path))
		if base != "" && base != "." && base != "/" {
			return base
		}
	}

	switch mediaType {
	case model.CapsArtifactMediaTypeVideo:
		return "output.mp4"
	case model.CapsArtifactMediaTypeMusic:
		return "output.mp3"
	default:
		return "output.png"
	}
}

func fallbackMIME(mime string, mediaType model.CapsArtifactMediaType) string {
	trimmed := strings.TrimSpace(mime)
	if trimmed != "" {
		return trimmed
	}
	switch mediaType {
	case model.CapsArtifactMediaTypeVideo:
		return "video/mp4"
	case model.CapsArtifactMediaTypeMusic:
		return "audio/mpeg"
	default:
		return "image/png"
	}
}

func trimToPtr(raw string) *string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func (p *Publisher) markArtifactFailed(ctx context.Context, artifactID int64, code string, message string) {
	if p == nil || p.capsArtifactRepo == nil || artifactID <= 0 {
		return
	}
	if _, err := p.capsArtifactRepo.MarkFailed(ctx, artifactID, code, message); err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":        "artifact.publish",
			"artifact_id": artifactID,
			"code":        strings.TrimSpace(code),
		}).WithError(err).Error("mark failed update failed")
	}
}

func (p *Publisher) failUpstream(message string) error {
	trimmed := strings.TrimSpace(message)
	if trimmed == "" {
		return model.ErrUpstreamUnavailable
	}
	return fmt.Errorf("%w: %s", model.ErrUpstreamUnavailable, trimmed)
}

func sanitizeURLForLog(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	parsed, err := url.Parse(trimmed)
	if err != nil {
		return trimmed
	}
	if parsed.Scheme == "" || parsed.Host == "" {
		return trimmed
	}
	return parsed.Scheme + "://" + parsed.Host + parsed.Path
}
