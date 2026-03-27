package auth

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWTVerifier_VerifyIdentityToken(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("GenerateKey() error = %v", err)
	}

	jwksServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		payload := map[string]any{
			"keys": []map[string]string{{
				"kty": "RSA",
				"kid": "kid-1",
				"n":   base64.RawURLEncoding.EncodeToString(privateKey.PublicKey.N.Bytes()),
				"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(privateKey.PublicKey.E)).Bytes()),
			}},
		}
		_ = json.NewEncoder(w).Encode(payload)
	}))
	defer jwksServer.Close()

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"iss":     jwksServer.URL + "/",
		"aud":     []string{"https://api.anycap.local"},
		"sub":     "auth0|demo-user",
		"email":   "demo@example.com",
		"name":    "Demo User",
		"picture": "https://cdn.example.com/avatar.png",
		"exp":     time.Now().Add(time.Hour).Unix(),
		"iat":     time.Now().Add(-time.Minute).Unix(),
	})
	token.Header["kid"] = "kid-1"

	rawToken, err := token.SignedString(privateKey)
	if err != nil {
		t.Fatalf("SignedString() error = %v", err)
	}

	verifier := NewJWTVerifier(JWTVerifierConfig{
		Issuer:   jwksServer.URL + "/",
		Audience: "https://api.anycap.local",
	}, jwksServer.Client())

	authUser, err := verifier.VerifyIdentityToken(context.Background(), rawToken)
	if err != nil {
		t.Fatalf("VerifyIdentityToken() error = %v", err)
	}
	if authUser.UserID != "auth0|demo-user" || authUser.Email != "demo@example.com" || authUser.Name != "Demo User" {
		t.Fatalf("unexpected auth user: %#v", authUser)
	}
}

func TestJWTVerifier_RejectsWrongAudience(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("GenerateKey() error = %v", err)
	}

	jwksServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		payload := map[string]any{
			"keys": []map[string]string{{
				"kty": "RSA",
				"kid": "kid-1",
				"n":   base64.RawURLEncoding.EncodeToString(privateKey.PublicKey.N.Bytes()),
				"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(privateKey.PublicKey.E)).Bytes()),
			}},
		}
		_ = json.NewEncoder(w).Encode(payload)
	}))
	defer jwksServer.Close()

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"iss": jwksServer.URL + "/",
		"aud": []string{"wrong-audience"},
		"sub": "auth0|demo-user",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	token.Header["kid"] = "kid-1"

	rawToken, err := token.SignedString(privateKey)
	if err != nil {
		t.Fatalf("SignedString() error = %v", err)
	}

	verifier := NewJWTVerifier(JWTVerifierConfig{
		Issuer:   jwksServer.URL + "/",
		Audience: "https://api.anycap.local",
	}, jwksServer.Client())

	_, err = verifier.VerifyIdentityToken(context.Background(), rawToken)
	if err != model.ErrAuthInvalid {
		t.Fatalf("expected ErrAuthInvalid, got %v", err)
	}
}
