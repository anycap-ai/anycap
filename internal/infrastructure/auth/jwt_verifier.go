package auth

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"io"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"

	"github.com/golang-jwt/jwt/v5"
)

type JWTVerifierConfig struct {
	Issuer   string
	Audience string
}

type JWTVerifier struct {
	cfg        JWTVerifierConfig
	httpClient *http.Client

	mu   sync.RWMutex
	keys map[string]*rsa.PublicKey
}

func NewJWTVerifier(cfg JWTVerifierConfig, httpClient *http.Client) *JWTVerifier {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 10 * time.Second}
	}
	return &JWTVerifier{
		cfg:        cfg,
		httpClient: httpClient,
		keys:       make(map[string]*rsa.PublicKey),
	}
}

func (v *JWTVerifier) VerifyIdentityToken(ctx context.Context, rawToken string) (model.AuthUser, error) {
	if v == nil {
		logging.WithContext(ctx).WithField("flow", "auth.verify_identity_token").Error("jwt verifier is nil")
		return model.AuthUser{}, model.ErrInternal
	}
	issuer, err := v.normalizedIssuer()
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.verify_identity_token").WithError(err).Error("normalize auth issuer failed")
		return model.AuthUser{}, err
	}

	parser := jwt.NewParser(jwt.WithValidMethods([]string{jwt.SigningMethodRS256.Alg()}))
	token, err := parser.Parse(rawToken, func(token *jwt.Token) (any, error) {
		kid, _ := token.Header["kid"].(string)
		if kid == "" {
			return nil, model.ErrAuthInvalid
		}
		return v.signingKey(ctx, kid)
	})
	if err != nil || token == nil || !token.Valid {
		logging.WithContext(ctx).WithField("flow", "auth.verify_identity_token").WithError(err).Warn("jwt identity token validation failed")
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		logging.WithContext(ctx).WithField("flow", "auth.verify_identity_token").Warn("jwt claims type invalid")
		return model.AuthUser{}, model.ErrAuthInvalid
	}
	if !sameIssuer(stringClaim(claims, "iss"), issuer) {
		return model.AuthUser{}, model.ErrAuthInvalid
	}
	if v.cfg.Audience != "" && !verifyAudience(claims["aud"], v.cfg.Audience) {
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	sub, _ := claims["sub"].(string)
	if sub == "" {
		logging.WithContext(ctx).WithField("flow", "auth.verify_identity_token").Warn("jwt subject missing")
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	return model.AuthUser{
		UserID:        sub,
		Email:         stringClaim(claims, "email"),
		EmailVerified: boolClaim(claims, "email_verified"),
		Name:          stringClaim(claims, "name"),
		Picture:       stringClaim(claims, "picture"),
	}, nil
}

func (v *JWTVerifier) FetchIdentityProfile(ctx context.Context, rawToken string) (model.AuthUser, error) {
	if v == nil || strings.TrimSpace(rawToken) == "" {
		logging.WithContext(ctx).WithField("flow", "auth.fetch_identity_profile").Warn("invalid input for identity profile fetch")
		return model.AuthUser{}, model.ErrInternal
	}

	issuerURL, err := normalizeIssuerURL(v.cfg.Issuer)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.fetch_identity_profile").WithError(err).Error("normalize auth issuer failed")
		return model.AuthUser{}, err
	}
	issuerURL.Path = joinURLPath(issuerURL.Path, "userinfo")
	issuerURL.RawQuery = ""
	issuerURL.Fragment = ""

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, issuerURL.String(), nil)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.fetch_identity_profile").WithError(err).Error("build identity profile request failed")
		return model.AuthUser{}, model.ErrInternal
	}
	req.Header.Set("Authorization", "Bearer "+rawToken)

	resp, err := v.httpClient.Do(req)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.fetch_identity_profile").WithError(err).Error("identity profile request failed")
		return model.AuthUser{}, model.ErrInternal
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":        "auth.fetch_identity_profile",
			"status_code": resp.StatusCode,
		}).Warn("identity profile returned non-200")
		_, _ = io.Copy(io.Discard, resp.Body)
		return model.AuthUser{}, mapAuthError(resp)
	}

	var profile struct {
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.fetch_identity_profile").WithError(err).Error("decode identity profile failed")
		return model.AuthUser{}, model.ErrInternal
	}
	if profile.Sub == "" {
		logging.WithContext(ctx).WithField("flow", "auth.fetch_identity_profile").Warn("identity profile subject missing")
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	return model.AuthUser{
		UserID:        profile.Sub,
		Email:         profile.Email,
		EmailVerified: profile.EmailVerified,
		Name:          profile.Name,
		Picture:       profile.Picture,
	}, nil
}

func (v *JWTVerifier) signingKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	v.mu.RLock()
	key := v.keys[kid]
	v.mu.RUnlock()
	if key != nil {
		return key, nil
	}
	if err := v.refreshKeys(ctx); err != nil {
		return nil, err
	}
	v.mu.RLock()
	key = v.keys[kid]
	v.mu.RUnlock()
	if key == nil {
		return nil, model.ErrAuthInvalid
	}
	return key, nil
}

func (v *JWTVerifier) refreshKeys(ctx context.Context) error {
	jwksURL, err := v.jwksURL()
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.refresh_jwks").WithError(err).Error("build jwks url failed")
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, jwksURL, nil)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.refresh_jwks").WithError(err).Error("build jwks request failed")
		return model.ErrInternal
	}
	resp, err := v.httpClient.Do(req)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.refresh_jwks").WithError(err).Error("jwks request failed")
		return model.ErrInternal
	}
	defer resp.Body.Close()
	if resp.StatusCode >= http.StatusBadRequest {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":        "auth.refresh_jwks",
			"status_code": resp.StatusCode,
		}).Error("jwks returned non-200")
		return model.ErrInternal
	}

	var payload struct {
		Keys []struct {
			Kty string `json:"kty"`
			Kid string `json:"kid"`
			N   string `json:"n"`
			E   string `json:"e"`
		} `json:"keys"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		logging.WithContext(ctx).WithField("flow", "auth.refresh_jwks").WithError(err).Error("decode jwks failed")
		return model.ErrInternal
	}

	decoded := make(map[string]*rsa.PublicKey, len(payload.Keys))
	for _, key := range payload.Keys {
		if key.Kty != "RSA" || key.Kid == "" {
			continue
		}
		publicKey, err := decodeRSAPublicKey(key.N, key.E)
		if err != nil {
			logging.WithContext(ctx).WithField("flow", "auth.refresh_jwks").WithError(err).Error("decode rsa public key failed")
			return model.ErrInternal
		}
		decoded[key.Kid] = publicKey
	}

	v.mu.Lock()
	v.keys = decoded
	v.mu.Unlock()
	return nil
}

func (v *JWTVerifier) jwksURL() (string, error) {
	issuerURL, err := normalizeIssuerURL(v.cfg.Issuer)
	if err != nil {
		return "", err
	}
	issuerURL.Path = joinURLPath(issuerURL.Path, ".well-known/jwks.json")
	issuerURL.RawQuery = ""
	issuerURL.Fragment = ""
	return issuerURL.String(), nil
}

func (v *JWTVerifier) normalizedIssuer() (string, error) {
	issuerURL, err := normalizeIssuerURL(v.cfg.Issuer)
	if err != nil {
		return "", err
	}
	return issuerURL.String(), nil
}

func decodeRSAPublicKey(modulus, exponent string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(modulus)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(exponent)
	if err != nil {
		return nil, err
	}
	eValue := 0
	for _, b := range eBytes {
		eValue = eValue<<8 + int(b)
	}
	if eValue <= 0 {
		return nil, model.ErrAuthInvalid
	}
	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: eValue,
	}, nil
}

func verifyAudience(raw any, want string) bool {
	switch value := raw.(type) {
	case string:
		return value == want
	case []any:
		for _, item := range value {
			if str, ok := item.(string); ok && str == want {
				return true
			}
		}
	case []string:
		for _, item := range value {
			if item == want {
				return true
			}
		}
	}
	return false
}

func stringClaim(claims jwt.MapClaims, key string) string {
	value, _ := claims[key].(string)
	return value
}

func boolClaim(claims jwt.MapClaims, key string) bool {
	value, _ := claims[key].(bool)
	return value
}

func sameIssuer(actual, expected string) bool {
	return strings.TrimRight(actual, "/") == strings.TrimRight(expected, "/")
}
