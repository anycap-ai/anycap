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
	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	imageapp "gitlab.knoffice.tech/engineering/anycap/internal/application/image"
	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
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
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/feedback"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/image"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/modelroute"
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
