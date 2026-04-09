package annotate

import (
	_ "embed"
	"encoding/json"
	"strings"
)

//go:embed page.html
var annotationPageHTML string

// jsStringEscape returns s escaped for safe embedding inside a JavaScript
// string literal. It uses JSON encoding which produces a valid JS string
// (including escaping of ', ", \, newlines, and </script> sequences).
func jsStringEscape(s string) string {
	b, _ := json.Marshal(s)
	// json.Marshal returns a quoted string like `"value"`. Strip the
	// surrounding quotes so the caller controls the quoting context.
	return string(b[1 : len(b)-1])
}

// injectTemplateVars replaces template placeholders in the HTML with actual values.
// All values are JS-string-escaped to prevent injection or syntax errors when
// the target URL (or other values) contain characters like ', ", \, or </script>.
func injectTemplateVars(html, csrfToken, mediaType, targetURL, sessionID string, autoClose bool) string {
	autoCloseStr := "false"
	if autoClose {
		autoCloseStr = "true"
	}
	r := strings.NewReplacer(
		"{{CSRF_TOKEN}}", jsStringEscape(csrfToken),
		"{{MEDIA_TYPE}}", jsStringEscape(mediaType),
		"{{TARGET_URL}}", jsStringEscape(targetURL),
		"{{SESSION_ID}}", jsStringEscape(sessionID),
		"{{AUTO_CLOSE}}", autoCloseStr,
	)
	return r.Replace(html)
}
