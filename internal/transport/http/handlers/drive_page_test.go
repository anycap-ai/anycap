package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type testSpaceService struct {
	space *model.Space
}

func (s *testSpaceService) GetOrCreatePersonalSpace(_ context.Context, _ string) (*model.Space, error) {
	return s.space, nil
}

type testDriveNodeRepo struct {
	nodes  map[int64]*model.DriveNode
	nextID int64
}

func (r *testDriveNodeRepo) CreateFolder(_ context.Context, input model.CreateDriveFolderInput) (*model.DriveNode, error) {
	if r.nodes == nil {
		r.nodes = map[int64]*model.DriveNode{}
	}
	r.nextID++
	now := time.Now().UTC()
	node := &model.DriveNode{
		ID:          r.nextID,
		SpaceID:     input.SpaceID,
		ParentID:    input.ParentID,
		Kind:        model.DriveNodeKindFolder,
		Name:        input.Name,
		CreatedBy:   input.CreatedBy,
		EdgeVersion: 1,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	r.nodes[node.ID] = node
	return cloneDriveNodeForHandler(node), nil
}

func (r *testDriveNodeRepo) CreateFile(_ context.Context, input model.CreateDriveFileInput) (*model.DriveNode, error) {
	if r.nodes == nil {
		r.nodes = map[int64]*model.DriveNode{}
	}
	r.nextID++
	now := time.Now().UTC()
	node := &model.DriveNode{
		ID:          r.nextID,
		SpaceID:     input.SpaceID,
		ParentID:    input.ParentID,
		Kind:        model.DriveNodeKindFile,
		Name:        input.Name,
		CreatedBy:   input.CreatedBy,
		Size:        input.Size,
		MIME:        input.MIME,
		EdgeVersion: 1,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	r.nodes[node.ID] = node
	return cloneDriveNodeForHandler(node), nil
}

func (r *testDriveNodeRepo) GetByID(_ context.Context, id int64) (*model.DriveNode, error) {
	node, ok := r.nodes[id]
	if !ok || node.DeletedAt != nil {
		return nil, nil
	}
	return cloneDriveNodeForHandler(node), nil
}

func (r *testDriveNodeRepo) ListByParent(_ context.Context, filter model.ListDriveNodesFilter) ([]model.DriveNode, error) {
	items := make([]model.DriveNode, 0)
	for _, node := range r.nodes {
		if node.DeletedAt != nil || node.SpaceID != filter.SpaceID || !sameNullableParent(node.ParentID, filter.ParentID) {
			continue
		}
		items = append(items, *cloneDriveNodeForHandler(node))
	}
	return items, nil
}

func (r *testDriveNodeRepo) Update(_ context.Context, input model.UpdateDriveNodeInput) (*model.DriveNode, error) {
	node, ok := r.nodes[input.ID]
	if !ok || node.DeletedAt != nil || node.SpaceID != input.SpaceID {
		return nil, nil
	}
	if input.Name != nil {
		node.Name = *input.Name
	}
	if input.UpdateParent {
		node.ParentID = input.ParentID
	}
	node.EdgeVersion++
	node.UpdatedAt = time.Now().UTC()
	return cloneDriveNodeForHandler(node), nil
}

func (r *testDriveNodeRepo) AttachStorageObject(_ context.Context, input model.AttachDriveNodeStorageInput) (*model.DriveNode, error) {
	node, ok := r.nodes[input.NodeID]
	if !ok || node.DeletedAt != nil || node.SpaceID != input.SpaceID {
		return nil, nil
	}
	node.StorageObjectID = &input.StorageObjectID
	node.Size = &input.Size
	node.MIME = &input.MIME
	node.EdgeVersion++
	node.UpdatedAt = time.Now().UTC()
	return cloneDriveNodeForHandler(node), nil
}

func (r *testDriveNodeRepo) ExistsInSubtree(_ context.Context, _, _, _ int64) (bool, error) {
	return false, nil
}

func (r *testDriveNodeRepo) SoftDeleteSubtree(_ context.Context, spaceID, rootID int64) (int64, error) {
	node, ok := r.nodes[rootID]
	if !ok || node.SpaceID != spaceID || node.DeletedAt != nil {
		return 0, nil
	}
	now := time.Now().UTC()
	node.DeletedAt = &now
	node.UpdatedAt = now
	node.EdgeVersion++
	return 1, nil
}

type testPageSiteRepo struct {
	sites      map[int64]*model.PageSite
	nextID     int64
	byPageName map[string]int64
}

func (r *testPageSiteRepo) Create(_ context.Context, input model.CreatePageSiteInput) (*model.PageSite, error) {
	if r.sites == nil {
		r.sites = map[int64]*model.PageSite{}
	}
	if r.byPageName == nil {
		r.byPageName = map[string]int64{}
	}
	if _, exists := r.byPageName[input.PageName]; exists {
		return nil, fmt.Errorf("duplicate")
	}
	r.nextID++
	now := time.Now().UTC()
	site := &model.PageSite{
		ID:           r.nextID,
		SpaceID:      input.SpaceID,
		Name:         input.Name,
		PageName:     input.PageName,
		AccessMode:   input.AccessMode,
		PasswordHash: input.PasswordHash,
		PasswordSalt: input.PasswordSalt,
		SPAFallback:  input.SPAFallback,
		EdgeVersion:  1,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	r.sites[site.ID] = site
	r.byPageName[site.PageName] = site.ID
	return clonePageSiteForHandler(site), nil
}

func (r *testPageSiteRepo) ListBySpace(_ context.Context, spaceID int64) ([]model.PageSite, error) {
	items := make([]model.PageSite, 0)
	for _, site := range r.sites {
		if site.SpaceID == spaceID && site.DeletedAt == nil {
			items = append(items, *clonePageSiteForHandler(site))
		}
	}
	return items, nil
}

func (r *testPageSiteRepo) GetByID(_ context.Context, id int64) (*model.PageSite, error) {
	site, ok := r.sites[id]
	if !ok || site.DeletedAt != nil {
		return nil, nil
	}
	return clonePageSiteForHandler(site), nil
}

func (r *testPageSiteRepo) Update(_ context.Context, input model.UpdatePageSiteInput) (*model.PageSite, error) {
	site, ok := r.sites[input.ID]
	if !ok || site.DeletedAt != nil || site.SpaceID != input.SpaceID {
		return nil, nil
	}
	if input.Name != nil {
		site.Name = *input.Name
	}
	if input.AccessMode != nil {
		site.AccessMode = *input.AccessMode
	}
	if input.SPAFallback != nil {
		site.SPAFallback = *input.SPAFallback
	}
	if input.UpdatePassword {
		site.PasswordHash = input.PasswordHash
		site.PasswordSalt = input.PasswordSalt
	}
	site.EdgeVersion++
	site.UpdatedAt = time.Now().UTC()
	return clonePageSiteForHandler(site), nil
}

func (r *testPageSiteRepo) SetCurrentVersion(_ context.Context, spaceID, id int64, versionID *int64) (*model.PageSite, error) {
	site, ok := r.sites[id]
	if !ok || site.DeletedAt != nil || site.SpaceID != spaceID {
		return nil, nil
	}
	if versionID == nil {
		site.CurrentVersionID = nil
	} else {
		value := *versionID
		site.CurrentVersionID = &value
	}
	site.EdgeVersion++
	site.UpdatedAt = time.Now().UTC()
	return clonePageSiteForHandler(site), nil
}

func (r *testPageSiteRepo) SoftDelete(_ context.Context, _, _ int64) error {
	return nil
}

type testPageSlugRepo struct {
	slugs map[string]int64
}

func (r *testPageSlugRepo) Create(_ context.Context, slug string, pageID int64) error {
	if r.slugs == nil {
		r.slugs = map[string]int64{}
	}
	if _, exists := r.slugs[slug]; exists {
		return fmt.Errorf("duplicate")
	}
	r.slugs[slug] = pageID
	return nil
}

func (r *testPageSlugRepo) MarkTombstone(_ context.Context, _ string, _ int64) error {
	return nil
}

type testPageVersionRepo struct {
	versions map[int64]*model.PageVersion
	byPage   map[int64][]int64
	nextID   int64
}

func (r *testPageVersionRepo) CreateDraft(_ context.Context, pageID int64, createdBy string, assetPrefix string) (*model.PageVersion, error) {
	if r.versions == nil {
		r.versions = map[int64]*model.PageVersion{}
	}
	if r.byPage == nil {
		r.byPage = map[int64][]int64{}
	}
	r.nextID++

	versionNo := int64(1)
	for _, id := range r.byPage[pageID] {
		if current, ok := r.versions[id]; ok && current.VersionNo >= versionNo {
			versionNo = current.VersionNo + 1
		}
	}

	if strings.TrimSpace(assetPrefix) == "" {
		assetPrefix = fmt.Sprintf("page/sites/%d/versions", pageID)
	}
	assetPrefix = fmt.Sprintf("%s/%d", strings.TrimRight(assetPrefix, "/"), versionNo)

	version := &model.PageVersion{
		ID:          r.nextID,
		PageID:      pageID,
		VersionNo:   versionNo,
		Status:      model.PageVersionStatusDraft,
		AssetPrefix: assetPrefix,
		CreatedBy:   createdBy,
		CreatedAt:   time.Now().UTC(),
	}
	r.versions[version.ID] = version
	r.byPage[pageID] = append(r.byPage[pageID], version.ID)
	cloned := *version
	return &cloned, nil
}

func (r *testPageVersionRepo) CreateDraftFromSource(_ context.Context, pageID int64, createdBy string, assetPrefix string, sourceVersionID int64) (*model.PageVersion, error) {
	version, err := r.CreateDraft(context.Background(), pageID, createdBy, assetPrefix)
	if err != nil {
		return nil, err
	}
	version.SourceVersionID = &sourceVersionID
	if existing, ok := r.versions[version.ID]; ok {
		existing.SourceVersionID = &sourceVersionID
	}
	return version, nil
}

func (r *testPageVersionRepo) GetByID(_ context.Context, id int64) (*model.PageVersion, error) {
	version, ok := r.versions[id]
	if !ok {
		return nil, nil
	}
	cloned := *version
	return &cloned, nil
}

func (r *testPageVersionRepo) UpdateStatus(_ context.Context, id int64, status model.PageVersionStatus) (*model.PageVersion, error) {
	version, ok := r.versions[id]
	if !ok {
		return nil, nil
	}
	version.Status = status
	cloned := *version
	return &cloned, nil
}

func (r *testPageVersionRepo) ListByPageID(_ context.Context, pageID int64) ([]model.PageVersion, error) {
	ids := r.byPage[pageID]
	items := make([]model.PageVersion, 0, len(ids))
	for i := len(ids) - 1; i >= 0; i-- {
		version, ok := r.versions[ids[i]]
		if !ok {
			continue
		}
		items = append(items, *version)
	}
	return items, nil
}

var _ port.DriveNodeRepository = (*testDriveNodeRepo)(nil)
var _ port.PageSiteRepository = (*testPageSiteRepo)(nil)
var _ port.PageVersionRepository = (*testPageVersionRepo)(nil)

func TestDriveHandler_CreateAndList(t *testing.T) {
	spaceSvc := &testSpaceService{space: &model.Space{ID: 100, OwnerUserID: "u-1"}}
	driveSvc := driveapp.NewService(spaceSvc, &testDriveNodeRepo{})
	h := server.Default(server.WithHostPorts("127.0.0.1:0"))
	v1 := h.Group("/v1")
	protected := v1.Group("", middleware.LocalBypassAuth(model.Principal{UserID: "u-1", AuthType: "test"}))
	NewDriveHandler(driveSvc, PassthroughIDResolver{}, presenter.PassthroughIDMapper{}).RegisterRoutes(protected)

	createBody := []byte(`{"name":"docs"}`)
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/drive/folders",
		&ut.Body{Body: bytes.NewReader(createBody), Len: len(createBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"name":"docs"`) {
		t.Fatalf("expected created folder name in response, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodGet, "/v1/drive/nodes", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"total":1`) {
		t.Fatalf("expected total=1, got %s", resp.Body.String())
	}
}

func TestPageHandler_CreateAndUpdate(t *testing.T) {
	spaceSvc := &testSpaceService{space: &model.Space{ID: 100, OwnerUserID: "u-1"}}
	pageSvc := pageapp.NewService(spaceSvc, &testPageSiteRepo{}, &testPageSlugRepo{}, "pepper-xyz")
	h := server.Default(server.WithHostPorts("127.0.0.1:0"))
	v1 := h.Group("/v1")
	protected := v1.Group("", middleware.LocalBypassAuth(model.Principal{UserID: "u-1", AuthType: "test"}))
	NewPageHandler(pageSvc, PassthroughIDResolver{}, presenter.PassthroughIDMapper{}).RegisterRoutes(protected)

	createBody := []byte(`{"name":"Docs Site"}`)
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/pages",
		&ut.Body{Body: bytes.NewReader(createBody), Len: len(createBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var envelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("unmarshal create response: %v", err)
	}
	data, ok := envelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", envelope["data"])
	}
	idStr, ok := data["id"].(string)
	if !ok {
		t.Fatalf("expected string id in response, got %#v", data["id"])
	}

	patchBody := []byte(`{"access_mode":"password","password":"secret-123"}`)
	resp = ut.PerformRequest(h.Engine, http.MethodPatch, fmt.Sprintf("/v1/pages/%s", idStr),
		&ut.Body{Body: bytes.NewReader(patchBody), Len: len(patchBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"access_mode":"password"`) {
		t.Fatalf("expected updated access mode in response, got %s", resp.Body.String())
	}
}

func TestPageHandler_VersionUploadAndFinalize(t *testing.T) {
	spaceSvc := &testSpaceService{space: &model.Space{ID: 100, OwnerUserID: "u-1"}}
	pageSvc := pageapp.NewService(
		spaceSvc,
		&testPageSiteRepo{},
		&testPageSlugRepo{},
		"pepper-xyz",
		pageapp.WithVersioning(&testPageVersionRepo{}, &testUploadSessionRepo{}, &testStorageObjectRepo{}, &testCloudObjectStore{}),
	)
	h := server.Default(server.WithHostPorts("127.0.0.1:0"))
	v1 := h.Group("/v1")
	protected := v1.Group("", middleware.LocalBypassAuth(model.Principal{UserID: "u-1", AuthType: "test"}))
	NewPageHandler(pageSvc, PassthroughIDResolver{}, presenter.PassthroughIDMapper{}).RegisterRoutes(protected)

	createBody := []byte(`{"name":"Docs Site"}`)
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/pages",
		&ut.Body{Body: bytes.NewReader(createBody), Len: len(createBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var createSiteEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &createSiteEnvelope); err != nil {
		t.Fatalf("unmarshal create site response: %v", err)
	}
	createdSite := createSiteEnvelope["data"].(map[string]any)
	siteID := createdSite["id"].(string)

	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/versions", siteID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var createVersionEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &createVersionEnvelope); err != nil {
		t.Fatalf("unmarshal create version response: %v", err)
	}
	createdVersion := createVersionEnvelope["data"].(map[string]any)
	versionID := createdVersion["id"].(string)

	presignBody := []byte(`{"asset_path":"index.html","content_type":"text/html","content_length":42}`)
	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/versions/%s/files/presign", siteID, versionID),
		&ut.Body{Body: bytes.NewReader(presignBody), Len: len(presignBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var presignEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &presignEnvelope); err != nil {
		t.Fatalf("unmarshal presign response: %v", err)
	}
	presignData := presignEnvelope["data"].(map[string]any)
	uploadSessionID := presignData["upload_session_id"].(string)

	completeBody := []byte(fmt.Sprintf(`{"upload_session_id":"%s"}`, uploadSessionID))
	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/versions/%s/files/complete", siteID, versionID),
		&ut.Body{Body: bytes.NewReader(completeBody), Len: len(completeBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"status":"draft"`) {
		t.Fatalf("expected status=draft before finalize, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/versions/%s/finalize", siteID, versionID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"status":"verified"`) {
		t.Fatalf("expected status=verified after finalize, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodGet, fmt.Sprintf("/v1/pages/%s/versions", siteID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"total":1`) {
		t.Fatalf("expected total=1, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/versions/%s/publish", siteID, versionID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"status":"published"`) {
		t.Fatalf("expected status=published after publish, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/unpublish", siteID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	var unpublishEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &unpublishEnvelope); err != nil {
		t.Fatalf("unmarshal unpublish response: %v", err)
	}
	unpublishData, ok := unpublishEnvelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected unpublish data object, got %#v", unpublishEnvelope["data"])
	}
	if _, exists := unpublishData["current_version_id"]; exists {
		t.Fatalf("expected current_version_id omitted after unpublish, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/pages/%s/versions/%s/rollback-clone", siteID, versionID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"source_version_id":`) {
		t.Fatalf("expected source_version_id in rollback clone response, got %s", resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"status":"verified"`) {
		t.Fatalf("expected rollback clone status=verified, got %s", resp.Body.String())
	}
}

func sameNullableParent(a, b *int64) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	return *a == *b
}

func cloneDriveNodeForHandler(node *model.DriveNode) *model.DriveNode {
	if node == nil {
		return nil
	}
	cloned := *node
	if node.ParentID != nil {
		v := *node.ParentID
		cloned.ParentID = &v
	}
	if node.StorageObjectID != nil {
		v := *node.StorageObjectID
		cloned.StorageObjectID = &v
	}
	if node.Size != nil {
		v := *node.Size
		cloned.Size = &v
	}
	if node.MIME != nil {
		v := *node.MIME
		cloned.MIME = &v
	}
	if node.DeletedAt != nil {
		v := *node.DeletedAt
		cloned.DeletedAt = &v
	}
	return &cloned
}

func clonePageSiteForHandler(site *model.PageSite) *model.PageSite {
	if site == nil {
		return nil
	}
	cloned := *site
	if site.CurrentVersionID != nil {
		v := *site.CurrentVersionID
		cloned.CurrentVersionID = &v
	}
	if site.PasswordHash != nil {
		v := *site.PasswordHash
		cloned.PasswordHash = &v
	}
	if site.PasswordSalt != nil {
		v := *site.PasswordSalt
		cloned.PasswordSalt = &v
	}
	if site.DeletedAt != nil {
		v := *site.DeletedAt
		cloned.DeletedAt = &v
	}
	return &cloned
}

type testUploadSessionRepo struct {
	sessions map[int64]*model.UploadSession
	nextID   int64
}

func (r *testUploadSessionRepo) Create(_ context.Context, input model.UploadSession) (*model.UploadSession, error) {
	if r.sessions == nil {
		r.sessions = map[int64]*model.UploadSession{}
	}
	r.nextID++
	session := input
	session.ID = r.nextID
	session.CreatedAt = time.Now().UTC()
	r.sessions[session.ID] = &session
	return cloneUploadSessionForHandler(&session), nil
}

func (r *testUploadSessionRepo) GetByID(_ context.Context, id int64) (*model.UploadSession, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, nil
	}
	return cloneUploadSessionForHandler(session), nil
}

func (r *testUploadSessionRepo) MarkCompleted(_ context.Context, id int64) error {
	session, ok := r.sessions[id]
	if !ok {
		return nil
	}
	session.Status = model.UploadSessionStatusCompleted
	return nil
}

func (r *testUploadSessionRepo) CountCompletedByTarget(_ context.Context, targetType model.UploadTargetType, targetID int64) (int64, error) {
	var count int64
	for _, session := range r.sessions {
		if session.TargetType == targetType && session.TargetID == targetID && session.Status == model.UploadSessionStatusCompleted {
			count++
		}
	}
	return count, nil
}

type testStorageObjectRepo struct {
	objects map[int64]*model.StorageObject
	nextID  int64
}

func (r *testStorageObjectRepo) Create(_ context.Context, input model.StorageObject) (*model.StorageObject, error) {
	if r.objects == nil {
		r.objects = map[int64]*model.StorageObject{}
	}
	r.nextID++
	obj := input
	obj.ID = r.nextID
	obj.CreatedAt = time.Now().UTC()
	r.objects[obj.ID] = &obj
	return &obj, nil
}

func (r *testStorageObjectRepo) GetByID(_ context.Context, id int64) (*model.StorageObject, error) {
	obj, ok := r.objects[id]
	if !ok {
		return nil, nil
	}
	cloned := *obj
	return &cloned, nil
}

func (r *testStorageObjectRepo) ListByPrefix(_ context.Context, spaceID int64, objectKeyPrefix string) ([]model.StorageObject, error) {
	items := make([]model.StorageObject, 0)
	for _, object := range r.objects {
		if object.SpaceID != spaceID {
			continue
		}
		if strings.HasPrefix(object.ObjectKey, objectKeyPrefix) {
			items = append(items, *object)
		}
	}
	return items, nil
}

type testCloudObjectStore struct {
	headByKey map[string]*model.StorageObjectHead
}

func (s *testCloudObjectStore) PresignPutObject(_ context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error) {
	if s.headByKey == nil {
		s.headByKey = map[string]*model.StorageObjectHead{}
	}
	s.headByKey[objectKey] = &model.StorageObjectHead{Size: contentLength, MIME: contentType, ETag: "etag"}
	return model.PresignResult{UploadURL: "https://upload.example.com/put", ObjectURL: "https://cdn.example.com/obj", ObjectKey: objectKey, ExpiresIn: 600}, nil
}

func (s *testCloudObjectStore) PresignGetObject(_ context.Context, objectKey string, _ time.Duration) (string, error) {
	return "https://download.example.com/" + objectKey, nil
}

func (s *testCloudObjectStore) HeadObject(_ context.Context, objectKey string) (*model.StorageObjectHead, error) {
	head, ok := s.headByKey[objectKey]
	if !ok {
		return nil, nil
	}
	cloned := *head
	return &cloned, nil
}

func (s *testCloudObjectStore) CopyObject(_ context.Context, sourceObjectKey, targetObjectKey string) error {
	if s.headByKey == nil {
		s.headByKey = map[string]*model.StorageObjectHead{}
	}
	head, ok := s.headByKey[sourceObjectKey]
	if !ok {
		return fmt.Errorf("source object not found")
	}
	cloned := *head
	s.headByKey[targetObjectKey] = &cloned
	return nil
}

func (s *testCloudObjectStore) DeleteObject(_ context.Context, _ string) error {
	return nil
}

func (s *testCloudObjectStore) BucketName() string {
	return "anycap-cloud"
}

type testDriveShareRepo struct {
	links  map[int64]*model.DriveShareLink
	nextID int64
}

func (r *testDriveShareRepo) GetActiveByNodeID(_ context.Context, nodeID int64) (*model.DriveShareLink, error) {
	link, ok := r.links[nodeID]
	if !ok || link.Status != model.DriveShareStatusActive {
		return nil, nil
	}
	return cloneDriveShareForHandler(link), nil
}

func (r *testDriveShareRepo) Create(_ context.Context, link model.DriveShareLink) (*model.DriveShareLink, error) {
	if r.links == nil {
		r.links = map[int64]*model.DriveShareLink{}
	}
	r.nextID++
	now := time.Now().UTC()
	link.ID = r.nextID
	link.CreatedAt = now
	link.UpdatedAt = now
	r.links[link.NodeID] = &link
	return cloneDriveShareForHandler(&link), nil
}

func (r *testDriveShareRepo) Update(_ context.Context, link model.DriveShareLink) (*model.DriveShareLink, error) {
	existing, ok := r.links[link.NodeID]
	if !ok {
		return nil, nil
	}
	existing.Token = link.Token
	existing.ExpiresAt = link.ExpiresAt
	existing.PasswordHash = link.PasswordHash
	existing.PasswordSalt = link.PasswordSalt
	existing.EdgeVersion++
	existing.UpdatedAt = time.Now().UTC()
	return cloneDriveShareForHandler(existing), nil
}

func (r *testDriveShareRepo) RevokeActiveByNodeID(_ context.Context, nodeID int64) error {
	link, ok := r.links[nodeID]
	if !ok {
		return nil
	}
	link.Status = model.DriveShareStatusRevoked
	link.EdgeVersion++
	link.UpdatedAt = time.Now().UTC()
	return nil
}

func TestDriveHandler_UploadAndShare(t *testing.T) {
	spaceSvc := &testSpaceService{space: &model.Space{ID: 100, OwnerUserID: "u-1"}}
	nodeRepo := &testDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFolder,
			Name:    "root",
		},
	}}
	uploadRepo := &testUploadSessionRepo{}
	storageRepo := &testStorageObjectRepo{}
	objectStore := &testCloudObjectStore{}
	shareRepo := &testDriveShareRepo{}

	driveSvc := driveapp.NewService(
		spaceSvc,
		nodeRepo,
		driveapp.WithUpload(uploadRepo, storageRepo, objectStore),
		driveapp.WithShare(shareRepo, "pepper", "https://drive.anycap.cloud/s"),
	)

	h := server.Default(server.WithHostPorts("127.0.0.1:0"))
	v1 := h.Group("/v1")
	protected := v1.Group("", middleware.LocalBypassAuth(model.Principal{UserID: "u-1", AuthType: "test"}))
	NewDriveHandler(driveSvc, PassthroughIDResolver{}, presenter.PassthroughIDMapper{}).RegisterRoutes(protected)

	presignBody := []byte(`{"parent_id":"1","name":"a.txt","content_type":"text/plain","content_length":12}`)
	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/drive/files/presign",
		&ut.Body{Body: bytes.NewReader(presignBody), Len: len(presignBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var presignEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &presignEnvelope); err != nil {
		t.Fatalf("unmarshal presign response: %v", err)
	}
	presignData, ok := presignEnvelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", presignEnvelope["data"])
	}
	uploadSessionID := presignData["upload_session_id"].(string)
	fileID := presignData["file_id"].(string)

	completeBody := []byte(fmt.Sprintf(`{"upload_session_id":"%s","file_id":"%s"}`, uploadSessionID, fileID))
	resp = ut.PerformRequest(h.Engine, http.MethodPost, "/v1/drive/files/complete",
		&ut.Body{Body: bytes.NewReader(completeBody), Len: len(completeBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"name":"a.txt"`) {
		t.Fatalf("expected file name in response, got %s", resp.Body.String())
	}

	shareBody := []byte(`{"expires_in_seconds":3600,"password":"secret-123"}`)
	resp = ut.PerformRequest(h.Engine, http.MethodPut, fmt.Sprintf("/v1/drive/nodes/%s/share", fileID),
		&ut.Body{Body: bytes.NewReader(shareBody), Len: len(shareBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"url":"https://drive.anycap.cloud/s/`) {
		t.Fatalf("expected share url in response, got %s", resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodPost, fmt.Sprintf("/v1/drive/nodes/%s/share/rotate", fileID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.Engine, http.MethodDelete, fmt.Sprintf("/v1/drive/nodes/%s/share", fileID), nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !strings.Contains(resp.Body.String(), `"revoked":true`) {
		t.Fatalf("expected revoked=true, got %s", resp.Body.String())
	}
}

func cloneUploadSessionForHandler(session *model.UploadSession) *model.UploadSession {
	if session == nil {
		return nil
	}
	cloned := *session
	return &cloned
}

func cloneDriveShareForHandler(link *model.DriveShareLink) *model.DriveShareLink {
	if link == nil {
		return nil
	}
	cloned := *link
	if link.ExpiresAt != nil {
		v := *link.ExpiresAt
		cloned.ExpiresAt = &v
	}
	if link.PasswordHash != nil {
		v := *link.PasswordHash
		cloned.PasswordHash = &v
	}
	if link.PasswordSalt != nil {
		v := *link.PasswordSalt
		cloned.PasswordSalt = &v
	}
	return &cloned
}
