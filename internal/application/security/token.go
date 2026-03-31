package security

import (
	"crypto/rand"
	"fmt"
	"strings"
)

const tokenAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// GeneratePrefixedToken generates a token with deterministic prefix and fixed-length base62 body.
// The body is generated with rejection sampling to avoid modulo bias.
func GeneratePrefixedToken(prefix string, bodyLength int) (string, error) {
	trimmedPrefix := strings.TrimSpace(prefix)
	if trimmedPrefix == "" {
		return "", fmt.Errorf("token prefix is required")
	}
	if bodyLength <= 0 {
		return "", fmt.Errorf("token body length must be greater than zero")
	}

	body, err := randomBase62(bodyLength)
	if err != nil {
		return "", err
	}
	return trimmedPrefix + body, nil
}

func randomBase62(length int) (string, error) {
	const maxValidByte = 248 // largest multiple of 62 that fits in a byte: 62 * 4

	out := make([]byte, length)
	for i := 0; i < length; {
		b := make([]byte, 1)
		if _, err := rand.Read(b); err != nil {
			return "", fmt.Errorf("generate token body: %w", err)
		}
		if b[0] >= maxValidByte {
			continue
		}
		out[i] = tokenAlphabet[b[0]%byte(len(tokenAlphabet))]
		i++
	}
	return string(out), nil
}
