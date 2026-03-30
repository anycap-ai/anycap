package kvsync

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeKVClient struct {
	values map[string][]byte
}

func (c *fakeKVClient) Put(_ context.Context, key string, value []byte) error {
	if c.values == nil {
		c.values = map[string][]byte{}
	}
	c.values[key] = append([]byte(nil), value...)
	return nil
}

func (c *fakeKVClient) Delete(_ context.Context, key string) error {
	if c.values == nil {
		c.values = map[string][]byte{}
	}
	delete(c.values, key)
	return nil
}

type fakeProjectorPageSiteRepo struct {
	site *model.PageSite
}

func (r *fakeProjectorPageSiteRepo) Create(context.Context, model.CreatePageSiteInput) (*model.PageSite, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageSiteRepo) ListBySpace(context.Context, model.ListPageSitesFilter) ([]model.PageSite, int, error) {
	return nil, 0, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageSiteRepo) GetByID(_ context.Context, _ int64) (*model.PageSite, error) {
	if r.site == nil {
		return nil, nil
	}
	cloned := *r.site
	return &cloned, nil
}
func (r *fakeProjectorPageSiteRepo) Update(context.Context, model.UpdatePageSiteInput) (*model.PageSite, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageSiteRepo) SetCurrentVersion(context.Context, int64, int64, *int64) (*model.PageSite, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageSiteRepo) SoftDelete(context.Context, int64, int64) error {
	return fmt.Errorf("not implemented")
}

type fakeProjectorPageVersionRepo struct {
	version *model.PageVersion
}

func (r *fakeProjectorPageVersionRepo) CreateDraft(context.Context, int64, string, string) (*model.PageVersion, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageVersionRepo) CreateDraftFromSource(context.Context, int64, string, string, int64) (*model.PageVersion, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageVersionRepo) GetByID(_ context.Context, _ int64) (*model.PageVersion, error) {
	if r.version == nil {
		return nil, nil
	}
	cloned := *r.version
	return &cloned, nil
}
func (r *fakeProjectorPageVersionRepo) UpdateStatus(context.Context, int64, model.PageVersionStatus) (*model.PageVersion, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageVersionRepo) ListByPageID(context.Context, model.ListPageVersionsFilter) ([]model.PageVersion, int, error) {
	return nil, 0, fmt.Errorf("not implemented")
}
func (r *fakeProjectorPageVersionRepo) GetByPageIDAndVersionNo(context.Context, int64, int64) (*model.PageVersion, error) {
	return nil, fmt.Errorf("not implemented")
}

func TestPageProjector_HostSync(t *testing.T) {
	currentVersionID := int64(7)
	siteRepo := &fakeProjectorPageSiteRepo{site: &model.PageSite{
		ID:               1,
		SpaceID:          100,
		PageName:         "docs-center",
		CurrentVersionID: &currentVersionID,
		AccessMode:       model.PageAccessModePublic,
		SPAFallback:      true,
		EdgeVersion:      3,
		UpdatedAt:        time.Now().UTC(),
	}}
	versionRepo := &fakeProjectorPageVersionRepo{version: &model.PageVersion{
		ID:          7,
		PageID:      1,
		VersionNo:   2,
		Status:      model.PageVersionStatusPublished,
		AssetPrefix: "page/spaces/100/sites/1/versions/2",
	}}
	kv := &fakeKVClient{}

	projector := NewPageProjector(kv, siteRepo, versionRepo, "page-%s.anycap.cloud")
	result, err := projector.Project(context.Background(), model.KVSyncJob{
		JobType:     model.KVSyncJobTypePageHostSync,
		TargetID:    "1",
		EdgeVersion: 3,
	})
	if err != nil {
		t.Fatalf("Project() error = %v", err)
	}
	if result != ProjectResultDone {
		t.Fatalf("expected done result, got %v", result)
	}

	key := "page:host:page-docs-center.anycap.cloud"
	raw, ok := kv.values[key]
	if !ok {
		t.Fatalf("expected key %q", key)
	}
	var payload map[string]any
	if err := json.Unmarshal(raw, &payload); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}
	if got := payload["asset_prefix"]; got != "page/spaces/100/sites/1/versions/2" {
		t.Fatalf("unexpected asset_prefix: %#v", got)
	}
}

func TestPageProjector_HostDelete(t *testing.T) {
	siteRepo := &fakeProjectorPageSiteRepo{site: &model.PageSite{
		ID:          1,
		SpaceID:     100,
		PageName:    "docs-center",
		EdgeVersion: 4,
	}}
	versionRepo := &fakeProjectorPageVersionRepo{}
	kv := &fakeKVClient{
		values: map[string][]byte{
			"page:host:page-docs-center.anycap.cloud": []byte(`{"ok":true}`),
		},
	}

	projector := NewPageProjector(kv, siteRepo, versionRepo, "page-%s.anycap.cloud")
	result, err := projector.Project(context.Background(), model.KVSyncJob{
		JobType:     model.KVSyncJobTypePageHostDelete,
		TargetID:    "1",
		EdgeVersion: 4,
	})
	if err != nil {
		t.Fatalf("Project() error = %v", err)
	}
	if result != ProjectResultDone {
		t.Fatalf("expected done result, got %v", result)
	}
	if _, ok := kv.values["page:host:page-docs-center.anycap.cloud"]; ok {
		t.Fatal("expected page host key to be deleted")
	}
}
