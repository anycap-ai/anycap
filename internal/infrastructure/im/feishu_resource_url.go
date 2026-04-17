package im

import (
	"net/url"
	"regexp"
	"strings"
)

type FeishuResourceKind string

const (
	FeishuResourceKindDocx    FeishuResourceKind = "docx"
	FeishuResourceKindWiki    FeishuResourceKind = "wiki"
	FeishuResourceKindSheet   FeishuResourceKind = "sheet"
	FeishuResourceKindBitable FeishuResourceKind = "bitable"
)

type FeishuResourceRef struct {
	URL   string
	Kind  FeishuResourceKind
	Token string
	Query map[string]string
}

var feishuResourceURLRe = regexp.MustCompile(`https?://[^\s<>"']+`)

func ExtractFeishuResourceRefs(message string) []FeishuResourceRef {
	message = strings.TrimSpace(message)
	if message == "" {
		return nil
	}
	matches := feishuResourceURLRe.FindAllString(message, -1)
	refs := make([]FeishuResourceRef, 0, len(matches))
	for _, match := range matches {
		ref, ok := parseFeishuResourceURL(match)
		if !ok {
			continue
		}
		refs = append(refs, ref)
	}
	return refs
}

func parseFeishuResourceURL(raw string) (FeishuResourceRef, bool) {
	raw = strings.TrimRight(strings.TrimSpace(raw), ".,;:!?，。；：！？)]}）】")
	if raw == "" {
		return FeishuResourceRef{}, false
	}
	parsed, err := url.Parse(raw)
	if err != nil || parsed == nil {
		return FeishuResourceRef{}, false
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return FeishuResourceRef{}, false
	}
	host := strings.ToLower(strings.TrimSpace(parsed.Hostname()))
	if !strings.HasSuffix(host, ".feishu.cn") && host != "feishu.cn" && !strings.HasSuffix(host, ".larksuite.com") && host != "larksuite.com" {
		return FeishuResourceRef{}, false
	}

	segments := nonEmptyPathSegments(parsed.EscapedPath())
	if len(segments) < 2 {
		return FeishuResourceRef{}, false
	}
	kind, ok := feishuResourceKindFromPath(segments[0])
	if !ok {
		return FeishuResourceRef{}, false
	}
	token, err := url.PathUnescape(segments[1])
	if err != nil {
		return FeishuResourceRef{}, false
	}
	token = trimFeishuResourceToken(token)
	if token == "" {
		return FeishuResourceRef{}, false
	}
	parsed.Path = "/" + segments[0] + "/" + token
	parsed.RawPath = ""
	raw = parsed.String()
	return FeishuResourceRef{
		URL:   raw,
		Kind:  kind,
		Token: token,
		Query: firstQueryValues(parsed.Query()),
	}, true
}

func trimFeishuResourceToken(token string) string {
	token = strings.TrimSpace(token)
	for i, r := range token {
		if isFeishuResourceTokenRune(r) {
			continue
		}
		return token[:i]
	}
	return token
}

func isFeishuResourceTokenRune(r rune) bool {
	return r >= 'a' && r <= 'z' ||
		r >= 'A' && r <= 'Z' ||
		r >= '0' && r <= '9' ||
		r == '_' ||
		r == '-'
}

func feishuResourceKindFromPath(segment string) (FeishuResourceKind, bool) {
	switch strings.ToLower(strings.TrimSpace(segment)) {
	case "docx":
		return FeishuResourceKindDocx, true
	case "wiki":
		return FeishuResourceKindWiki, true
	case "sheets":
		return FeishuResourceKindSheet, true
	case "base":
		return FeishuResourceKindBitable, true
	default:
		return "", false
	}
}

func nonEmptyPathSegments(path string) []string {
	parts := strings.Split(path, "/")
	segments := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		segments = append(segments, part)
	}
	return segments
}

func firstQueryValues(values url.Values) map[string]string {
	if len(values) == 0 {
		return nil
	}
	result := make(map[string]string, len(values))
	for key, value := range values {
		if len(value) == 0 {
			continue
		}
		result[key] = value[0]
	}
	return result
}
