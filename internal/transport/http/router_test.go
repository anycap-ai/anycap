package http

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"testing"
	"time"

	capapp "gitlab.knoffice.tech/engineering/anycap/internal/application/capabilities"
	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	driveapp "gitlab.knoffice.tech/engineering/anycap/internal/application/drive"
	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	pageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/page"
	systemapp "gitlab.knoffice.tech/engineering/anycap/internal/application/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/feedbackstore"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/lark"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/loginsession"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/ratelimit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	userstore "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/user"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/capabilities"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/catalog"
	drivehandler "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/drive"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/feedback"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/modelroute"
	pagehandler "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/page"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/system"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/cloudwego/hertz/pkg/route"
)

type modelRouteRepoStub struct {
	items []model.ModelRoute
}

type testIdentityTokenAuthenticator struct {
	principals map[string]model.Principal
}

func (a *testIdentityTokenAuthenticator) AuthenticateIdentityToken(_ context.Context, rawToken string) (model.Principal, error) {
	principal, ok := a.principals[rawToken]
	if !ok {
		return model.Principal{}, model.ErrAuthInvalid
	}
	return principal, nil
}

func (s *modelRouteRepoStub) ListModelRoutes(_ context.Context, _ model.ListModelRoutesFilter) ([]model.ModelRoute, error) {
	return s.items, nil
}

func (s *modelRouteRepoStub) GetModelRoute(_ context.Context, id int64) (*model.ModelRoute, error) {
	for i := range s.items {
		if s.items[i].ID == id {
			return &s.items[i], nil
		}
	}
	return nil, nil
}

func (s *modelRouteRepoStub) CreateModelRoute(_ context.Context, input model.CreateModelRouteInput) (*model.ModelRoute, error) {
	item := model.ModelRoute{
		ID:          1,
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		DisplayName: input.DisplayName,
		RouteType:   input.RouteType,
		Region:      input.Region,
		Tier:        input.Tier,
		Env:         input.Env,
		Priority:    input.Priority,
		Enabled:     routeInputEnabled(input.Enabled),
		Status:      input.Status,
		Extra:       input.Extra,
	}
	return &item, nil
}

func (s *modelRouteRepoStub) UpdateModelRoute(_ context.Context, id int64, input model.UpdateModelRouteInput) (*model.ModelRoute, error) {
	item := model.ModelRoute{
		ID:          id,
		ModelID:     input.ModelID,
		Capability:  input.Capability,
		Operation:   input.Operation,
		AbilityKey:  input.AbilityKey,
		AlgoType:    input.AlgoType,
		DisplayName: input.DisplayName,
		RouteType:   input.RouteType,
		Region:      input.Region,
		Tier:        input.Tier,
		Env:         input.Env,
		Priority:    input.Priority,
		Enabled:     routeInputEnabled(input.Enabled),
		Status:      input.Status,
		Extra:       input.Extra,
	}
	return &item, nil
}

func (s *modelRouteRepoStub) DeleteModelRoute(_ context.Context, _ int64) error {
	return nil
}

func routeInputEnabled(value *bool) bool {
	if value == nil {
		return false
	}
	return *value
}

// --- Drive/Page test fakes ---

type fakeSpaceService struct {
	space *model.Space
}

func (s *fakeSpaceService) GetOrCreatePersonalSpace(_ context.Context, _ string) (*model.Space, error) {
	return s.space, nil
}

type fakeDriveNodeRepo struct {
	nodes  map[int64]*model.DriveNode
	nextID int64
}

func (r *fakeDriveNodeRepo) CreateFolder(_ context.Context, input model.CreateDriveFolderInput) (*model.DriveNode, error) {
	if r.nodes == nil {
		r.nodes = map[int64]*model.DriveNode{}
	}
	r.nextID++
	node := &model.DriveNode{
		ID:          r.nextID,
		SpaceID:     input.SpaceID,
		ParentID:    input.ParentID,
		Kind:        model.DriveNodeKindFolder,
		Name:        input.Name,
		CreatedBy:   input.CreatedBy,
		EdgeVersion: 1,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	r.nodes[node.ID] = node
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) CreateFile(_ context.Context, input model.CreateDriveFileInput) (*model.DriveNode, error) {
	if r.nodes == nil {
		r.nodes = map[int64]*model.DriveNode{}
	}
	r.nextID++
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
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	r.nodes[node.ID] = node
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) GetByID(_ context.Context, id int64) (*model.DriveNode, error) {
	node, ok := r.nodes[id]
	if !ok || node.DeletedAt != nil {
		return nil, nil
	}
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) ListByParent(_ context.Context, filter model.ListDriveNodesFilter) ([]model.DriveNode, error) {
	items := make([]model.DriveNode, 0)
	for _, node := range r.nodes {
		if node.DeletedAt != nil || node.SpaceID != filter.SpaceID {
			continue
		}
		if !sameNullableInt64(node.ParentID, filter.ParentID) {
			continue
		}
		items = append(items, *cloneDriveNode(node))
	}
	return items, nil
}

func (r *fakeDriveNodeRepo) Update(_ context.Context, input model.UpdateDriveNodeInput) (*model.DriveNode, error) {
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
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) AttachStorageObject(_ context.Context, input model.AttachDriveNodeStorageInput) (*model.DriveNode, error) {
	node, ok := r.nodes[input.NodeID]
	if !ok || node.DeletedAt != nil || node.SpaceID != input.SpaceID {
		return nil, nil
	}
	node.StorageObjectID = &input.StorageObjectID
	node.Size = &input.Size
	node.MIME = &input.MIME
	node.EdgeVersion++
	node.UpdatedAt = time.Now().UTC()
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) ExistsInSubtree(_ context.Context, spaceID, rootID, targetID int64) (bool, error) {
	visited := map[int64]bool{}
	queue := []int64{rootID}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		if visited[current] {
			continue
		}
		visited[current] = true
		if current == targetID {
			return true, nil
		}
		for _, node := range r.nodes {
			if node.DeletedAt != nil || node.SpaceID != spaceID || node.ParentID == nil {
				continue
			}
			if *node.ParentID == current {
				queue = append(queue, node.ID)
			}
		}
	}
	return false, nil
}

func (r *fakeDriveNodeRepo) SoftDeleteSubtree(_ context.Context, spaceID, rootID int64) (int64, error) {
	toDelete := []int64{rootID}
	deletedCount := int64(0)
	for len(toDelete) > 0 {
		current := toDelete[0]
		toDelete = toDelete[1:]
		node, ok := r.nodes[current]
		if !ok || node.DeletedAt != nil || node.SpaceID != spaceID {
			continue
		}
		now := time.Now().UTC()
		node.DeletedAt = &now
		node.UpdatedAt = now
		node.EdgeVersion++
		deletedCount++
		for _, child := range r.nodes {
			if child.DeletedAt != nil || child.SpaceID != spaceID || child.ParentID == nil {
				continue
			}
			if *child.ParentID == current {
				toDelete = append(toDelete, child.ID)
			}
		}
	}
	return deletedCount, nil
}

func cloneDriveNode(n *model.DriveNode) *model.DriveNode {
	c := *n
	return &c
}

func sameNullableInt64(a, b *int64) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	return *a == *b
}

type fakePageSiteRepo struct {
	sites  map[int64]*model.PageSite
	nextID int64
}

func (r *fakePageSiteRepo) Create(_ context.Context, input model.CreatePageSiteInput) (*model.PageSite, error) {
	if r.sites == nil {
		r.sites = map[int64]*model.PageSite{}
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
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) ListBySpace(_ context.Context, spaceID int64) ([]model.PageSite, error) {
	items := make([]model.PageSite, 0)
	for _, site := range r.sites {
		if site.SpaceID != spaceID || site.DeletedAt != nil {
			continue
		}
		items = append(items, *clonePageSite(site))
	}
	return items, nil
}

func (r *fakePageSiteRepo) GetByID(_ context.Context, id int64) (*model.PageSite, error) {
	site, ok := r.sites[id]
	if !ok || site.DeletedAt != nil {
		return nil, nil
	}
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) Update(_ context.Context, input model.UpdatePageSiteInput) (*model.PageSite, error) {
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
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) SetCurrentVersion(_ context.Context, spaceID, id int64, versionID *int64) (*model.PageSite, error) {
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
	return clonePageSite(site), nil
}

func (r *fakePageSiteRepo) SoftDelete(_ context.Context, spaceID, id int64) error {
	site, ok := r.sites[id]
	if !ok || site.SpaceID != spaceID || site.DeletedAt != nil {
		return nil
	}
	now := time.Now().UTC()
	site.DeletedAt = &now
	site.UpdatedAt = now
	site.EdgeVersion++
	return nil
}

func clonePageSite(s *model.PageSite) *model.PageSite {
	c := *s
	return &c
}

type fakePageSlugRepo struct {
	slugs map[string]int64
}

func (r *fakePageSlugRepo) Create(_ context.Context, slug string, pageID int64) error {
	if r.slugs == nil {
		r.slugs = map[string]int64{}
	}
	r.slugs[slug] = pageID
	return nil
}

func (r *fakePageSlugRepo) MarkTombstone(_ context.Context, _ string, _ int64) error {
	return nil
}

func newRouterForTest(t *testing.T, rpm int) (*serverHarness, string) {
	t.Helper()

	apiKeys := apikey.NewMemoryService()
	loginSessions := loginsession.NewMemoryLoginSessionRepo()
	users := userstore.NewMemoryProvisioner()
	seededUser, _, err := users.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:  "auth0|user-123",
		Email:   "user@example.com",
		Name:    "Demo User",
		Picture: "https://cdn.example.com/avatar.png",
	}, time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("seed user: %v", err)
	}
	sparseUser, _, err := users.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID: "auth0|user-sparse",
	}, time.Date(2026, 3, 25, 10, 5, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("seed sparse user: %v", err)
	}
	callLogs := calllog.NewMemoryCallLogRepo()
	creditClient := credit.NewStubClient(map[string]int64{seededUser.ID: 3})
	_ = callLogs.Insert(context.Background(), model.CallLog{
		RequestID:  "req_123",
		UserID:     seededUser.ID,
		Capability: "image.generate",
		Model:      "flux-dev",
		Status:     "success",
		CreditCost: 1,
		CreatedAt:  time.Date(2026, 3, 26, 10, 30, 0, 0, time.UTC),
	})
	created, err := apiKeys.CreateAPIKey(t.Context(), seededUser.ID, "cli")
	if err != nil {
		t.Fatalf("CreateAPIKey() error = %v", err)
	}

	sessionSeq := 0
	systemService := systemapp.NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev", Commit: "abc123", Date: "2026-03-24T00:00:00Z"}, apiKeys)
	systemService.SetUserReader(users)
	systemService.SetCreditClient(creditClient)
	systemService.SetCallLogRepo(callLogs)
	passthroughMapper := presenter.PassthroughIDMapper{}
	systemHandler := system.NewHandler(systemService, passthroughMapper)
	loginHandler := login.NewHandler(loginapp.NewService(
		users,
		credit.NewStubClient(nil),
		apiKeys,
		loginSessions,
		"https://anycap.local/auth/device",
		func() string {
			sessionSeq++
			return "state-" + string(rune('0'+sessionSeq))
		},
		func() string {
			sessionSeq++
			return "lsn-" + string(rune('0'+sessionSeq))
		},
		func() string {
			sessionSeq++
			return "CODE-" + string(rune('0'+sessionSeq))
		},
		func() time.Time { return time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC) },
		7*24*time.Hour,
	), passthroughMapper)
	catalogRepo := nexushub.NewCatalogStubWith([]model.ModelSpec{{ModelID: "flux-dev", Capability: model.CapabilityImage, DisplayName: "FLUX Dev", Status: "active", Operations: map[model.Operation]model.OperationSpec{model.OperationGenerate: {RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}}, Routes: []model.RouteBinding{{RouteType: model.RouteTypeDirect, AbilityKey: "flux-dev", GenType: string(model.CapabilityImage), AlgoType: "txt_2_img", Priority: 100, Enabled: true}}}}}})
	imageHandler := image.NewHandler(imageapp.NewService(catalogRepo, nexushub.NewStubClient(), creditClient, callLogs))
	catalogService := catalogapp.NewService(catalogRepo)
	imageCatalog := catalog.NewHandler(catalogService, model.CapabilityImage)
	capHandler := capabilities.NewHandler(capapp.NewService(agentplatform.NewStubClient(), s3store.NewStubClient()))
	feedbackHandler := feedback.NewHandler(feedbackapp.NewService(feedbackstore.NewMemoryFeedbackRepo(), lark.NewStubNotifier(), "test"))
	passthroughResolver := idresolver.PassthroughIDResolver{}
	testSpace := &model.Space{ID: 100, OwnerUserID: seededUser.ID}
	driveService := driveapp.NewService(&fakeSpaceService{space: testSpace}, &fakeDriveNodeRepo{})
	driveHandler := drivehandler.NewHandler(driveService, passthroughResolver, passthroughMapper)
	pageService := pageapp.NewService(&fakeSpaceService{space: testSpace}, &fakePageSiteRepo{}, &fakePageSlugRepo{}, "test-pepper")
	pageHandler := pagehandler.NewHandler(pageService, passthroughResolver, passthroughMapper)
	modelRouteHandler := modelroute.NewHandler(modelrouteapp.NewService(&modelRouteRepoStub{
		items: []model.ModelRoute{
			{
				ID:         1,
				ModelID:    "nano-banana-2",
				Capability: model.CapabilityImage,
				Operation:  model.OperationEdit,
				AbilityKey: "google_nano_banana_2",
				AlgoType:   "img_2_img",
				Status:     model.ModelRouteStatusActive,
			},
		},
	}), passthroughResolver, passthroughMapper)
	identityTokens := &testIdentityTokenAuthenticator{
		principals: map[string]model.Principal{
			"jwt-demo-token": {
				UserID:         seededUser.ID,
				AuthType:       "auth0_jwt",
				ExternalUserID: "auth0|user-123",
				Email:          seededUser.Email,
				Name:           seededUser.Name,
				Picture:        seededUser.AvatarURL,
			},
			"jwt-sparse-token": {
				UserID:         sparseUser.ID,
				AuthType:       "auth0_jwt",
				ExternalUserID: "auth0|user-sparse",
			},
		},
	}

	engine := NewRouter(RouterConfig{
		Addr: ":0",
		Middlewares: []app.HandlerFunc{
			middleware.Recover(), middleware.RequestID(), middleware.AccessLog(),
		},
		Root: []RouteRegistrar{
			RouteRegistrarFunc(systemHandler.RegisterRootRoutes),
			RouteRegistrarFunc(loginHandler.RegisterRootRoutes),
		},
		V1: []RouteRegistrar{
			systemHandler,
			loginHandler,
			imageCatalog,
			modelRouteHandler,
			RouteRegistrarFunc(func(group *route.RouterGroup) {
				protected := group.Group("", middleware.Auth(apiKeys, identityTokens), middleware.RateLimit(ratelimit.NewInMemoryLimiter(), rpm))
				systemHandler.RegisterProtectedRoutes(protected)
				loginHandler.RegisterProtectedRoutes(protected)
				imageHandler.RegisterRoutes(protected)
				driveHandler.RegisterRoutes(protected)
				pageHandler.RegisterRoutes(protected)
				capHandler.RegisterRoutes(protected)
				feedbackHandler.RegisterRoutes(protected)
			}),
		},
	})

	return &serverHarness{engine: engine}, created.RawKey
}

type serverHarness struct {
	engine *server.Hertz
}

func TestRouter_HealthAndLogin(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/ping", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.Code)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/login/init", &ut.Body{Body: bytes.NewReader([]byte(`{"method":"browser_poll"}`)), Len: len(`{"method":"browser_poll"}`)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var initEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &initEnvelope); err != nil {
		t.Fatalf("unmarshal init response: %v", err)
	}
	data, ok := initEnvelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", initEnvelope["data"])
	}
	if loginSessionID, _ := data["login_session_id"].(string); loginSessionID == "" {
		t.Fatalf("expected login_session_id, got %#v", data)
	}
	if browserURL, _ := data["browser_url"].(string); browserURL == "" {
		t.Fatalf("expected browser_url, got %#v", data)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var deviceEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &deviceEnvelope); err != nil {
		t.Fatalf("unmarshal device init response: %v", err)
	}
	deviceData, ok := deviceEnvelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", deviceEnvelope["data"])
	}
	deviceSessionID, _ := deviceData["login_session_id"].(string)
	if deviceSessionID == "" {
		t.Fatalf("expected device login_session_id, got %#v", deviceData)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-poll", &ut.Body{Body: bytes.NewReader([]byte(`{"login_session_id":"` + deviceSessionID + `"}`)), Len: len(`{"login_session_id":"` + deviceSessionID + `"}`)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_DeprecatedWebFlowRejected(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	initBody := []byte(`{"method":"web","redirect_url":"http://localhost:3000/auth/callback"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/login", &ut.Body{Body: bytes.NewReader(initBody), Len: len(initBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_BrowserPollLoginFlow(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	initBody := []byte(`{"method":"browser_poll"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/login", &ut.Body{Body: bytes.NewReader(initBody), Len: len(initBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	loginSessionID, _ := data["login_session_id"].(string)
	browserURLRaw, _ := data["browser_url"].(string)
	pollToken, _ := data["poll_token"].(string)
	if loginSessionID == "" || browserURLRaw == "" || pollToken == "" {
		t.Fatalf("expected login_session_id/browser_url/poll_token, got %#v", data)
	}

	browserURL, err := url.Parse(browserURLRaw)
	if err != nil {
		t.Fatalf("parse browser url: %v", err)
	}
	browserToken := browserURL.Query().Get("browser_token")
	if browserToken == "" {
		t.Fatalf("expected browser_token in browser url, got %q", browserURLRaw)
	}

	verifyBody := []byte(`{"browser_token":"` + browserToken + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/browser-verify", &ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer jwt-demo-token"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	pollBody := []byte(`{"login_session_id":"` + loginSessionID + `","poll_token":"` + pollToken + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal poll response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if data["status"] != model.LoginSessionStatusComplete {
		t.Fatalf("expected complete, got %#v", data["status"])
	}
	if apiKey, _ := data["api_key"].(string); apiKey == "" {
		t.Fatalf("expected api_key in poll response, got %#v", data)
	}
}

func TestRouter_HeadlessRelayFlow(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var deviceEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &deviceEnvelope); err != nil {
		t.Fatalf("unmarshal device init response: %v", err)
	}
	deviceData, ok := deviceEnvelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", deviceEnvelope["data"])
	}
	loginSessionID, _ := deviceData["login_session_id"].(string)
	userCode, _ := deviceData["user_code"].(string)
	if loginSessionID == "" || userCode == "" {
		t.Fatalf("expected login_session_id and user_code, got %#v", deviceData)
	}

	checkBody := []byte(`{"user_code":"` + userCode + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code-check", &ut.Body{Body: bytes.NewReader(checkBody), Len: len(checkBody)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	verifyBody := []byte(`{"user_code":"` + userCode + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-verify", &ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer jwt-demo-token"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-poll", &ut.Body{Body: bytes.NewReader([]byte(`{"login_session_id":"` + loginSessionID + `"}`)), Len: len(`{"login_session_id":"` + loginSessionID + `"}`)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var pollEnvelope map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &pollEnvelope); err != nil {
		t.Fatalf("unmarshal device poll response: %v", err)
	}
	pollData, ok := pollEnvelope["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", pollEnvelope["data"])
	}
	if pollData["status"] != model.LoginSessionStatusComplete {
		t.Fatalf("expected complete, got %#v", pollData["status"])
	}
	if apiKey, _ := pollData["api_key"].(string); apiKey == "" {
		t.Fatalf("expected api_key in poll response, got %#v", pollData)
	}
}

func TestRouter_DashboardReadAPIs(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	authz := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/me", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal /v1/me response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if email, _ := data["email"].(string); email == "" {
		t.Fatalf("expected email in /v1/me response, got %#v", data)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/credits/balance", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal /v1/credits/balance response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if available, _ := data["available"].(float64); available <= 0 {
		t.Fatalf("expected positive available balance, got %#v", data)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/logs?limit=20", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal /v1/logs response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	items, ok := data["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("expected non-empty items in /v1/logs response, got %#v", data)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/dashboard/summary", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal /v1/dashboard/summary response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if _, ok := data["user"].(map[string]any); !ok {
		t.Fatalf("expected user object in summary, got %#v", data)
	}
	if _, ok := data["balance"].(map[string]any); !ok {
		t.Fatalf("expected balance object in summary, got %#v", data)
	}
}

func TestRouter_MeSupportsJWTBearer(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/me", nil, ut.Header{
		Key:   "Authorization",
		Value: "Bearer jwt-demo-token",
	})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"email":"user@example.com"`)) {
		t.Fatalf("expected user profile in response, got %s", resp.Body.String())
	}
}

func TestRouter_ExchangeIssuesAPIKeyForJWTBearer(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/exchange", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2},
		ut.Header{Key: "Authorization", Value: "Bearer jwt-demo-token"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"api_key":"ak_`)) {
		t.Fatalf("expected api key in response, got %s", resp.Body.String())
	}
}

func TestRouter_ExchangeRejectsAPIKeyBearer(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/exchange", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"code":"AUTH_INVALID"`)) {
		t.Fatalf("expected auth invalid error, got %s", resp.Body.String())
	}
}

func TestRouter_DeviceCodeCheck(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal device init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	userCode, _ := data["user_code"].(string)
	if userCode == "" {
		t.Fatalf("expected user_code, got %#v", data)
	}

	body := []byte(`{"user_code":"` + userCode + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code-check", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal code check response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if valid, _ := data["valid"].(bool); !valid {
		t.Fatalf("expected valid=true, got %#v", data)
	}
}

func TestRouter_DeviceVerifyCompletesSession(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal device init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	loginSessionID, _ := data["login_session_id"].(string)
	userCode, _ := data["user_code"].(string)
	if loginSessionID == "" || userCode == "" {
		t.Fatalf("expected login_session_id and user_code, got %#v", data)
	}

	verifyBody := []byte(`{"user_code":"` + userCode + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-verify",
		&ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	pollBody := []byte(`{"login_session_id":"` + loginSessionID + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal device poll response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if data["status"] != model.LoginSessionStatusComplete {
		t.Fatalf("expected complete, got %#v", data["status"])
	}
	if apiKey, _ := data["api_key"].(string); apiKey == "" {
		t.Fatalf("expected api_key in poll response, got %#v", data)
	}
}

func TestRouter_DeviceVerifyCompletesSessionWithJWTBearer(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal device init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	loginSessionID, _ := data["login_session_id"].(string)
	userCode, _ := data["user_code"].(string)

	verifyBody := []byte(`{"user_code":"` + userCode + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-verify",
		&ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer jwt-demo-token"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	pollBody := []byte(`{"login_session_id":"` + loginSessionID + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if !bytes.Contains(resp.Body.Bytes(), []byte(`"status":"complete"`)) {
		t.Fatalf("expected completed poll response, got %s", resp.Body.String())
	}
}

func TestRouter_BrowserVerifyCompletesBrowserPollSessionWithJWTBearer(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/login", &ut.Body{
		Body: bytes.NewReader([]byte(`{"method":"browser_poll"}`)),
		Len:  len(`{"method":"browser_poll"}`),
	}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal browser poll init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	loginSessionID, _ := data["login_session_id"].(string)
	browserURL, _ := data["browser_url"].(string)
	pollToken, _ := data["poll_token"].(string)
	if loginSessionID == "" || browserURL == "" || pollToken == "" {
		t.Fatalf("expected browser poll init data, got %#v", data)
	}

	parsedURL, err := url.Parse(browserURL)
	if err != nil {
		t.Fatalf("parse browser url: %v", err)
	}
	browserToken := parsedURL.Query().Get("browser_token")
	if browserToken == "" {
		t.Fatalf("expected browser token in %q", browserURL)
	}

	verifyBody := []byte(`{"browser_token":"` + browserToken + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/browser-verify",
		&ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer jwt-demo-token"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	pollBody := []byte(`{"login_session_id":"` + loginSessionID + `","poll_token":"` + pollToken + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"status":"complete"`)) {
		t.Fatalf("expected completed poll response, got %s", resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"api_key":"ak_`)) {
		t.Fatalf("expected api key in poll response, got %s", resp.Body.String())
	}
}

func TestRouter_BrowserVerifyRejectsAPIKeyBearer(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/login", &ut.Body{
		Body: bytes.NewReader([]byte(`{"method":"browser_poll"}`)),
		Len:  len(`{"method":"browser_poll"}`),
	}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal browser poll init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	browserURL, _ := data["browser_url"].(string)
	parsedURL, err := url.Parse(browserURL)
	if err != nil {
		t.Fatalf("parse browser url: %v", err)
	}
	browserToken := parsedURL.Query().Get("browser_token")

	verifyBody := []byte(`{"browser_token":"` + browserToken + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/browser-verify",
		&ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_BrowserVerifyUsesProfileFallbackForSparseJWT(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/login", &ut.Body{
		Body: bytes.NewReader([]byte(`{"method":"browser_poll"}`)),
		Len:  len(`{"method":"browser_poll"}`),
	}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal browser poll init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	loginSessionID, _ := data["login_session_id"].(string)
	browserURL, _ := data["browser_url"].(string)
	pollToken, _ := data["poll_token"].(string)

	parsedURL, err := url.Parse(browserURL)
	if err != nil {
		t.Fatalf("parse browser url: %v", err)
	}
	browserToken := parsedURL.Query().Get("browser_token")
	if browserToken == "" {
		t.Fatalf("expected browser token in %q", browserURL)
	}

	verifyBody := []byte(`{"browser_token":"` + browserToken + `","user":{"email":"fallback@example.com","name":"Fallback User","picture":"https://cdn.example.com/fallback.png"}}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/browser-verify",
		&ut.Body{Body: bytes.NewReader(verifyBody), Len: len(verifyBody)},
		ut.Header{Key: "Authorization", Value: "Bearer jwt-sparse-token"},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	pollBody := []byte(`{"login_session_id":"` + loginSessionID + `","poll_token":"` + pollToken + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"email":"fallback@example.com"`)) || !bytes.Contains(resp.Body.Bytes(), []byte(`"name":"Fallback User"`)) {
		t.Fatalf("expected fallback profile in poll response, got %s", resp.Body.String())
	}
}

func TestRouter_DevicePollSlowDown(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-code", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal device init response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	loginSessionID, _ := data["login_session_id"].(string)
	if loginSessionID == "" {
		t.Fatalf("expected login_session_id, got %#v", data)
	}

	pollBody := []byte(`{"login_session_id":"` + loginSessionID + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/device-poll", &ut.Body{Body: bytes.NewReader(pollBody), Len: len(pollBody)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal device poll response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected object data, got %#v", env["data"])
	}
	if data["status"] != model.LoginSessionStatusSlowDown {
		t.Fatalf("expected slow_down, got %#v", data["status"])
	}
}

func TestRouter_ProtectedRoutes(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/status", nil)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.Code)
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/image/models", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/image/models/flux-dev/schema?operation=generate", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	body := []byte(`{"prompt":"paper crane","model":"flux-dev"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/image/generate", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/auth/logout", &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/status", nil, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey})
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 after logout revoke, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_ModelRoutesDoNotRequireAuth(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/admin/model-routes", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	if env["status"] != "success" {
		t.Fatalf("expected success status, got %#v", env["status"])
	}
}

func TestRouter_CapabilitiesPresign(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)
	body := []byte(`{"filename":"demo.png","content_type":"image/png","content_length":1024}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/capabilities/presign", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	if env["status"] != "success" {
		t.Fatalf("expected success status, got %#v", env["status"])
	}
}

func TestRouter_Healthz(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	resp := ut.PerformRequest(h.engine.Engine, http.MethodGet, "/healthz", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.Code)
	}
	if resp.Header().Get("X-Request-Id") == "" {
		t.Fatal("expected X-Request-Id header")
	}
}

func TestRouter_FeedbackRequiresAuth(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	body := []byte(`{"type":"bug","message":"something broke","metadata":{"cli_version":"0.1.0","os":"darwin/arm64"}}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/feedback", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without auth, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_FeedbackSuccess(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	body := []byte(`{"type":"bug","message":"image generate returned 500","metadata":{"cli_version":"0.1.0","os":"darwin/arm64"}}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/feedback",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	if env["status"] != "success" {
		t.Fatalf("expected success, got %v", env["status"])
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data object, got %#v", env["data"])
	}
	if data["id"] == nil || data["id"] == "" {
		t.Fatalf("expected feedback id, got %#v", data)
	}
}

func TestRouter_FeedbackInvalidType(t *testing.T) {
	h, rawKey := newRouterForTest(t, 10)

	body := []byte(`{"type":"invalid","message":"test","metadata":{}}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/feedback",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "Authorization", Value: "Bearer " + rawKey},
		ut.Header{Key: "Content-Type", Value: "application/json"},
	)
	if resp.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d body=%s", resp.Code, resp.Body.String())
	}
}

// --- Drive tests ---

func TestRouter_DriveCreateFolderAndList(t *testing.T) {
	h, rawKey := newRouterForTest(t, 100)
	authz := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	ct := ut.Header{Key: "Content-Type", Value: "application/json"}

	// Create folder
	body := []byte(`{"name":"docs"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/drive/folders", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("create folder: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal create response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data object, got %#v", env["data"])
	}
	if data["name"] != "docs" {
		t.Fatalf("expected name=docs, got %v", data["name"])
	}
	if data["kind"] != "folder" {
		t.Fatalf("expected kind=folder, got %v", data["kind"])
	}
	folderID := data["id"]

	// List root nodes
	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/drive/nodes", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("list nodes: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal list response: %v", err)
	}
	data, ok = env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data object, got %#v", env["data"])
	}
	items, ok := data["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("expected non-empty items, got %#v", data)
	}
	first := items[0].(map[string]any)
	if first["name"] != "docs" {
		t.Fatalf("expected listed folder name=docs, got %v", first["name"])
	}

	// Create subfolder using parent_id
	subBody := []byte(`{"name":"sub","parent_id":"` + folderID.(string) + `"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/drive/folders", &ut.Body{Body: bytes.NewReader(subBody), Len: len(subBody)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("create subfolder: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_DriveUpdateAndDelete(t *testing.T) {
	h, rawKey := newRouterForTest(t, 100)
	authz := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	ct := ut.Header{Key: "Content-Type", Value: "application/json"}

	// Create folder
	body := []byte(`{"name":"old-name"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/drive/folders", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("create: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	var env map[string]any
	json.Unmarshal(resp.Body.Bytes(), &env)
	data := env["data"].(map[string]any)
	folderID := data["id"].(string)

	// Rename
	renameBody := []byte(`{"name":"new-name"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPatch, "/v1/drive/nodes/"+folderID, &ut.Body{Body: bytes.NewReader(renameBody), Len: len(renameBody)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("update: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	json.Unmarshal(resp.Body.Bytes(), &env)
	data = env["data"].(map[string]any)
	if data["name"] != "new-name" {
		t.Fatalf("expected renamed to new-name, got %v", data["name"])
	}

	// Delete
	resp = ut.PerformRequest(h.engine.Engine, http.MethodDelete, "/v1/drive/nodes/"+folderID, nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("delete: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	json.Unmarshal(resp.Body.Bytes(), &env)
	data = env["data"].(map[string]any)
	if data["deleted"] != true {
		t.Fatalf("expected deleted=true, got %#v", data)
	}
	if data["id"] != folderID {
		t.Fatalf("expected id=%s in delete response, got %v", folderID, data["id"])
	}

	// List should be empty now
	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/drive/nodes", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("list after delete: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	json.Unmarshal(resp.Body.Bytes(), &env)
	data = env["data"].(map[string]any)
	total, _ := data["total"].(float64)
	if total != 0 {
		t.Fatalf("expected 0 items after delete, got %v", total)
	}
}

func TestRouter_DriveRequiresAuth(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	body := []byte(`{"name":"docs"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/drive/folders", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without auth, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/drive/nodes", nil)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without auth, got %d body=%s", resp.Code, resp.Body.String())
	}
}

// --- Page tests ---

func TestRouter_PageCreateSiteAndList(t *testing.T) {
	h, rawKey := newRouterForTest(t, 100)
	authz := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	ct := ut.Header{Key: "Content-Type", Value: "application/json"}

	// Create site
	body := []byte(`{"name":"My Portfolio"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/pages", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("create site: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}

	var env map[string]any
	if err := json.Unmarshal(resp.Body.Bytes(), &env); err != nil {
		t.Fatalf("unmarshal create response: %v", err)
	}
	data, ok := env["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data object, got %#v", env["data"])
	}
	if data["name"] != "My Portfolio" {
		t.Fatalf("expected name=My Portfolio, got %v", data["name"])
	}
	siteID := data["id"].(string)

	// List sites
	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/pages", nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("list sites: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	json.Unmarshal(resp.Body.Bytes(), &env)
	data = env["data"].(map[string]any)
	items, ok := data["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("expected non-empty items, got %#v", data)
	}

	// Get site
	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/pages/"+siteID, nil, authz)
	if resp.Code != http.StatusOK {
		t.Fatalf("get site: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	json.Unmarshal(resp.Body.Bytes(), &env)
	data = env["data"].(map[string]any)
	if data["name"] != "My Portfolio" {
		t.Fatalf("expected name=My Portfolio, got %v", data["name"])
	}
}

func TestRouter_PageUpdateSite(t *testing.T) {
	h, rawKey := newRouterForTest(t, 100)
	authz := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	ct := ut.Header{Key: "Content-Type", Value: "application/json"}

	// Create
	body := []byte(`{"name":"Old Name"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/pages", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("create: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	var env map[string]any
	json.Unmarshal(resp.Body.Bytes(), &env)
	siteID := env["data"].(map[string]any)["id"].(string)

	// Update name
	updateBody := []byte(`{"name":"New Name"}`)
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPatch, "/v1/pages/"+siteID, &ut.Body{Body: bytes.NewReader(updateBody), Len: len(updateBody)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("update: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	json.Unmarshal(resp.Body.Bytes(), &env)
	data := env["data"].(map[string]any)
	if data["name"] != "New Name" {
		t.Fatalf("expected renamed to New Name, got %v", data["name"])
	}
}

func TestRouter_PageRequiresAuth(t *testing.T) {
	h, _ := newRouterForTest(t, 10)

	body := []byte(`{"name":"test"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/pages", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without auth, got %d body=%s", resp.Code, resp.Body.String())
	}

	resp = ut.PerformRequest(h.engine.Engine, http.MethodGet, "/v1/pages", nil)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without auth, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestRouter_PageUpdateRejectsEmptyPatch(t *testing.T) {
	h, rawKey := newRouterForTest(t, 100)
	authz := ut.Header{Key: "Authorization", Value: "Bearer " + rawKey}
	ct := ut.Header{Key: "Content-Type", Value: "application/json"}

	// Create
	body := []byte(`{"name":"test"}`)
	resp := ut.PerformRequest(h.engine.Engine, http.MethodPost, "/v1/pages", &ut.Body{Body: bytes.NewReader(body), Len: len(body)}, authz, ct)
	if resp.Code != http.StatusOK {
		t.Fatalf("create: expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	var env map[string]any
	json.Unmarshal(resp.Body.Bytes(), &env)
	siteID := env["data"].(map[string]any)["id"].(string)

	// Empty update should fail
	resp = ut.PerformRequest(h.engine.Engine, http.MethodPatch, "/v1/pages/"+siteID, &ut.Body{Body: bytes.NewReader([]byte(`{}`)), Len: 2}, authz, ct)
	if resp.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for empty update, got %d body=%s", resp.Code, resp.Body.String())
	}
}
