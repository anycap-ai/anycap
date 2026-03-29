package auth

import (
	"io"
	"net/http"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestNormalizeIssuerURL(t *testing.T) {
	issuer, err := normalizeIssuerURL("https://example.auth0.com/")
	if err != nil {
		t.Fatalf("normalizeIssuerURL() error = %v", err)
	}
	if issuer.String() != "https://example.auth0.com/" {
		t.Fatalf("unexpected issuer: %q", issuer.String())
	}
	issuer, err = normalizeIssuerURL("example.auth0.com")
	if err != nil {
		t.Fatalf("normalizeIssuerURL() with host only error = %v", err)
	}
	if issuer.String() != "https://example.auth0.com" {
		t.Fatalf("unexpected normalized issuer: %q", issuer.String())
	}

	if _, err := normalizeIssuerURL(""); err != model.ErrInternal {
		t.Fatalf("expected ErrInternal for empty issuer, got %v", err)
	}
}

func TestJoinURLPath(t *testing.T) {
	if got := joinURLPath("/tenant/", ".well-known/jwks.json"); got != "/tenant/.well-known/jwks.json" {
		t.Fatalf("unexpected joined path: %q", got)
	}
	if got := joinURLPath("", "userinfo"); got != "userinfo" {
		t.Fatalf("unexpected joined path: %q", got)
	}
}

func TestMapAuthError(t *testing.T) {
	cases := []struct {
		name string
		resp *http.Response
		want error
	}{
		{
			name: "nil response",
			resp: nil,
			want: model.ErrInternal,
		},
		{
			name: "400 auth invalid",
			resp: &http.Response{StatusCode: http.StatusBadRequest, Body: io.NopCloser(strings.NewReader(`{"error":"invalid_grant"}`))},
			want: model.ErrAuthInvalid,
		},
		{
			name: "500 internal",
			resp: &http.Response{StatusCode: http.StatusInternalServerError, Body: io.NopCloser(strings.NewReader(`{"error":"server_error"}`))},
			want: model.ErrInternal,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := mapAuthError(tc.resp); got != tc.want {
				t.Fatalf("mapAuthError() = %v, want %v", got, tc.want)
			}
		})
	}
}
