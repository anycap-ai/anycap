package capabilities

import (
	"fmt"
	"strconv"
	"strings"
)

func uploadRefURL(uploadID int64) string {
	return fmt.Sprintf("anycap://upload/%d", uploadID)
}

func parseUploadRefID(rawURL string) (int64, bool) {
	const prefix = "anycap://upload/"
	trimmed := strings.TrimSpace(rawURL)
	if !strings.HasPrefix(strings.ToLower(trimmed), prefix) {
		return 0, false
	}
	rawID := strings.TrimPrefix(strings.ToLower(trimmed), prefix)
	if rawID == "" || strings.Contains(rawID, "/") {
		return 0, false
	}
	id, err := strconv.ParseInt(rawID, 10, 64)
	if err != nil || id <= 0 {
		return 0, false
	}
	return id, true
}

func looksLikeAnyCapRef(rawURL string) bool {
	return strings.HasPrefix(strings.ToLower(strings.TrimSpace(rawURL)), "anycap://")
}
