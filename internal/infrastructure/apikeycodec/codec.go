package apikeycodec

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
)

func GenerateRawKey() (string, error) {
	buf := make([]byte, 12)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}

	return "ak_" + hex.EncodeToString(buf), nil
}

func PrefixFromRawKey(rawKey string) string {
	if len(rawKey) <= 12 {
		return rawKey
	}
	return rawKey[:12]
}

func HashRawKey(rawKey string) string {
	sum := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(sum[:])
}
