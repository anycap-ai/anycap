package auth

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

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
		return model.AuthUser{}, model.ErrInternal
	}
	issuer, err := v.normalizedIssuer()
	if err != nil {
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
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
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
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	return model.AuthUser{
		UserID:  sub,
		Email:   stringClaim(claims, "email"),
		Name:    stringClaim(claims, "name"),
		Picture: stringClaim(claims, "picture"),
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
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, jwksURL, nil)
	if err != nil {
		return model.ErrInternal
	}
	resp, err := v.httpClient.Do(req)
	if err != nil {
		return model.ErrInternal
	}
	defer resp.Body.Close()
	if resp.StatusCode >= http.StatusBadRequest {
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
		return model.ErrInternal
	}

	decoded := make(map[string]*rsa.PublicKey, len(payload.Keys))
	for _, key := range payload.Keys {
		if key.Kty != "RSA" || key.Kid == "" {
			continue
		}
		publicKey, err := decodeRSAPublicKey(key.N, key.E)
		if err != nil {
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

func sameIssuer(actual, expected string) bool {
	return strings.TrimRight(actual, "/") == strings.TrimRight(expected, "/")
}
