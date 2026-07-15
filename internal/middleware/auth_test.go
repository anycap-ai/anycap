package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/cloudwego/hertz/pkg/app"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type fakeIdentityTokenAuthenticator struct {
	principal model.Principal
	err       error
	rawToken  string
}

func (f *fakeIdentityTokenAuthenticator) AuthenticateIdentityToken(_ context.Context, rawToken string) (model.Principal, error) {
	f.rawToken = rawToken
	if f.err != nil {
		return model.Principal{}, f.err
	}
	return f.principal, nil
}

var _ port.IdentityTokenAuthenticator = (*fakeIdentityTokenAuthenticator)(nil)

func TestAuthMiddleware_RejectMissingBearer(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	h.GET("/protected", Auth(apikey.NewMemoryService(), nil), func(ctx context.Context, c *app.RequestContext) { c.String(200, "ok") })

	resp := ut.PerformRequest(h.Engine, http.MethodGet, "/protected", nil)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestAuthMiddleware_ModelInvocationIncludesPrepareDiagnostics(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	CapabilityPOST(h.Group("/v1/image"), "/generate", "image.generate", Auth(apikey.NewMemoryService(), nil), func(ctx context.Context, c *app.RequestContext) { c.String(200, "ok") })

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/generate", nil)
	var envelope struct {
		Diagnostics struct {
			Stage string `json:"stage"`
		} `json:"diagnostics"`
	}
	if err := json.Unmarshal(resp.Body.Bytes(), &envelope); err != nil {
		t.Fatal(err)
	}
	if resp.Code != http.StatusUnauthorized || envelope.Diagnostics.Stage != "prepare" {
		t.Fatalf("status=%d body=%s", resp.Code, resp.Body.String())
	}
}

func TestAuthMiddleware_DynamicImageEditIncludesPrepareDiagnostics(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware(), Auth(apikey.NewMemoryService(), nil))
	h.POST("/v1/image/:operation", func(ctx context.Context, c *app.RequestContext) { c.String(200, "ok") })

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/v1/image/edit", nil)
	if resp.Code != http.StatusUnauthorized || !bytes.Contains(resp.Body.Bytes(), []byte(`"stage":"prepare"`)) {
		t.Fatalf("status=%d body=%s", resp.Code, resp.Body.String())
	}
}

func TestAuthMiddleware_UsesJWTAuthenticatorForNonAPIKeyBearer(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())

	identityAuth := &fakeIdentityTokenAuthenticator{
		principal: model.Principal{
			UserID:         "2000000001",
			AuthType:       "auth0_jwt",
			ExternalUserID: "auth0|demo-user",
			Email:          "demo@example.com",
			Name:           "Demo User",
		},
	}

	h.GET("/protected", Auth(apikey.NewMemoryService(), identityAuth), func(ctx context.Context, c *app.RequestContext) {
		principal, ok := GetPrincipal(c)
		if !ok {
			t.Fatal("expected principal in request context")
		}
		c.JSON(http.StatusOK, principal)
	})

	resp := ut.PerformRequest(h.Engine, http.MethodGet, "/protected", nil, ut.Header{
		Key:   "Authorization",
		Value: "Bearer eyJhbGciOiJSUzI1NiJ9.test.payload",
	})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if identityAuth.rawToken != "eyJhbGciOiJSUzI1NiJ9.test.payload" {
		t.Fatalf("expected raw token to be forwarded, got %q", identityAuth.rawToken)
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"auth_type":"auth0_jwt"`)) {
		t.Fatalf("expected jwt principal in response, got %s", resp.Body.String())
	}
}

func TestAuthMiddleware_RejectsJWTBearerWhenIdentityAuthenticatorDisabled(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	h.GET("/protected", Auth(apikey.NewMemoryService(), nil), func(ctx context.Context, c *app.RequestContext) {
		c.String(http.StatusOK, "ok")
	})

	resp := ut.PerformRequest(h.Engine, http.MethodGet, "/protected", nil, ut.Header{
		Key:   "Authorization",
		Value: "Bearer eyJhbGciOiJSUzI1NiJ9.test.payload",
	})
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
	}
}

func TestLocalBypassAuth_SetsPrincipal(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	h.GET("/protected", LocalBypassAuth(model.Principal{
		UserID:   "123",
		AuthType: "local_bypass",
	}), func(ctx context.Context, c *app.RequestContext) {
		principal, ok := GetPrincipal(c)
		if !ok {
			t.Fatal("expected principal in request context")
		}
		c.JSON(http.StatusOK, principal)
	})

	resp := ut.PerformRequest(h.Engine, http.MethodGet, "/protected", nil)
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", resp.Code, resp.Body.String())
	}
	if !bytes.Contains(resp.Body.Bytes(), []byte(`"user_id":"123"`)) {
		t.Fatalf("expected bypass principal in response, got %s", resp.Body.String())
	}
}
