package externalid

import (
	"crypto/rand"
	"fmt"
	"strings"
)

const (
	DefaultRandomLength = 16
)

const (
	PrefixUser          = "u_"
	PrefixSpace         = "sp_"
	PrefixDriveNode     = "dn_"
	PrefixUploadSession = "upl_"
	PrefixPageSite      = "pg_"
	PrefixPageVersion   = "pv_"
	PrefixCapsUpload    = "cu_"
	PrefixCapsArtifact  = "ca_"
	PrefixModelRoute    = "mr_"
	PrefixLoginSession  = "lsn_"
	PrefixAPIKeyID      = "akid_"
	PrefixFeedback      = "fb_"
	PrefixUsageEvent    = "uevt_"
	PrefixProviderRun   = "prun_"
)

const randomCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func Generate(prefix string) string {
	return GenerateWithLen(prefix, DefaultRandomLength)
}

func GenerateWithLen(prefix string, length int) string {
	if length <= 0 {
		length = DefaultRandomLength
	}
	return prefix + randomAlnum(length)
}

func ValidatePrefix(id, prefix string) error {
	if strings.TrimSpace(prefix) == "" {
		return fmt.Errorf("prefix is required")
	}

	if !strings.HasPrefix(id, prefix) {
		return fmt.Errorf("id must start with %q", prefix)
	}

	raw := strings.TrimPrefix(id, prefix)
	if raw == "" {
		return fmt.Errorf("id suffix is required")
	}

	for _, ch := range raw {
		switch {
		case ch >= 'a' && ch <= 'z':
		case ch >= 'A' && ch <= 'Z':
		case ch >= '0' && ch <= '9':
		default:
			return fmt.Errorf("id contains invalid character %q", ch)
		}
	}

	return nil
}

func randomAlnum(length int) string {
	out := make([]byte, 0, length)
	rejectFloor := byte(256 - (256 % len(randomCharset)))
	buf := make([]byte, length*2)

	for len(out) < length {
		if _, err := rand.Read(buf); err != nil {
			// crypto/rand failures are unexpected; keep deterministic fallback to avoid panics.
			for len(out) < length {
				out = append(out, 'A')
			}
			break
		}
		for _, b := range buf {
			if b >= rejectFloor {
				continue
			}
			out = append(out, randomCharset[int(b)%len(randomCharset)])
			if len(out) == length {
				break
			}
		}
	}

	return string(out)
}
