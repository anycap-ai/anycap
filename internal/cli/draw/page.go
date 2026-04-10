package draw

import (
	_ "embed"
	"encoding/json"
	"strings"
)

//go:embed page.html
var drawPageHTML string

func injectTemplateVars(html, csrfToken, sessionID string, autoClose bool) string {
	autoCloseStr := "false"
	if autoClose {
		autoCloseStr = "true"
	}
	r := strings.NewReplacer(
		"{{CSRF_TOKEN}}", jsStringEscape(csrfToken),
		"{{SESSION_ID}}", jsStringEscape(sessionID),
		"{{AUTO_CLOSE}}", autoCloseStr,
	)
	return r.Replace(html)
}

func jsStringEscape(s string) string {
	b, _ := json.Marshal(s)
	return string(b[1 : len(b)-1])
}
