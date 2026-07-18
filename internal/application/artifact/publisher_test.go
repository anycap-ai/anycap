package artifact

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeIngestClient struct {
	result model.ArtifactIngestResult
	err    error
}

func (f *fakeIngestClient) Ingest(_ context.Context, _ model.ArtifactIngestRequest) (model.ArtifactIngestResult, error) {
	if f.err != nil {
		return model.ArtifactIngestResult{}, f.err
	}
	return f.result, nil
}

type fakeCapsArtifactRepo struct {
	nextID          int64
	created         []model.CapsArtifact
	failedIDs       []int64
	failedCodes     []string
	readyStorageIDs []int64
}

func (f *fakeCapsArtifactRepo) Create(_ context.Context, input model.CapsArtifact) (*model.CapsArtifact, error) {
	f.nextID++
	item := input
	item.ID = f.nextID
	item.ExternalID = "ca_test_" + strings.Repeat("a", 8)
	f.created = append(f.created, item)
	return &item, nil
}

func (f *fakeCapsArtifactRepo) MarkReady(_ context.Context, id int64, storageObjectID int64, sourceMIME string, sourceSize int64, readyAt time.Time) (*model.CapsArtifact, error) {
	f.readyStorageIDs = append(f.readyStorageIDs, storageObjectID)
	return &model.CapsArtifact{
		ID:              id,
		ExternalID:      "ca_test_" + strings.Repeat("a", 8),
		Status:          model.CapsArtifactStatusReady,
		StorageObjectID: &storageObjectID,
		SourceMIME:      &sourceMIME,
		SourceSize:      &sourceSize,
		ReadyAt:         &readyAt,
	}, nil
}

func (f *fakeCapsArtifactRepo) MarkFailed(_ context.Context, id int64, errorCode string, _ string) (*model.CapsArtifact, error) {
	f.failedIDs = append(f.failedIDs, id)
	f.failedCodes = append(f.failedCodes, errorCode)
	return &model.CapsArtifact{ID: id, Status: model.CapsArtifactStatusFailed}, nil
}

type fakeStorageObjectRepo struct {
	nextID int64
	items  []model.StorageObject
}

func (f *fakeStorageObjectRepo) Create(_ context.Context, input model.StorageObject) (*model.StorageObject, error) {
	f.nextID++
	item := input
	item.ID = f.nextID
	f.items = append(f.items, item)
	return &item, nil
}

func (f *fakeStorageObjectRepo) GetByID(_ context.Context, _ int64) (*model.StorageObject, error) {
	return nil, nil
}

func (f *fakeStorageObjectRepo) ListByPrefix(_ context.Context, _ int64, _ string) ([]model.StorageObject, error) {
	return nil, nil
}

type fakeLinkStore struct {
	keys  []string
	ttls  []int64
	blobs [][]byte
}

func (f *fakeLinkStore) PutJSON(_ context.Context, key string, value []byte, ttlSeconds int64) error {
	f.keys = append(f.keys, key)
	f.ttls = append(f.ttls, ttlSeconds)
	f.blobs = append(f.blobs, append([]byte(nil), value...))
	return nil
}

type fakeSpaceService struct{}

func (f fakeSpaceService) GetOrCreatePersonalSpace(_ context.Context, _ int64) (*model.Space, error) {
	return &model.Space{ID: 99}, nil
}

type fakeObjectStore struct{}

func (f fakeObjectStore) PresignPutObject(_ context.Context, _ string, _ string, _ int64) (model.PresignResult, error) {
	return model.PresignResult{}, nil
}
func (f fakeObjectStore) PresignGetObject(_ context.Context, _ string, _ time.Duration) (string, error) {
	return "", nil
}
func (f fakeObjectStore) HeadObject(_ context.Context, _ string) (*model.StorageObjectHead, error) {
	return nil, nil
}
func (f fakeObjectStore) CopyObject(_ context.Context, _, _ string) error {
	return nil
}
func (f fakeObjectStore) DeleteObject(_ context.Context, _ string) error {
	return nil
}
func (f fakeObjectStore) BucketName() string {
	return "anycap-cloud"
}

func TestPublisher_Publish_RewritesOutputURLAndStoresLink(t *testing.T) {
	capsRepo := &fakeCapsArtifactRepo{}
	storageRepo := &fakeStorageObjectRepo{}
	linkStore := &fakeLinkStore{}

	publisher, err := NewPublisher(
		PublisherConfig{
			PublicBaseURL:  "https://artifact.anycap.dev",
			LinkTTLSeconds: 300,
		},
		&fakeIngestClient{
			result: model.ArtifactIngestResult{
				ETag: "etag-1",
				MIME: "image/png",
				Size: 123,
			},
		},
		capsRepo,
		storageRepo,
		linkStore,
		fakeSpaceService{},
		fakeObjectStore{},
	)
	if err != nil {
		t.Fatalf("NewPublisher() error = %v", err)
	}

	result, err := publisher.Publish(context.Background(), model.ArtifactPublishRequest{
		UserID:         "2000000001",
		Capability:     "image.generate",
		MediaType:      model.CapsArtifactMediaTypeImage,
		Provider:       "nexushub",
		ProviderTaskID: "task-1",
		Outputs: []model.Artifact{
			{
				Type:     "image",
				URL:      "https://provider.example.com/a/b.png?token=abc",
				MIMEType: "image/png",
			},
		},
	})
	if err != nil {
		t.Fatalf("Publish() error = %v", err)
	}
	if len(result.Outputs) != 1 {
		t.Fatalf("expected 1 output, got %d", len(result.Outputs))
	}
	if !strings.HasPrefix(result.Outputs[0].URL, "https://artifact.anycap.dev/a/art_") {
		t.Fatalf("expected rewritten artifact url, got %q", result.Outputs[0].URL)
	}
	if len(linkStore.keys) != 1 || !strings.HasPrefix(linkStore.keys[0], "artifact:link:art_") {
		t.Fatalf("expected artifact link kv key, got %#v", linkStore.keys)
	}
	if linkStore.ttls[0] != 300 {
		t.Fatalf("expected ttl 300, got %d", linkStore.ttls[0])
	}

	var linkRecord model.ArtifactLinkRecord
	if err := json.Unmarshal(linkStore.blobs[0], &linkRecord); err != nil {
		t.Fatalf("unmarshal link record: %v", err)
	}
	if linkRecord.ObjectKey != "caps/outputs/o/ca_test_aaaaaaaa" {
		t.Fatalf("unexpected object key %q", linkRecord.ObjectKey)
	}
	if linkRecord.ETag != "etag-1" {
		t.Fatalf("unexpected etag %q", linkRecord.ETag)
	}
}

func TestPublisher_Publish_IngestFailureMarksArtifactFailed(t *testing.T) {
	capsRepo := &fakeCapsArtifactRepo{}
	storageRepo := &fakeStorageObjectRepo{}
	linkStore := &fakeLinkStore{}

	publisher, err := NewPublisher(
		PublisherConfig{
			PublicBaseURL:  "https://artifact.anycap.dev",
			LinkTTLSeconds: 300,
		},
		&fakeIngestClient{err: errors.New("network down")},
		capsRepo,
		storageRepo,
		linkStore,
		fakeSpaceService{},
		fakeObjectStore{},
	)
	if err != nil {
		t.Fatalf("NewPublisher() error = %v", err)
	}

	_, err = publisher.Publish(context.Background(), model.ArtifactPublishRequest{
		UserID:         "2000000001",
		Capability:     "image.generate",
		MediaType:      model.CapsArtifactMediaTypeImage,
		Provider:       "nexushub",
		ProviderTaskID: "task-1",
		Outputs: []model.Artifact{
			{
				Type:     "image",
				URL:      "https://provider.example.com/a/b.png",
				MIMEType: "image/png",
			},
		},
	})
	if !errors.Is(err, model.ErrUpstreamUnavailable) {
		t.Fatalf("expected ErrUpstreamUnavailable, got %v", err)
	}
	if len(capsRepo.failedIDs) != 1 {
		t.Fatalf("expected failed artifact marked, got %d", len(capsRepo.failedIDs))
	}
	if len(linkStore.keys) != 0 {
		t.Fatalf("expected no link written when ingest fails, got %d", len(linkStore.keys))
	}
}

func TestAudioArtifactFallbacks(t *testing.T) {
	if got := inferFilenameHint("https://provider.example.com/", model.CapsArtifactMediaTypeAudio); got != "output.mp3" {
		t.Fatalf("inferFilenameHint() = %q, want output.mp3", got)
	}
	if got := fallbackMIME("", model.CapsArtifactMediaTypeAudio); got != "audio/mpeg" {
		t.Fatalf("fallbackMIME() = %q, want audio/mpeg", got)
	}
}
