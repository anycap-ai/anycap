package im

import "strings"

var allowedReactionEmojiTypes = map[string]struct{}{
	"OnIt":     {},
	"THUMBSUP": {},
	"SMILE":    {},
	"SALUTE":   {},
	"MUSCLE":   {},
	"DONE":     {},
}

func AllowedReactionEmojiTypes() []string {
	return []string{"OnIt", "THUMBSUP", "SMILE", "SALUTE", "MUSCLE", "DONE"}
}

func IsAllowedReactionEmojiType(raw string) bool {
	_, ok := allowedReactionEmojiTypes[NormalizeReactionEmojiType(raw)]
	return ok
}

func NormalizeReactionEmojiType(raw string) string {
	candidate := strings.TrimSpace(raw)
	candidate = strings.Trim(candidate, "`\"'")
	candidate = strings.TrimSpace(candidate)
	if candidate == "" {
		return ""
	}
	for _, allowed := range AllowedReactionEmojiTypes() {
		if strings.EqualFold(candidate, allowed) {
			return allowed
		}
	}
	fields := strings.FieldsFunc(candidate, func(r rune) bool {
		switch r {
		case ' ', '\n', '\t', '\r', ',', '，', '.', '。', ':', '：', ';', '；', '!', '！', '?', '？', '(', ')', '[', ']', '{', '}', '<', '>':
			return true
		default:
			return false
		}
	})
	for _, field := range fields {
		for _, allowed := range AllowedReactionEmojiTypes() {
			if strings.EqualFold(strings.TrimSpace(field), allowed) {
				return allowed
			}
		}
	}
	return ""
}
