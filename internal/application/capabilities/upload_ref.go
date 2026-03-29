package capabilities

import (
	"fmt"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
)

const uploadRefPrefix = "anycap://upload/"

func uploadRefURL(uploadExternalID string) string {
	return fmt.Sprintf("%s%s", uploadRefPrefix, strings.TrimSpace(uploadExternalID))
}

func parseUploadRefExternalID(rawURL string) (string, bool) {
	trimmed := strings.TrimSpace(rawURL)
	lowerTrimmed := strings.ToLower(trimmed)
	if !strings.HasPrefix(lowerTrimmed, uploadRefPrefix) {
		return "", false
	}

	rawID := trimmed[len(uploadRefPrefix):]
	rawID = strings.TrimSpace(rawID)
	if rawID == "" || strings.Contains(rawID, "/") {
		return "", false
	}
	if err := externalid.ValidatePrefix(rawID, externalid.PrefixCapsUpload); err != nil {
		return "", false
	}
	return rawID, true
}

func looksLikeAnyCapRef(rawURL string) bool {
	return strings.HasPrefix(strings.ToLower(strings.TrimSpace(rawURL)), "anycap://")
}
