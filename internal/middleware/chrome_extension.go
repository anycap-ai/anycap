package middleware

import (
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
)

const chromeExtensionSource = "chrome-extension"

func NormalizeChromeExtensionInstallID(raw string) (string, bool) {
	installID := strings.TrimSpace(raw)
	if installID == "" || len(installID) > 128 {
		return "", false
	}
	for _, r := range installID {
		switch {
		case r >= 'a' && r <= 'z':
		case r >= 'A' && r <= 'Z':
		case r >= '0' && r <= '9':
		case r == '-' || r == '_':
		default:
			return "", false
		}
	}
	return installID, true
}

func ChromeExtensionAnonymousUserID(ctx *app.RequestContext) (string, bool) {
	source := strings.TrimSpace(string(ctx.Request.Header.Peek("X-Anycap-Source")))
	if strings.ToLower(source) != chromeExtensionSource {
		return "", false
	}

	installID, ok := NormalizeChromeExtensionInstallID(string(ctx.Request.Header.Peek("X-Anycap-Install-Id")))
	if !ok {
		return "", false
	}

	return model.AnonymousUserIDPrefix + installID, true
}
