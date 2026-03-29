package security

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"fmt"
)

const (
	PasswordHashAlgo          = "pbkdf2_sha256"
	PasswordHashIter          = 100000
	PasswordHashPepperVersion = "v1"
)

func HashPasswordPBKDF2SHA256(password string, pepper string) (hash string, salt string, err error) {
	saltBytes := make([]byte, 16)
	if _, err := rand.Read(saltBytes); err != nil {
		return "", "", fmt.Errorf("generate password salt: %w", err)
	}

	derived := pbkdf2SHA256([]byte(password+pepper), saltBytes, PasswordHashIter, 32)
	encodedSalt := base64.StdEncoding.EncodeToString(saltBytes)
	encodedHash := base64.StdEncoding.EncodeToString(derived)
	formattedHash := fmt.Sprintf("%s$%d$%s$%s", PasswordHashAlgo, PasswordHashIter, PasswordHashPepperVersion, encodedHash)
	return formattedHash, encodedSalt, nil
}

// pbkdf2SHA256 avoids an extra dependency while keeping the PBKDF2-HMAC-SHA256 contract.
func pbkdf2SHA256(password, salt []byte, iter, keyLen int) []byte {
	const hashLen = 32
	if keyLen <= 0 {
		return []byte{}
	}

	blockCount := (keyLen + hashLen - 1) / hashLen
	derivedKey := make([]byte, 0, blockCount*hashLen)

	for block := 1; block <= blockCount; block++ {
		mac := hmac.New(sha256.New, password)
		mac.Write(salt)
		var blockIndex [4]byte
		binary.BigEndian.PutUint32(blockIndex[:], uint32(block))
		mac.Write(blockIndex[:])
		u := mac.Sum(nil)

		t := make([]byte, len(u))
		copy(t, u)
		for i := 1; i < iter; i++ {
			mac = hmac.New(sha256.New, password)
			mac.Write(u)
			u = mac.Sum(nil)
			for j := range t {
				t[j] ^= u[j]
			}
		}

		derivedKey = append(derivedKey, t...)
	}

	return derivedKey[:keyLen]
}
